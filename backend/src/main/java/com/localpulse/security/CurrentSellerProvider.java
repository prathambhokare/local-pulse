package com.localpulse.security;

import com.localpulse.common.ApiException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
public class CurrentSellerProvider {

    public AuthenticatedSeller require() {
        Object principal = SecurityContextHolder.getContext().getAuthentication() != null
                ? SecurityContextHolder.getContext().getAuthentication().getPrincipal()
                : null;
        if (!(principal instanceof AuthenticatedSeller authenticatedSeller)) {
            throw ApiException.unauthorized("Authentication required. Please verify OTP first.");
        }
        return authenticatedSeller;
    }
}
