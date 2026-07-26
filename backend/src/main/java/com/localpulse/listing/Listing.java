package com.localpulse.listing;

import com.localpulse.seller.Seller;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;

/**
 * A single "availability" post: e.g. "50kg Rohu fish available today" or
 * "Haircut slots open". Always tied to a seller and a location, and always
 * has an expiry so the feed stays fresh (default 24h, seller-adjustable).
 */
@Entity
@Table(name = "listings", indexes = {
        @Index(name = "idx_listing_status_expiry", columnList = "status, expires_at"),
        @Index(name = "idx_listing_seller", columnList = "seller_id")
})
@Getter
@Setter
@NoArgsConstructor
public class Listing {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "seller_id", nullable = false)
    private Seller seller;

    @Column(name = "item_name", nullable = false)
    private String itemName;

    private String category;

    @Column(length = 1000)
    private String description;

    private BigDecimal price;

    @Column(name = "price_unit")
    private String priceUnit;

    @Column(name = "quantity_info")
    private String quantityInfo;

    @Column(length = 500)
    private String address;

    @Lob
    @Column(name = "image_data")
    private byte[] imageData;

    @Column(name = "image_content_type")
    private String imageContentType;

    @Column(nullable = false)
    private Double latitude;

    @Column(nullable = false)
    private Double longitude;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ListingStatus status = ListingStatus.ACTIVE;

    @Column(name = "posted_at", nullable = false, updatable = false)
    private Instant postedAt;

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    @PrePersist
    void onCreate() {
        this.postedAt = Instant.now();
    }
}
