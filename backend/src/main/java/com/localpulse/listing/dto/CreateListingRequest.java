package com.localpulse.listing.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record CreateListingRequest(
        @NotBlank(message = "Item name is required") String itemName,
        @NotBlank(message = "Category is required") String category,
        String description,
        @DecimalMin(value = "0", message = "Price must be positive") BigDecimal price,
        String priceUnit,
        String quantityInfo,
        @NotBlank(message = "Availability address is required")
        @Size(max = 500, message = "Address can be at most 500 characters")
        String address,
        /** Optional override; defaults to the seller's profile location. */
        Double latitude,
        Double longitude,
        /** Optional; defaults to app.listing.default-expiry-hours, capped at max-expiry-hours. */
        @Min(value = 1, message = "Expiry must be at least 1 hour")
        @Max(value = 24, message = "Expiry can be at most 24 hours")
        Integer expiryHours
) {
        @AssertTrue(message = "Choose a meaningful price unit such as kg, item or service")
        public boolean isPriceUnitValid() {
                return price == null || priceUnit != null && !priceUnit.isBlank()
                                && !priceUnit.trim().matches("^\\d+(?:[.,]\\d+)?$");
        }
}
