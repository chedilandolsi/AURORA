package com.aurora.controller;

import com.aurora.dto.ApiResponse;
import com.aurora.dto.admin.ReviewOrderRequest;
import com.aurora.dto.checkout.OrderResponse;
import com.aurora.model.entity.OrderStatus;
import com.aurora.security.UserPrincipal;
import com.aurora.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/admin/orders")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin - Order Management", description = "Endpoints for managing, reviewing, confirming, and rejecting artisanal customer orders")
public class AdminOrderController {

    private final OrderService orderService;

    @GetMapping
    @Operation(summary = "List all orders, optionally filtered by status")
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getOrders(
            @RequestParam(required = false) OrderStatus status) {
        List<OrderResponse> orders = orderService.getOrders(status);
        return ResponseEntity.ok(ApiResponse.ok(orders));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get full details of a specific order")
    public ResponseEntity<ApiResponse<OrderResponse>> getOrderById(@PathVariable UUID id) {
        OrderResponse order = orderService.getOrderById(id);
        return ResponseEntity.ok(ApiResponse.ok(order));
    }

    @PostMapping("/{id}/confirm")
    @Operation(summary = "Confirm an unpaid/manual order, trigger artisanal preparation, and dispatch confirmation email")
    public ResponseEntity<ApiResponse<OrderResponse>> confirmOrder(
            @PathVariable UUID id,
            @Valid @RequestBody(required = false) ReviewOrderRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        String adminEmail = userPrincipal != null ? userPrincipal.getEmail() : "Admin";
        String note = request != null ? request.getReviewNote() : null;
        log.info("Admin [{}] confirming order {}", adminEmail, id);

        OrderResponse confirmed = orderService.confirmManualOrder(id, adminEmail, note);
        return ResponseEntity.ok(ApiResponse.ok("Order confirmed successfully and notification email dispatched.", confirmed));
    }

    @PostMapping("/{id}/reject")
    @Operation(summary = "Reject an unpaid/manual order, restore reserved mask inventory, and dispatch rejection email")
    public ResponseEntity<ApiResponse<OrderResponse>> rejectOrder(
            @PathVariable UUID id,
            @Valid @RequestBody(required = false) ReviewOrderRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        String adminEmail = userPrincipal != null ? userPrincipal.getEmail() : "Admin";
        String note = request != null ? request.getReviewNote() : null;
        log.info("Admin [{}] rejecting order {}", adminEmail, id);

        OrderResponse rejected = orderService.rejectManualOrder(id, adminEmail, note);
        return ResponseEntity.ok(ApiResponse.ok("Order rejected, inventory restored, and notification dispatched.", rejected));
    }
}
