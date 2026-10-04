package com.aurora.dto.ai;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SimulationQuotaResponse {
    private long quotaUsed;
    private long quotaRemaining;
    private long quotaLimit;
    private String yearMonth;
    private String resetDate;
}
