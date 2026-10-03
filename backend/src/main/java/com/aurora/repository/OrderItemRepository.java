package com.aurora.repository;

import com.aurora.model.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

    @Query("SELECT oi.productId, oi.productName, oi.productWoodType, SUM(oi.quantity), SUM(oi.totalPrice) " +
           "FROM OrderItem oi " +
           "JOIN oi.order o " +
           "WHERE o.paymentStatus = com.aurora.model.entity.PaymentStatus.PAID " +
           "AND o.createdAt >= :startDate " +
           "GROUP BY oi.productId, oi.productName, oi.productWoodType " +
           "ORDER BY SUM(oi.quantity) DESC")
    List<Object[]> findTopSellingProducts(@Param("startDate") Instant startDate);
}
