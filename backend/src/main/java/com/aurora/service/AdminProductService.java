package com.aurora.service;

import com.aurora.dto.admin.CreateProductRequest;
import com.aurora.dto.admin.UpdateProductRequest;
import com.aurora.dto.catalog.ProductDetailDTO;
import com.aurora.exception.BadRequestException;
import com.aurora.exception.ResourceNotFoundException;
import com.aurora.model.entity.Category;
import com.aurora.model.entity.Product;
import com.aurora.model.entity.ProductImage;
import com.aurora.model.enums.MaskCategory;
import com.aurora.repository.CategoryRepository;
import com.aurora.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.text.Normalizer;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;
import java.util.UUID;
import java.util.regex.Pattern;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final ProductService productService;
    private final FileStorageService fileStorageService;

    private static final Pattern NONLATIN = Pattern.compile("[^\\w-]");
    private static final Pattern WHITESPACE = Pattern.compile("[\\s]");

    @Transactional(readOnly = true)
    public Page<ProductDetailDTO> getAllProductsForAdmin(int page, int size, String search) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Product> products;
        if (search != null && !search.trim().isEmpty()) {
            products = productRepository.findAll((root, query, cb) ->
                    cb.or(
                            cb.like(cb.lower(root.get("name")), "%" + search.toLowerCase().trim() + "%"),
                            cb.like(cb.lower(root.get("woodType")), "%" + search.toLowerCase().trim() + "%")
                    ), pageRequest);
        } else {
            products = productRepository.findAll(pageRequest);
        }
        return products.map(productService::mapToDetailDTO);
    }

    @Transactional
    public ProductDetailDTO createProduct(CreateProductRequest request) {
        if (!MaskCategory.isValidCategoryId(request.getCategoryId())) {
            throw new BadRequestException("Invalid mask category ID: " + request.getCategoryId() + ". Permitted categories: 1 (Abstract), 2 (Animals), 3 (People)");
        }

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", request.getCategoryId()));

        String baseSlug = toSlug(request.getName());
        String slug = baseSlug;
        int count = 1;
        while (productRepository.findBySlugAndIsActiveTrue(slug).isPresent()) {
            slug = baseSlug + "-" + count++;
        }

        Product product = Product.builder()
                .category(category)
                .name(request.getName().trim())
                .slug(slug)
                .shortDescription(request.getShortDescription())
                .detailedDescription(request.getDetailedDescription().trim())
                .woodType(request.getWoodType().trim())
                .dimensions(request.getDimensions().trim())
                .weightGrams(request.getWeightGrams())
                .priceEur(request.getPriceEur())
                .priceUsd(request.getPriceUsd())
                .discountPercentage(request.getDiscountPercentage() != null ? request.getDiscountPercentage() : 0)
                .stockQuantity(request.getStockQuantity())
                .isFeatured(request.getIsFeatured() != null ? request.getIsFeatured() : false)
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .artisanNotes(request.getArtisanNotes())
                .images(new ArrayList<>())
                .build();

        if (request.getImageUrls() != null && !request.getImageUrls().isEmpty()) {
            int order = 1;
            for (String url : request.getImageUrls()) {
                if (url != null && !url.trim().isEmpty()) {
                    product.getImages().add(ProductImage.builder()
                            .product(product)
                            .imageUrl(url.trim())
                            .altText(product.getName() + " - angle " + order)
                            .isPrimary(order == 1)
                            .displayOrder(order++)
                            .build());
                }
            }
        } else {
            // Default placeholder image
            product.getImages().add(ProductImage.builder()
                    .product(product)
                    .imageUrl("https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1200&q=85")
                    .altText(product.getName())
                    .isPrimary(true)
                    .displayOrder(1)
                    .build());
        }

        Product saved = productRepository.save(product);
        log.info("Created new artisan product: {} (ID: {})", saved.getName(), saved.getId());
        return productService.mapToDetailDTO(saved);
    }

    @Transactional
    public ProductDetailDTO updateProduct(UUID id, UpdateProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));

        if (request.getCategoryId() != null && !request.getCategoryId().equals(product.getCategory().getId())) {
            if (!MaskCategory.isValidCategoryId(request.getCategoryId())) {
                throw new BadRequestException("Invalid mask category ID: " + request.getCategoryId() + ". Permitted categories: 1 (Abstract), 2 (Animals), 3 (People)");
            }
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category", "id", request.getCategoryId()));
            product.setCategory(category);
        }

        if (request.getName() != null && !request.getName().trim().isEmpty()) {
            product.setName(request.getName().trim());
        }
        if (request.getShortDescription() != null) {
            product.setShortDescription(request.getShortDescription());
        }
        if (request.getDetailedDescription() != null) {
            product.setDetailedDescription(request.getDetailedDescription());
        }
        if (request.getWoodType() != null) {
            product.setWoodType(request.getWoodType());
        }
        if (request.getDimensions() != null) {
            product.setDimensions(request.getDimensions());
        }
        if (request.getWeightGrams() != null) {
            product.setWeightGrams(request.getWeightGrams());
        }
        if (request.getPriceEur() != null) {
            product.setPriceEur(request.getPriceEur());
        }
        if (request.getPriceUsd() != null) {
            product.setPriceUsd(request.getPriceUsd());
        }
        if (request.getDiscountPercentage() != null) {
            product.setDiscountPercentage(request.getDiscountPercentage());
        }
        if (request.getStockQuantity() != null) {
            product.setStockQuantity(request.getStockQuantity());
        }
        if (request.getIsFeatured() != null) {
            product.setIsFeatured(request.getIsFeatured());
        }
        if (request.getIsActive() != null) {
            product.setIsActive(request.getIsActive());
        }
        if (request.getArtisanNotes() != null) {
            product.setArtisanNotes(request.getArtisanNotes());
        }

        if (request.getImageUrls() != null && !request.getImageUrls().isEmpty()) {
            product.getImages().clear();
            int order = 1;
            for (String url : request.getImageUrls()) {
                if (url != null && !url.trim().isEmpty()) {
                    product.getImages().add(ProductImage.builder()
                            .product(product)
                            .imageUrl(url.trim())
                            .altText(product.getName() + " - angle " + order)
                            .isPrimary(order == 1)
                            .displayOrder(order++)
                            .build());
                }
            }
        }

        Product saved = productRepository.save(product);
        log.info("Updated product {} (ID: {})", saved.getName(), saved.getId());
        return productService.mapToDetailDTO(saved);
    }

    @Transactional
    public void updateStock(UUID id, int stock) {
        if (stock < 0) {
            throw new BadRequestException("Stock quantity cannot be negative");
        }
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));
        product.setStockQuantity(stock);
        productRepository.save(product);
        log.info("Updated stock for {} to {}", product.getName(), stock);
    }

    @Transactional
    public void deleteProduct(UUID id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));

        // Clean up locally stored image files from disk
        if (product.getImages() != null) {
            for (ProductImage image : product.getImages()) {
                fileStorageService.deleteFile(image.getImageUrl());
            }
        }

        // Permanently hard delete product entity and cascade DB relationships
        productRepository.delete(product);
        log.info("Permanently hard deleted mask product {} (ID: {}) and cleaned media", product.getName(), id);
    }

    public String uploadImage(MultipartFile file) {
        return fileStorageService.storeFile(file);
    }

    public List<String> uploadImages(MultipartFile[] files) {
        if (files == null || files.length == 0) {
            throw new BadRequestException("At least one image file is required");
        }
        return fileStorageService.storeFiles(Arrays.asList(files));
    }

    private String toSlug(String input) {
        String nowhitespace = WHITESPACE.matcher(input).replaceAll("-");
        String normalized = Normalizer.normalize(nowhitespace, Normalizer.Form.NFD);
        String slug = NONLATIN.matcher(normalized).replaceAll("");
        return slug.toLowerCase(Locale.ENGLISH);
    }
}
