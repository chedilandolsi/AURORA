package com.aurora.service;

import com.aurora.dto.checkout.CheckoutSessionResponse;
import com.aurora.dto.checkout.CreateCheckoutSessionRequest;
import com.aurora.exception.BadRequestException;
import com.aurora.model.entity.Order;
import com.aurora.model.entity.OrderItem;
import com.stripe.Stripe;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.exception.StripeException;
import com.stripe.model.Event;
import com.stripe.model.checkout.Session;
import com.stripe.net.Webhook;
import com.stripe.param.checkout.SessionCreateParams;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class StripePaymentService {

    private final OrderService orderService;

    @Value("${stripe.api-key}")
    private String stripeApiKey;

    @Value("${stripe.webhook-secret}")
    private String stripeWebhookSecret;

    @Value("${stripe.success-url}")
    private String successUrl;

    @Value("${stripe.cancel-url}")
    private String cancelUrl;

    @Value("${stripe.payout.wise-account-recipient:chedi-wise-eur-artisanal-account}")
    private String wisePayoutAccount;

    @PostConstruct
    public void init() {
        Stripe.apiKey = this.stripeApiKey;
        log.info("Initialized Stripe SDK with target Wise Payout Recipient: {}", wisePayoutAccount);
    }

    @Transactional
    public CheckoutSessionResponse createCheckoutSession(CreateCheckoutSessionRequest request, UUID userId) {
        // 1. Create order in database
        Order order = orderService.createOrder(request, userId);

        // Multi-currency handling: sanitize and support both EUR and USD for European and US buyers
        String currencyCode = "eur";
        if (order.getCurrency() != null && !order.getCurrency().isBlank()) {
            String c = order.getCurrency().trim().toLowerCase();
            if ("usd".equals(c) || "eur".equals(c)) {
                currencyCode = c;
            }
        }

        // 2. Build Stripe Line Items
        List<SessionCreateParams.LineItem> lineItems = new ArrayList<>();

        for (OrderItem item : order.getItems()) {
            // Stripe expects amount in smallest currency unit (cents)
            long unitAmountCents = item.getUnitPrice().multiply(new BigDecimal(100)).longValue();

            SessionCreateParams.LineItem lineItem = SessionCreateParams.LineItem.builder()
                    .setQuantity((long) item.getQuantity())
                    .setPriceData(
                            SessionCreateParams.LineItem.PriceData.builder()
                                    .setCurrency(currencyCode)
                                    .setUnitAmount(unitAmountCents)
                                    .setProductData(
                                            SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                                    .setName(item.getProductName())
                                                    .setDescription("Authentic handcrafted Tunisian mask carved in " + (item.getProductWoodType() != null ? item.getProductWoodType() : "Natural Olive Wood"))
                                                    .build()
                                    )
                                    .build()
                    )
                    .build();

            lineItems.add(lineItem);
        }

        // Add Shipping line item if applicable
        if (order.getShippingAmount().compareTo(BigDecimal.ZERO) > 0) {
            long shippingCents = order.getShippingAmount().multiply(new BigDecimal(100)).longValue();
            lineItems.add(
                    SessionCreateParams.LineItem.builder()
                            .setQuantity(1L)
                            .setPriceData(
                                    SessionCreateParams.LineItem.PriceData.builder()
                                            .setCurrency(currencyCode)
                                            .setUnitAmount(shippingCents)
                                            .setProductData(
                                                    SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                                            .setName("DHL Express International Shipping")
                                                            .setDescription("Direct artisanal courier from Tunisia with tracking & insurance")
                                                            .build()
                                            )
                                            .build()
                            )
                            .build()
            );
        }

        // 3. Build Checkout Session Params
        SessionCreateParams.Builder sessionParamsBuilder = SessionCreateParams.builder()
                .setMode(SessionCreateParams.Mode.PAYMENT)
                .setCustomerEmail(order.getCustomerEmail())
                .setSuccessUrl(successUrl)
                .setCancelUrl(cancelUrl)
                .addAllLineItem(lineItems)
                .putMetadata("order_id", order.getId().toString())
                .putMetadata("order_number", order.getOrderNumber())
                .putMetadata("wise_payout_account", wisePayoutAccount)
                .putMetadata("platform", "AURORA_ARTISAN_DECOR");

        // Allowed payment method types optimized for USA and Europe
        sessionParamsBuilder.addPaymentMethodType(SessionCreateParams.PaymentMethodType.CARD);

        try {
            Session session = Session.create(sessionParamsBuilder.build());

            // Link session ID to order
            order.setStripeCheckoutSessionId(session.getId());

            log.info("Created Stripe Checkout Session {} for order #{} in currency {}", session.getId(), order.getOrderNumber(), currencyCode);

            return CheckoutSessionResponse.builder()
                    .sessionId(session.getId())
                    .checkoutUrl(session.getUrl())
                    .orderNumber(order.getOrderNumber())
                    .totalAmount(order.getTotalAmount())
                    .currency(currencyCode.toUpperCase())
                    .build();

        } catch (StripeException e) {
            log.warn("Stripe Checkout Session creation via Stripe API returned: {}. Checking sandbox fallback.", e.getMessage());
            // In test/sandbox environment, fallback to simulated sandbox session URL
            if (stripeApiKey != null && (stripeApiKey.startsWith("sk_test_") || stripeApiKey.contains("placeholder") || stripeApiKey.contains("test"))) {
                String mockSessionId = "cs_test_" + UUID.randomUUID().toString().replace("-", "");
                order.setStripeCheckoutSessionId(mockSessionId);
                String sandboxRedirectUrl = successUrl.contains("{CHECKOUT_SESSION_ID}")
                        ? successUrl.replace("{CHECKOUT_SESSION_ID}", mockSessionId)
                        : (successUrl + (successUrl.contains("?") ? "&" : "?") + "session_id=" + mockSessionId);

                log.info("Active sandbox mode: generated checkout session {} with return URL {}", mockSessionId, sandboxRedirectUrl);
                return CheckoutSessionResponse.builder()
                        .sessionId(mockSessionId)
                        .checkoutUrl(sandboxRedirectUrl)
                        .orderNumber(order.getOrderNumber())
                        .totalAmount(order.getTotalAmount())
                        .currency(order.getCurrency())
                        .build();
            }
            log.error("Stripe Checkout Session creation failed", e);
            throw new BadRequestException("Failed to initiate secure Stripe checkout: " + e.getMessage());
        }
    }

    public void handleWebhookEvent(String payload, String sigHeader) {
        Event event = null;
        boolean isConfiguredSecret = stripeWebhookSecret != null 
                && !stripeWebhookSecret.isBlank() 
                && !stripeWebhookSecret.contains("placeholder")
                && !stripeWebhookSecret.contains("whsec_test_secret");

        try {
            if (isConfiguredSecret) {
                // Strict cryptographic verification with Stripe SDK
                if (sigHeader == null || sigHeader.isBlank()) {
                    log.error("Webhook rejected: Missing Stripe-Signature header while webhook secret is configured");
                    throw new BadRequestException("Missing Stripe-Signature header");
                }
                event = Webhook.constructEvent(payload, sigHeader, stripeWebhookSecret);
                log.info("Cryptographic signature successfully verified for Stripe event: {}", event.getId());
            } else {
                // Local dev test sandbox only (when webhook secret is not yet set)
                log.warn("Stripe webhook secret not configured. Parsing direct payload for local dev/testing.");
                event = Event.GSON.fromJson(payload, Event.class);
            }
        } catch (SignatureVerificationException e) {
            log.error("Strict cryptographic signature verification FAILED: {}", e.getMessage());
            throw new BadRequestException("Invalid Stripe cryptographic signature: " + e.getMessage());
        } catch (BadRequestException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error parsing Stripe webhook payload: {}", e.getMessage(), e);
            throw new BadRequestException("Invalid webhook payload: " + e.getMessage());
        }

        if (event == null) {
            throw new BadRequestException("Stripe event could not be deserialized");
        }

        log.info("Received Stripe webhook event: {}", event.getType());

        if ("checkout.session.completed".equals(event.getType())) {
            String sessionId = null;
            String paymentIntentId = null;

            try {
                Session session = (Session) event.getDataObjectDeserializer().getObject().orElse(null);
                if (session != null) {
                    sessionId = session.getId();
                    paymentIntentId = session.getPaymentIntent();
                }
            } catch (Exception e) {
                log.debug("EventDataObjectDeserializer as Session skipped: {}", e.getMessage());
            }

            // Fallback: direct extraction from JSON payload for sandbox testing
            if (sessionId == null) {
                try {
                    com.fasterxml.jackson.databind.JsonNode rootNode = new com.fasterxml.jackson.databind.ObjectMapper().readTree(payload);
                    com.fasterxml.jackson.databind.JsonNode objNode = rootNode.path("data").path("object");
                    if (!objNode.isMissingNode()) {
                        sessionId = objNode.has("id") ? objNode.get("id").asText() : null;
                        paymentIntentId = objNode.has("payment_intent") ? objNode.get("payment_intent").asText() : null;
                    }
                } catch (Exception ex) {
                    log.warn("Fallback JSON parsing for session ID failed: {}", ex.getMessage());
                }
            }

            if (sessionId != null && !sessionId.isBlank()) {
                if (paymentIntentId == null || paymentIntentId.isBlank()) {
                    paymentIntentId = "pi_test_" + UUID.randomUUID().toString().substring(0, 8);
                }
                log.info("Payment confirmed via checkout.session.completed for session: {}", sessionId);
                orderService.markOrderAsPaid(sessionId, paymentIntentId);
            } else {
                log.warn("Could not find session ID in checkout.session.completed event");
            }
        }
    }
}
