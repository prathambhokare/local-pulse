import React, { useState } from "react";
import { Image, Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Listing } from "../api/types";
import { resolveApiUrl } from "../config";
import { colors, radius, shadow, spacing } from "../theme";
import { formatPrice } from "../utils/price";
import { timeLeftLabel } from "../utils/time";

interface Props {
  listing: Listing;
  onExtend: (id: number) => Promise<void>;
  onClose: (id: number) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

const statusColors: Record<Listing["status"], string> = {
  ACTIVE: colors.success,
  CLOSED: colors.textMuted,
  EXPIRED: colors.accent,
};

export function SellerListingCard({ listing, onExtend, onClose, onDelete }: Props) {
  const [busy, setBusy] = useState(false);
  const [deletePromptVisible, setDeletePromptVisible] = useState(false);
  const imageUri = resolveApiUrl(listing.imageUrl);

  const run = async (action: () => Promise<void>) => {
    setBusy(true);
    try {
      await action();
    } finally {
      setBusy(false);
    }
  };

  const confirmDelete = () => {
    setDeletePromptVisible(true);
  };

  const handleDelete = () => {
    setDeletePromptVisible(false);
    run(() => onDelete(listing.id));
  };

  return (
    <View style={styles.card}>
      <Modal
        visible={deletePromptVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDeletePromptVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalIcon}>
              <Feather name="trash-2" size={20} color={colors.danger} />
            </View>
            <Text style={styles.modalTitle}>Delete listing?</Text>
            <Text style={styles.modalMessage}>
              “{listing.itemName}” will be permanently removed. This can't be undone.
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setDeletePromptVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.confirmButton]} onPress={handleDelete}>
                <Feather name="trash-2" size={15} color="#fff" />
                <Text style={styles.confirmButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <View style={styles.media}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Feather name="image" size={28} color={colors.primary} />
            <Text style={styles.imageText}>{listing.category}</Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.itemName} numberOfLines={1}>
            {listing.itemName}
          </Text>
          <View style={[styles.statusPill, { backgroundColor: statusColors[listing.status] }]}>
            <Text style={styles.statusText}>{listing.status}</Text>
          </View>
        </View>

        <Text style={styles.category}>{listing.category}</Text>
        {listing.description ? <Text style={styles.description} numberOfLines={2}>{listing.description}</Text> : null}
        {listing.address ? (
          <View style={styles.addressRow}>
            <Feather name="map-pin" size={14} color={colors.primaryDark} />
            <Text style={styles.address} numberOfLines={2}>{listing.address}</Text>
          </View>
        ) : null}

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
          <TouchableOpacity
            style={[styles.actionBtn, styles.extendBtn]}
            disabled={busy}
            onPress={() => run(() => onExtend(listing.id))}
          >
            <Feather name="clock" size={14} color={colors.primaryDark} />
            <Text style={styles.secondaryActionText}>+24h</Text>
          </TouchableOpacity>
          {listing.status !== "CLOSED" && (
            <TouchableOpacity
              style={[styles.actionBtn, styles.closeBtn]}
              disabled={busy}
              onPress={() => run(() => onClose(listing.id))}
            >
              <Feather name="check" size={14} color="#fff" />
              <Text style={styles.actionText}>Sold</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.actionBtn, styles.deleteBtn]}
            disabled={busy}
            onPress={confirmDelete}
            accessibilityRole="button"
            accessibilityLabel="Delete listing"
          >
            <Feather name="trash-2" size={14} color={colors.danger} />
          </TouchableOpacity>
        </View>
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
    height: 140,
    backgroundColor: colors.primarySoft,
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
    fontSize: 12,
    fontWeight: "700",
    color: colors.primaryDark,
  },
  content: {
    padding: spacing.md,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 2,
  },
  itemName: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.text,
    flexShrink: 1,
  },
  statusPill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  statusText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  category: {
    fontSize: 13,
    color: colors.primaryDark,
    fontWeight: "600",
    marginBottom: spacing.xs,
  },
  description: {
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 20,
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    marginTop: spacing.sm,
    padding: spacing.sm,
    borderRadius: radius.sm,
    backgroundColor: colors.primarySoft,
  },
  address: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
    color: colors.text,
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
    marginTop: spacing.lg,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 5,
  },
  extendBtn: {
    backgroundColor: colors.primarySoft,
  },
  closeBtn: {
    backgroundColor: colors.textMuted,
  },
  deleteBtn: {
    backgroundColor: colors.dangerSoft,
  },
  actionText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 13,
  },
  secondaryActionText: {
    color: colors.primaryDark,
    fontWeight: "700",
    fontSize: 13,
  },
  modalOverlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
    backgroundColor: "rgba(15, 27, 22, 0.48)",
  },
  modalContent: {
    width: "100%",
    maxWidth: 360,
    padding: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: colors.card,
    alignItems: "center",
    ...shadow.raised,
  },
  modalIcon: {
    width: 46,
    height: 46,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.dangerSoft,
    marginBottom: spacing.md,
  },
  modalTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: colors.text,
  },
  modalMessage: {
    marginTop: spacing.sm,
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
  modalActions: {
    width: "100%",
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  modalButton: {
    flex: 1,
    minHeight: 46,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: spacing.sm,
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  cancelButtonText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "700",
  },
  confirmButton: {
    backgroundColor: colors.danger,
  },
  confirmButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
});
