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
}
