package com.aurora.repository;

import com.aurora.model.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProductRepository extends JpaRepository<Product, UUID> {

    Optional<Product> findBySlugAndIsActiveTrue(String slug);

    List<Product> findByIsFeaturedTrueAndIsActiveTrueOrderByCreatedAtDesc();

    @Query("SELECT p FROM Product p WHERE p.isActive = true " +
           "AND (:categorySlug IS NULL OR p.category.slug = :categorySlug) " +
           "AND (:minPrice IS NULL OR p.priceEur >= :minPrice) " +
           "AND (:maxPrice IS NULL OR p.priceEur <= :maxPrice) " +
           "AND (:search IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(p.shortDescription) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(p.woodType) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Product> findFilteredProducts(
            @Param("categorySlug") String categorySlug,
            @Param("minPrice") BigDecimal minPrice,
            @Param("maxPrice") BigDecimal maxPrice,
            @Param("search") String search,
            Pageable pageable
    );
}
