package com.aurora.config;

import com.aurora.model.entity.*;
import com.aurora.repository.OrderRepository;
import com.aurora.repository.ProductRepository;
import com.aurora.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import com.aurora.repository.CartItemRepository;
import com.aurora.repository.CartRepository;
import org.springframework.security.crypto.password.PasswordEncoder;

@Slf4j
@Component
@org.springframework.core.annotation.Order(20)
@RequiredArgsConstructor
public class OrderDataSeeder implements CommandLineRunner {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;

    @Override
    @Transactional
    public void run(String... args) {
        log.info("Checking order lifecycle seed data across all 5 FSM states...");

        // 1. Seed dedicated customer test account (test.customer@aurora.tn) with empty cart
        seedTestCustomerAccount();

        List<Product> products = productRepository.findAll();
        if (products.isEmpty()) {
            log.warn("No products found in catalog. Skipping order seeding.");
            return;
        }

        // Try to associate with registered user, preferably chedi.landolsi@gmail.com or admin
        Optional<User> primaryUserOpt = userRepository.findByEmail("chedi.landolsi@gmail.com");
        if (primaryUserOpt.isEmpty()) {
            List<User> allUsers = userRepository.findAll();
            if (!allUsers.isEmpty()) {
                primaryUserOpt = Optional.of(allUsers.get(0));
            }
        }
        User targetUser = primaryUserOpt.orElse(null);

        // Map sample products by category or index
        Product abstractMask = products.stream()
                .filter(p -> p.getCategory() != null && "abstract".equalsIgnoreCase(p.getCategory().getSlug()))
                .findFirst()
                .orElse(products.get(0));

        Product animalMask = products.stream()
                .filter(p -> p.getCategory() != null && "animals".equalsIgnoreCase(p.getCategory().getSlug()))
                .findFirst()
                .orElse(products.size() > 1 ? products.get(1) : products.get(0));

        Product peopleMask = products.stream()
                .filter(p -> p.getCategory() != null && "people".equalsIgnoreCase(p.getCategory().getSlug()))
                .findFirst()
                .orElse(products.size() > 2 ? products.get(2) : products.get(0));

        Instant now = Instant.now();

        // 1. Status: PENDING_CONFIRMATION
        if (orderRepository.findByStatus(OrderStatus.PENDING_CONFIRMATION).isEmpty()) {
            log.info("Seeding PENDING_CONFIRMATION mock orders...");
            createOrder(
                    "AUR-20261004-1001",
                    targetUser,
                    OrderStatus.PENDING_CONFIRMATION,
                    PaymentStatus.PAID,
                    PaymentMethod.STRIPE,
                    "EUR",
                    "Julian Vance",
                    "julian.vance@paris-design.fr",
                    "+33 6 12 34 56 78",
                    "42 Rue de Rivoli",
                    "Apt 3B",
                    "Paris",
                    "Île-de-France",
                    "75001",
                    "France",
                    null,
                    null,
                    null,
                    null,
                    null,
                    now.minus(2, ChronoUnit.HOURS),
                    List.of(abstractMask)
            );

            createOrder(
                    "AUR-20261004-1002",
                    targetUser,
                    OrderStatus.PENDING_CONFIRMATION,
                    PaymentStatus.PAID,
                    PaymentMethod.STRIPE,
                    "USD",
                    "Elena Rostova",
                    "elena.rostova@gallery-ny.com",
                    "+1 (212) 555-0144",
                    "150 Central Park West",
                    "Suite 14",
                    "New York",
                    "NY",
                    "10023",
                    "United States",
                    null,
                    null,
                    null,
                    null,
                    null,
                    now.minus(4, ChronoUnit.HOURS),
                    List.of(animalMask)
            );
        }

        // 2. Status: CONFIRMED
        if (orderRepository.findByStatus(OrderStatus.CONFIRMED).isEmpty()) {
            log.info("Seeding CONFIRMED mock orders...");
            createOrder(
                    "AUR-20261004-2001",
                    targetUser,
                    OrderStatus.CONFIRMED,
                    PaymentStatus.PAID,
                    PaymentMethod.STRIPE,
                    "EUR",
                    "Marcus Sterling",
                    "m.sterling@kensington-art.co.uk",
                    "+44 20 7946 0912",
                    "18 Kensington Palace Gardens",
                    null,
                    "London",
                    "Greater London",
                    "W8 4QP",
                    "United Kingdom",
                    "Wood grain grain alignment inspected by Master Mohamed Ali. Sealed in custom cedar preservation case.",
                    "admin@aurora-masks.tn",
                    now.minus(5, ChronoUnit.HOURS),
                    null,
                    null,
                    now.minus(12, ChronoUnit.HOURS),
                    List.of(peopleMask)
            );

            createOrder(
                    "AUR-20261004-2002",
                    targetUser,
                    OrderStatus.CONFIRMED,
                    PaymentStatus.PAID,
                    PaymentMethod.STRIPE,
                    "EUR",
                    "Chloe Dupont",
                    "chloe.dupont@geneva-interiors.ch",
                    "+41 22 731 5500",
                    "12 Quai du Mont-Blanc",
                    null,
                    "Geneva",
                    null,
                    "1201",
                    "Switzerland",
                    "Artisan Certificate of Authenticity signed. Awaiting courier handover at Carthage hub.",
                    "admin@aurora-masks.tn",
                    now.minus(3, ChronoUnit.HOURS),
                    null,
                    null,
                    now.minus(8, ChronoUnit.HOURS),
                    List.of(abstractMask)
            );
        }

        // 3. Status: ON_THE_WAY
        if (orderRepository.findByStatus(OrderStatus.ON_THE_WAY).isEmpty()) {
            log.info("Seeding ON_THE_WAY mock orders with test DHL tracking numbers...");
            createOrder(
                    "AUR-20261004-3001",
                    targetUser,
                    OrderStatus.ON_THE_WAY,
                    PaymentStatus.PAID,
                    PaymentMethod.STRIPE,
                    "USD",
                    "Arthur Pendelton",
                    "arthur.p@pacific-design.com",
                    "+1 (415) 555-0899",
                    "345 California St, Floor 22",
                    null,
                    "San Francisco",
                    "CA",
                    "94104",
                    "United States",
                    "Dispatched via Poste Rapide / DHL Express Worldwide.",
                    "admin@aurora-masks.tn",
                    now.minus(1, ChronoUnit.DAYS),
                    "TEST-DHL-84920391",
                    "DHL Express Worldwide",
                    now.minus(1, ChronoUnit.DAYS),
                    List.of(animalMask)
            );

            createOrder(
                    "AUR-20261004-3002",
                    targetUser,
                    OrderStatus.ON_THE_WAY,
                    PaymentStatus.PAID,
                    PaymentMethod.STRIPE,
                    "EUR",
                    "Sophie Martin",
                    "sophie.martin@milano-art.it",
                    "+39 02 8765 4321",
                    "Via Monte Napoleone 8",
                    null,
                    "Milan",
                    "Lombardy",
                    "20121",
                    "Italy",
                    "International air freight departed Tunis Carthage gateway.",
                    "admin@aurora-masks.tn",
                    now.minus(18, ChronoUnit.HOURS),
                    "TEST-DHL-19283746",
                    "DHL Express Worldwide",
                    now.minus(18, ChronoUnit.HOURS),
                    List.of(peopleMask)
            );
        }

        // 4. Status: DELIVERED
        if (orderRepository.findByStatus(OrderStatus.DELIVERED).isEmpty()) {
            log.info("Seeding DELIVERED mock orders...");
            createOrder(
                    "AUR-20261004-4001",
                    targetUser,
                    OrderStatus.DELIVERED,
                    PaymentStatus.PAID,
                    PaymentMethod.STRIPE,
                    "EUR",
                    "David Chen",
                    "d.chen@berlin-atelier.de",
                    "+49 30 1234 5678",
                    "Unter den Linden 77",
                    "Building B",
                    "Berlin",
                    "Berlin",
                    "10117",
                    "Germany",
                    "Delivered and signed by recipient in pristine condition.",
                    "admin@aurora-masks.tn",
                    now.minus(4, ChronoUnit.DAYS),
                    "TEST-DHL-99482012",
                    "DHL Express Worldwide",
                    now.minus(4, ChronoUnit.DAYS),
                    List.of(abstractMask)
            );
        }

        // 5. Status: REJECTED
        if (orderRepository.findByStatus(OrderStatus.REJECTED).isEmpty()) {
            log.info("Seeding REJECTED mock orders...");
            createOrder(
                    "AUR-20261004-5001",
                    targetUser,
                    OrderStatus.REJECTED,
                    PaymentStatus.REFUNDED,
                    PaymentMethod.STRIPE,
                    "EUR",
                    "Liam O'Connor",
                    "liam.oc@dublin-craft.ie",
                    "+353 1 496 0123",
                    "14 Grafton Street",
                    null,
                    "Dublin",
                    "Leinster",
                    "D02 K674",
                    "Ireland",
                    "Selected rare olive wood burl was acquired by a national museum heritage collection; full refund issued immediately to customer.",
                    "admin@aurora-masks.tn",
                    now.minus(2, ChronoUnit.DAYS),
                    null,
                    null,
                    now.minus(3, ChronoUnit.DAYS),
                    List.of(animalMask)
            );
        }

        log.info("Order lifecycle mock data verification complete.");
    }

