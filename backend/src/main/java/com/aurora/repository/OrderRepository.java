package com.aurora.repository;

import com.aurora.model.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface OrderRepository extends JpaRepository<Order, UUID> {
    Optional<Order> findByOrderNumber(String orderNumber);
    Optional<Order> findByStripeCheckoutSessionId(String stripeCheckoutSessionId);
    List<Order> findByUserIdOrderByCreatedAtDesc(UUID userId);
    List<Order> findByCustomerEmailOrderByCreatedAtDesc(String customerEmail);

    @org.springframework.data.jpa.repository.Query("SELECT SUM(o.totalAmount) FROM Order o WHERE o.paymentStatus = com.aurora.model.entity.PaymentStatus.PAID AND o.createdAt >= :startDate")
    java.math.BigDecimal calculateTotalRevenue(@org.springframework.data.repository.query.Param("startDate") java.time.Instant startDate);

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(o) FROM Order o WHERE o.paymentStatus = com.aurora.model.entity.PaymentStatus.PAID AND o.createdAt >= :startDate")
    long countPaidOrders(@org.springframework.data.repository.query.Param("startDate") java.time.Instant startDate);

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(DISTINCT o.customerEmail) FROM Order o WHERE o.paymentStatus = com.aurora.model.entity.PaymentStatus.PAID AND o.createdAt >= :startDate")
    long countUniqueCustomers(@org.springframework.data.repository.query.Param("startDate") java.time.Instant startDate);

    @org.springframework.data.jpa.repository.Query("SELECT o FROM Order o WHERE o.paymentStatus = com.aurora.model.entity.PaymentStatus.PAID AND o.createdAt >= :startDate ORDER BY o.createdAt ASC")
    List<Order> findPaidOrdersSince(@org.springframework.data.repository.query.Param("startDate") java.time.Instant startDate);

    List<Order> findByPaymentMethodOrderByCreatedAtDesc(com.aurora.model.entity.PaymentMethod paymentMethod);

    List<Order> findByPaymentMethodAndStatusOrderByCreatedAtAsc(com.aurora.model.entity.PaymentMethod paymentMethod,
                                                                com.aurora.model.entity.OrderStatus status);

    List<Order> findByStatusOrderByCreatedAtDesc(com.aurora.model.entity.OrderStatus status);

    List<Order> findByStatus(com.aurora.model.entity.OrderStatus status);

    List<Order> findAllByOrderByCreatedAtDesc();

    long countByPaymentMethodAndStatus(com.aurora.model.entity.PaymentMethod paymentMethod,
                                       com.aurora.model.entity.OrderStatus status);

    long countByUserIdAndStatus(UUID userId, com.aurora.model.entity.OrderStatus status);

    /** Locks the order row so two admins cannot confirm/reject the same order concurrently. */
    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @org.springframework.data.jpa.repository.Query("SELECT o FROM Order o WHERE o.id = :id")
    Optional<Order> findByIdForUpdate(@org.springframework.data.repository.query.Param("id") UUID id);

    /** Locks the order row by Stripe Checkout Session ID to ensure idempotent webhook processing without race conditions. */
    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @org.springframework.data.jpa.repository.Query("SELECT o FROM Order o WHERE o.stripeCheckoutSessionId = :sessionId")
    Optional<Order> findByStripeCheckoutSessionIdForUpdate(@org.springframework.data.repository.query.Param("sessionId") String sessionId);
}
