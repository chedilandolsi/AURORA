package com.aurora.service;

import com.aurora.dto.admin.AnalyticsSummaryDTO;
import com.aurora.model.entity.Category;
import com.aurora.model.entity.Order;
import com.aurora.model.entity.OrderItem;
import com.aurora.model.entity.Product;
import com.aurora.repository.CategoryRepository;
import com.aurora.repository.OrderItemRepository;
import com.aurora.repository.OrderRepository;
import com.aurora.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.*;
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

        // 2. Revenue Trend Points
        List<Order> paidOrders = orderRepository.findPaidOrdersSince(startDate);
        List<AnalyticsSummaryDTO.RevenueTrendPointDTO> trendPoints = buildTrendPoints(paidOrders, period, startDate);

        // 3. Top Selling Products Leaderboard
        List<AnalyticsSummaryDTO.TopProductDTO> topProducts = buildTopProducts(startDate);

        // 4. Category Sales Distribution
        List<AnalyticsSummaryDTO.CategorySalesDTO> categoryBreakdown = buildCategoryDistribution(paidOrders, totalRevenue);

        return AnalyticsSummaryDTO.builder()
                .period(period)
                .totalRevenue(totalRevenue)
                .grossSales(grossSales)
                .averageOrderValue(aov)
                .totalOrders(totalOrders)
                .totalCustomers(totalCustomers)
                .lowStockCount(lowStockCount)
                .revenueTrend(trendPoints)
                .categoryBreakdown(categoryBreakdown)
                .topSellingProducts(topProducts)
                .build();
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
            if (productId != null) {
                Optional<Product> pOpt = productRepository.findById(productId);
                if (pOpt.isPresent()) {
                    stockRemaining = pOpt.get().getStockQuantity();
                }
            }

            topProducts.add(AnalyticsSummaryDTO.TopProductDTO.builder()
                    .productId(productId)
                    .productName(productName)
                    .woodType(woodType)
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
