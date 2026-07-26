package com.localpulse.listing.dto;

import com.localpulse.listing.Listing;

import java.math.BigDecimal;
import java.time.Instant;

public record NearbyListingResponse(
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
        Instant postedAt,
        Instant expiresAt,
        Double distanceKm,
        Long sellerId,
        String businessName,
        String sellerPhone
) {
    public static NearbyListingResponse from(Listing listing, Double distanceKm) {
        var seller = listing.getSeller();
        return new NearbyListingResponse(
                listing.getId(),
                listing.getItemName(),
                listing.getCategory(),
                listing.getDescription(),
                listing.getPrice(),
                listing.getPriceUnit(),
                listing.getQuantityInfo(),
                listing.getAddress() != null ? listing.getAddress() : seller.getAddress(),
                listing.getImageData() != null ? "/api/listings/" + listing.getId() + "/image" : null,
                listing.getLatitude(),
                listing.getLongitude(),
                listing.getPostedAt(),
                listing.getExpiresAt(),
                distanceKm,
                seller.getId(),
                seller.getBusinessName(),
                seller.getPhone()
        );
    }
}
