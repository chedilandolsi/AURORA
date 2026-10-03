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
        log.info("Created pending order #{} for total {} {}", savedOrder.getOrderNumber(), savedOrder.getTotalAmount(), savedOrder.getCurrency());
        return savedOrder;
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
                productRepository.findById(item.getProductId()).ifPresent(product -> {
                    int remaining = Math.max(0, product.getStockQuantity() - item.getQuantity());
                    product.setStockQuantity(remaining);
                    productRepository.save(product);
                });
            }
        }

        orderRepository.save(order);
        log.info("Successfully marked order #{} as PAID with PaymentIntent: {}", order.getOrderNumber(), paymentIntentId);
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
