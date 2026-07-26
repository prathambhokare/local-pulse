package com.localpulse.seller;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SellerRepository extends JpaRepository<Seller, Long> {
    Optional<Seller> findByPhone(String phone);

    boolean existsByPhone(String phone);
}
