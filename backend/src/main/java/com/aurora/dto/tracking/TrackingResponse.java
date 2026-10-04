package com.aurora.dto.tracking;

import com.aurora.model.entity.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TrackingResponse {
    private String trackingNumber;
    private String carrier;
    private String orderNumber;
    private OrderStatus status;
    private String origin;
    private String destination;
    private Instant estimatedDelivery;
    private String serviceType;
    @Builder.Default
    private List<TrackingCheckpoint> checkpoints = new ArrayList<>();
}
