import { apiClient } from "./client";
import { Listing, NearbyListing } from "./types";
import { Platform } from "react-native";

export interface NearbySearchParams {
  lat?: number;
  lng?: number;
  radiusKm?: number;
  noRadius?: boolean;
  query?: string;
  category?: string;
}

export async function searchNearby(params: NearbySearchParams): Promise<NearbyListing[]> {
  const { data } = await apiClient.get<NearbyListing[]>("/api/listings/nearby", { params });
  return data;
}

export async function getMyListings(): Promise<Listing[]> {
  const { data } = await apiClient.get<Listing[]>("/api/listings/mine");
  return data;
}

export interface CreateListingInput {
  itemName: string;
  category: string;
  description?: string;
  price?: number;
  priceUnit?: string;
  quantityInfo?: string;
  address: string;
  latitude?: number;
  longitude?: number;
  expiryHours?: number;
}

export async function createListing(input: CreateListingInput): Promise<Listing> {
  const { data } = await apiClient.post<Listing>("/api/listings", input);
  return data;
}

export interface ListingImageInput {
  uri: string;
  fileName?: string | null;
  mimeType?: string | null;
}

export async function uploadListingImage(id: number, image: ListingImageInput): Promise<Listing> {
  const formData = new FormData();
  const fileName = image.fileName || `availability-${id}.jpg`;
  const mimeType = image.mimeType || "image/jpeg";

  if (Platform.OS === "web") {
    const response = await fetch(image.uri);
    const blob = await response.blob();
    formData.append("image", blob, fileName);
  } else {
    formData.append("image", {
      uri: image.uri,
      name: fileName,
      type: mimeType,
    } as unknown as Blob);
  }

  const { data } = await apiClient.put<Listing>(`/api/listings/${id}/image`, formData);
  return data;
}

export interface UpdateListingInput {
  description?: string;
  price?: number;
  priceUnit?: string;
  quantityInfo?: string;
  extendHours?: number;
  closed?: boolean;
}

export async function updateListing(id: number, input: UpdateListingInput): Promise<Listing> {
  const { data } = await apiClient.patch<Listing>(`/api/listings/${id}`, input);
  return data;
}

export async function deleteListing(id: number): Promise<void> {
  await apiClient.delete(`/api/listings/${id}`);
}
