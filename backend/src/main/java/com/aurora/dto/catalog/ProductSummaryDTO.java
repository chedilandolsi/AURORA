package com.aurora.dto.catalog;

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
public class ProductSummaryDTO {
    private UUID id;
    private String name;
    private String slug;
    private String shortDescription;
    private String woodType;
    private String dimensions;
    private BigDecimal priceEur;
    private BigDecimal priceUsd;
    private BigDecimal discountedPriceEur;
    private BigDecimal discountedPriceUsd;
    private Integer discountPercentage;
    private Integer stockQuantity;
    private Boolean isFeatured;
    private String primaryImageUrl;
    private Long categoryId;
    private String categoryName;
    private String categorySlug;
}
