package com.aurora.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateProductRequest {
    private Long categoryId;
    private String name;
    private String shortDescription;
    private String detailedDescription;
    private String woodType;
    private String dimensions;
    private Integer weightGrams;
    private BigDecimal priceEur;
    private BigDecimal priceUsd;
    private Integer discountPercentage;
    private Integer stockQuantity;
    private Boolean isFeatured;
    private Boolean isActive;
    private String artisanNotes;
    private List<String> imageUrls;
}
