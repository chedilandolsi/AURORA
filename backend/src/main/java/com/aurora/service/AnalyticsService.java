package com.aurora.service;

import com.aurora.dto.admin.AnalyticsSummaryDTO;
import com.aurora.dto.admin.RecordVisitRequest;
import com.aurora.model.entity.Category;
import com.aurora.model.entity.Order;
import com.aurora.model.entity.OrderItem;
import com.aurora.model.entity.Product;
import com.aurora.model.entity.TrafficVisit;
import com.aurora.repository.CategoryRepository;
import com.aurora.repository.OrderItemRepository;
import com.aurora.repository.OrderRepository;
import com.aurora.repository.ProductRepository;
import com.aurora.repository.TrafficVisitRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final TrafficVisitRepository trafficVisitRepository;

    @Transactional(readOnly = true)
    public AnalyticsSummaryDTO getAnalytics(String range) {
        String period = (range != null) ? range.toUpperCase().trim() : "MONTHLY";
        Instant startDate = calculateStartDate(period);

        // 1. Core Financial Metrics
        BigDecimal totalRevenue = orderRepository.calculateTotalRevenue(startDate);
        if (totalRevenue == null) totalRevenue = BigDecimal.ZERO;

        long totalOrders = orderRepository.countPaidOrders(startDate);
        long totalCustomers = orderRepository.countUniqueCustomers(startDate);
        long lowStockCount = productRepository.countByStockQuantityLessThanEqualAndIsActiveTrue(5);

        BigDecimal grossSales = totalRevenue;
        BigDecimal aov = totalOrders > 0
                ? totalRevenue.divide(BigDecimal.valueOf(totalOrders), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        // 2. Traffic Metrics
        long totalVisits = trafficVisitRepository.countVisitsSince(startDate);
        long uniqueVisitors = trafficVisitRepository.countUniqueVisitorsSince(startDate);
        double conversionRate = totalVisits > 0
                ? Math.round(((double) totalOrders / totalVisits) * 10000.0) / 100.0
                : 0.0;

        // 3. Revenue Trend Points
        List<Order> paidOrders = orderRepository.findPaidOrdersSince(startDate);
        List<AnalyticsSummaryDTO.RevenueTrendPointDTO> trendPoints = buildTrendPoints(paidOrders, period, startDate);

        // 4. Top Selling Products Leaderboard
        List<AnalyticsSummaryDTO.TopProductDTO> topProducts = buildTopProducts(startDate);
        AnalyticsSummaryDTO.TopProductDTO mostSoldProduct = topProducts.isEmpty() ? null : topProducts.get(0);

        // 5. Category Sales Distribution
        List<AnalyticsSummaryDTO.CategorySalesDTO> categoryBreakdown = buildCategoryDistribution(paidOrders, totalRevenue);

        return AnalyticsSummaryDTO.builder()
                .period(period)
                .totalRevenue(totalRevenue)
                .grossSales(grossSales)
                .averageOrderValue(aov)
                .totalOrders(totalOrders)
                .totalCustomers(totalCustomers)
                .lowStockCount(lowStockCount)
                .totalVisits(totalVisits)
                .uniqueVisitors(uniqueVisitors)
                .conversionRate(conversionRate)
                .mostSoldProduct(mostSoldProduct)
                .revenueTrend(trendPoints)
                .categoryBreakdown(categoryBreakdown)
                .topSellingProducts(topProducts)
                .build();
    }

    @Transactional(readOnly = true)
    public List<AnalyticsSummaryDTO.TopProductDTO> getTopSellingProducts(String range) {
        String period = (range != null) ? range.toUpperCase().trim() : "MONTHLY";
        Instant startDate = calculateStartDate(period);
        return buildTopProducts(startDate);
    }

    @Transactional
    public void recordVisit(RecordVisitRequest request, HttpServletRequest httpRequest, UUID userId) {
        try {
            String clientIp = extractClientIp(httpRequest);
            String ipHash = hashIp(clientIp);
            String userAgent = httpRequest != null ? httpRequest.getHeader("User-Agent") : null;
            if (userAgent != null && userAgent.length() > 255) {
                userAgent = userAgent.substring(0, 255);
            }
            String pageUrl = request != null && request.getPageUrl() != null ? request.getPageUrl() : "/";
            if (pageUrl.length() > 255) pageUrl = pageUrl.substring(0, 255);
            String referrer = request != null && request.getReferrer() != null ? request.getReferrer() : null;
            if (referrer != null && referrer.length() > 255) referrer = referrer.substring(0, 255);

            TrafficVisit visit = TrafficVisit.builder()
                    .visitorIpHash(ipHash)
                    .userAgent(userAgent)
                    .pageUrl(pageUrl)
                    .referrer(referrer)
                    .userId(userId)
                    .build();
            trafficVisitRepository.save(visit);
        } catch (Exception e) {
            log.warn("Failed to record traffic visit: {}", e.getMessage());
        }
    }

    private String hashIp(String ip) {
        if (ip == null || ip.isBlank()) return "anonymous";
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(ip.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (Exception e) {
            return Integer.toHexString(ip.hashCode());
        }
    }

    private String extractClientIp(HttpServletRequest request) {
        if (request == null) return "unknown";
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader == null || xfHeader.isEmpty() || "unknown".equalsIgnoreCase(xfHeader)) {
            return request.getRemoteAddr();
        }
        return xfHeader.split(",")[0].trim();
    }

    private Instant calculateStartDate(String period) {
        ZonedDateTime now = ZonedDateTime.now(ZoneOffset.UTC);
        return switch (period) {
            case "DAILY" -> now.minusDays(1).toInstant();
            case "WEEKLY" -> now.minusDays(7).toInstant();
            case "YEARLY" -> now.minusDays(365).toInstant();
            case "MONTHLY" -> now.minusDays(30).toInstant();
            default -> now.minusDays(30).toInstant();
        };
    }

    private List<AnalyticsSummaryDTO.RevenueTrendPointDTO> buildTrendPoints(
            List<Order> orders, String period, Instant startDate) {

        Map<String, BigDecimal> revenueMap = new LinkedHashMap<>();
        Map<String, Long> countMap = new LinkedHashMap<>();

        DateTimeFormatter formatter = "DAILY".equals(period)
                ? DateTimeFormatter.ofPattern("HH:00")
                : ("YEARLY".equals(period)
                ? DateTimeFormatter.ofPattern("MMM yyyy")
                : DateTimeFormatter.ofPattern("MMM dd"));

        // Pre-fill keys to ensure continuous chart line
        ZonedDateTime cursor = ZonedDateTime.ofInstant(startDate, ZoneOffset.UTC);
        ZonedDateTime end = ZonedDateTime.now(ZoneOffset.UTC);

        if ("DAILY".equals(period)) {
            while (!cursor.isAfter(end)) {
                String key = cursor.format(formatter);
                revenueMap.put(key, BigDecimal.ZERO);
                countMap.put(key, 0L);
                cursor = cursor.plusHours(4);
            }
        } else if ("YEARLY".equals(period)) {
            while (!cursor.isAfter(end)) {
                String key = cursor.format(formatter);
                revenueMap.put(key, BigDecimal.ZERO);
                countMap.put(key, 0L);
                cursor = cursor.plusMonths(1);
            }
        } else {
            while (!cursor.isAfter(end)) {
                String key = cursor.format(formatter);
                revenueMap.put(key, BigDecimal.ZERO);
                countMap.put(key, 0L);
                cursor = cursor.plusDays(1);
            }
        }

        // Aggregate actual orders
        for (Order order : orders) {
            ZonedDateTime orderTime = ZonedDateTime.ofInstant(order.getCreatedAt(), ZoneOffset.UTC);
            String key = orderTime.format(formatter);
            revenueMap.put(key, revenueMap.getOrDefault(key, BigDecimal.ZERO).add(order.getTotalAmount()));
            countMap.put(key, countMap.getOrDefault(key, 0L) + 1);
        }

        List<AnalyticsSummaryDTO.RevenueTrendPointDTO> points = new ArrayList<>();
        revenueMap.forEach((key, rev) -> points.add(
                AnalyticsSummaryDTO.RevenueTrendPointDTO.builder()
                        .label(key)
                        .revenue(rev)
                        .orderCount(countMap.getOrDefault(key, 0L))
                        .build()
        ));

        return points;
    }

    private List<AnalyticsSummaryDTO.TopProductDTO> buildTopProducts(Instant startDate) {
        List<Object[]> rawList = orderItemRepository.findTopSellingProducts(startDate);
        List<AnalyticsSummaryDTO.TopProductDTO> topProducts = new ArrayList<>();

        for (Object[] row : rawList) {
            UUID productId = (UUID) row[0];
            String productName = (String) row[1];
            String woodType = (String) row[2];
            long unitsSold = ((Number) row[3]).longValue();
            BigDecimal totalRevenue = (BigDecimal) row[4];

            int stockRemaining = 0;
            String primaryImageUrl = "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1000&q=80";
            if (productId != null) {
                Optional<Product> pOpt = productRepository.findById(productId);
                if (pOpt.isPresent()) {
                    Product product = pOpt.get();
                    stockRemaining = product.getStockQuantity();
                    primaryImageUrl = product.getPrimaryImageUrl();
                }
            }

            topProducts.add(AnalyticsSummaryDTO.TopProductDTO.builder()
                    .productId(productId)
                    .productName(productName)
                    .woodType(woodType)
                    .primaryImageUrl(primaryImageUrl)
                    .unitsSold(unitsSold)
                    .totalRevenue(totalRevenue)
                    .stockRemaining(stockRemaining)
                    .build());
        }

        return topProducts;
    }

    private List<AnalyticsSummaryDTO.CategorySalesDTO> buildCategoryDistribution(List<Order> orders, BigDecimal totalRevenue) {
        Map<String, BigDecimal> catSales = new HashMap<>();
        Map<String, Long> catUnits = new HashMap<>();

        for (Order order : orders) {
            if (order.getItems() != null) {
                for (OrderItem item : order.getItems()) {
                    String categoryName = "Artisanal Masks";
                    if (item.getProductId() != null) {
                        Optional<Product> p = productRepository.findById(item.getProductId());
                        if (p.isPresent() && p.get().getCategory() != null) {
                            categoryName = p.get().getCategory().getName();
                        }
                    }
                    catSales.put(categoryName, catSales.getOrDefault(categoryName, BigDecimal.ZERO).add(item.getTotalPrice()));
                    catUnits.put(categoryName, catUnits.getOrDefault(categoryName, 0L) + item.getQuantity());
                }
            }
        }

        List<AnalyticsSummaryDTO.CategorySalesDTO> results = new ArrayList<>();
        catSales.forEach((catName, sales) -> {
            double pct = totalRevenue.compareTo(BigDecimal.ZERO) > 0
                    ? sales.divide(totalRevenue, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100)).doubleValue()
                    : 0.0;
            results.add(AnalyticsSummaryDTO.CategorySalesDTO.builder()
                    .categoryName(catName)
                    .totalSales(sales)
                    .percentage(Math.round(pct * 10.0) / 10.0)
                    .unitsSold(catUnits.getOrDefault(catName, 0L))
                    .build());
        });

        // If no orders yet, populate category placeholders
        if (results.isEmpty()) {
            List<Category> allCats = categoryRepository.findAll();
            for (Category c : allCats) {
                results.add(AnalyticsSummaryDTO.CategorySalesDTO.builder()
                        .categoryName(c.getName())
                        .totalSales(BigDecimal.ZERO)
                        .percentage(25.0)
                        .unitsSold(0)
                        .build());
            }
        }

        return results;
    }
}
