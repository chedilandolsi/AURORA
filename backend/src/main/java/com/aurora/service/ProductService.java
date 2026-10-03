package com.aurora.service;

import com.aurora.dto.catalog.ProductDetailDTO;
import com.aurora.dto.catalog.ProductImageDTO;
import com.aurora.dto.catalog.ProductSummaryDTO;
import com.aurora.exception.ResourceNotFoundException;
import com.aurora.model.entity.Product;
import com.aurora.model.entity.ProductImage;
import com.aurora.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;

    @Transactional(readOnly = true)
    public Page<ProductSummaryDTO> getProducts(
            String categorySlug,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            String search,
            int page,
            int size,
            String sortBy,
            String sortDirection) {

        Sort sort = Sort.by(
                "desc".equalsIgnoreCase(sortDirection) ? Sort.Direction.DESC : Sort.Direction.ASC,
                sortBy != null ? sortBy : "createdAt"
        );
        Pageable pageable = PageRequest.of(page, size, sort);

        Specification<Product> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.isTrue(root.get("isActive")));

            if (categorySlug != null && !categorySlug.trim().isEmpty()) {
                predicates.add(cb.equal(root.get("category").get("slug"), categorySlug.trim()));
            }
            if (minPrice != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("priceEur"), minPrice));
            }
            if (maxPrice != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("priceEur"), maxPrice));
            }
            if (search != null && !search.trim().isEmpty()) {
                String searchPattern = "%" + search.toLowerCase().trim() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("name")), searchPattern),
                        cb.like(cb.lower(root.get("shortDescription")), searchPattern),
                        cb.like(cb.lower(root.get("woodType")), searchPattern)
                ));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<Product> productPage = productRepository.findAll(spec, pageable);

        return productPage.map(this::mapToSummaryDTO);
    }

    @Transactional(readOnly = true)
    public List<ProductSummaryDTO> getFeaturedProducts() {
        return productRepository.findByIsFeaturedTrueAndIsActiveTrueOrderByCreatedAtDesc().stream()
                .map(this::mapToSummaryDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ProductSummaryDTO> getOnSaleProducts() {
        return productRepository.findByDiscountPercentageGreaterThanAndIsActiveTrueOrderByDiscountPercentageDesc(0).stream()
                .map(this::mapToSummaryDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ProductDetailDTO getProductBySlug(String slug) {
        Product product = productRepository.findBySlugAndIsActiveTrue(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "slug", slug));
        return mapToDetailDTO(product);
    }

    @Transactional(readOnly = true)
    public ProductDetailDTO getProductById(UUID id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));
        return mapToDetailDTO(product);
    }

    public ProductSummaryDTO mapToSummaryDTO(Product product) {
        return ProductSummaryDTO.builder()
                .id(product.getId())
                .name(product.getName())
                .slug(product.getSlug())
                .shortDescription(product.getShortDescription())
                .woodType(product.getWoodType())
                .dimensions(product.getDimensions())
                .priceEur(product.getPriceEur())
                .priceUsd(product.getPriceUsd())
                .discountedPriceEur(product.getDiscountedPriceEur())
                .discountedPriceUsd(product.getDiscountedPriceUsd())
                .discountPercentage(product.getDiscountPercentage())
                .stockQuantity(product.getStockQuantity())
                .isFeatured(product.getIsFeatured())
                .primaryImageUrl(product.getPrimaryImageUrl())
                .categoryId(product.getCategory() != null ? product.getCategory().getId() : null)
                .categoryName(product.getCategory() != null ? product.getCategory().getName() : null)
                .categorySlug(product.getCategory() != null ? product.getCategory().getSlug() : null)
                .build();
    }

    public ProductDetailDTO mapToDetailDTO(Product product) {
        List<ProductImageDTO> imageDTOs = product.getImages() != null
                ? product.getImages().stream().map(this::mapToImageDTO).collect(Collectors.toList())
                : List.of();

        return ProductDetailDTO.builder()
                .id(product.getId())
                .name(product.getName())
                .slug(product.getSlug())
                .shortDescription(product.getShortDescription())
                .detailedDescription(product.getDetailedDescription())
                .woodType(product.getWoodType())
                .dimensions(product.getDimensions())
                .weightGrams(product.getWeightGrams())
                .priceEur(product.getPriceEur())
                .priceUsd(product.getPriceUsd())
                .discountedPriceEur(product.getDiscountedPriceEur())
                .discountedPriceUsd(product.getDiscountedPriceUsd())
                .discountPercentage(product.getDiscountPercentage())
                .stockQuantity(product.getStockQuantity())
                .isFeatured(product.getIsFeatured())
                .artisanNotes(product.getArtisanNotes())
                .categoryId(product.getCategory() != null ? product.getCategory().getId() : null)
                .categoryName(product.getCategory() != null ? product.getCategory().getName() : null)
                .categorySlug(product.getCategory() != null ? product.getCategory().getSlug() : null)
                .images(imageDTOs)
                .build();
    }

    private ProductImageDTO mapToImageDTO(ProductImage image) {
        return ProductImageDTO.builder()
                .id(image.getId())
                .imageUrl(image.getImageUrl())
                .altText(image.getAltText())
                .isPrimary(image.getIsPrimary())
                .displayOrder(image.getDisplayOrder())
                .build();
    }
}
