package com.aurora.controller;

import com.aurora.dto.ApiResponse;
import com.aurora.dto.checkout.OrderResponse;
import com.aurora.dto.tracking.TrackingResponse;
import com.aurora.security.UserPrincipal;
import com.aurora.service.DhlTrackingService;
import com.aurora.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@Tag(name = "Orders & DHL Live Tracking", description = "Endpoints for customer order history and DHL live tracking milestones")
public class OrderController {

    private final OrderService orderService;
    private final DhlTrackingService dhlTrackingService;

    @GetMapping("/my-orders")
    @Operation(summary = "Get order history for authenticated collector")
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getMyOrders(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        if (userPrincipal == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Unauthorized"));
        }
        List<OrderResponse> orders = orderService.getUserOrders(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.ok(orders));
    }

    @GetMapping("/{orderNumber}")
    @Operation(summary = "Get order details by order number reference")
    public ResponseEntity<ApiResponse<OrderResponse>> getOrderByOrderNumber(@PathVariable String orderNumber) {
        OrderResponse response = orderService.getOrderByOrderNumber(orderNumber);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @GetMapping("/{id}/tracking")
    @Operation(summary = "Fetch live DHL Express shipment milestones by Order ID")
    public ResponseEntity<ApiResponse<TrackingResponse>> getTrackingByOrderId(@PathVariable UUID id) {
        TrackingResponse response = dhlTrackingService.getTrackingByOrderId(id);
        return ResponseEntity.ok(ApiResponse.ok("Live DHL shipment milestones retrieved", response));
    }

    @GetMapping("/track/{orderNumber}")
    @Operation(summary = "Fetch live DHL Express shipment milestones by Order Number reference")
    public ResponseEntity<ApiResponse<TrackingResponse>> getTrackingByOrderNumber(@PathVariable String orderNumber) {
        TrackingResponse response = dhlTrackingService.getTrackingByOrderNumber(orderNumber);
        return ResponseEntity.ok(ApiResponse.ok("Live DHL shipment milestones retrieved", response));
    }
}
