package com.aurora.controller;

import com.aurora.dto.ApiResponse;
import com.aurora.dto.admin.RecordVisitRequest;
import com.aurora.security.UserPrincipal;
import com.aurora.service.AnalyticsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
@Tag(name = "Analytics - Public", description = "Public endpoints for traffic tracking and event hooks")
public class PublicAnalyticsController {

    private final AnalyticsService analyticsService;

    @PostMapping("/visit")
    @Operation(summary = "Record incoming visitor session / page view")
    public ResponseEntity<ApiResponse<Void>> recordVisit(
            @RequestBody(required = false) RecordVisitRequest request,
            HttpServletRequest httpRequest,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {

        UUID userId = (userPrincipal != null) ? userPrincipal.getId() : null;
        analyticsService.recordVisit(request, httpRequest, userId);
        return ResponseEntity.ok(ApiResponse.ok("Visit recorded", null));
    }
}