    private void createOrder(
            String orderNumber,
            User user,
            OrderStatus status,
            PaymentStatus paymentStatus,
            PaymentMethod paymentMethod,
            String currency,
            String customerName,
            String customerEmail,
            String customerPhone,
            String address1,
            String address2,
            String city,
            String state,
            String postalCode,
            String country,
            String reviewNote,
            String reviewedBy,
            Instant reviewedAt,
            String trackingNumber,
            String carrier,
            Instant shippedAt,
            List<Product> products
    ) {
        if (orderRepository.findByOrderNumber(orderNumber).isPresent()) {
            return;
        }

        BigDecimal subtotal = BigDecimal.ZERO;
        List<OrderItem> items = new ArrayList<>();

        for (Product product : products) {
            BigDecimal price = "USD".equalsIgnoreCase(currency)
                    ? (product.getDiscountedPriceUsd() != null ? product.getDiscountedPriceUsd() : product.getPriceUsd())
                    : (product.getDiscountedPriceEur() != null ? product.getDiscountedPriceEur() : product.getPriceEur());

            subtotal = subtotal.add(price);

            OrderItem item = OrderItem.builder()
                    .productId(product.getId())
                    .productName(product.getName())
                    .productWoodType(product.getWoodType())
                    .unitPrice(price)
                    .quantity(1)
                    .totalPrice(price)
                    .build();
            items.add(item);
        }

        BigDecimal shipping = subtotal.compareTo(new BigDecimal("200.00")) >= 0 ? BigDecimal.ZERO : new BigDecimal("25.00");
        BigDecimal total = subtotal.add(shipping);

        Order order = Order.builder()
                .orderNumber(orderNumber)
                .user(user)
                .status(status)
                .currency(currency)
                .subtotalAmount(subtotal)
                .shippingAmount(shipping)
                .totalAmount(total)
                .paymentStatus(paymentStatus)
                .paymentMethod(paymentMethod)
                .customerName(customerName)
                .customerEmail(customerEmail)
                .customerPhone(customerPhone)
                .shippingAddressLine1(address1)
                .shippingAddressLine2(address2)
                .shippingCity(city)
                .shippingState(state)
                .shippingPostalCode(postalCode)
                .shippingCountry(country)
                .reviewNote(reviewNote)
                .reviewedBy(reviewedBy)
                .reviewedAt(reviewedAt)
                .trackingNumber(trackingNumber)
                .carrier(carrier)
                .shippedAt(shippedAt)
                .deliveredAt(status == OrderStatus.DELIVERED ? Instant.now().minus(1, ChronoUnit.DAYS) : null)
                .notes("Authentic artisanal commission")
                .build();

        for (OrderItem item : items) {
            item.setOrder(order);
        }
        order.setItems(items);

        orderRepository.save(order);
        log.info("Seeded order [{}] with status [{}] for customer [{}]", orderNumber, status, customerName);
    }

