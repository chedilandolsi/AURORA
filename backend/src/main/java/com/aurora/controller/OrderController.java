package com.aurora.controller;

import com.aurora.dto.ApiResponse;
import com.aurora.dto.checkout.OrderResponse;
import com.aurora.security.UserPrincipal;
import com.aurora.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@Tag(name = "Orders", description = "Endpoints for order retrieval and tracking")
public class OrderController {

    private final OrderService orderService;

    @GetMapping("/track/{orderNumber}")
    @Operation(summary = "Track order details by order number")
    public ResponseEntity<ApiResponse<OrderResponse>> trackOrder(@PathVariable String orderNumber) {
        OrderResponse response = orderService.getOrderByOrderNumber(orderNumber);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @GetMapping("/my-orders")
    @Operation(summary = "Get order history for authenticated user")
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getMyOrders(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        if (userPrincipal == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Unauthorized"));
        }
        List<OrderResponse> orders = orderService.getUserOrders(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.ok(orders));
    }
}
