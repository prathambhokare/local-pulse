package com.localpulse.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.listing")
public class ListingProperties {

    private int defaultExpiryHours;
    private int maxExpiryHours;

    public int getDefaultExpiryHours() {
        return defaultExpiryHours;
    }

    public void setDefaultExpiryHours(int defaultExpiryHours) {
        this.defaultExpiryHours = defaultExpiryHours;
    }

    public int getMaxExpiryHours() {
        return maxExpiryHours;
    }

    public void setMaxExpiryHours(int maxExpiryHours) {
        this.maxExpiryHours = maxExpiryHours;
    }
}
