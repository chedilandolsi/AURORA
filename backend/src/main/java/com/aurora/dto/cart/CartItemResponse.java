package com.aurora.dto.cart;

import com.aurora.dto.catalog.ProductSummaryDTO;
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
public class CartItemResponse {
    private UUID id;
    private ProductSummaryDTO product;
    private Integer quantity;
    private BigDecimal lineTotalEur;
    private BigDecimal lineTotalUsd;
}
