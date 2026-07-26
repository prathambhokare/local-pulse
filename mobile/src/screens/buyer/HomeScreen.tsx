import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  FlatList,
  Image,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { CategoryChips } from "../../components/CategoryChips";
import { ListingCard } from "../../components/ListingCard";
import { RadiusSelector } from "../../components/RadiusSelector";
import { useLocation } from "../../hooks/useLocation";
import { searchNearby } from "../../api/listings";
import { NearbyListing } from "../../api/types";
import { colors, radius, shadow, spacing } from "../../theme";
import { extractErrorMessage } from "../../api/client";

const AUTO_REFRESH_MS = 15 * 60 * 1000;

type FeedRow =
  | { type: "summary" }
  | { type: "listing"; listing: NearbyListing }
  | { type: "empty" };

export function HomeScreen() {
  const { coords, requestLocation, errorMessage: locationError } = useLocation();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [radiusKm, setRadiusKm] = useState(5);
  const [noRadius, setNoRadius] = useState(false);
  const [allListings, setAllListings] = useState<NearbyListing[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const latestSearchId = useRef(0);

  useEffect(() => {
    requestLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const runSearch = useCallback(
    async (overrides?: { radiusKm?: number; noRadius?: boolean; searchQuery?: string }) => {
      const searchId = ++latestSearchId.current;
      setLoading(true);
      setError(null);
      const effectiveRadius = overrides?.radiusKm ?? radiusKm;
      const effectiveNoRadius = overrides?.noRadius ?? noRadius;
      const effectiveQuery = overrides?.searchQuery ?? query;
      try {
        // Fetch everything available in the region (no category filter) so the
        // category chips can reflect what's actually on offer nearby right now.
        const results = await searchNearby({
          lat: coords?.latitude,
          lng: coords?.longitude,
          radiusKm: effectiveRadius,
          noRadius: effectiveNoRadius,
          query: effectiveQuery.trim() || undefined,
        });
        if (searchId === latestSearchId.current) {
          setAllListings(results);
        }
      } catch (err) {
        if (searchId === latestSearchId.current) {
          setError(extractErrorMessage(err));
        }
      } finally {
        if (searchId === latestSearchId.current) {
          setLoading(false);
        }
      }
    },
    [coords, radiusKm, noRadius, query]
  );

  useEffect(() => {
    // Re-run search once we have (or fail to get) a location fix.
    runSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coords]);

  useEffect(() => {
    const timeout = setTimeout(() => runSearch({ searchQuery: query }), 300);
    return () => clearTimeout(timeout);
    // runSearch changes with the current query, radius and location; query is
    // intentionally the only trigger for this debounce.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  useEffect(() => {
    const interval = setInterval(() => runSearch(), AUTO_REFRESH_MS);
    return () => clearInterval(interval);
  }, [runSearch]);

  const availableCategories = useMemo(() => {
    const set = new Set<string>();
    allListings.forEach((listing) => set.add(listing.category));
    return Array.from(set).sort();
  }, [allListings]);

  const listings = useMemo(() => {
    if (!selectedCategory) return allListings;
    return allListings.filter((listing) => listing.category === selectedCategory);
  }, [allListings, selectedCategory]);

  const feedRows = useMemo<FeedRow[]>(() => {
    const rows: FeedRow[] = [{ type: "summary" }];
    if (!loading && listings.length === 0) {
      rows.push({ type: "empty" });
    } else {
      rows.push(...listings.map((listing) => ({ type: "listing" as const, listing })));
    }
    return rows;
  }, [listings, loading]);

  useEffect(() => {
    // If the previously selected category is no longer on offer in this region, reset to "All".
    if (selectedCategory && !availableCategories.includes(selectedCategory)) {
      setSelectedCategory(null);
    }
  }, [availableCategories, selectedCategory]);

  const handleChangeRadius = (value: number) => {
    setRadiusKm(value);
    setNoRadius(false);
    runSearch({ radiusKm: value, noRadius: false });
  };

  const handleToggleNoRadius = () => {
    const next = !noRadius;
    setNoRadius(next);
    runSearch({ noRadius: next });
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <View style={styles.logoBadge}>
            <Image source={require("../../../assets/android-icon-foreground.png")} style={styles.logoImage} />
          </View>
          <View>
            <Text style={styles.title}>LocalPulse</Text>
            <View style={styles.locationRow}>
              <Feather name="map-pin" size={11} color={colors.textMuted} />
              <Text style={styles.subtitle}>
                {coords ? `Showing within ${radiusKm} km` : "Finding your area"}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <FlatList
        data={feedRows}
        keyExtractor={(item) => item.type === "listing" ? `listing-${item.listing.id}` : item.type}
        renderItem={({ item }) => {
          if (item.type === "summary") {
            return (
              <View style={styles.resultsHeader}>
                <View style={styles.resultsTitleRow}>
                  <View style={styles.liveDot} />
                  <Text style={styles.resultsTitle}>Available now</Text>
                </View>
                <Text style={styles.resultCount}>
                  {listings.length} {listings.length === 1 ? "listing" : "listings"}
                </Text>
              </View>
            );
          }
          if (item.type === "empty") {
            return (
              <View style={styles.empty}>
                <View style={styles.emptyIcon}>
                  <Feather name="shopping-bag" size={25} color={colors.primary} />
                </View>
                <Text style={styles.emptyText}>
                  No availability found nearby yet. Try widening your radius or check back soon.
                </Text>
              </View>
            );
          }
          return (
            <View style={styles.listItem}>
              <ListingCard listing={item.listing} />
            </View>
          );
        }}
        stickyHeaderIndices={[1]}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={() => runSearch()} />}
        ListHeaderComponent={
          <>
            <View style={styles.searchRow}>
              <View style={styles.searchBox}>
                <TouchableOpacity
                  onPress={() => runSearch()}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel="Search listings"
                >
                  <Feather name="search" size={18} color={colors.textMuted} style={styles.searchIcon} />
                </TouchableOpacity>
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search fish, vegetables, salon..."
                  placeholderTextColor={colors.textMuted}
                  value={query}
                  onChangeText={setQuery}
                  onSubmitEditing={() => runSearch()}
                  returnKeyType="search"
                />
                {query.length > 0 && (
                  <TouchableOpacity onPress={() => { setQuery(""); runSearch({ searchQuery: "" }); }} hitSlop={8}>
                    <Feather name="x" size={18} color={colors.textMuted} />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            <View style={styles.filtersBlock}>
              <RadiusSelector
                radiusKm={radiusKm}
                noRadius={noRadius}
                onChangeRadius={handleChangeRadius}
                onToggleNoRadius={handleToggleNoRadius}
              />
              {availableCategories.length > 0 && (
                <View style={{ marginTop: spacing.sm }}>
                  <CategoryChips
                    categories={availableCategories}
                    selected={selectedCategory}
                    onSelect={setSelectedCategory}
                  />
                </View>
              )}
            </View>

            {locationError && <Text style={styles.notice}>{locationError}</Text>}
            {error && <Text style={styles.errorText}>{error}</Text>}
          </>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    width: "100%",
    maxWidth: 680,
    alignSelf: "center",
    paddingHorizontal: spacing.md,
    paddingTop: Platform.OS === "android" ? spacing.md : 0,
    paddingBottom: spacing.sm,
    backgroundColor: colors.background,
    zIndex: 2,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  logoBadge: {
    width: 38,
    height: 38,
    borderRadius: radius.sm,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  logoImage: {
    width: 34,
    height: 34,
  },
  title: {
    fontSize: 21,
    fontWeight: "800",
    color: colors.primaryDark,
  },
  subtitle: {
    fontSize: 12,
    color: colors.textMuted,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    marginTop: 2,
  },
  searchRow: {
    width: "100%",
    maxWidth: 680,
    alignSelf: "center",
    paddingHorizontal: spacing.md,
    marginTop: spacing.md,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    ...shadow.card,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.text,
  },
  filtersBlock: {
    width: "100%",
    maxWidth: 680,
    alignSelf: "center",
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  notice: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    color: colors.textMuted,
    fontSize: 12,
  },
  errorText: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    color: colors.danger,
    fontSize: 13,
  },
  resultsHeader: {
    width: "100%",
    maxWidth: 680,
    alignSelf: "center",
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.background,
    zIndex: 2,
  },
  resultsTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: radius.pill,
    backgroundColor: colors.success,
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.text,
  },
  resultCount: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textMuted,
  },
  listContent: {
    width: "100%",
    maxWidth: 680,
    alignSelf: "center",
    paddingBottom: 96,
  },
  listItem: {
    paddingHorizontal: spacing.md,
  },
  empty: {
    padding: spacing.lg,
    alignItems: "center",
  },
  emptyIcon: {
    width: 52,
    height: 52,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  emptyText: {
    textAlign: "center",
    color: colors.textMuted,
    fontSize: 14,
  },
});

