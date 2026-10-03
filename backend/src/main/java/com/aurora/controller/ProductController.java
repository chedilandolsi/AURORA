package com.aurora.controller;

import com.aurora.dto.ApiResponse;
import com.aurora.dto.catalog.ProductDetailDTO;
import com.aurora.dto.catalog.ProductSummaryDTO;
import com.aurora.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
@Tag(name = "Products", description = "Endpoints for catalog browsing and product details")
public class ProductController {

    private final ProductService productService;

    @GetMapping
    @Operation(summary = "Search and filter artisanal products with pagination")
    public ResponseEntity<ApiResponse<Page<ProductSummaryDTO>>> getProducts(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDirection) {

        Page<ProductSummaryDTO> products = productService.getProducts(
                category, minPrice, maxPrice, search, page, size, sortBy, sortDirection
        );
        return ResponseEntity.ok(ApiResponse.ok(products));
    }

    @GetMapping("/featured")
    @Operation(summary = "List highlighted artisan masterworks for homepage hero/gallery")
    public ResponseEntity<ApiResponse<List<ProductSummaryDTO>>> getFeaturedProducts() {
        List<ProductSummaryDTO> featured = productService.getFeaturedProducts();
        return ResponseEntity.ok(ApiResponse.ok(featured));
    }

    @GetMapping("/on-sale")
    @Operation(summary = "List artisanal products currently on sale with special discounts")
    public ResponseEntity<ApiResponse<List<ProductSummaryDTO>>> getOnSaleProducts() {
        List<ProductSummaryDTO> onSale = productService.getOnSaleProducts();
        return ResponseEntity.ok(ApiResponse.ok(onSale));
    }

    @GetMapping("/{slug}")
    @Operation(summary = "Get detailed product specifications by slug")
    public ResponseEntity<ApiResponse<ProductDetailDTO>> getProductBySlug(@PathVariable String slug) {
        ProductDetailDTO product = productService.getProductBySlug(slug);
        return ResponseEntity.ok(ApiResponse.ok(product));
    }

    @GetMapping("/id/{id}")
    @Operation(summary = "Get product by UUID")
    public ResponseEntity<ApiResponse<ProductDetailDTO>> getProductById(@PathVariable UUID id) {
        ProductDetailDTO product = productService.getProductById(id);
        return ResponseEntity.ok(ApiResponse.ok(product));
    }
}
