package com.localpulse.meta;

import java.util.List;

/**
 * Suggested categories shown in the app's UI (search chips, seller onboarding
 * picker). Sellers/listings still store category as free text so this list
 * isn't strictly enforced - it just seeds a good default experience.
 */
public final class Categories {

    public static final List<String> SUGGESTED = List.of(
            "Fish",
            "Vegetables",
            "Fruits",
            "Meat",
            "Dairy",
            "Grocery",
            "Bakery",
            "Flowers",
            "Salon",
            "Street Food",
            "Other"
    );

    private Categories() {
    }
}
