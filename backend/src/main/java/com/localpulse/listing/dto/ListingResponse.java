package com.localpulse.listing.dto;

import com.localpulse.listing.Listing;
import com.localpulse.listing.ListingStatus;

import java.math.BigDecimal;
import java.time.Instant;

public record ListingResponse(
        Long id,
        String itemName,
        String category,
        String description,
        BigDecimal price,
        String priceUnit,
        String quantityInfo,
        String address,
        String imageUrl,
        Double latitude,
        Double longitude,
        ListingStatus status,
        Instant postedAt,
        Instant expiresAt
) {
    public static ListingResponse from(Listing listing) {
        return new ListingResponse(
                listing.getId(),
                listing.getItemName(),
                listing.getCategory(),
                listing.getDescription(),
                listing.getPrice(),
                listing.getPriceUnit(),
                listing.getQuantityInfo(),
                listing.getAddress(),
                listing.getImageData() != null ? "/api/listings/" + listing.getId() + "/image" : null,
                listing.getLatitude(),
                listing.getLongitude(),
                listing.getStatus(),
                listing.getPostedAt(),
                listing.getExpiresAt()
        );
    }
}
