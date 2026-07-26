package com.localpulse.seller;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

/**
 * A seller (fish vendor, vegetable seller, salon, grocery shop, etc.) who has
 * authenticated via mobile OTP. Buyers are never persisted - they're
 * anonymous browsers of the /listings/nearby feed.
 */
@Entity
@Table(name = "sellers", indexes = {
        @Index(name = "idx_seller_phone", columnList = "phone", unique = true)
})
@Getter
@Setter
@NoArgsConstructor
public class Seller {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 20)
    private String phone;

    @Column(name = "business_name")
    private String businessName;

    /** Free-text category, e.g. "Fish Seller", "Vegetables", "Salon". */
    private String category;

    private String address;

    private Double latitude;

    private Double longitude;

    @Column(nullable = false)
    private boolean active = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    void onCreate() {
        Instant now = Instant.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    void onUpdate() {
        this.updatedAt = Instant.now();
    }

    public boolean isProfileComplete() {
        return businessName != null && !businessName.isBlank()
                && category != null && !category.isBlank()
                && latitude != null && longitude != null;
    }
}
