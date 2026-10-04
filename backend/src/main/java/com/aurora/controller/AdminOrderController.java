package com.aurora.controller;

import com.aurora.dto.ApiResponse;
import com.aurora.dto.admin.ReviewOrderRequest;
import com.aurora.dto.admin.ShipOrderRequest;
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
@Tag(name = "Admin - Order Management & Strict FSM", description = "Endpoints for managing strict order lifecycle (Confirm, Ship via DHL, Deliver, Reject)")
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
    @Operation(summary = "Step 2: Confirm order after manual admin review (PENDING_CONFIRMATION -> CONFIRMED)")
    public ResponseEntity<ApiResponse<OrderResponse>> confirmOrder(
            @PathVariable UUID id,
            @Valid @RequestBody(required = false) ReviewOrderRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        String adminEmail = userPrincipal != null ? userPrincipal.getEmail() : "Admin";
        String note = request != null ? request.getReviewNote() : null;
        log.info("Admin [{}] confirming order {}", adminEmail, id);

        OrderResponse confirmed = orderService.confirmOrder(id, adminEmail, note);
        return ResponseEntity.ok(ApiResponse.ok("Order confirmed and placed into atelier preparation queue.", confirmed));
    }

    @PostMapping("/{id}/ship")
    @Operation(summary = "Step 3: Dispatch order via DHL Express / Poste Rapide with official tracking number (CONFIRMED -> ON_THE_WAY)")
    public ResponseEntity<ApiResponse<OrderResponse>> shipOrder(
            @PathVariable UUID id,
            @Valid @RequestBody ShipOrderRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        String adminEmail = userPrincipal != null ? userPrincipal.getEmail() : "Admin";
        log.info("Admin [{}] shipping order {} with DHL tracking {}", adminEmail, id, request.getTrackingNumber());

        OrderResponse shipped = orderService.shipOrder(id, request.getTrackingNumber(), request.getCarrier(), adminEmail);
        return ResponseEntity.ok(ApiResponse.ok("Order marked as ON_THE_WAY with DHL tracking number. Customer notified via email.", shipped));
    }

    @PostMapping("/{id}/deliver")
    @Operation(summary = "Step 4: Mark order as successfully delivered to collector (ON_THE_WAY -> DELIVERED)")
    public ResponseEntity<ApiResponse<OrderResponse>> deliverOrder(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        String adminEmail = userPrincipal != null ? userPrincipal.getEmail() : "Admin";
        log.info("Admin [{}] marking order {} as DELIVERED", adminEmail, id);

        OrderResponse delivered = orderService.deliverOrder(id, adminEmail);
        return ResponseEntity.ok(ApiResponse.ok("Order successfully marked as DELIVERED.", delivered));
    }

    @PostMapping("/{id}/reject")
    @Operation(summary = "Step 5: Reject order, restore reserved mask inventory, and dispatch update email")
    public ResponseEntity<ApiResponse<OrderResponse>> rejectOrder(
            @PathVariable UUID id,
            @Valid @RequestBody(required = false) ReviewOrderRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        String adminEmail = userPrincipal != null ? userPrincipal.getEmail() : "Admin";
        String note = request != null ? request.getReviewNote() : null;
        log.info("Admin [{}] rejecting order {}", adminEmail, id);

        OrderResponse rejected = orderService.rejectOrder(id, adminEmail, note);
        return ResponseEntity.ok(ApiResponse.ok("Order rejected and mask inventory restored to catalog.", rejected));
    }
}