    private void seedTestCustomerAccount() {
        String testEmail = "test.customer@aurora.tn";
        User customer = userRepository.findByEmail(testEmail).orElse(null);
        if (customer == null) {
            customer = User.builder()
                    .email(testEmail)
                    .passwordHash(passwordEncoder.encode("AuroraTest2026!"))
                    .firstName("Test")
                    .lastName("Customer")
                    .authProvider(AuthProvider.LOCAL)
                    .role(Role.ROLE_USER)
                    .isActive(true)
                    .build();
            customer = userRepository.save(customer);
            log.info("Seeded dedicated customer test account: {}", testEmail);
        } else {
            customer.setPasswordHash(passwordEncoder.encode("AuroraTest2026!"));
            customer.setRole(Role.ROLE_USER);
            customer.setIsActive(true);
            customer = userRepository.save(customer);
            log.info("Verified & updated dedicated customer test account: {}", testEmail);
        }

        // Guarantee clean, empty cart by default for complete test flow
        Optional<Cart> cartOpt = cartRepository.findByUserId(customer.getId());
        if (cartOpt.isPresent()) {
            cartItemRepository.deleteByCartId(cartOpt.get().getId());
            log.info("Cleared cart for {} to guarantee clean initial test state", testEmail);
        }
    }
}
