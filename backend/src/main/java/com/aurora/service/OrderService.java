package com.aurora.service;

import com.aurora.dto.checkout.CreateCheckoutSessionRequest;
import com.aurora.dto.checkout.OrderItemRequest;
import com.aurora.dto.checkout.OrderItemResponse;
import com.aurora.dto.checkout.OrderResponse;
import com.aurora.exception.BadRequestException;
import com.aurora.exception.ResourceNotFoundException;
import com.aurora.model.entity.*;
import com.aurora.repository.OrderRepository;
import com.aurora.repository.ProductRepository;
import com.aurora.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.security.SecureRandom;
import java.time.Instant;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final CartService cartService;
    private final EmailService emailService;
    private final SecureRandom random = new SecureRandom();

    @Transactional
    public Order createOrder(CreateCheckoutSessionRequest request, UUID userId) {
        String currency = "USD".equalsIgnoreCase(request.getCurrency()) ? "USD" : "EUR";

        User user = null;
        if (userId != null) {
            user = userRepository.findById(userId).orElse(null);
        }

        String orderNumber = generateOrderNumber();

        Order order = Order.builder()
                .orderNumber(orderNumber)
                .user(user)
                .currency(currency)
                .status(OrderStatus.PENDING)
                .paymentStatus(PaymentStatus.UNPAID)
                .paymentMethod(PaymentMethod.STRIPE)
                .customerEmail(request.getCustomerEmail().toLowerCase().trim())
                .customerName(request.getCustomerName().trim())
                .customerPhone(request.getCustomerPhone())
                .shippingAddressLine1(request.getShippingAddressLine1())
                .shippingAddressLine2(request.getShippingAddressLine2())
                .shippingCity(request.getShippingCity())
                .shippingState(request.getShippingState())
                .shippingPostalCode(request.getShippingPostalCode())
                .shippingCountry(request.getShippingCountry())
                .notes(request.getNotes())
                .subtotalAmount(BigDecimal.ZERO)
                .shippingAmount(BigDecimal.ZERO)
                .totalAmount(BigDecimal.ZERO)
                .items(new ArrayList<>())
                .build();

        BigDecimal subtotal = BigDecimal.ZERO;

        for (OrderItemRequest itemRequest : request.getItems()) {
            Product product = productRepository.findById(itemRequest.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product", "id", itemRequest.getProductId()));

            if (product.getStockQuantity() < itemRequest.getQuantity()) {
                throw new BadRequestException("Insufficient stock for mask: " + product.getName() + " (Only " + product.getStockQuantity() + " remaining in atelier)");
            }

            BigDecimal unitPrice = "USD".equalsIgnoreCase(currency)
                    ? product.getDiscountedPriceUsd()
                    : product.getDiscountedPriceEur();

            BigDecimal itemTotal = unitPrice.multiply(BigDecimal.valueOf(itemRequest.getQuantity()));
            subtotal = subtotal.add(itemTotal);

            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .productId(product.getId())
                    .productName(product.getName())
                    .productWoodType(product.getWoodType())
                    .unitPrice(unitPrice)
                    .quantity(itemRequest.getQuantity())
                    .totalPrice(itemTotal)
                    .build();

            order.getItems().add(orderItem);
        }

        // Worldwide DHL Express Artisanal Shipping: Free over 200 EUR/USD, otherwise 25
        BigDecimal shippingCost = subtotal.compareTo(new BigDecimal("200.00")) >= 0
                ? BigDecimal.ZERO
                : new BigDecimal("25.00");

        order.setSubtotalAmount(subtotal);
        order.setShippingAmount(shippingCost);
        order.setTotalAmount(subtotal.add(shippingCost));

        Order savedOrder = orderRepository.save(order);
        log.info("Created pending Stripe order #{} for total {} {}", savedOrder.getOrderNumber(), savedOrder.getTotalAmount(), savedOrder.getCurrency());
        return savedOrder;
    }

    @Transactional
    public OrderResponse placeUnpaidOrder(CreateCheckoutSessionRequest request, UUID userId) {
        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new BadRequestException("Order must contain at least one mask.");
        }

        String currency = "USD".equalsIgnoreCase(request.getCurrency()) ? "USD" : "EUR";

        User user = null;
        if (userId != null) {
            user = userRepository.findById(userId).orElse(null);
        }

        String orderNumber = generateOrderNumber();

        Order order = Order.builder()
                .orderNumber(orderNumber)
                .user(user)
                .currency(currency)
                .status(OrderStatus.PENDING_MANUAL_CONFIRMATION)
                .paymentStatus(PaymentStatus.UNPAID)
                .paymentMethod(PaymentMethod.MANUAL)
                .customerEmail(request.getCustomerEmail().toLowerCase().trim())
                .customerName(request.getCustomerName().trim())
                .customerPhone(request.getCustomerPhone())
                .shippingAddressLine1(request.getShippingAddressLine1())
                .shippingAddressLine2(request.getShippingAddressLine2())
                .shippingCity(request.getShippingCity())
                .shippingState(request.getShippingState())
                .shippingPostalCode(request.getShippingPostalCode())
                .shippingCountry(request.getShippingCountry())
                .notes(request.getNotes())
                .subtotalAmount(BigDecimal.ZERO)
                .shippingAmount(BigDecimal.ZERO)
                .totalAmount(BigDecimal.ZERO)
                .items(new ArrayList<>())
                .build();

        BigDecimal subtotal = BigDecimal.ZERO;

        for (OrderItemRequest itemRequest : request.getItems()) {
            // Pessimistic write lock to prevent race-condition overselling
            Product product = productRepository.findByIdForUpdate(itemRequest.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product", "id", itemRequest.getProductId()));

            if (product.getStockQuantity() < itemRequest.getQuantity()) {
                throw new BadRequestException("Insufficient stock for mask: " + product.getName() + " (Only " + product.getStockQuantity() + " remaining in atelier)");
            }

            // Reserve/deduct inventory immediately
            product.setStockQuantity(product.getStockQuantity() - itemRequest.getQuantity());
            productRepository.save(product);

            BigDecimal unitPrice = "USD".equalsIgnoreCase(currency)
                    ? product.getDiscountedPriceUsd()
                    : product.getDiscountedPriceEur();

            BigDecimal itemTotal = unitPrice.multiply(BigDecimal.valueOf(itemRequest.getQuantity()));
            subtotal = subtotal.add(itemTotal);

            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .productId(product.getId())
                    .productName(product.getName())
                    .productWoodType(product.getWoodType())
                    .unitPrice(unitPrice)
                    .quantity(itemRequest.getQuantity())
                    .totalPrice(itemTotal)
                    .build();

            order.getItems().add(orderItem);
        }

        BigDecimal shippingCost = subtotal.compareTo(new BigDecimal("200.00")) >= 0
                ? BigDecimal.ZERO
                : new BigDecimal("25.00");

        order.setSubtotalAmount(subtotal);
        order.setShippingAmount(shippingCost);
        order.setTotalAmount(subtotal.add(shippingCost));

        Order savedOrder = orderRepository.save(order);
        log.info("Placed manual unpaid order #{} for total {} {} with status {}",
                savedOrder.getOrderNumber(), savedOrder.getTotalAmount(), savedOrder.getCurrency(), savedOrder.getStatus());

        if (userId != null) {
            try {
                cartService.clearCart(userId);
            } catch (Exception e) {
                log.warn("Could not clear user cart after unpaid checkout: {}", e.getMessage());
            }
        }

        try {
            emailService.sendManualOrderReceivedEmail(savedOrder);
        } catch (Exception e) {
            log.warn("Failed to dispatch order received email: {}", e.getMessage());
        }

        return mapToResponse(savedOrder);
    }

    @Transactional
    public OrderResponse confirmManualOrder(UUID orderId, String adminEmail, String reviewNote) {
        Order order = orderRepository.findByIdForUpdate(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));

        if (order.getStatus() != OrderStatus.PENDING_MANUAL_CONFIRMATION) {
            throw new BadRequestException("Order #" + order.getOrderNumber() + " cannot be confirmed because it is in status: " + order.getStatus());
        }

        order.setStatus(OrderStatus.CONFIRMED);
        order.setReviewedAt(Instant.now());
        order.setReviewedBy(adminEmail != null ? adminEmail : "Admin");
        order.setReviewNote(reviewNote != null && !reviewNote.isBlank() ? reviewNote.trim() : null);

        Order savedOrder = orderRepository.save(order);
        log.info("Admin [{}] CONFIRMED order #{}", adminEmail, savedOrder.getOrderNumber());

        try {
            emailService.sendOrderConfirmationEmail(savedOrder);
        } catch (Exception e) {
            log.warn("Failed to dispatch order confirmation email: {}", e.getMessage());
        }

        return mapToResponse(savedOrder);
    }

    @Transactional
    public OrderResponse rejectManualOrder(UUID orderId, String adminEmail, String reviewNote) {
        Order order = orderRepository.findByIdForUpdate(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));

        if (order.getStatus() != OrderStatus.PENDING_MANUAL_CONFIRMATION) {
            throw new BadRequestException("Order #" + order.getOrderNumber() + " cannot be rejected because it is in status: " + order.getStatus());
        }

        // Restore reserved stock back to atelier inventory
        for (OrderItem item : order.getItems()) {
            if (item.getProductId() != null) {
                productRepository.findByIdForUpdate(item.getProductId()).ifPresent(product -> {
                    product.setStockQuantity(product.getStockQuantity() + item.getQuantity());
                    productRepository.save(product);
                    log.info("Restored {} unit(s) of mask [{}] back to inventory due to order rejection.", item.getQuantity(), product.getName());
                });
            }
        }

        order.setStatus(OrderStatus.REJECTED);
        order.setReviewedAt(Instant.now());
        order.setReviewedBy(adminEmail != null ? adminEmail : "Admin");
        order.setReviewNote(reviewNote != null && !reviewNote.isBlank() ? reviewNote.trim() : null);

        Order savedOrder = orderRepository.save(order);
        log.info("Admin [{}] REJECTED order #{} with note: {}", adminEmail, savedOrder.getOrderNumber(), reviewNote);

        try {
            emailService.sendOrderRejectionEmail(savedOrder, reviewNote);
        } catch (Exception e) {
            log.warn("Failed to dispatch order rejection email: {}", e.getMessage());
        }

        return mapToResponse(savedOrder);
    }

    @Transactional
    public void markOrderAsPaid(String sessionId, String paymentIntentId) {
        Order order = orderRepository.findByStripeCheckoutSessionId(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Order with Stripe session ID: " + sessionId + " not found"));

        if (order.getPaymentStatus() == PaymentStatus.PAID) {
            log.info("Order #{} is already marked as PAID", order.getOrderNumber());
            return;
        }

        order.setStatus(OrderStatus.PAID);
        order.setPaymentStatus(PaymentStatus.PAID);
        order.setStripePaymentIntentId(paymentIntentId);

        // Deduct inventory quantities safely
        for (OrderItem item : order.getItems()) {
            if (item.getProductId() != null) {
                productRepository.findByIdForUpdate(item.getProductId()).ifPresent(product -> {
                    int remaining = Math.max(0, product.getStockQuantity() - item.getQuantity());
                    product.setStockQuantity(remaining);
                    productRepository.save(product);
                });
            }
        }

        Order savedOrder = orderRepository.save(order);
        log.info("Successfully marked order #{} as PAID with PaymentIntent: {}", order.getOrderNumber(), paymentIntentId);

        try {
            emailService.sendOrderConfirmationEmail(savedOrder);
        } catch (Exception e) {
            log.warn("Failed to dispatch Stripe payment confirmation email: {}", e.getMessage());
        }
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getOrders(OrderStatus status) {
        List<Order> orders;
        if (status != null) {
            orders = orderRepository.findByStatusOrderByCreatedAtDesc(status);
        } else {
            orders = orderRepository.findAllByOrderByCreatedAtDesc();
        }
        return orders.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public OrderResponse getOrderById(UUID id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", id));
        return mapToResponse(order);
    }

    @Transactional(readOnly = true)
    public OrderResponse getOrderByOrderNumber(String orderNumber) {
        Order order = orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "orderNumber", orderNumber));
        return mapToResponse(order);
    }

    @Transactional(readOnly = true)
    public OrderResponse getOrderBySessionId(String sessionId) {
        Order order = orderRepository.findByStripeCheckoutSessionId(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "stripeSessionId", sessionId));
        return mapToResponse(order);
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getUserOrders(UUID userId) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public OrderResponse mapToResponse(Order order) {
        List<OrderItemResponse> itemResponses = order.getItems() != null
                ? order.getItems().stream().map(item -> OrderItemResponse.builder()
                .id(item.getId())
                .productId(item.getProductId())
                .productName(item.getProductName())
                .productWoodType(item.getProductWoodType())
                .unitPrice(item.getUnitPrice())
                .quantity(item.getQuantity())
                .totalPrice(item.getTotalPrice())
                .build()).collect(Collectors.toList())
                : List.of();

        return OrderResponse.builder()
                .id(order.getId())
                .orderNumber(order.getOrderNumber())
                .status(order.getStatus())
                .paymentStatus(order.getPaymentStatus())
                .paymentMethod(order.getPaymentMethod())
                .currency(order.getCurrency())
                .subtotalAmount(order.getSubtotalAmount())
                .shippingAmount(order.getShippingAmount())
                .totalAmount(order.getTotalAmount())
                .customerEmail(order.getCustomerEmail())
                .customerName(order.getCustomerName())
                .customerPhone(order.getCustomerPhone())
                .shippingAddressLine1(order.getShippingAddressLine1())
                .shippingAddressLine2(order.getShippingAddressLine2())
                .shippingCity(order.getShippingCity())
                .shippingState(order.getShippingState())
                .shippingPostalCode(order.getShippingPostalCode())
                .shippingCountry(order.getShippingCountry())
                .notes(order.getNotes())
                .reviewedAt(order.getReviewedAt())
                .reviewedBy(order.getReviewedBy())
                .reviewNote(order.getReviewNote())
                .createdAt(order.getCreatedAt())
                .items(itemResponses)
                .build();
    }

    private String generateOrderNumber() {
        String datePart = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        int randSuffix = 1000 + random.nextInt(9000);
        return "AUR-" + datePart + "-" + randSuffix;
    }
}
