package com.aurora.dto.catalog;

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
public class ProductDetailDTO {
    private UUID id;
    private String name;
    private String slug;
    private String shortDescription;
    private String detailedDescription;
    private String woodType;
    private String dimensions;
    private Integer weightGrams;
    private BigDecimal priceEur;
    private BigDecimal priceUsd;
    private BigDecimal discountedPriceEur;
    private BigDecimal discountedPriceUsd;
    private Integer discountPercentage;
    private Integer stockQuantity;
    private Boolean isFeatured;
    private String artisanNotes;
    private Long categoryId;
    private String categoryName;
    private String categorySlug;
    @Builder.Default
    private List<ProductImageDTO> images = new ArrayList<>();
}
