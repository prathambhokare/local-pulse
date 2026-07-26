import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { TOKEN_STORAGE_KEY } from "../api/client";
import { SellerProfile } from "../api/types";
import { getMyProfile } from "../api/sellers";

interface AuthContextValue {
  isLoading: boolean;
  isAuthenticated: boolean;
  sellerId: number | null;
  phone: string | null;
  profile: SellerProfile | null;
  /** Called right after OTP verification succeeds. */
  signIn: (token: string, sellerId: number, phone: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<SellerProfile | null>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [sellerId, setSellerId] = useState<number | null>(null);
  const [phone, setPhone] = useState<string | null>(null);
  const [profile, setProfile] = useState<SellerProfile | null>(null);

  useEffect(() => {
    (async () => {
      const token = await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
      if (token) {
        try {
          const me = await getMyProfile();
          setSellerId(me.id);
          setPhone(me.phone);
          setProfile(me);
        } catch {
          await AsyncStorage.removeItem(TOKEN_STORAGE_KEY);
        }
      }
      setIsLoading(false);
    })();
  }, []);

  const signIn = async (token: string, newSellerId: number, newPhone: string) => {
    await AsyncStorage.setItem(TOKEN_STORAGE_KEY, token);
    setSellerId(newSellerId);
    setPhone(newPhone);
    try {
      const me = await getMyProfile();
      setProfile(me);
    } catch {
      setProfile(null);
    }
  };

  const signOut = async () => {
    await AsyncStorage.removeItem(TOKEN_STORAGE_KEY);
    setSellerId(null);
    setPhone(null);
    setProfile(null);
  };

  const refreshProfile = async () => {
    try {
      const me = await getMyProfile();
      setProfile(me);
      return me;
    } catch {
      return null;
    }
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      isLoading,
      isAuthenticated: sellerId !== null,
      sellerId,
      phone,
      profile,
      signIn,
      signOut,
      refreshProfile,
    }),
    [isLoading, sellerId, phone, profile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
