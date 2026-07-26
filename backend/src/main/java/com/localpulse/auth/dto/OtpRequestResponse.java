package com.localpulse.auth.dto;

public record OtpRequestResponse(
        String message,
        int expiryMinutes,
        String devOtp
) {
}
