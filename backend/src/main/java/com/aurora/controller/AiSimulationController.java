package com.aurora.controller;

import com.aurora.dto.ApiResponse;
import com.aurora.dto.ai.SimulationQuotaResponse;
import com.aurora.dto.ai.SimulationResponse;
import com.aurora.security.UserPrincipal;
import com.aurora.service.AiSimulationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
@Tag(name = "AI Virtual Wall Simulation", description = "Endpoints for simulating artisanal masks on user walls with monthly rate limiting")
public class AiSimulationController {

    private final AiSimulationService aiSimulationService;

    @PostMapping(value = "/simulate", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Generate virtual wall projection with olive wood mask (Max 3 free simulations/month)")
    public ResponseEntity<ApiResponse<SimulationResponse>> simulateMask(
            @RequestParam("productId") UUID productId,
            @RequestParam("wallImage") MultipartFile wallImage,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {

        UUID userId = userPrincipal != null ? userPrincipal.getId() : null;
        log.info("Simulating mask {} on wall for user {}", productId, userId);

        SimulationResponse response = aiSimulationService.simulateMaskOnWall(userId, productId, wallImage);
        return ResponseEntity.ok(ApiResponse.ok("Virtual wall simulation generated successfully", response));
    }

    @GetMapping("/quota")
    @Operation(summary = "Check user's remaining monthly virtual wall simulation quota")
    public ResponseEntity<ApiResponse<SimulationQuotaResponse>> getQuota(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {

        UUID userId = userPrincipal != null ? userPrincipal.getId() : null;
        SimulationQuotaResponse response = aiSimulationService.getUserQuota(userId);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }
}
