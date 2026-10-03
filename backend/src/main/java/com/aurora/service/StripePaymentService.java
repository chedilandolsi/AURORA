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

        String currencyCode = order.getCurrency().toLowerCase(); // "eur" or "usd"

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

            log.info("Created Stripe Checkout Session {} for order #{}", session.getId(), order.getOrderNumber());

            return CheckoutSessionResponse.builder()
                    .sessionId(session.getId())
                    .checkoutUrl(session.getUrl())
                    .orderNumber(order.getOrderNumber())
                    .totalAmount(order.getTotalAmount())
                    .currency(order.getCurrency())
                    .build();

        } catch (StripeException e) {
            log.error("Stripe Checkout Session creation failed", e);
            throw new BadRequestException("Failed to initiate secure Stripe checkout: " + e.getMessage());
        }
    }

    public void handleWebhookEvent(String payload, String sigHeader) {
        Event event;
        try {
            if (stripeWebhookSecret != null && !stripeWebhookSecret.contains("whsec_test_secret")) {
                event = Webhook.constructEvent(payload, sigHeader, stripeWebhookSecret);
            } else {
                // In local dev/test environment without CLI webhook signing secret
                event = Event.GSON.fromJson(payload, Event.class);
            }
        } catch (SignatureVerificationException e) {
            log.error("Invalid Stripe webhook signature", e);
            throw new BadRequestException("Invalid webhook signature");
        } catch (Exception e) {
            log.error("Error parsing Stripe webhook", e);
            throw new BadRequestException("Invalid webhook payload");
        }

        log.info("Received Stripe webhook event: {}", event.getType());

        if ("checkout.session.completed".equals(event.getType())) {
            Session session = (Session) event.getDataObjectDeserializer().getObject().orElse(null);
            if (session != null) {
                String sessionId = session.getId();
                String paymentIntentId = session.getPaymentIntent();
                log.info("Payment confirmed via checkout.session.completed for session: {}", sessionId);
                orderService.markOrderAsPaid(sessionId, paymentIntentId);
            }
        }
    }
}
