package com.localpulse.seller;

import com.localpulse.security.CurrentSellerProvider;
import com.localpulse.seller.dto.SellerProfileRequest;
import com.localpulse.seller.dto.SellerProfileResponse;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/sellers")
public class SellerController {

    private final SellerService sellerService;
    private final CurrentSellerProvider currentSellerProvider;

    public SellerController(SellerService sellerService, CurrentSellerProvider currentSellerProvider) {
        this.sellerService = sellerService;
        this.currentSellerProvider = currentSellerProvider;
    }

    @GetMapping("/me")
    public SellerProfileResponse me() {
        Long sellerId = currentSellerProvider.require().sellerId();
        return SellerProfileResponse.from(sellerService.getOrThrow(sellerId));
    }

    @PutMapping("/me")
    public SellerProfileResponse updateMe(@Valid @RequestBody SellerProfileRequest request) {
        Long sellerId = currentSellerProvider.require().sellerId();
        return SellerProfileResponse.from(sellerService.updateProfile(sellerId, request));
    }
}
