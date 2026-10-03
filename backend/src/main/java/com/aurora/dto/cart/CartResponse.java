package com.aurora.dto.cart;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CartResponse {
    private UUID id;
    @Builder.Default
    private List<CartItemResponse> items = new ArrayList<>();
    private Integer totalItems;
    private BigDecimal subtotalEur;
    private BigDecimal subtotalUsd;
    private BigDecimal shippingEur;
    private BigDecimal shippingUsd;
    private BigDecimal totalEur;
    private BigDecimal totalUsd;
}
