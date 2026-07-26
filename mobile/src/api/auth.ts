import { apiClient } from "./client";
import { AuthResponse, OtpRequestResponse } from "./types";

export async function requestOtp(phone: string): Promise<OtpRequestResponse> {
  const { data } = await apiClient.post<OtpRequestResponse>("/api/auth/otp/request", { phone });
  return data;
}

export async function verifyOtp(phone: string, otp: string): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>("/api/auth/otp/verify", { phone, otp });
  return data;
}
