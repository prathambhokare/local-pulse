package com.localpulse.seller.dto;

import com.localpulse.seller.Seller;

public record SellerProfileResponse(
        Long id,
        String phone,
        String businessName,
        String category,
        String address,
        Double latitude,
        Double longitude,
        boolean profileComplete
) {
    public static SellerProfileResponse from(Seller seller) {
        return new SellerProfileResponse(
                seller.getId(),
                seller.getPhone(),
                seller.getBusinessName(),
                seller.getCategory(),
                seller.getAddress(),
                seller.getLatitude(),
                seller.getLongitude(),
                seller.isProfileComplete()
        );
    }
}
