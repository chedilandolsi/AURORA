package com.aurora.controller;

import com.aurora.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.concurrent.TimeUnit;

@Slf4j
@RestController
@RequiredArgsConstructor
public class UploadMediaController {

    private final FileStorageService fileStorageService;
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${supabase.url:https://bmcbrphlhclsveunvpsu.supabase.co}")
    private String supabaseUrl;

    @Value("${supabase.storage.bucket:products}")
    private String storageBucket;

    @GetMapping("/uploads/products/{fileName:.+}")
    public ResponseEntity<Resource> getProductImage(@PathVariable String fileName) {
        return resolveAndServe(fileName, fileStorageService.getRootLocation());
    }

    @GetMapping("/uploads/{fileName:.+}")
    public ResponseEntity<Resource> getGeneralUploadImage(@PathVariable String fileName) {
        Path baseUploads = fileStorageService.getRootLocation().getParent() != null
                ? fileStorageService.getRootLocation().getParent()
                : fileStorageService.getRootLocation();
        return resolveAndServe(fileName, baseUploads);
    }

    private ResponseEntity<Resource> resolveAndServe(String fileName, Path targetDir) {
        String cleanName = Paths.get(fileName).getFileName().toString().replaceAll("[^a-zA-Z0-9._-]", "");
        Path localFile = targetDir.resolve(cleanName).normalize().toAbsolutePath();

        // 1. Serve local file if present and readable
        if (Files.exists(localFile) && Files.isReadable(localFile) && Files.isRegularFile(localFile)) {
            try {
                long size = Files.size(localFile);
                if (size > 0) {
                    MediaType mediaType = determineMediaType(cleanName);
                    return ResponseEntity.ok()
                            .contentType(mediaType)
                            .contentLength(size)
                            .cacheControl(CacheControl.maxAge(7, TimeUnit.DAYS).cachePublic())
                            .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + cleanName + "\"")
                            .body(new FileSystemResource(localFile));
                }
            } catch (Exception e) {
                log.warn("Error reading local image {}: {}", cleanName, e.getMessage());
            }
        }

        // 2. Fallback to Supabase Storage public cloud bucket
        try {
            String supabasePublicUrl = String.format("%s/storage/v1/object/public/%s/%s",
                    supabaseUrl.replaceAll("/+$", ""), storageBucket, cleanName);
            ResponseEntity<byte[]> cloudResponse = restTemplate.getForEntity(supabasePublicUrl, byte[].class);
            if (cloudResponse.getStatusCode().is2xxSuccessful() && cloudResponse.getBody() != null && cloudResponse.getBody().length > 0) {
                byte[] cloudBytes = cloudResponse.getBody();
                // Cache locally for subsequent fast container reads
                try {
                    Files.createDirectories(targetDir);
                    Files.write(localFile, cloudBytes);
                    log.info("Cached cloud image from Supabase Storage locally: {}", cleanName);
                } catch (Exception writeEx) {
                    log.warn("Could not cache cloud image locally: {}", writeEx.getMessage());
                }

                MediaType mediaType = determineMediaType(cleanName);
                return ResponseEntity.ok()
                        .contentType(mediaType)
                        .contentLength(cloudBytes.length)
                        .cacheControl(CacheControl.maxAge(7, TimeUnit.DAYS).cachePublic())
                        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + cleanName + "\"")
                        .body(new ByteArrayResource(cloudBytes));
            }
        } catch (Exception e) {
            log.debug("Cloud lookup for {} skipped or not found in Supabase: {}", cleanName, e.getMessage());
        }

        // 3. Fallback to packaged classpath seed resource
        ClassPathResource classpathSeed = new ClassPathResource("static/images/masks/" + cleanName);
        if (classpathSeed.exists()) {
            try {
                // Opportunistically seed ephemeral disk
                try (InputStream in = classpathSeed.getInputStream()) {
                    Files.createDirectories(targetDir);
                    Files.copy(in, localFile, StandardCopyOption.REPLACE_EXISTING);
                }
                return ResponseEntity.ok()
                        .contentType(determineMediaType(cleanName))
                        .contentLength(classpathSeed.contentLength())
                        .cacheControl(CacheControl.maxAge(7, TimeUnit.DAYS).cachePublic())
                        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + cleanName + "\"")
                        .body(classpathSeed);
            } catch (Exception e) {
                log.warn("Failed reading classpath seed {}: {}", cleanName, e.getMessage());
            }
        }

        // 4. Fallback to default handcrafted mask placeholder
        ClassPathResource defaultMask = new ClassPathResource("static/images/masks/default-mask.jpg");
        if (defaultMask.exists()) {
            try {
                try (InputStream in = defaultMask.getInputStream()) {
                    Files.createDirectories(targetDir);
                    Files.copy(in, localFile, StandardCopyOption.REPLACE_EXISTING);
                }
                return ResponseEntity.ok()
                        .contentType(MediaType.IMAGE_JPEG)
                        .contentLength(defaultMask.contentLength())
                        .cacheControl(CacheControl.maxAge(1, TimeUnit.DAYS).cachePublic())
                        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"default-mask.jpg\"")
                        .body(defaultMask);
            } catch (Exception e) {
                log.warn("Failed reading default-mask fallback: {}", e.getMessage());
            }
        }

        // 5. Ultimate fallback: 1x1 transparent PNG to prevent browser 500 error
        byte[] transparentPng = new byte[] {
                (byte) 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
                0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,
                0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
                0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, (byte) 0xC4, (byte) 0x89
        };
        return ResponseEntity.ok()
                .contentType(MediaType.IMAGE_PNG)
                .contentLength(transparentPng.length)
                .body(new ByteArrayResource(transparentPng));
    }

    private MediaType determineMediaType(String fileName) {
        String lower = fileName.toLowerCase();
        if (lower.endsWith(".png")) {
            return MediaType.IMAGE_PNG;
        } else if (lower.endsWith(".webp")) {
            return MediaType.parseMediaType("image/webp");
        } else if (lower.endsWith(".gif")) {
            return MediaType.IMAGE_GIF;
        } else {
            return MediaType.IMAGE_JPEG;
        }
    }
}
