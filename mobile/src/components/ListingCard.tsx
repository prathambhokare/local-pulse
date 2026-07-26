import React from "react";
import { Image, Linking, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { NearbyListing } from "../api/types";
import { resolveApiUrl } from "../config";
import { colors, radius, shadow, spacing } from "../theme";
import { formatPrice } from "../utils/price";
import { timeLeftLabel } from "../utils/time";

interface Props {
  listing: NearbyListing;
}

function toWhatsAppNumber(phone: string): string {
  return phone.replace(/[^\d]/g, "");
}

export function ListingCard({ listing }: Props) {
  const imageUri = resolveApiUrl(listing.imageUrl);
  const handleCall = () => {
    Linking.openURL(`tel:${listing.sellerPhone}`);
  };

  const handleWhatsApp = () => {
    const message = encodeURIComponent(
      `Hi, I saw your listing for "${listing.itemName}" on LocalPulse. Is it still available?`
    );
    Linking.openURL(`https://wa.me/${toWhatsAppNumber(listing.sellerPhone)}?text=${message}`);
  };

  const handleDirections = () => {
    const destination = listing.address?.trim() || `${listing.latitude},${listing.longitude}`;
    Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`);
  };

  return (
    <View style={styles.card}>
      <View style={styles.media}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Feather name="image" size={32} color={colors.primary} />
            <Text style={styles.imageText}>{listing.category}</Text>
          </View>
        )}
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{listing.category}</Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.itemName} numberOfLines={1}>
            {listing.itemName}
          </Text>
        </View>

        <View style={styles.sellerRow}>
          <Text style={styles.seller} numberOfLines={1}>
            {listing.businessName ?? "Seller"}
          </Text>
          <View style={styles.categoryPill}>
             <Text style={styles.distance}>
               {listing.distanceKm != null ? `${listing.distanceKm.toFixed(1)} km away` : 'Nearby'}
             </Text>
          </View>
        </View>

        {listing.description ? (
          <Text style={styles.description} numberOfLines={2}>
            {listing.description}
          </Text>
        ) : null}

        <TouchableOpacity style={styles.locationBlock} onPress={handleDirections} activeOpacity={0.75}>
          <View style={styles.locationIcon}>
            <Feather name="map-pin" size={16} color={colors.primaryDark} />
          </View>
          <View style={styles.locationTextBlock}>
            <Text style={styles.locationLabel}>Pickup address</Text>
            <Text style={styles.address} numberOfLines={2}>
              {listing.address || "Open pickup location"}
            </Text>
          </View>
          <Feather name="chevron-right" size={18} color={colors.textMuted} />
        </TouchableOpacity>

        <View style={styles.phoneRow}>
          <Feather name="phone" size={13} color={colors.textMuted} />
          <Text style={styles.phone}>{listing.sellerPhone}</Text>
        </View>

        <View style={styles.metaRow}>
          <View>
            {listing.price != null && (
              <Text style={styles.price}>{formatPrice(listing.price, listing.priceUnit)}</Text>
            )}
            {listing.quantityInfo ? <Text style={styles.meta}>{listing.quantityInfo}</Text> : null}
          </View>
          <View style={{ flex: 1 }} />
          <Text style={styles.expiry}>{timeLeftLabel(listing.expiresAt)}</Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={[styles.actionBtn, styles.callBtn]} onPress={handleCall}>
            <Feather name="phone" size={16} color="#fff" />
            <Text style={styles.actionText}>Call</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, styles.whatsappBtn]}
            onPress={handleWhatsApp}
            accessibilityLabel="Message seller on WhatsApp"
          >
            <Feather name="message-circle" size={17} color={colors.primaryDark} />
            <Text style={styles.whatsappText}>WhatsApp</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.directionsBtn} onPress={handleDirections}>
          <Feather name="navigation" size={16} color={colors.primaryDark} />
          <Text style={styles.directionsText}>Open directions in Google Maps</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.sm,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
    ...shadow.card,
  },
  media: {
    height: 210,
    backgroundColor: colors.primarySoft,
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imagePlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  imageText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.primaryDark,
  },
  categoryBadge: {
    position: "absolute",
    left: spacing.sm,
    top: spacing.sm,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.pill,
    backgroundColor: "rgba(255,255,255,0.94)",
  },
  categoryText: {
    fontSize: 11,
    fontWeight: "800",
    color: colors.primaryDark,
  },
  content: {
    padding: spacing.md,
  },
  headerRow: {
    marginBottom: 2,
  },
  itemName: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.text,
  },
  sellerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.xs,
  },
  seller: {
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: "500",
    flexShrink: 1,
  },
  categoryPill: {
    flexDirection: "row",
    alignItems: "center",
  },
  distance: {
    fontSize: 12,
    color: colors.primaryDark,
    fontWeight: "600",
  },
  description: {
    marginTop: spacing.xs,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textMuted,
  },
  locationBlock: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: spacing.md,
    padding: spacing.sm,
    borderRadius: radius.sm,
    backgroundColor: colors.primarySoft,
  },
  locationIcon: {
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.card,
  },
  locationTextBlock: {
    flex: 1,
  },
  locationLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: colors.primaryDark,
    textTransform: "uppercase",
  },
  address: {
    marginTop: 2,
    fontSize: 13,
    lineHeight: 18,
    color: colors.text,
  },
  phoneRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: spacing.sm,
  },
  phone: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.textMuted,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: spacing.md,
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  price: {
    fontSize: 17,
    fontWeight: "800",
    color: colors.text,
  },
  meta: {
    fontSize: 13,
    fontWeight: "500",
    color: colors.textMuted,
    marginTop: 2,
  },
  expiry: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.accent,
    paddingBottom: 2,
  },
  actions: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  actionBtn: {
    flex: 1,
    minHeight: 46,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: spacing.sm,
  },
  callBtn: {
    backgroundColor: colors.primary,
  },
  actionText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
  whatsappBtn: {
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
  },
  whatsappText: {
    color: colors.primaryDark,
    fontWeight: "700",
    fontSize: 14,
  },
  directionsBtn: {
    minHeight: 44,
    marginTop: spacing.sm,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  directionsText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.primaryDark,
  },
});
