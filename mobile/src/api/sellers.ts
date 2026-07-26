import { apiClient } from "./client";
import { SellerProfile } from "./types";

export async function getMyProfile(): Promise<SellerProfile> {
  const { data } = await apiClient.get<SellerProfile>("/api/sellers/me");
  return data;
}

export interface SellerProfileInput {
  businessName: string;
  category: string;
  address?: string;
  latitude: number;
  longitude: number;
}

export async function updateMyProfile(input: SellerProfileInput): Promise<SellerProfile> {
  const { data } = await apiClient.put<SellerProfile>("/api/sellers/me", input);
  return data;
}
