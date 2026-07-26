package com.localpulse.seller;

import com.localpulse.common.ApiException;
import com.localpulse.seller.dto.SellerProfileRequest;
import org.springframework.stereotype.Service;

@Service
public class SellerService {

    private final SellerRepository sellerRepository;

    public SellerService(SellerRepository sellerRepository) {
        this.sellerRepository = sellerRepository;
    }

    public Seller getOrThrow(Long sellerId) {
        return sellerRepository.findById(sellerId)
                .orElseThrow(() -> ApiException.notFound("Seller not found"));
    }

    public Seller updateProfile(Long sellerId, SellerProfileRequest request) {
        Seller seller = getOrThrow(sellerId);
        seller.setBusinessName(request.businessName().trim());
        seller.setCategory(request.category().trim());
        seller.setAddress(request.address() != null ? request.address().trim() : null);
        seller.setLatitude(request.latitude());
        seller.setLongitude(request.longitude());
        return sellerRepository.save(seller);
    }
}
