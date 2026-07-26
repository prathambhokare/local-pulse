import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { PrimaryButton } from "../../components/PrimaryButton";
import { requestOtp } from "../../api/auth";
import { extractErrorMessage } from "../../api/client";
import { colors, radius, spacing } from "../../theme";
import { SellerStackParamList } from "../../navigation/types";

type Nav = NativeStackNavigationProp<SellerStackParamList, "PhoneEntry">;

export function PhoneEntryScreen() {
  const navigation = useNavigation<Nav>();
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    const trimmed = phone.trim();
    if (trimmed.length < 10) {
      setError("Enter a valid mobile number");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await requestOtp(trimmed);
      navigation.navigate("OtpVerify", { phone: trimmed, devOtp: res.devOtp ?? undefined });
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.content}>
        <View style={styles.brandMark}>
          <Feather name="shopping-bag" size={24} color="#fff" />
        </View>
        <Text style={styles.heading}>Start selling locally</Text>
        <Text style={styles.subheading}>
          Share today's availability and connect directly with nearby buyers.
        </Text>

        <Text style={styles.label}>Mobile number</Text>
        <View style={styles.inputShell}>
          <Feather name="smartphone" size={18} color={colors.textMuted} />
          <TextInput
            style={styles.input}
            placeholder="+91 98765 43210"
            placeholderTextColor={colors.textMuted}
            keyboardType="phone-pad"
            autoComplete="tel"
            textContentType="telephoneNumber"
            value={phone}
            onChangeText={setPhone}
            autoFocus
          />
        </View>

        {error && <Text style={styles.error}>{error}</Text>}

        <PrimaryButton title="Continue with OTP" onPress={handleSubmit} loading={loading} style={styles.submit} />
        <View style={styles.securityNote}>
          <Feather name="shield" size={13} color={colors.textMuted} />
          <Text style={styles.securityText}>Your number is used only to secure your seller account.</Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
  },
  content: {
    width: "100%",
    maxWidth: 520,
    alignSelf: "center",
    paddingTop: 56,
  },
  brandMark: {
    width: 52,
    height: 52,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
    marginBottom: spacing.lg,
  },
  heading: {
    fontSize: 28,
    fontWeight: "800",
    color: colors.text,
  },
  subheading: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
    lineHeight: 21,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.text,
    marginBottom: spacing.sm,
  },
  inputShell: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.card,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.text,
  },
  error: {
    color: colors.danger,
    marginTop: spacing.sm,
    fontSize: 13,
  },
  submit: {
    marginTop: spacing.lg,
  },
  securityNote: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: spacing.md,
  },
  securityText: {
    fontSize: 11,
    color: colors.textMuted,
  },
});
