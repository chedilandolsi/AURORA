package com.aurora.config;

import com.aurora.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;

@Configuration
@RequiredArgsConstructor
public class WebMvcConfig implements WebMvcConfigurer {

    private final FileStorageService fileStorageService;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        Path uploadProductsDir = fileStorageService.getRootLocation();
        String uploadProductsUri = uploadProductsDir.toUri().toString();
        if (!uploadProductsUri.endsWith("/")) {
            uploadProductsUri += "/";
        }

        Path baseUploadsDir = uploadProductsDir.getParent() != null ? uploadProductsDir.getParent() : uploadProductsDir;
        String baseUploadsUri = baseUploadsDir.toUri().toString();
        if (!baseUploadsUri.endsWith("/")) {
            baseUploadsUri += "/";
        }

        registry.addResourceHandler("/uploads/products/**")
                .addResourceLocations(uploadProductsUri, "file:uploads/products/", "file:./uploads/products/")
                .setCachePeriod(3600);

        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(baseUploadsUri, "file:uploads/", "file:./uploads/")
                .setCachePeriod(3600);
    }
}
