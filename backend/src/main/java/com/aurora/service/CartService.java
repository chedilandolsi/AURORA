package com.aurora.service;

import com.aurora.dto.cart.AddToCartRequest;
import com.aurora.dto.cart.CartItemResponse;
import com.aurora.dto.cart.CartResponse;
import com.aurora.exception.BadRequestException;
import com.aurora.exception.ResourceNotFoundException;
import com.aurora.model.entity.Cart;
import com.aurora.model.entity.CartItem;
import com.aurora.model.entity.Product;
import com.aurora.model.entity.User;
import com.aurora.repository.CartItemRepository;
import com.aurora.repository.CartRepository;
import com.aurora.repository.ProductRepository;
import com.aurora.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final ProductService productService;

    @Transactional
    public Cart getOrCreateCartEntity(UUID userId) {
        return cartRepository.findByUserId(userId)
                .orElseGet(() -> {
                    User user = userRepository.findById(userId)
                            .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
                    Cart newCart = Cart.builder()
                            .user(user)
                            .items(new ArrayList<>())
                            .build();
                    return cartRepository.save(newCart);
                });
    }

    @Transactional(readOnly = true)
    public CartResponse getCart(UUID userId) {
        Cart cart = cartRepository.findByUserId(userId).orElse(null);
        if (cart == null || cart.getItems() == null || cart.getItems().isEmpty()) {
            return buildEmptyCartResponse(cart != null ? cart.getId() : null);
        }
        return buildCartResponse(cart);
    }

    @Transactional
    public CartResponse addItem(UUID userId, AddToCartRequest request) {
        Cart cart = getOrCreateCartEntity(userId);
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + request.getProductId()));

        if (!Boolean.TRUE.equals(product.getIsActive())) {
            throw new BadRequestException("This artisanal mask is currently not active for purchase.");
        }

        if (product.getStockQuantity() <= 0) {
            throw new BadRequestException("This artisanal mask is currently out of stock.");
        }

        CartItem existingItem = cartItemRepository.findByCartIdAndProductId(cart.getId(), product.getId())
                .orElse(null);

        int requestedQuantity = request.getQuantity() != null && request.getQuantity() > 0 ? request.getQuantity() : 1;

        if (existingItem != null) {
            int newQuantity = existingItem.getQuantity() + requestedQuantity;
            if (newQuantity > product.getStockQuantity()) {
                throw new BadRequestException("Only " + product.getStockQuantity() + " pieces available in atelier stock.");
            }
            existingItem.setQuantity(newQuantity);
            cartItemRepository.save(existingItem);
        } else {
            if (requestedQuantity > product.getStockQuantity()) {
                throw new BadRequestException("Only " + product.getStockQuantity() + " pieces available in atelier stock.");
            }
            CartItem newItem = CartItem.builder()
                    .cart(cart)
                    .product(product)
                    .quantity(requestedQuantity)
                    .build();
            cart.getItems().add(newItem);
            cartItemRepository.save(newItem);
        }

        return buildCartResponse(cart);
    }

    @Transactional
    public CartResponse updateItemQuantity(UUID userId, UUID itemId, int quantity) {
        Cart cart = getOrCreateCartEntity(userId);
        CartItem item = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found with id: " + itemId));

        if (!item.getCart().getId().equals(cart.getId())) {
            throw new BadRequestException("Cart item does not belong to user's cart.");
        }

        if (quantity <= 0) {
            cart.getItems().remove(item);
            cartItemRepository.delete(item);
        } else {
            Product product = item.getProduct();
            if (quantity > product.getStockQuantity()) {
                throw new BadRequestException("Only " + product.getStockQuantity() + " pieces available in stock.");
            }
            item.setQuantity(quantity);
            cartItemRepository.save(item);
        }

        return buildCartResponse(cart);
    }

    @Transactional
    public CartResponse removeItem(UUID userId, UUID itemId) {
        Cart cart = getOrCreateCartEntity(userId);
        CartItem item = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found with id: " + itemId));

        if (!item.getCart().getId().equals(cart.getId())) {
            throw new BadRequestException("Cart item does not belong to user's cart.");
        }

        cart.getItems().remove(item);
        cartItemRepository.delete(item);

        return buildCartResponse(cart);
    }

    @Transactional
    public CartResponse clearCart(UUID userId) {
        Cart cart = cartRepository.findByUserId(userId).orElse(null);
        if (cart != null) {
            cart.getItems().clear();
            cartItemRepository.deleteByCartId(cart.getId());
            return buildEmptyCartResponse(cart.getId());
        }
        return buildEmptyCartResponse(null);
    }

    private CartResponse buildCartResponse(Cart cart) {
        List<CartItemResponse> itemResponses = cart.getItems().stream()
                .map(this::mapToItemResponse)
                .collect(Collectors.toList());

        BigDecimal subtotalEur = itemResponses.stream()
                .map(CartItemResponse::getLineTotalEur)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal subtotalUsd = itemResponses.stream()
                .map(CartItemResponse::getLineTotalUsd)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        int totalCount = itemResponses.stream()
                .mapToInt(CartItemResponse::getQuantity)
                .sum();

        BigDecimal freeShippingThreshold = new BigDecimal("200.00");
        BigDecimal flatRateShipping = new BigDecimal("25.00");

        BigDecimal shippingEur = (totalCount > 0 && subtotalEur.compareTo(freeShippingThreshold) < 0)
                ? flatRateShipping
                : BigDecimal.ZERO;

        BigDecimal shippingUsd = (totalCount > 0 && subtotalUsd.compareTo(freeShippingThreshold) < 0)
                ? flatRateShipping
                : BigDecimal.ZERO;

        return CartResponse.builder()
                .id(cart.getId())
                .items(itemResponses)
                .totalItems(totalCount)
                .subtotalEur(subtotalEur)
                .subtotalUsd(subtotalUsd)
                .shippingEur(shippingEur)
                .shippingUsd(shippingUsd)
                .totalEur(subtotalEur.add(shippingEur))
                .totalUsd(subtotalUsd.add(shippingUsd))
                .build();
    }

    private CartItemResponse mapToItemResponse(CartItem item) {
        Product p = item.getProduct();
        BigDecimal priceEur = p.getDiscountedPriceEur();
        BigDecimal priceUsd = p.getDiscountedPriceUsd();
        BigDecimal qty = BigDecimal.valueOf(item.getQuantity());

        return CartItemResponse.builder()
                .id(item.getId())
                .product(productService.mapToSummaryDTO(p))
                .quantity(item.getQuantity())
                .lineTotalEur(priceEur.multiply(qty))
                .lineTotalUsd(priceUsd.multiply(qty))
                .build();
    }

    private CartResponse buildEmptyCartResponse(UUID cartId) {
        return CartResponse.builder()
                .id(cartId)
                .items(new ArrayList<>())
                .totalItems(0)
                .subtotalEur(BigDecimal.ZERO)
                .subtotalUsd(BigDecimal.ZERO)
                .shippingEur(BigDecimal.ZERO)
                .shippingUsd(BigDecimal.ZERO)
                .totalEur(BigDecimal.ZERO)
                .totalUsd(BigDecimal.ZERO)
                .build();
    }
}
