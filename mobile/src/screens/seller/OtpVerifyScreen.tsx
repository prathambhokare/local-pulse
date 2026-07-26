import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { PrimaryButton } from "../../components/PrimaryButton";
import { requestOtp, verifyOtp } from "../../api/auth";
import { extractErrorMessage } from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import { colors, radius, spacing } from "../../theme";
import { SellerStackParamList } from "../../navigation/types";

type OtpRoute = RouteProp<SellerStackParamList, "OtpVerify">;

export function OtpVerifyScreen() {
  const route = useRoute<OtpRoute>();
  const { phone, devOtp } = route.params;
  const { signIn } = useAuth();
  const [otp, setOtp] = useState(devOtp ?? "");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hint, setHint] = useState<string | null>(devOtp ? `Dev mode OTP: ${devOtp}` : null);

  const handleVerify = async () => {
    if (otp.trim().length !== 6) {
      setError("Enter the 6-digit OTP");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const auth = await verifyOtp(phone, otp.trim());
      await signIn(auth.token, auth.sellerId, auth.phone);
      // Navigation switches automatically once AuthContext updates.
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError(null);
    try {
      const res = await requestOtp(phone);
      setHint(res.devOtp ? `Dev mode OTP: ${res.devOtp}` : "A new OTP has been sent.");
      if (res.devOtp) setOtp(res.devOtp);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setResending(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={styles.content}>
        <View style={styles.brandMark}>
          <Feather name="shield" size={24} color="#fff" />
        </View>
        <Text style={styles.heading}>Verify your number</Text>
        <Text style={styles.subheading}>Enter the 6-digit code sent to {phone}</Text>

        <TextInput
          style={styles.input}
          placeholder="123456"
          placeholderTextColor={colors.textMuted}
          keyboardType="number-pad"
          autoComplete={Platform.OS === "android" ? "sms-otp" : "one-time-code"}
          textContentType="oneTimeCode"
          maxLength={6}
          value={otp}
          onChangeText={setOtp}
          autoFocus
        />

        {hint && <Text style={styles.hint}>{hint}</Text>}
        {error && <Text style={styles.error}>{error}</Text>}

        <PrimaryButton title="Verify & Continue" onPress={handleVerify} loading={loading} style={{ marginTop: spacing.lg }} />
        <PrimaryButton
          title="Resend OTP"
          onPress={handleResend}
          loading={resending}
          variant="secondary"
          style={{ marginTop: spacing.sm }}
        />
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
  },
  input: {
    backgroundColor: colors.card,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: 15,
    fontSize: 22,
    letterSpacing: 8,
    color: colors.text,
    textAlign: "center",
  },
  hint: {
    marginTop: spacing.sm,
    color: colors.primary,
    fontSize: 13,
  },
  error: {
    color: colors.danger,
    marginTop: spacing.sm,
    fontSize: 13,
  },
});
