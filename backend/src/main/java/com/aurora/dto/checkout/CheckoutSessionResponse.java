package com.aurora.dto.checkout;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CheckoutSessionResponse {
    private String sessionId;
    private String checkoutUrl;
    private String orderNumber;
    private BigDecimal totalAmount;
    private String currency;
}
