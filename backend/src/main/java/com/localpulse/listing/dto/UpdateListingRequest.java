package com.localpulse.listing.dto;

import java.math.BigDecimal;

public record UpdateListingRequest(
        String description,
        BigDecimal price,
        String priceUnit,
        String quantityInfo,
        /** If provided, pushes expiresAt forward by this many hours from now. */
        Integer extendHours,
        /** If true, marks the listing CLOSED (e.g. sold out) so it drops off the buyer feed. */
        Boolean closed
) {
}
