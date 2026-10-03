package com.aurora.dto.checkout;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateCheckoutSessionRequest {

    @Builder.Default
    private String currency = "EUR"; // EUR or USD

    @NotEmpty(message = "Order must contain at least one item")
    @Valid
    private List<OrderItemRequest> items;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String customerEmail;

    @NotBlank(message = "Customer name is required")
    private String customerName;

    private String customerPhone;

    @NotBlank(message = "Shipping address is required")
    private String shippingAddressLine1;

    private String shippingAddressLine2;

    @NotBlank(message = "City is required")
    private String shippingCity;

    private String shippingState;

    @NotBlank(message = "Postal code is required")
    private String shippingPostalCode;

    @NotBlank(message = "Country is required (e.g., USA, France, Germany, UK)")
    private String shippingCountry;

    private String notes;
}
