package com.localpulse.listing;

import com.localpulse.common.ApiException;
import com.localpulse.common.GeoUtils;
import com.localpulse.config.ListingProperties;
import com.localpulse.listing.dto.CreateListingRequest;
import com.localpulse.listing.dto.NearbyListingResponse;
import com.localpulse.listing.dto.UpdateListingRequest;
import com.localpulse.seller.Seller;
import com.localpulse.seller.SellerRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.Instant;
import java.util.Comparator;
import java.util.List;

@Service
public class ListingService {

    private static final long MAX_IMAGE_BYTES = 5 * 1024 * 1024;

    private final ListingRepository listingRepository;
    private final SellerRepository sellerRepository;
    private final ListingProperties listingProperties;

    public ListingService(ListingRepository listingRepository, SellerRepository sellerRepository,
                           ListingProperties listingProperties) {
        this.listingRepository = listingRepository;
        this.sellerRepository = sellerRepository;
        this.listingProperties = listingProperties;
    }

    @Transactional
    public Listing create(Long sellerId, CreateListingRequest request) {
        Seller seller = sellerRepository.findById(sellerId)
                .orElseThrow(() -> ApiException.notFound("Seller not found"));

        if (!seller.isProfileComplete()) {
            throw ApiException.badRequest("Please complete your seller profile (business name, category, location) before posting.");
        }

        double lat = request.latitude() != null ? request.latitude() : seller.getLatitude();
        double lng = request.longitude() != null ? request.longitude() : seller.getLongitude();

        int requestedHours = request.expiryHours() != null ? request.expiryHours() : listingProperties.getDefaultExpiryHours();
        int hours = Math.min(requestedHours, listingProperties.getMaxExpiryHours());

        Listing listing = new Listing();
        listing.setSeller(seller);
        listing.setItemName(request.itemName().trim());
        listing.setCategory(request.category().trim());
        listing.setDescription(request.description());
        listing.setPrice(request.price());
        listing.setPriceUnit(request.priceUnit());
        listing.setQuantityInfo(request.quantityInfo());
        listing.setAddress(request.address().trim());
        listing.setLatitude(lat);
        listing.setLongitude(lng);
        listing.setStatus(ListingStatus.ACTIVE);
        listing.setExpiresAt(Instant.now().plusSeconds(hours * 3600L));

        return listingRepository.save(listing);
    }

    @Transactional
    public Listing update(Long sellerId, Long listingId, UpdateListingRequest request) {
        Listing listing = getOwnedOrThrow(sellerId, listingId);

        if (request.description() != null) {
            listing.setDescription(request.description());
        }
        if (request.price() != null) {
            listing.setPrice(request.price());
        }
        if (request.priceUnit() != null) {
            listing.setPriceUnit(request.priceUnit());
        }
        if (request.quantityInfo() != null) {
            listing.setQuantityInfo(request.quantityInfo());
        }
        if (request.extendHours() != null) {
            int hours = Math.min(request.extendHours(), listingProperties.getMaxExpiryHours());
            Instant base = listing.getExpiresAt().isAfter(Instant.now()) ? listing.getExpiresAt() : Instant.now();
            listing.setExpiresAt(base.plusSeconds(hours * 3600L));
            if (listing.getStatus() == ListingStatus.EXPIRED) {
                listing.setStatus(ListingStatus.ACTIVE);
            }
        }
        if (Boolean.TRUE.equals(request.closed())) {
            listing.setStatus(ListingStatus.CLOSED);
        } else if (Boolean.FALSE.equals(request.closed()) && listing.getStatus() == ListingStatus.CLOSED) {
            listing.setStatus(ListingStatus.ACTIVE);
        }

        return listingRepository.save(listing);
    }

    @Transactional
    public Listing uploadImage(Long sellerId, Long listingId, MultipartFile image) {
        Listing listing = getOwnedOrThrow(sellerId, listingId);
        String contentType = image.getContentType();

        if (image.isEmpty()) {
            throw ApiException.badRequest("Please choose an image to upload");
        }
        if (contentType == null || !contentType.startsWith("image/")) {
            throw ApiException.badRequest("Only image files are supported");
        }
        if (image.getSize() > MAX_IMAGE_BYTES) {
            throw ApiException.badRequest("Image must be 5 MB or smaller");
        }

        try {
            listing.setImageData(image.getBytes());
            listing.setImageContentType(contentType);
        } catch (IOException exception) {
            throw ApiException.badRequest("Could not read the uploaded image");
        }
        return listingRepository.save(listing);
    }

    @Transactional(readOnly = true)
    public Listing getImage(Long listingId) {
        Listing listing = listingRepository.findById(listingId)
                .orElseThrow(() -> ApiException.notFound("Listing image not found"));
        if (listing.getImageData() == null) {
            throw ApiException.notFound("Listing image not found");
        }
        return listing;
    }

    @Transactional
    public void delete(Long sellerId, Long listingId) {
        Listing listing = getOwnedOrThrow(sellerId, listingId);
        listingRepository.delete(listing);
    }

    public List<Listing> myListings(Long sellerId) {
        return listingRepository.findBySellerIdOrderByPostedAtDesc(sellerId);
    }

    /**
     * Buyer-facing search. Filtering/distance-sorting happens in Java since
     * H2 has no geospatial functions and dataset sizes here are small
     * (local/regional demo scale).
     */
    @Transactional(readOnly = true)
    public List<NearbyListingResponse> searchNearby(Double lat, Double lng, Double radiusKm, boolean noRadius,
                                                      String query, String category) {
        List<Listing> active = listingRepository.findByStatusAndExpiresAtAfter(ListingStatus.ACTIVE, Instant.now());

        String normalizedQuery = query != null ? query.trim().toLowerCase() : null;
        String normalizedCategory = category != null ? category.trim().toLowerCase() : null;

        return active.stream()
                .filter(l -> normalizedQuery == null || normalizedQuery.isBlank()
                        || l.getItemName().toLowerCase().contains(normalizedQuery)
                        || (l.getDescription() != null && l.getDescription().toLowerCase().contains(normalizedQuery))
                        || (l.getAddress() != null && l.getAddress().toLowerCase().contains(normalizedQuery))
                        || l.getSeller().getBusinessName() != null && l.getSeller().getBusinessName().toLowerCase().contains(normalizedQuery))
                .filter(l -> normalizedCategory == null || normalizedCategory.isBlank()
                        || l.getCategory() != null && l.getCategory().toLowerCase().contains(normalizedCategory))
                .map(l -> {
                    Double distance = (lat != null && lng != null)
                            ? GeoUtils.distanceKm(lat, lng, l.getLatitude(), l.getLongitude())
                            : null;
                    return NearbyListingResponse.from(l, distance);
                })
                .filter(r -> noRadius || lat == null || lng == null
                        || (r.distanceKm() != null && r.distanceKm() <= radiusKm))
                .sorted(Comparator.comparing(
                        (NearbyListingResponse r) -> r.distanceKm() != null ? r.distanceKm() : Double.MAX_VALUE))
                .toList();
    }

    private Listing getOwnedOrThrow(Long sellerId, Long listingId) {
        Listing listing = listingRepository.findById(listingId)
                .orElseThrow(() -> ApiException.notFound("Listing not found"));
        if (!listing.getSeller().getId().equals(sellerId)) {
            throw ApiException.forbidden("You do not own this listing");
        }
        return listing;
    }
}
