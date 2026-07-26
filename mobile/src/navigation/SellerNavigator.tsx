import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuth } from "../context/AuthContext";
import { colors } from "../theme";
import { SellerStackParamList } from "./types";
import { PhoneEntryScreen } from "../screens/seller/PhoneEntryScreen";
import { OtpVerifyScreen } from "../screens/seller/OtpVerifyScreen";
import { ProfileSetupScreen } from "../screens/seller/ProfileSetupScreen";
import { DashboardScreen } from "../screens/seller/DashboardScreen";
import { AddListingScreen } from "../screens/seller/AddListingScreen";

const Stack = createNativeStackNavigator<SellerStackParamList>();

/**
 * Screens are swapped based on auth state (unauthenticated -> phone/otp,
 * authenticated-but-incomplete -> profile setup, complete -> dashboard).
 * This is the standard React Navigation "conditional screens" auth pattern.
 */
export function SellerNavigator() {
  const { isAuthenticated, profile, isLoading } = useAuth();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.card },
        headerTintColor: colors.text,
        headerShadowVisible: false,
        headerTitleStyle: { fontWeight: "800" },
      }}
    >
      {isLoading ? null : !isAuthenticated ? (
        <>
          <Stack.Screen name="PhoneEntry" component={PhoneEntryScreen} options={{ title: "Seller Login" }} />
          <Stack.Screen name="OtpVerify" component={OtpVerifyScreen} options={{ title: "Verify OTP" }} />
        </>
      ) : !profile?.profileComplete ? (
        <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} options={{ title: "Complete Profile" }} />
      ) : (
        <>
          <Stack.Screen name="Dashboard" component={DashboardScreen} options={{ title: "My Listings" }} />
          <Stack.Screen name="AddListing" component={AddListingScreen} options={{ title: "Post Availability" }} />
        </>
      )}
    </Stack.Navigator>
  );
}
