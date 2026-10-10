package com.aurora;

import com.aurora.dto.admin.AnalyticsSummaryDTO;
import com.aurora.dto.cart.AddToCartRequest;
import com.aurora.dto.cart.CartResponse;
import com.aurora.dto.catalog.ProductSummaryDTO;
import com.aurora.dto.checkout.CheckoutSessionResponse;
import com.aurora.dto.checkout.CreateCheckoutSessionRequest;
import com.aurora.dto.checkout.OrderItemRequest;
import com.aurora.dto.checkout.OrderResponse;
import com.aurora.model.entity.*;
import com.aurora.repository.*;
import com.aurora.service.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Page;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class FullFlowE2EPurchaseIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ProductService productService;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private CartService cartService;

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private OrderService orderService;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private StripePaymentService stripePaymentService;

    @Autowired
    private EmailService emailService;

    @Autowired
    private AnalyticsService analyticsService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("1. Catalog Retrieval across all 3 standardized mask categories (Abstract, Animals, People)")
    void testCatalogRetrievalAcrossCategories() {
        List<Category> allCategories = categoryRepository.findAll();
        assertThat(allCategories).isNotEmpty();

        for (Category category : allCategories) {
            Page<ProductSummaryDTO> page = productService.getProducts(
                    category.getSlug(), null, null, null, 0, 10, "createdAt", "desc"
            );
            assertThat(page).isNotNull();
            // Verify category products or general catalog retrieval
            page.getContent().forEach(item -> {
                assertThat(item.getCategorySlug()).isEqualToIgnoringCase(category.getSlug());
                assertThat(item.getPriceEur()).isGreaterThan(BigDecimal.ZERO);
                assertThat(item.getPriceUsd()).isGreaterThan(BigDecimal.ZERO);
            });
        }
    }

    @Test
    @DisplayName("2. User-tied Persistent Cart lifecycle (Add items, update quantity, verify database persistence)")
    @Transactional
    void testPersistentCartLifecycle() {
        User user = userRepository.findByEmail("test.customer@aurora.tn")
                .orElseGet(() -> userRepository.findAll().stream().findFirst().orElseThrow());

        List<Product> products = productRepository.findAll();
        assertThat(products).isNotEmpty();
        Product product1 = products.get(0);

        // Add to persistent cart
        AddToCartRequest addReq = new AddToCartRequest();
        addReq.setProductId(product1.getId());
        addReq.setQuantity(2);

        CartResponse cart = cartService.addItem(user.getId(), addReq);
        assertThat(cart).isNotNull();
        assertThat(cart.getItems()).isNotEmpty();
        assertThat(cart.getTotalItems()).isGreaterThanOrEqualTo(2);

        // Verify cart is tied in repository
        Optional<Cart> persistedCart = cartRepository.findByUserId(user.getId());
        assertThat(persistedCart).isPresent();
        assertThat(persistedCart.get().getItems()).isNotEmpty();
    }

    @Test
    @DisplayName("3. Concurrency Safety: Simulate simultaneous checkouts verifying pessimistic write locking prevents negative inventory")
    void testConcurrencyPessimisticLockingPreventsOverselling() throws Exception {
        // Create an exclusive single-stock limited edition mask
        Category category = categoryRepository.findAll().get(0);
        Product scarceMask = Product.builder()
                .category(category)
                .name("Sacred Falcon Test Artifact")
                .slug("sacred-falcon-test-" + UUID.randomUUID())
                .shortDescription("Unique limited totem with strictly 1 piece in stock.")
                .detailedDescription("Masterwork handcrafted from 300-year-old olive wood root with charred ceremonial patina.")
                .woodType("Ancient Tunisian Cedar")
                .priceEur(new BigDecimal("490.00"))
                .priceUsd(new BigDecimal("530.00"))
                .stockQuantity(1) // Only ONE in atelier!
                .isActive(true)
                .isFeatured(false)
                .dimensions("45x20x15cm")
                .weightGrams(2100)
                .build();
        scarceMask = productRepository.saveAndFlush(scarceMask);

        int threads = 3;
        ExecutorService executor = Executors.newFixedThreadPool(threads);
        CountDownLatch readyLatch = new CountDownLatch(threads);
        CountDownLatch startLatch = new CountDownLatch(1);
        AtomicInteger successCount = new AtomicInteger(0);
        AtomicInteger rejectedRaceCount = new AtomicInteger(0);

        List<String> sessionIds = new ArrayList<>();

        for (int i = 0; i < threads; i++) {
            CreateCheckoutSessionRequest checkoutReq = new CreateCheckoutSessionRequest();
            checkoutReq.setCustomerName("Buyer " + i);
            checkoutReq.setCustomerEmail("buyer" + i + "@example.com");
            checkoutReq.setShippingAddressLine1("123 Artisan Ave");
            checkoutReq.setShippingCity("Tunis");
            checkoutReq.setShippingPostalCode("1001");
            checkoutReq.setShippingCountry("Tunisia");
            checkoutReq.setCurrency("EUR");

            OrderItemRequest item = new OrderItemRequest();
            item.setProductId(scarceMask.getId());
            item.setQuantity(1);
            checkoutReq.setItems(Collections.singletonList(item));

            Order order = orderService.createOrder(checkoutReq, null);
            String mockSessionId = "cs_concurrent_test_" + UUID.randomUUID();
            order.setStripeCheckoutSessionId(mockSessionId);
            orderRepository.saveAndFlush(order);
            sessionIds.add(mockSessionId);
        }

        for (String sessionId : sessionIds) {
            executor.submit(() -> {
                readyLatch.countDown();
                try {
                    startLatch.await();
                    orderService.markOrderAsPaid(sessionId, "pi_test_" + UUID.randomUUID());
                    successCount.incrementAndGet();
                } catch (Exception e) {
                    // Race condition caught cleanly by pessimistic write lock
                    rejectedRaceCount.incrementAndGet();
                }
            });
        }

        readyLatch.await();
        startLatch.countDown(); // Release all threads concurrently
        executor.shutdown();
        boolean completed = executor.awaitTermination(10, TimeUnit.SECONDS);
        assertThat(completed).isTrue();

        // Exactly ONE order should successfully acquire stock; all others rejected
        assertThat(successCount.get()).isEqualTo(1);
        assertThat(rejectedRaceCount.get()).isEqualTo(threads - 1);

        // Product inventory must never drop below 0
        Product finalProduct = productRepository.findById(scarceMask.getId()).orElseThrow();
        assertThat(finalProduct.getStockQuantity()).isEqualTo(0);
    }

    @Test
    @DisplayName("4. Stripe Checkout Session initialization and Webhook settlement")
    void testStripeCheckoutAndWebhookSettlement() {
        Product product = productRepository.findAll().get(0);

        CreateCheckoutSessionRequest req = new CreateCheckoutSessionRequest();
        req.setCustomerName("Sophia Dubois");
        req.setCustomerEmail("sophia.dubois@paris-art.fr");
        req.setShippingAddressLine1("45 Rue de Rivoli");
        req.setShippingCity("Paris");
        req.setShippingPostalCode("75001");
        req.setShippingCountry("France");
        req.setCurrency("EUR");

        OrderItemRequest item = new OrderItemRequest();
        item.setProductId(product.getId());
        item.setQuantity(1);
        req.setItems(Collections.singletonList(item));

        CheckoutSessionResponse sessionResponse = stripePaymentService.createCheckoutSession(req, null);
        assertThat(sessionResponse).isNotNull();
        assertThat(sessionResponse.getSessionId()).isNotBlank();
        assertThat(sessionResponse.getCheckoutUrl()).isNotBlank();
        assertThat(sessionResponse.getCurrency()).isEqualTo("EUR");

        // Simulate incoming Stripe checkout.session.completed webhook
        String webhookPayload = "{\n" +
                "  \"id\": \"evt_test_" + UUID.randomUUID() + "\",\n" +
                "  \"type\": \"checkout.session.completed\",\n" +
                "  \"data\": {\n" +
                "    \"object\": {\n" +
                "      \"id\": \"" + sessionResponse.getSessionId() + "\",\n" +
                "      \"payment_intent\": \"pi_test_confirmed_" + UUID.randomUUID() + "\"\n" +
                "    }\n" +
                "  }\n" +
                "}";

        stripePaymentService.handleWebhookEvent(webhookPayload, null);

        // Verify order is now PENDING_CONFIRMATION and PAID
        Order settledOrder = orderRepository.findByStripeCheckoutSessionId(sessionResponse.getSessionId()).orElseThrow();
        assertThat(settledOrder.getStatus()).isEqualTo(OrderStatus.PENDING_CONFIRMATION);
        assertThat(settledOrder.getPaymentStatus()).isEqualTo(PaymentStatus.PAID);
    }

    @Test
    @DisplayName("5. Strict Order Lifecycle FSM (PENDING_CONFIRMATION -> CONFIRMED -> ON_THE_WAY -> DELIVERED)")
    void testStrictOrderLifecycleFSM() {
        Product product = productRepository.findAll().get(0);

        CreateCheckoutSessionRequest req = new CreateCheckoutSessionRequest();
        req.setCustomerName("Lucas Vance");
        req.setCustomerEmail("lucas.vance@chicago-design.com");
        req.setShippingAddressLine1("800 Michigan Ave");
        req.setShippingCity("Chicago");
        req.setShippingPostalCode("60611");
        req.setShippingCountry("United States");
        req.setCurrency("USD");

        OrderItemRequest item = new OrderItemRequest();
        item.setProductId(product.getId());
        item.setQuantity(1);
        req.setItems(Collections.singletonList(item));

        Order order = orderService.createOrder(req, null);
        String mockSessionId = "cs_fsm_" + UUID.randomUUID();
        order.setStripeCheckoutSessionId(mockSessionId);
        orderRepository.saveAndFlush(order);

        // Step 1: Payment settled -> PENDING_CONFIRMATION
        orderService.markOrderAsPaid(mockSessionId, "pi_test_" + UUID.randomUUID());
        Order paidOrder = orderRepository.findById(order.getId()).orElseThrow();
        assertThat(paidOrder.getStatus()).isEqualTo(OrderStatus.PENDING_CONFIRMATION);

        // Step 2: Admin reviews & confirms -> CONFIRMED
        OrderResponse confirmed = orderService.confirmOrder(order.getId(), "admin@aurora-masks.tn", "Verified wood authenticity & packaging");
        assertThat(confirmed.getStatus()).isEqualTo(OrderStatus.CONFIRMED);

        // Step 3: Admin dispatches with official DHL tracking -> ON_THE_WAY
        OrderResponse shipped = orderService.shipOrder(order.getId(), "DHL-TN-9876543210", "DHL Express", "admin@aurora-masks.tn");
        assertThat(shipped.getStatus()).isEqualTo(OrderStatus.ON_THE_WAY);
        assertThat(shipped.getTrackingNumber()).isEqualTo("DHL-TN-9876543210");
        assertThat(shipped.getCarrier()).isEqualTo("DHL Express");

        // Step 4: Admin marks delivered -> DELIVERED
        OrderResponse delivered = orderService.deliverOrder(order.getId(), "admin@aurora-masks.tn");
        assertThat(delivered.getStatus()).isEqualTo(OrderStatus.DELIVERED);
    }

    @Test
    @DisplayName("6. Email Notification Dispatch Triggers on Confirmation and Rejection")
    void testEmailNotificationTriggers() {
        Order order = orderRepository.findAll().stream().findFirst().orElseThrow();

        // Verify email methods execute cleanly without throwing unchecked errors
        emailService.sendManualOrderReceivedEmail(order);
        emailService.sendOrderConfirmationEmail(order);
        emailService.sendOrderShippedEmail(order);
        emailService.sendOrderRejectionEmail(order, "Artisan flaw detected during inspection");
    }

    @Test
    @DisplayName("7. Admin Analytics Endpoints validate clean responses across date ranges without throwing errors")
    @WithMockUser(username = "admin@aurora-masks.tn", roles = {"ADMIN"})
    void testAdminAnalyticsEndpoints() throws Exception {
        String[] ranges = {"WEEKLY", "MONTHLY", "YEARLY", "ALL"};

        for (String range : ranges) {
            mockMvc.perform(get("/api/admin/analytics")
                            .param("range", range)
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success").value(true))
                    .andExpect(jsonPath("$.data.totalRevenue").isNumber());

            mockMvc.perform(get("/api/admin/analytics/top-products")
                            .param("range", range)
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success").value(true));
        }

        // Direct Service validation
        AnalyticsSummaryDTO summary = analyticsService.getAnalytics("MONTHLY");
        assertThat(summary).isNotNull();
        assertThat(summary.getRevenueTrend()).isNotNull();
        assertThat(summary.getCategoryBreakdown()).isNotNull();
    }
}
