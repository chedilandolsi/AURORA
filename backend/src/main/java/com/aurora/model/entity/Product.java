package com.aurora.model.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "products")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true, length = 280)
    private String slug;

    @Column(name = "short_description", length = 500)
    private String shortDescription;

    @Column(name = "detailed_description", nullable = false, columnDefinition = "TEXT")
    private String detailedDescription;

    @Column(name = "wood_type", nullable = false, length = 100)
    private String woodType;

    @Column(nullable = false, length = 100)
    private String dimensions;

    @Column(name = "weight_grams")
    private Integer weightGrams;

    @Column(name = "price_eur", nullable = false, precision = 10, scale = 2)
    private BigDecimal priceEur;

    @Column(name = "price_usd", nullable = false, precision = 10, scale = 2)
    private BigDecimal priceUsd;

    @Column(name = "discount_percentage", nullable = false)
    @Builder.Default
    private Integer discountPercentage = 0;

    @Column(name = "stock_quantity", nullable = false)
    @Builder.Default
    private Integer stockQuantity = 0;

    @Column(name = "is_featured", nullable = false)
    @Builder.Default
    private Boolean isFeatured = false;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "artisan_notes", columnDefinition = "TEXT")
    private String artisanNotes;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @OrderBy("displayOrder ASC")
    @Builder.Default
    private List<ProductImage> images = new ArrayList<>();

    public BigDecimal getDiscountedPriceEur() {
        if (discountPercentage == null || discountPercentage <= 0) {
            return priceEur;
        }
        BigDecimal discountFactor = BigDecimal.valueOf(100 - discountPercentage).divide(BigDecimal.valueOf(100));
        return priceEur.multiply(discountFactor).setScale(2, java.math.RoundingMode.HALF_UP);
    }

    public BigDecimal getDiscountedPriceUsd() {
        if (discountPercentage == null || discountPercentage <= 0) {
            return priceUsd;
        }
        BigDecimal discountFactor = BigDecimal.valueOf(100 - discountPercentage).divide(BigDecimal.valueOf(100));
        return priceUsd.multiply(discountFactor).setScale(2, java.math.RoundingMode.HALF_UP);
    }

    public String getPrimaryImageUrl() {
        if (images == null || images.isEmpty()) {
            return "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1000&q=80";
        }
        return images.stream()
                .filter(ProductImage::getIsPrimary)
                .findFirst()
                .map(ProductImage::getImageUrl)
                .orElse(images.get(0).getImageUrl());
    }
}
