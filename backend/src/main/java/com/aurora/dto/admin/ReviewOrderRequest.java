package com.aurora.dto.admin;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewOrderRequest {

    @Size(max = 1000, message = "Review note must not exceed 1000 characters")
    private String reviewNote;
}
