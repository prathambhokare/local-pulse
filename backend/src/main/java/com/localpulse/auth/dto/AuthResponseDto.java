package com.localpulse.auth.dto;

public record AuthResponseDto(
        String token,
        Long sellerId,
        String phone,
        boolean profileComplete
) {
}
