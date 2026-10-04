package com.aurora.dto.tracking;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TrackingCheckpoint {
    private String statusCode;
    private String title;
    private String description;
    private String location;
    private Instant timestamp;
    private boolean completed;
}
