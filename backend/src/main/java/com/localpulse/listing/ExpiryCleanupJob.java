package com.localpulse.listing;

import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

/**
 * Periodically flips ACTIVE listings whose expiresAt has passed to EXPIRED.
 * Buyer search already filters by expiresAt too, so this job is mainly
 * housekeeping (keeps "my listings" status accurate for sellers).
 */
@Component
@Slf4j
public class ExpiryCleanupJob {

    private final ListingRepository listingRepository;

    public ExpiryCleanupJob(ListingRepository listingRepository) {
        this.listingRepository = listingRepository;
    }

    @Scheduled(fixedRate = 5 * 60 * 1000L)
    @Transactional
    public void expireStaleListings() {
        List<Listing> stale = listingRepository.findByStatusAndExpiresAtBefore(ListingStatus.ACTIVE, Instant.now());
        if (stale.isEmpty()) {
            return;
        }
        stale.forEach(l -> l.setStatus(ListingStatus.EXPIRED));
        listingRepository.saveAll(stale);
        log.info("Marked {} listing(s) as EXPIRED", stale.size());
    }
}
