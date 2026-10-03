package com.aurora.dto.checkout;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderItemResponse {
    private Long id;
    private UUID productId;
    private String productName;
    private String productWoodType;
    private BigDecimal unitPrice;
    private Integer quantity;
    private BigDecimal totalPrice;
}
