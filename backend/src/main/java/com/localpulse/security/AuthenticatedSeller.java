package com.localpulse.security;

/**
 * Lightweight principal placed into the SecurityContext after a JWT is
 * validated. Kept intentionally minimal - controllers/services that need
 * full seller details still go through SellerRepository.
 */
public record AuthenticatedSeller(Long sellerId, String phone) {
}
