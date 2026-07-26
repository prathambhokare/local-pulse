package com.localpulse.auth;

import com.localpulse.auth.dto.AuthResponseDto;
import com.localpulse.auth.dto.OtpRequestDto;
import com.localpulse.auth.dto.OtpRequestResponse;
import com.localpulse.auth.dto.OtpVerifyDto;
import com.localpulse.config.OtpProperties;
import com.localpulse.security.JwtService;
import com.localpulse.seller.Seller;
import com.localpulse.seller.SellerRepository;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final OtpService otpService;
    private final OtpProperties otpProperties;
    private final SellerRepository sellerRepository;
    private final JwtService jwtService;

    public AuthController(OtpService otpService, OtpProperties otpProperties,
                           SellerRepository sellerRepository, JwtService jwtService) {
        this.otpService = otpService;
        this.otpProperties = otpProperties;
        this.sellerRepository = sellerRepository;
        this.jwtService = jwtService;
    }

    @PostMapping("/otp/request")
    public OtpRequestResponse requestOtp(@Valid @RequestBody OtpRequestDto request) {
        String code = otpService.requestOtp(request.phone());
        String devOtp = otpProperties.isExposeInResponse() ? code : null;
        return new OtpRequestResponse(
                "OTP sent successfully" + (devOtp != null ? " (dev mode - see devOtp field)" : ""),
                otpProperties.getExpiryMinutes(),
                devOtp
        );
    }

    @PostMapping("/otp/verify")
    public AuthResponseDto verifyOtp(@Valid @RequestBody OtpVerifyDto request) {
        String phone = otpService.verifyOtpAndGetPhone(request.phone(), request.otp());
        Seller seller = findOrCreateSeller(phone);

        String token = jwtService.generateToken(seller.getId(), seller.getPhone());
        return new AuthResponseDto(token, seller.getId(), seller.getPhone(), seller.isProfileComplete());
    }

    private Seller findOrCreateSeller(String phone) {
        Optional<Seller> existing = sellerRepository.findByPhone(phone);
        if (existing.isEmpty() && phone.matches("^\\+91[6-9][0-9]{9}$")) {
            existing = sellerRepository.findByPhone(phone.substring(3));
        }
        if (existing.isPresent()) {
            Seller seller = existing.get();
            if (!phone.equals(seller.getPhone())) {
                seller.setPhone(phone);
                return sellerRepository.save(seller);
            }
            return seller;
        }

        Seller newSeller = new Seller();
        newSeller.setPhone(phone);
        return sellerRepository.save(newSeller);
    }
}
