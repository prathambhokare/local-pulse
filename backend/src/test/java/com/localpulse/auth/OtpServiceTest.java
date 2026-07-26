package com.localpulse.auth;

import com.localpulse.config.OtpProperties;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class OtpServiceTest {

    @Mock
    private OtpTokenRepository otpTokenRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    private OtpProperties otpProperties;
    private OtpService otpService;

    @BeforeEach
    void setUp() {
        otpProperties = new OtpProperties();
        otpProperties.setDefaultCountryCode("+91");
        otpProperties.setExpiryMinutes(5);
        otpProperties.setMaxAttempts(5);
        otpService = new OtpService(
                otpTokenRepository,
                passwordEncoder,
                otpProperties
        );
    }

    @Test
    void returnsLocalOtpAndStoresOnlyItsHash() {
        when(otpTokenRepository.findByPhoneAndConsumedFalseOrderByCreatedAtDesc("+919876543210"))
                .thenReturn(List.of());
        when(passwordEncoder.encode(anyString())).thenAnswer(invocation -> "hash:" + invocation.getArgument(0));

        String responseCode = otpService.requestOtp("98765 43210");

        ArgumentCaptor<OtpToken> tokenCaptor = ArgumentCaptor.forClass(OtpToken.class);
        verify(otpTokenRepository).save(tokenCaptor.capture());

        OtpToken storedToken = tokenCaptor.getValue();
        assertNotNull(responseCode);
        assertTrue(responseCode.matches("[0-9]{6}"));
        assertEquals("+919876543210", storedToken.getPhone());
        assertEquals("hash:" + responseCode, storedToken.getCodeHash());
    }
}