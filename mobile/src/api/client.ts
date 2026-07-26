import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "../config";

export const TOKEN_STORAGE_KEY = "localpulse:token";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

apiClient.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/** Extracts a human-readable message from an API error response. */
export function extractErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string; details?: string[] } | undefined;
    if (data?.details?.length) {
      return data.details.join("\n");
    }
    if (data?.message) {
      return data.message;
    }
    if (error.message) {
      return error.message;
    }
  }
  return "Something went wrong. Please try again.";
}
