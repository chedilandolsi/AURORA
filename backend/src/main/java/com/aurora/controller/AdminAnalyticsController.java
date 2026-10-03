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

@RestController
@RequestMapping("/api/admin/analytics")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin - Sales Analytics", description = "Endpoints for sales metrics, AOV, revenue trends and leaderboards (Admin Only)")
public class AdminAnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping
    @Operation(summary = "Get aggregated financial metrics and trend analysis across customizable date ranges")
    public ResponseEntity<ApiResponse<AnalyticsSummaryDTO>> getAnalytics(
            @RequestParam(defaultValue = "MONTHLY") String range) {
        AnalyticsSummaryDTO summary = analyticsService.getAnalytics(range);
        return ResponseEntity.ok(ApiResponse.ok("Analytics generated successfully", summary));
    }
}
