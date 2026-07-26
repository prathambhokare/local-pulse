import React, { useEffect, useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { PrimaryButton } from "../../components/PrimaryButton";
import { CategoryChips } from "../../components/CategoryChips";
import { getCategories } from "../../api/categories";
import { createListing, deleteListing, uploadListingImage } from "../../api/listings";
import { extractErrorMessage } from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import { colors, radius, shadow, spacing } from "../../theme";
import { SellerStackParamList } from "../../navigation/types";

type Nav = NativeStackNavigationProp<SellerStackParamList, "AddListing">;

const EXPIRY_OPTIONS = [
  { label: "6 hours", hours: 6 },
  { label: "12 hours", hours: 12 },
  { label: "24 hours", hours: 24 },
];

const PRICE_UNITS = ["kg", "item", "dozen", "litre", "service"];

export function AddListingScreen() {
  const navigation = useNavigation<Nav>();
  const { profile } = useAuth();
  const [categories, setCategories] = useState<string[]>([]);
  const [itemName, setItemName] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [customCategory, setCustomCategory] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [priceUnit, setPriceUnit] = useState("");
  const [quantityInfo, setQuantityInfo] = useState("");
  const [address, setAddress] = useState(profile?.address ?? "");
  const [image, setImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [expiryHours, setExpiryHours] = useState(24);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    const profileAddress = profile?.address;
    if (profileAddress) {
      setAddress((currentAddress) => currentAddress || profileAddress);
    }
  }, [profile?.address]);

  const chooseImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setError("Photo access is needed to choose an availability picture.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.75,
    });
    if (!result.canceled) {
      setImage(result.assets[0]);
      setError(null);
    }
  };

  const handleSubmit = async () => {
    if (!itemName.trim()) {
      setError("What are you selling? Item name is required.");
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
    const parsedPrice = price.trim() ? Number(price.trim()) : undefined;
    if (price.trim() && Number.isNaN(parsedPrice)) {
      setError("Price must be a number");
      return;
    }
    if (parsedPrice != null && !priceUnit.trim()) {
      setError("Choose what the price is for, such as kg, item or service");
      return;
    }
    if (/^\d+(?:[.,]\d+)?$/.test(priceUnit.trim())) {
      setError("Price unit must be a word such as kg, item or service");
      return;
    }
    if (!address.trim()) {
      setError("Please enter where this availability can be collected");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const created = await createListing({
        itemName: itemName.trim(),
        category: submittedCategory,
        description: description.trim() || undefined,
        price: parsedPrice,
        priceUnit: priceUnit.trim() || undefined,
        quantityInfo: quantityInfo.trim() || undefined,
        address: address.trim(),
        expiryHours,
      });
      if (image) {
        try {
          await uploadListingImage(created.id, image);
        } catch (uploadError) {
          await deleteListing(created.id).catch(() => undefined);
          throw uploadError;
        }
      }
      navigation.goBack();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.intro}>
          <Text style={styles.title}>Post fresh availability</Text>
          <Text style={styles.subtitle}>A clear photo helps nearby buyers decide faster.</Text>
        </View>

        <Text style={styles.label}>Availability photo</Text>
        {image ? (
          <View style={styles.photoFrame}>
            <Image source={{ uri: image.uri }} style={styles.photo} resizeMode="cover" />
            <View style={styles.photoActions}>
              <TouchableOpacity style={styles.photoAction} onPress={chooseImage}>
                <Feather name="refresh-cw" size={15} color={colors.text} />
                <Text style={styles.photoActionText}>Replace</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.photoAction} onPress={() => setImage(null)}>
                <Feather name="trash-2" size={15} color={colors.danger} />
                <Text style={[styles.photoActionText, { color: colors.danger }]}>Remove</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity style={styles.photoPicker} onPress={chooseImage} activeOpacity={0.8}>
            <View style={styles.photoIcon}>
              <Feather name="image" size={24} color={colors.primary} />
            </View>
            <Text style={styles.photoPickerTitle}>Choose a product photo</Text>
            <Text style={styles.photoPickerHint}>JPG, PNG or WebP · up to 5 MB</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.label}>What's available?</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Fresh Rohu Fish"
          placeholderTextColor={colors.textMuted}
          value={itemName}
          onChangeText={setItemName}
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

        <Text style={styles.label}>Description (optional)</Text>
        <TextInput
          style={[styles.input, styles.multiline]}
          placeholder="Caught this morning, 40kg available..."
          placeholderTextColor={colors.textMuted}
          value={description}
          onChangeText={setDescription}
          multiline
        />

        <View style={styles.row}>
          <View style={styles.rowItem}>
            <Text style={styles.label}>Price in ₹ (optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="220"
              placeholderTextColor={colors.textMuted}
              value={price}
              onChangeText={setPrice}
              keyboardType="numeric"
            />
          </View>
          <View style={styles.rowItem}>
            <Text style={styles.label}>Price per</Text>
            <TextInput
              style={styles.input}
              placeholder="kg or item"
              placeholderTextColor={colors.textMuted}
              value={priceUnit}
              onChangeText={setPriceUnit}
            />
          </View>
        </View>
        <View style={styles.unitRow}>
          {PRICE_UNITS.map((unit) => {
            const isActive = priceUnit === unit;
            return (
              <TouchableOpacity
                key={unit}
                style={[styles.unitChip, isActive && styles.unitChipActive]}
                onPress={() => setPriceUnit(unit)}
              >
                <Text style={[styles.unitText, isActive && styles.unitTextActive]}>{unit}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.label}>Quantity (optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. 40kg available"
          placeholderTextColor={colors.textMuted}
          value={quantityInfo}
          onChangeText={setQuantityInfo}
        />

        <Text style={styles.label}>Pickup address</Text>
        <View style={styles.addressInputShell}>
          <Feather name="map-pin" size={18} color={colors.primary} style={styles.addressIcon} />
          <TextInput
            style={styles.addressInput}
            placeholder="Shop, street, area and landmark"
            placeholderTextColor={colors.textMuted}
            value={address}
            onChangeText={setAddress}
            multiline
            maxLength={500}
            textAlignVertical="top"
          />
        </View>
        <Text style={styles.helper}>Buyers will see this address and can open it in Google Maps.</Text>

        <Text style={styles.label}>Keep this listing live for</Text>
        <View style={styles.expiryRow}>
          {EXPIRY_OPTIONS.map((opt) => {
            const isActive = expiryHours === opt.hours;
            return (
              <TouchableOpacity
                key={opt.hours}
                style={[styles.expiryChip, isActive && styles.expiryChipActive]}
                onPress={() => setExpiryHours(opt.hours)}
              >
                <Text style={[styles.expiryText, isActive && styles.expiryTextActive]}>{opt.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <Text style={styles.helper}>It will auto-expire after this time so buyers only see fresh availability.</Text>

        {error && <Text style={styles.error}>{error}</Text>}

        <PrimaryButton title="Post availability" onPress={handleSubmit} loading={loading} style={styles.submitButton} />
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
    maxWidth: 680,
    alignSelf: "center",
    paddingHorizontal: spacing.md,
    paddingBottom: 48,
  },
  intro: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: colors.text,
  },
  subtitle: {
    marginTop: spacing.xs,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textMuted,
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.text,
    marginBottom: spacing.sm,
    marginTop: spacing.lg,
  },
  photoPicker: {
    aspectRatio: 4 / 3,
    maxHeight: 300,
    backgroundColor: colors.primarySoft,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  photoIcon: {
    width: 52,
    height: 52,
    borderRadius: radius.pill,
    backgroundColor: colors.card,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
    ...shadow.card,
  },
  photoPickerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.primaryDark,
  },
  photoPickerHint: {
    marginTop: spacing.xs,
    fontSize: 12,
    color: colors.textMuted,
  },
  photoFrame: {
    overflow: "hidden",
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.card,
  },
  photo: {
    width: "100%",
    aspectRatio: 4 / 3,
    maxHeight: 300,
  },
  photoActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: spacing.sm,
    padding: spacing.sm,
  },
  photoAction: {
    minHeight: 36,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: spacing.md,
  },
  photoActionText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.text,
  },
  input: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
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
  multiline: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  addressInputShell: {
    minHeight: 82,
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: colors.card,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
  },
  addressIcon: {
    marginTop: 15,
    marginRight: spacing.sm,
  },
  addressInput: {
    flex: 1,
    minHeight: 80,
    paddingVertical: 13,
    fontSize: 15,
    lineHeight: 21,
    color: colors.text,
  },
  row: {
    flexDirection: "row",
    gap: spacing.md,
  },
  rowItem: {
    flex: 1,
  },
  unitRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  unitChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 7,
    borderRadius: radius.pill,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  unitChipActive: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  unitText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.textMuted,
  },
  unitTextActive: {
    color: colors.primaryDark,
  },
  expiryRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  expiryChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  expiryChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  expiryText: {
    fontSize: 13,
    fontWeight: "500",
    color: colors.text,
  },
  expiryTextActive: {
    color: "#fff",
  },
  helper: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  error: {
    color: colors.danger,
    marginTop: spacing.md,
    fontSize: 13,
  },
  submitButton: {
    marginTop: spacing.xl,
  },
});
