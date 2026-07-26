package com.localpulse.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.otp")
public class OtpProperties {

    private String defaultCountryCode = "+91";
    private int expiryMinutes;
    private boolean exposeInResponse;
    private int maxAttempts;

    public String getDefaultCountryCode() {
        return defaultCountryCode;
    }

    public void setDefaultCountryCode(String defaultCountryCode) {
        this.defaultCountryCode = defaultCountryCode;
    }

    public int getExpiryMinutes() {
        return expiryMinutes;
    }

    public void setExpiryMinutes(int expiryMinutes) {
        this.expiryMinutes = expiryMinutes;
    }

    public boolean isExposeInResponse() {
        return exposeInResponse;
    }

    public void setExposeInResponse(boolean exposeInResponse) {
        this.exposeInResponse = exposeInResponse;
    }

    public int getMaxAttempts() {
        return maxAttempts;
    }

    public void setMaxAttempts(int maxAttempts) {
        this.maxAttempts = maxAttempts;
    }

}
