import React, { useCallback, useEffect, useState } from "react";
import { FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { SellerListingCard } from "../../components/SellerListingCard";
import { PrimaryButton } from "../../components/PrimaryButton";
import { deleteListing, getMyListings, updateListing } from "../../api/listings";
import { extractErrorMessage } from "../../api/client";
import { Listing } from "../../api/types";
import { useAuth } from "../../context/AuthContext";
import { colors, radius, shadow, spacing } from "../../theme";
import { SellerStackParamList } from "../../navigation/types";

type Nav = NativeStackNavigationProp<SellerStackParamList, "Dashboard">;

const AUTO_REFRESH_MS = 15 * 60 * 1000;

export function DashboardScreen() {
  const navigation = useNavigation<Nav>();
  const { profile, signOut } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMyListings();
      setListings(data);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  useEffect(() => {
    const interval = setInterval(load, AUTO_REFRESH_MS);
    return () => clearInterval(interval);
  }, [load]);

  const handleExtend = async (id: number) => {
    try {
      await updateListing(id, { extendHours: 24 });
      load();
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  };

  const handleClose = async (id: number) => {
    try {
      await updateListing(id, { closed: true });
      load();
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteListing(id);
      setListings((current) => current.filter((listing) => listing.id !== id));
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.businessName}>{profile?.businessName ?? "My shop"}</Text>
          <Text style={styles.category}>{profile?.category}</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={signOut}>
          <Feather name="log-out" size={13} color={colors.textMuted} />
          <Text style={styles.logout}>Log out</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.addRow}>
        <PrimaryButton title="+ Post new availability" onPress={() => navigation.navigate("AddListing")} />
      </View>

      {error && <Text style={styles.error}>{error}</Text>}

      <FlatList
        data={listings}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <SellerListingCard listing={item} onExtend={handleExtend} onClose={handleClose} onDelete={handleDelete} />
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.empty}>
              <View style={styles.emptyIcon}>
                <Feather name="package" size={25} color={colors.primary} />
              </View>
              <Text style={styles.emptyText}>You haven't posted anything yet. Tap above to add your first listing.</Text>
            </View>
          ) : null
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    width: "100%",
    maxWidth: 680,
    alignSelf: "center",
  },
  businessName: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.primaryDark,
  },
  category: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  logout: {
    color: colors.textMuted,
    fontWeight: "700",
    fontSize: 12,
  },
  addRow: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.md,
    width: "100%",
    maxWidth: 680,
    alignSelf: "center",
  },
  error: {
    color: colors.danger,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.sm,
    fontSize: 13,
  },
  listContent: {
    width: "100%",
    maxWidth: 680,
    alignSelf: "center",
    padding: spacing.md,
    paddingBottom: 96,
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
