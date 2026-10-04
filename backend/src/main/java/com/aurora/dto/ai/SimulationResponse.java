package com.aurora.dto.ai;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SimulationResponse {
    private UUID simulationId;
    private String resultImageUrl;
    private String wallImageUrl;
    private UUID productId;
    private String productName;
    private long quotaUsed;
    private long quotaRemaining;
    private String resetDate;
    private Instant createdAt;
}
