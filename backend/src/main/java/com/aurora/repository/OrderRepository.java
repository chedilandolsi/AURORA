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
}
