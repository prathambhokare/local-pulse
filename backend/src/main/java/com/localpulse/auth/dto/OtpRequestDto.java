package com.localpulse.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record OtpRequestDto(
        @NotBlank(message = "Phone number is required")
        @Pattern(regexp = "^[+0-9()\\-\\s]{10,25}$", message = "Enter a valid phone number")
        String phone
) {
}
