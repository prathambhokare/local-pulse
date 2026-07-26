package com.localpulse.listing;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.Instant;
import java.util.List;

public interface ListingRepository extends JpaRepository<Listing, Long> {

    List<Listing> findBySellerIdOrderByPostedAtDesc(Long sellerId);

    @Query("SELECT l FROM Listing l JOIN FETCH l.seller WHERE l.status = ?1 AND l.expiresAt > ?2")
    List<Listing> findByStatusAndExpiresAtAfter(ListingStatus status, Instant now);

    List<Listing> findByStatusAndExpiresAtBefore(ListingStatus status, Instant now);
}
