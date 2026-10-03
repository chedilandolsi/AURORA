package com.aurora.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnalyticsSummaryDTO {
    private String period; // DAILY, WEEKLY, MONTHLY, YEARLY
    private BigDecimal totalRevenue;
    private BigDecimal grossSales;
    private BigDecimal averageOrderValue;
    private long totalOrders;
    private long totalCustomers;
    private long lowStockCount;
    @Builder.Default
    private List<RevenueTrendPointDTO> revenueTrend = new ArrayList<>();
    @Builder.Default
    private List<CategorySalesDTO> categoryBreakdown = new ArrayList<>();
    @Builder.Default
    private List<TopProductDTO> topSellingProducts = new ArrayList<>();

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RevenueTrendPointDTO {
        private String label; // e.g. "Mon", "Oct 01", "2026-W40"
        private BigDecimal revenue;
        private long orderCount;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CategorySalesDTO {
        private String categoryName;
        private BigDecimal totalSales;
        private double percentage;
        private long unitsSold;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TopProductDTO {
        private UUID productId;
        private String productName;
        private String woodType;
        private long unitsSold;
        private BigDecimal totalRevenue;
        private int stockRemaining;
    }
}
