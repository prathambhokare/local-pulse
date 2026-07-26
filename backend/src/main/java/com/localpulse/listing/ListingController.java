package com.localpulse.listing;

import com.localpulse.listing.dto.CreateListingRequest;
import com.localpulse.listing.dto.ListingResponse;
import com.localpulse.listing.dto.NearbyListingResponse;
import com.localpulse.listing.dto.UpdateListingRequest;
import com.localpulse.security.CurrentSellerProvider;
import jakarta.validation.Valid;
import org.springframework.http.CacheControl;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.Duration;
import java.util.List;

@RestController
@RequestMapping("/api/listings")
public class ListingController {

    private final ListingService listingService;
    private final CurrentSellerProvider currentSellerProvider;

    public ListingController(ListingService listingService, CurrentSellerProvider currentSellerProvider) {
        this.listingService = listingService;
        this.currentSellerProvider = currentSellerProvider;
    }

    /** Public buyer feed/search. No auth required. */
    @GetMapping("/nearby")
    public List<NearbyListingResponse> nearby(
            @RequestParam(required = false) Double lat,
            @RequestParam(required = false) Double lng,
            @RequestParam(required = false, defaultValue = "5") Double radiusKm,
            @RequestParam(required = false, defaultValue = "false") boolean noRadius,
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String category
    ) {
        return listingService.searchNearby(lat, lng, radiusKm, noRadius, query, category);
    }

    @GetMapping("/mine")
    public List<ListingResponse> mine() {
        Long sellerId = currentSellerProvider.require().sellerId();
        return listingService.myListings(sellerId).stream().map(ListingResponse::from).toList();
    }

    @PostMapping
    public ListingResponse create(@Valid @RequestBody CreateListingRequest request) {
        Long sellerId = currentSellerProvider.require().sellerId();
        return ListingResponse.from(listingService.create(sellerId, request));
    }

    @PutMapping(value = "/{id}/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ListingResponse uploadImage(@PathVariable Long id, @RequestPart("image") MultipartFile image) {
        Long sellerId = currentSellerProvider.require().sellerId();
        return ListingResponse.from(listingService.uploadImage(sellerId, id, image));
    }

    @GetMapping("/{id}/image")
    public ResponseEntity<byte[]> image(@PathVariable Long id) {
        Listing listing = listingService.getImage(id);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(listing.getImageContentType()))
                .cacheControl(CacheControl.maxAge(Duration.ofHours(1)).cachePublic())
                .body(listing.getImageData());
    }

    @PatchMapping("/{id}")
    public ListingResponse update(@PathVariable Long id, @RequestBody UpdateListingRequest request) {
        Long sellerId = currentSellerProvider.require().sellerId();
        return ListingResponse.from(listingService.update(sellerId, id, request));
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        Long sellerId = currentSellerProvider.require().sellerId();
        listingService.delete(sellerId, id);
    }
}
