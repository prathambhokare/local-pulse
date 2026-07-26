package com.localpulse.auth;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OtpTokenRepository extends JpaRepository<OtpToken, Long> {
    List<OtpToken> findByPhoneAndConsumedFalseOrderByCreatedAtDesc(String phone);
}
