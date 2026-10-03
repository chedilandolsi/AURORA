package com.aurora.service;

import com.aurora.exception.BadRequestException;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.*;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Slf4j
@Service
public class FileStorageService {

    private final Path rootLocation;
    private final List<String> allowedExtensions = Arrays.asList("jpg", "jpeg", "png", "webp", "gif");
    private final List<String> allowedMimeTypes = Arrays.asList(
            "image/jpeg", "image/png", "image/webp", "image/gif"
    );

    public FileStorageService(@Value("${app.upload.dir:uploads/products}") String uploadDir) {
        this.rootLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
    }

    @PostConstruct
    public void init() {
        try {
            Files.createDirectories(rootLocation);
            log.info("Initialized secure file storage at: {}", rootLocation);
        } catch (IOException e) {
            throw new RuntimeException("Could not initialize storage directory", e);
        }
    }

    public String storeFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Uploaded image cannot be empty");
        }

        String originalFilename = StringUtils.cleanPath(Objects.requireNonNull(file.getOriginalFilename()));
        if (originalFilename.contains("..")) {
            throw new BadRequestException("Filename contains invalid path sequence: " + originalFilename);
        }

        String extension = getFileExtension(originalFilename).toLowerCase();
        if (!allowedExtensions.contains(extension)) {
            throw new BadRequestException("Invalid image format ." + extension + ". Allowed: JPEG, PNG, WebP, GIF");
        }

        String contentType = file.getContentType();
        if (contentType == null || !allowedMimeTypes.contains(contentType.toLowerCase())) {
            throw new BadRequestException("Invalid MIME type: " + contentType + ". Allowed: image/jpeg, image/png, image/webp, image/gif");
        }

        // Limit individual file size to 10MB
        if (file.getSize() > 10 * 1024 * 1024) {
            throw new BadRequestException("File size exceeds 10MB limit");
        }

        String uniqueFilename = UUID.randomUUID() + "." + extension;
        Path destinationFile = this.rootLocation.resolve(uniqueFilename).normalize().toAbsolutePath();

        if (!destinationFile.getParent().equals(this.rootLocation)) {
            throw new BadRequestException("Cannot store file outside target directory");
        }

        try (InputStream inputStream = file.getInputStream()) {
            Files.copy(inputStream, destinationFile, StandardCopyOption.REPLACE_EXISTING);
            log.info("Successfully stored uploaded image as: {}", uniqueFilename);
            return "/uploads/products/" + uniqueFilename;
        } catch (IOException e) {
            log.error("Failed to store file: {}", originalFilename, e);
            throw new RuntimeException("Failed to store uploaded file: " + e.getMessage(), e);
        }
    }

    public List<String> storeFiles(List<MultipartFile> files) {
        if (files == null || files.isEmpty()) {
            throw new BadRequestException("Uploaded image collection cannot be empty");
        }
        List<String> storedPaths = new ArrayList<>();
        for (MultipartFile file : files) {
            if (file != null && !file.isEmpty()) {
                storedPaths.add(storeFile(file));
            }
        }
        return storedPaths;
    }

    public void deleteFile(String fileUrl) {
        if (fileUrl == null || !fileUrl.contains("/uploads/products/")) {
            return; // Not a local uploaded file, might be external Unsplash URL
        }

        try {
            String filename = fileUrl.substring(fileUrl.lastIndexOf('/') + 1);
            Path filePath = this.rootLocation.resolve(filename).normalize().toAbsolutePath();
            if (filePath.getParent().equals(this.rootLocation) && Files.exists(filePath)) {
                Files.delete(filePath);
                log.info("Deleted local product image file: {}", filename);
            }
        } catch (IOException e) {
            log.warn("Could not delete image file for url: {}. Reason: {}", fileUrl, e.getMessage());
        }
    }

    public Path getRootLocation() {
        return rootLocation;
    }

    private String getFileExtension(String filename) {
        int lastIndex = filename.lastIndexOf('.');
        if (lastIndex == -1) {
            throw new BadRequestException("Uploaded file has no extension");
        }
        return filename.substring(lastIndex + 1);
    }
}
