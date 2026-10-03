package com.aurora.controller;

import com.aurora.dto.ApiResponse;
import com.aurora.dto.admin.CreateProductRequest;
import com.aurora.dto.admin.UpdateProductRequest;
import com.aurora.dto.catalog.ProductDetailDTO;
import com.aurora.service.AdminProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/products")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin - Product Management", description = "Endpoints for artisanal mask CRUD operations (Admin Only)")
public class AdminProductController {

    private final AdminProductService adminProductService;

    @GetMapping
    @Operation(summary = "List all products including inactive for atelier management")
    public ResponseEntity<ApiResponse<Page<ProductDetailDTO>>> getAllProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String search) {
        Page<ProductDetailDTO> products = adminProductService.getAllProductsForAdmin(page, size, search);
        return ResponseEntity.ok(ApiResponse.ok(products));
    }

    @PostMapping
    @Operation(summary = "Create and catalog a new handcrafted mask")
    public ResponseEntity<ApiResponse<ProductDetailDTO>> createProduct(
            @Valid @RequestBody CreateProductRequest request) {
        ProductDetailDTO product = adminProductService.createProduct(request);
        return ResponseEntity.ok(ApiResponse.ok("Product created successfully", product));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update specifications, pricing, or imagery of a mask")
    public ResponseEntity<ApiResponse<ProductDetailDTO>> updateProduct(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateProductRequest request) {
        ProductDetailDTO updated = adminProductService.updateProduct(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Product updated successfully", updated));
    }

    @PatchMapping("/{id}/stock")
    @Operation(summary = "Quick-adjust atelier inventory count")
    public ResponseEntity<ApiResponse<Void>> updateStock(
            @PathVariable UUID id,
            @RequestBody Map<String, Integer> payload) {
        Integer stock = payload.get("stock");
        if (stock == null) {
            stock = 0;
        }
        adminProductService.updateStock(id, stock);
        return ResponseEntity.ok(ApiResponse.ok("Stock updated successfully", null));
    }

    @PostMapping(value = "/upload-image", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload artisanal mask image file (JPEG, PNG, WebP)")
    public ResponseEntity<ApiResponse<Map<String, String>>> uploadImage(
            @RequestParam("file") org.springframework.web.multipart.MultipartFile file) {
        String imageUrl = adminProductService.uploadImage(file);
        return ResponseEntity.ok(ApiResponse.ok("Image uploaded successfully", Map.of("imageUrl", imageUrl)));
    }

    @PostMapping(value = "/upload-images", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload multiple artisanal mask image files concurrently (JPEG, PNG, WebP)")
    public ResponseEntity<ApiResponse<Map<String, Object>>> uploadImages(
            @RequestParam("files") org.springframework.web.multipart.MultipartFile[] files) {
        java.util.List<String> imageUrls = adminProductService.uploadImages(files);
        return ResponseEntity.ok(ApiResponse.ok("Images uploaded successfully", Map.of("imageUrls", imageUrls)));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Permanently delete mask record and associated media from atelier")
    public ResponseEntity<ApiResponse<Void>> deleteProduct(@PathVariable UUID id) {
        adminProductService.deleteProduct(id);
        return ResponseEntity.ok(ApiResponse.ok("Product permanently deleted successfully", null));
    }
}
