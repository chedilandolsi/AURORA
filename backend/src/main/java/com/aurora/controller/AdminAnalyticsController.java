package com.aurora.controller;

import com.aurora.dto.ApiResponse;
import com.aurora.dto.admin.AnalyticsSummaryDTO;
import com.aurora.service.AnalyticsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/analytics")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin - Sales Analytics", description = "Endpoints for sales metrics, AOV, revenue trends, traffic and product leaderboards (Admin Only)")
public class AdminAnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping
    @Operation(summary = "Get aggregated financial, traffic, and sales metrics across customizable date ranges")
    public ResponseEntity<ApiResponse<AnalyticsSummaryDTO>> getAnalytics(
            @RequestParam(defaultValue = "MONTHLY") String range) {
        AnalyticsSummaryDTO summary = analyticsService.getAnalytics(range);
        return ResponseEntity.ok(ApiResponse.ok("Analytics generated successfully", summary));
    }

    @GetMapping("/top-products")
    @Operation(summary = "Get top selling wooden mask products leaderboard with revenue and units sold")
    public ResponseEntity<ApiResponse<List<AnalyticsSummaryDTO.TopProductDTO>>> getTopProducts(
            @RequestParam(defaultValue = "MONTHLY") String range) {
        List<AnalyticsSummaryDTO.TopProductDTO> topProducts = analyticsService.getTopSellingProducts(range);
        return ResponseEntity.ok(ApiResponse.ok("Top selling products retrieved successfully", topProducts));
    }
}
