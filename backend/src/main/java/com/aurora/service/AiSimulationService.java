package com.aurora.service;

import com.aurora.dto.ai.SimulationQuotaResponse;
import com.aurora.dto.ai.SimulationResponse;
import com.aurora.exception.BadRequestException;
import com.aurora.exception.ResourceNotFoundException;
import com.aurora.model.entity.AiSimulation;
import com.aurora.model.entity.Product;
import com.aurora.model.entity.ProductImage;
import com.aurora.model.entity.User;
import com.aurora.repository.AiSimulationRepository;
import com.aurora.repository.ProductRepository;
import com.aurora.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.geom.RoundRectangle2D;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
import java.net.URL;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AiSimulationService {

    private static final int MONTHLY_QUOTA_LIMIT = 3;
    private final AiSimulationRepository aiSimulationRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @Value("${app.upload.simulations-dir:uploads/simulations}")
    private String simulationsDir;

    @Transactional
    public SimulationResponse simulateMaskOnWall(UUID userId, UUID productId, MultipartFile wallImage) {
        if (userId == null) {
            throw new BadRequestException("You must be signed in as a registered collector to access the AI Wall Simulator.");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", productId));

        if (wallImage == null || wallImage.isEmpty()) {
            throw new BadRequestException("Please upload a photo of your wall or room.");
        }

        String contentType = wallImage.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new BadRequestException("Uploaded file must be a valid image (JPEG, PNG, WEBP).");
        }

        String currentYearMonth = YearMonth.now().toString(); // e.g. "2026-10"
        long usedQuota = aiSimulationRepository.countByUserIdAndYearMonth(userId, currentYearMonth);

        if (usedQuota >= MONTHLY_QUOTA_LIMIT) {
            throw new BadRequestException("Monthly free AI wall simulation quota reached (" + MONTHLY_QUOTA_LIMIT + "/" + MONTHLY_QUOTA_LIMIT
                    + "). Your complimentary simulations will reset on the 1st of " + getNextMonthFormatted() + ".");
        }

        try {
            Path targetDir = Paths.get(simulationsDir).toAbsolutePath().normalize();
            if (!Files.exists(targetDir)) {
                Files.createDirectories(targetDir);
            }

            String fileExt = getFileExtension(wallImage.getOriginalFilename());
            String wallFilename = "wall_" + UUID.randomUUID() + fileExt;
            Path wallPath = targetDir.resolve(wallFilename);
            wallImage.transferTo(wallPath.toFile());

            String simFilename = "sim_" + UUID.randomUUID() + ".jpg";
            Path simPath = targetDir.resolve(simFilename);

            // Generate AI composite simulation
            generateWallProjection(wallPath.toFile(), product, simPath.toFile());

            String wallImageUrl = "/uploads/simulations/" + wallFilename;
            String resultImageUrl = "/uploads/simulations/" + simFilename;

            AiSimulation simulation = AiSimulation.builder()
                    .user(user)
                    .product(product)
                    .wallImageUrl(wallImageUrl)
                    .resultImageUrl(resultImageUrl)
                    .yearMonth(currentYearMonth)
                    .build();

            AiSimulation saved = aiSimulationRepository.save(simulation);
            long newUsed = usedQuota + 1;

            log.info("User [{}] generated AI wall simulation for product [{}] (Used: {}/{})",
                    user.getEmail(), product.getName(), newUsed, MONTHLY_QUOTA_LIMIT);

            return SimulationResponse.builder()
                    .simulationId(saved.getId())
                    .resultImageUrl(resultImageUrl)
                    .wallImageUrl(wallImageUrl)
                    .productId(product.getId())
                    .productName(product.getName())
                    .quotaUsed(newUsed)
                    .quotaRemaining(Math.max(0, MONTHLY_QUOTA_LIMIT - newUsed))
                    .resetDate("1st of " + getNextMonthFormatted())
                    .createdAt(saved.getCreatedAt())
                    .build();

        } catch (IOException e) {
            log.error("Failed to process wall simulation image", e);
            throw new BadRequestException("Failed to generate AI wall simulation: " + e.getMessage());
        }
    }

    @Transactional(readOnly = true)
    public SimulationQuotaResponse getUserQuota(UUID userId) {
        String currentYearMonth = YearMonth.now().toString();
        long used = 0;
        if (userId != null) {
            used = aiSimulationRepository.countByUserIdAndYearMonth(userId, currentYearMonth);
        }

        return SimulationQuotaResponse.builder()
                .quotaUsed(used)
                .quotaRemaining(Math.max(0, MONTHLY_QUOTA_LIMIT - used))
                .quotaLimit(MONTHLY_QUOTA_LIMIT)
                .yearMonth(currentYearMonth)
                .resetDate("1st of " + getNextMonthFormatted())
                .build();
    }

    private void generateWallProjection(File wallFile, Product product, File outputFile) throws IOException {
        BufferedImage wallImg = ImageIO.read(wallFile);
        if (wallImg == null) {
            throw new BadRequestException("Could not decode uploaded wall image.");
        }

        BufferedImage maskImg = loadProductMaskImage(product);

        int wallW = wallImg.getWidth();
        int wallH = wallImg.getHeight();

        // Target mask size: ~35% of wall height, maintaining aspect ratio
        double targetH = wallH * 0.38;
        double scale = targetH / (double) maskImg.getHeight();
        int maskW = (int) (maskImg.getWidth() * scale);
        int maskH = (int) targetH;

        // Position mask slightly above the vertical center (golden ratio eye level)
        int posX = (wallW - maskW) / 2;
        int posY = (int) (wallH * 0.28);

        BufferedImage output = new BufferedImage(wallW, wallH, BufferedImage.TYPE_INT_RGB);
        Graphics2D g = output.createGraphics();

        // High quality rendering hints
        g.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BICUBIC);
        g.setRenderingHint(RenderingHints.KEY_RENDERING, RenderingHints.VALUE_RENDER_QUALITY);
        g.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);

        // 1. Draw base wall
        g.drawImage(wallImg, 0, 0, null);

        // 2. Render realistic soft Mediterranean ambient drop shadow behind mask
        int shadowOffset = Math.max(10, (int) (maskH * 0.05));
        for (int i = 18; i >= 1; i--) {
            float alpha = 0.018f * (19 - i) / 19f;
            g.setColor(new Color(0, 0, 0, (int) (alpha * 255)));
            g.fillRoundRect(
                    posX - i * 2,
                    posY + shadowOffset - i,
                    maskW + i * 4,
                    maskH + i * 2,
                    30, 30
            );
        }

        // 3. Draw scaled mask artwork
        g.drawImage(maskImg, posX, posY, maskW, maskH, null);

        // 4. Subtle watermark banner in bottom-right corner
        int pad = 24;
        String brandText = "A U R O R A  —  Virtual Wall Preview";
        String productText = product.getName() + " (" + (product.getWoodType() != null ? product.getWoodType() : "Tunisian Olive Wood") + ")";

        Font brandFont = new Font("SansSerif", Font.BOLD, Math.max(12, wallW / 65));
        Font prodFont = new Font("SansSerif", Font.PLAIN, Math.max(10, wallW / 85));

        g.setFont(brandFont);
        FontMetrics fmBrand = g.getFontMetrics();
        int bWidth = fmBrand.stringWidth(brandText);

        g.setFont(prodFont);
        FontMetrics fmProd = g.getFontMetrics();
        int pWidth = fmProd.stringWidth(productText);

        int boxW = Math.max(bWidth, pWidth) + 36;
        int boxH = 54;
        int boxX = wallW - boxW - pad;
        int boxY = wallH - boxH - pad;

        // Subtle frosted dark glass badge
        g.setColor(new Color(13, 12, 10, 205));
        g.fill(new RoundRectangle2D.Float(boxX, boxY, boxW, boxH, 16, 16));
        g.setColor(new Color(212, 175, 55, 120));
        g.draw(new RoundRectangle2D.Float(boxX, boxY, boxW, boxH, 16, 16));

        // Badge text
        g.setColor(new Color(212, 175, 55));
        g.setFont(brandFont);
        g.drawString(brandText, boxX + 18, boxY + 22);

        g.setColor(new Color(220, 215, 200, 210));
        g.setFont(prodFont);
        g.drawString(productText, boxX + 18, boxY + 42);

        g.dispose();

        ImageIO.write(output, "jpg", outputFile);
    }

    private BufferedImage loadProductMaskImage(Product product) {
        // Try local product image first
        if (product.getImages() != null && !product.getImages().isEmpty()) {
            for (ProductImage img : product.getImages()) {
                String url = img.getImageUrl();
                if (url != null) {
                    try {
                        if (url.startsWith("/uploads/")) {
                            File localFile = new File(url.substring(1));
                            if (localFile.exists()) {
                                return ImageIO.read(localFile);
                            }
                        } else if (url.startsWith("http://") || url.startsWith("https://")) {
                            return ImageIO.read(new URL(url));
                        }
                    } catch (Exception ex) {
                        log.warn("Could not load image from {}: {}", url, ex.getMessage());
                    }
                }
            }
        }

        // Fallback: generate a clean artisanal mask silhouette in Tunisian olive wood tones
        BufferedImage fallback = new BufferedImage(400, 600, BufferedImage.TYPE_INT_ARGB);
        Graphics2D g = fallback.createGraphics();
        g.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);

        // Warm olive wood gradient
        GradientPaint gp = new GradientPaint(0, 0, new Color(139, 90, 43), 400, 600, new Color(74, 45, 20));
        g.setPaint(gp);
        g.fillOval(50, 40, 300, 520);

        g.setColor(new Color(212, 175, 55, 180));
        g.drawOval(50, 40, 300, 520);
        g.drawOval(80, 80, 240, 440);

        // Carved features
        g.setColor(new Color(40, 25, 12));
        g.fillOval(120, 220, 45, 20);
        g.fillOval(235, 220, 45, 20);
        g.fillPolygon(new int[]{200, 185, 215}, new int[]{230, 360, 360}, 3);
        g.fillRoundRect(160, 410, 80, 25, 12, 12);

        g.dispose();
        return fallback;
    }

    private String getNextMonthFormatted() {
        return LocalDate.now().plusMonths(1).format(DateTimeFormatter.ofPattern("MMMM yyyy"));
    }

    private String getFileExtension(String filename) {
        if (filename != null && filename.contains(".")) {
            return filename.substring(filename.lastIndexOf("."));
        }
        return ".jpg";
    }
}
