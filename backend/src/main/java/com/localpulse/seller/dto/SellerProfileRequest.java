package com.localpulse.seller.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record SellerProfileRequest(
        @NotBlank(message = "Business name is required") String businessName,
        @NotBlank(message = "Category is required") String category,
        String address,
        @NotNull(message = "Latitude is required") Double latitude,
        @NotNull(message = "Longitude is required") Double longitude
) {
}
