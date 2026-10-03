package com.aurora.controller;

import com.aurora.dto.ApiResponse;
import com.aurora.dto.cart.AddToCartRequest;
import com.aurora.dto.cart.CartResponse;
import com.aurora.dto.cart.UpdateCartItemRequest;
import com.aurora.security.UserPrincipal;
import com.aurora.service.CartService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
@Tag(name = "Cart", description = "User-specific persistent shopping cart endpoints")
public class CartController {

    private final CartService cartService;

    @GetMapping
    @Operation(summary = "Get persisted active cart for authenticated user")
    public ResponseEntity<ApiResponse<CartResponse>> getCart(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        if (userPrincipal == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Authentication required to view cart."));
        }
        CartResponse cart = cartService.getCart(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.ok(cart));
    }

    @PostMapping("/items")
    @Operation(summary = "Add an artisanal mask to the user's persisted cart")
    public ResponseEntity<ApiResponse<CartResponse>> addItem(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody AddToCartRequest request) {
        if (userPrincipal == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Authentication required to modify cart."));
        }
        CartResponse cart = cartService.addItem(userPrincipal.getId(), request);
        return ResponseEntity.ok(ApiResponse.ok(cart));
    }

    @PutMapping("/items/{itemId}")
    @Operation(summary = "Update line item quantity in user's cart")
    public ResponseEntity<ApiResponse<CartResponse>> updateItemQuantity(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable UUID itemId,
            @Valid @RequestBody UpdateCartItemRequest request) {
        if (userPrincipal == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Authentication required to modify cart."));
        }
        CartResponse cart = cartService.updateItemQuantity(userPrincipal.getId(), itemId, request.getQuantity());
        return ResponseEntity.ok(ApiResponse.ok(cart));
    }

    @DeleteMapping("/items/{itemId}")
    @Operation(summary = "Remove an item from user's cart")
    public ResponseEntity<ApiResponse<CartResponse>> removeItem(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable UUID itemId) {
        if (userPrincipal == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Authentication required to modify cart."));
        }
        CartResponse cart = cartService.removeItem(userPrincipal.getId(), itemId);
        return ResponseEntity.ok(ApiResponse.ok(cart));
    }

    @DeleteMapping("/clear")
    @Operation(summary = "Clear all items from user's cart")
    public ResponseEntity<ApiResponse<CartResponse>> clearCart(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        if (userPrincipal == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Authentication required to modify cart."));
        }
        CartResponse cart = cartService.clearCart(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.ok(cart));
    }
}
