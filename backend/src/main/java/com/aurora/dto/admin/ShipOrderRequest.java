package com.aurora.dto.admin;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShipOrderRequest {

    @NotBlank(message = "DHL Tracking number is required")
    @Size(min = 5, max = 100, message = "Tracking number must be between 5 and 100 characters")
    private String trackingNumber;

    @Builder.Default
    private String carrier = "DHL Express";
}
