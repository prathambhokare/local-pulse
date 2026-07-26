import React, { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { PrimaryButton } from "../../components/PrimaryButton";
import { CategoryChips } from "../../components/CategoryChips";
import { getCategories } from "../../api/categories";
import { updateMyProfile } from "../../api/sellers";
import { extractErrorMessage } from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import { useLocation } from "../../hooks/useLocation";
import { colors, radius, spacing } from "../../theme";

export function ProfileSetupScreen() {
  const { refreshProfile, phone } = useAuth();
  const { coords, requestLocation, isLoading: locating, errorMessage: locationError } = useLocation();
  const [categories, setCategories] = useState<string[]>([]);
  const [businessName, setBusinessName] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [customCategory, setCustomCategory] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getCategories().then(setCategories).catch(() => setCategories([]));
    requestLocation();
  }, []);

  const handleSubmit = async () => {
    if (!businessName.trim()) {
      setError("Business / seller name is required");
      return;
    }
    if (!category) {
      setError("Please select a category");
      return;
    }
    if (category === "Other" && !customCategory.trim()) {
      setError("Please enter the category name");
      return;
    }
    const submittedCategory = category === "Other" ? customCategory.trim() : category;
    if (!coords) {
      setError("We need your location to show buyers how far you are. Please allow location access.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await updateMyProfile({
        businessName: businessName.trim(),
        category: submittedCategory,
        address: address.trim() || undefined,
        latitude: coords.latitude,
        longitude: coords.longitude,
      });
      await refreshProfile();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.brandMark}>
          <Feather name="user" size={22} color="#fff" />
        </View>
        <Text style={styles.heading}>Set up your shop</Text>
        <Text style={styles.subheading}>Signed in as {phone}</Text>

        <Text style={styles.label}>Business / seller name</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Ravi Fish Mart"
          placeholderTextColor={colors.textMuted}
          value={businessName}
          onChangeText={setBusinessName}
        />

        <Text style={styles.label}>Category</Text>
        <CategoryChips
          categories={categories}
          selected={category}
          onSelect={(value) => {
            setCategory(value);
            if (value !== "Other") setCustomCategory("");
          }}
          showAllOption={false}
        />
        {category === "Other" && (
          <View style={styles.customCategoryBlock}>
            <Text style={styles.customCategoryLabel}>Category name</Text>
            <View style={styles.customCategoryInput}>
              <Feather name="tag" size={17} color={colors.textMuted} />
              <TextInput
                style={styles.customCategoryTextInput}
                placeholder="e.g. Home services"
                placeholderTextColor={colors.textMuted}
                value={customCategory}
                onChangeText={setCustomCategory}
                autoCapitalize="words"
                maxLength={60}
                autoFocus
              />
            </View>
          </View>
        )}

        <Text style={styles.label}>Address (optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="Shop / area / landmark"
          placeholderTextColor={colors.textMuted}
          value={address}
          onChangeText={setAddress}
        />

        <Text style={styles.label}>Location</Text>
        <PrimaryButton
          title={coords ? "Location captured" : "Use my current location"}
          onPress={requestLocation}
          loading={locating}
          variant={coords ? "secondary" : "primary"}
        />
        {locationError && <Text style={styles.error}>{locationError}</Text>}

        {error && <Text style={styles.error}>{error}</Text>}

        <PrimaryButton title="Save & continue" onPress={handleSubmit} loading={loading} style={{ marginTop: spacing.lg }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    width: "100%",
    maxWidth: 620,
    alignSelf: "center",
    padding: spacing.md,
    paddingTop: spacing.xl,
    paddingBottom: 48,
  },
  brandMark: {
    width: 48,
    height: 48,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
    marginBottom: spacing.md,
  },
  heading: {
    fontSize: 26,
    fontWeight: "800",
    color: colors.text,
  },
  subheading: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.text,
    marginBottom: spacing.xs,
    marginTop: spacing.lg,
  },
  input: {
    backgroundColor: colors.card,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    fontSize: 15,
    color: colors.text,
  },
  customCategoryBlock: {
    marginTop: spacing.md,
  },
  customCategoryLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  customCategoryInput: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.card,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  customCategoryTextInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.text,
  },
  error: {
    color: colors.danger,
    marginTop: spacing.sm,
    fontSize: 13,
  },
});
