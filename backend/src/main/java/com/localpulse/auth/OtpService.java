package com.localpulse.auth;

import com.localpulse.common.ApiException;
import com.localpulse.config.OtpProperties;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.List;

/**
 * Generates and validates one-time-passwords for seller login.
 *
 * Generates a local code and stores only its hash for verification.
 */
@Service
@Slf4j
public class OtpService {

    private static final SecureRandom RANDOM = new SecureRandom();

    private final OtpTokenRepository otpTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final OtpProperties otpProperties;

    public OtpService(OtpTokenRepository otpTokenRepository, PasswordEncoder passwordEncoder,
                      OtpProperties otpProperties) {
        this.otpTokenRepository = otpTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.otpProperties = otpProperties;
    }

    @Transactional
    public String requestOtp(String rawPhone) {
        String phone = normalize(rawPhone);

        // Invalidate any previous unconsumed OTPs for this phone.
        List<OtpToken> existing = otpTokenRepository.findByPhoneAndConsumedFalseOrderByCreatedAtDesc(phone);
        existing.forEach(t -> t.setConsumed(true));
        otpTokenRepository.saveAll(existing);

        String code = generateCode();

        OtpToken token = new OtpToken();
        token.setPhone(phone);
        token.setCodeHash(passwordEncoder.encode(code));
        token.setExpiresAt(Instant.now().plusSeconds(otpProperties.getExpiryMinutes() * 60L));
        otpTokenRepository.save(token);

        log.info("[LOCAL OTP] Code for {} is {}", phone, code);
        return code;
    }

    @Transactional
    public String verifyOtpAndGetPhone(String rawPhone, String code) {
        String phone = normalize(rawPhone);

        List<OtpToken> candidates = otpTokenRepository.findByPhoneAndConsumedFalseOrderByCreatedAtDesc(phone);
        if (candidates.isEmpty()) {
            throw ApiException.badRequest("No OTP request found for this phone. Please request a new OTP.");
        }

        OtpToken latest = candidates.get(0);
        if (latest.isExpired()) {
            throw ApiException.badRequest("OTP has expired. Please request a new one.");
        }
        if (latest.getAttempts() >= otpProperties.getMaxAttempts()) {
            throw ApiException.badRequest("Too many incorrect attempts. Please request a new OTP.");
        }
        if (!passwordEncoder.matches(code, latest.getCodeHash())) {
            latest.setAttempts(latest.getAttempts() + 1);
            otpTokenRepository.save(latest);
            throw ApiException.badRequest("Incorrect OTP. Please try again.");
        }

        latest.setConsumed(true);
        otpTokenRepository.save(latest);
        return phone;
    }

    private String generateCode() {
        int value = 100000 + RANDOM.nextInt(900000);
        return String.valueOf(value);
    }

    private String normalize(String phone) {
        String compact = phone.trim().replaceAll("[\\s()-]", "");
        if (compact.matches("^0[6-9][0-9]{9}$")) {
            compact = compact.substring(1);
        }
        if (compact.matches("^[6-9][0-9]{9}$")) {
            compact = otpProperties.getDefaultCountryCode() + compact;
        } else if (compact.matches("^[1-9][0-9]{10,14}$")) {
            compact = "+" + compact;
        }
        if (!compact.matches("^\\+[1-9][0-9]{7,14}$")) {
            throw ApiException.badRequest("Enter a valid mobile number with country code.");
        }
        return compact;
    }
}
