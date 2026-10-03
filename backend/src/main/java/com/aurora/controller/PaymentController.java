package com.aurora.controller;

import com.aurora.dto.ApiResponse;
import com.aurora.dto.checkout.CheckoutSessionResponse;
import com.aurora.dto.checkout.CreateCheckoutSessionRequest;
import com.aurora.dto.checkout.OrderResponse;
import com.aurora.security.UserPrincipal;
import com.aurora.service.OrderService;
import com.aurora.service.StripePaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@Tag(name = "Payments & Stripe Checkout", description = "Endpoints for creating Stripe Checkout Sessions and processing webhooks")
public class PaymentController {

    private final StripePaymentService stripePaymentService;
    private final OrderService orderService;

    @PostMapping("/create-checkout-session")
    @Operation(summary = "Create a server-side Stripe Checkout Session for EUR/USD international payments")
    public ResponseEntity<ApiResponse<CheckoutSessionResponse>> createCheckoutSession(
            @Valid @RequestBody CreateCheckoutSessionRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {

        UUID userId = userPrincipal != null ? userPrincipal.getId() : null;
        log.info("Initiating checkout session for customer: {}, currency: {}", request.getCustomerEmail(), request.getCurrency());

        CheckoutSessionResponse response = stripePaymentService.createCheckoutSession(request, userId);
        return ResponseEntity.ok(ApiResponse.ok("Stripe checkout session initialized successfully", response));
    }

    @GetMapping("/session/{sessionId}")
    @Operation(summary = "Get order confirmation details by Stripe session ID after checkout completion")
    public ResponseEntity<ApiResponse<OrderResponse>> getOrderBySessionId(@PathVariable String sessionId) {
        OrderResponse response = orderService.getOrderBySessionId(sessionId);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PostMapping("/webhook")
    @Operation(summary = "Stripe Webhook Listener for real-time payment settlement and order fulfillment")
    public ResponseEntity<String> handleStripeWebhook(
            @RequestBody String payload,
            @RequestHeader(value = "Stripe-Signature", required = false) String sigHeader) {

        log.info("Processing Stripe webhook notification");
        stripePaymentService.handleWebhookEvent(payload, sigHeader);
        return ResponseEntity.ok("Webhook processed successfully");
    }
}
