package com.aurora.dto.checkout;

import com.aurora.model.entity.OrderStatus;
import com.aurora.model.entity.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderResponse {
    private UUID id;
    private String orderNumber;
    private OrderStatus status;
    private PaymentStatus paymentStatus;
    private String currency;
    private BigDecimal subtotalAmount;
    private BigDecimal shippingAmount;
    private BigDecimal totalAmount;
    private String customerEmail;
    private String customerName;
    private String customerPhone;
    private String shippingAddressLine1;
    private String shippingAddressLine2;
    private String shippingCity;
    private String shippingState;
    private String shippingPostalCode;
    private String shippingCountry;
    private Instant createdAt;
    @Builder.Default
    private List<OrderItemResponse> items = new ArrayList<>();
}
