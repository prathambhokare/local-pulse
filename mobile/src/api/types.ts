export type ListingStatus = "ACTIVE" | "CLOSED" | "EXPIRED";

export interface SellerProfile {
  id: number;
  phone: string;
  businessName: string | null;
  category: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  profileComplete: boolean;
}

export interface AuthResponse {
  token: string;
  sellerId: number;
  phone: string;
  profileComplete: boolean;
}

export interface OtpRequestResponse {
  message: string;
  expiryMinutes: number;
  devOtp: string | null;
}

export interface Listing {
  id: number;
  itemName: string;
  category: string;
  description: string | null;
  price: number | null;
  priceUnit: string | null;
  quantityInfo: string | null;
  address: string | null;
  imageUrl: string | null;
  latitude: number;
  longitude: number;
  status: ListingStatus;
  postedAt: string;
  expiresAt: string;
}

export interface NearbyListing {
  id: number;
  itemName: string;
  category: string;
  description: string | null;
  price: number | null;
  priceUnit: string | null;
  quantityInfo: string | null;
  address: string | null;
  imageUrl: string | null;
  latitude: number;
  longitude: number;
  postedAt: string;
  expiresAt: string;
  distanceKm: number | null;
  sellerId: number;
  businessName: string | null;
  sellerPhone: string;
}

export interface ApiErrorBody {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
  details: string[];
}
