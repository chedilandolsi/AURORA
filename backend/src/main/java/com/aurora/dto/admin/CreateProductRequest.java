package com.aurora.dto.admin;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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
public class CreateProductRequest {

    @NotNull(message = "Category ID is required")
    private Long categoryId;

    @NotBlank(message = "Product name is required")
    private String name;

    private String shortDescription;

    @NotBlank(message = "Detailed artisan description is required")
    private String detailedDescription;

    @NotBlank(message = "Wood type is required")
    private String woodType;

    @NotBlank(message = "Dimensions are required")
    private String dimensions;

    private Integer weightGrams;

    @NotNull(message = "Price in EUR is required")
    @Min(value = 1, message = "Price in EUR must be positive")
    private BigDecimal priceEur;

    @NotNull(message = "Price in USD is required")
    @Min(value = 1, message = "Price in USD must be positive")
    private BigDecimal priceUsd;

    @Builder.Default
    private Integer discountPercentage = 0;

    @NotNull(message = "Stock quantity is required")
    @Min(value = 0, message = "Stock quantity cannot be negative")
    private Integer stockQuantity;

    @Builder.Default
    private Boolean isFeatured = false;

    @Builder.Default
    private Boolean isActive = true;

    private String artisanNotes;

    private List<String> imageUrls;
}
