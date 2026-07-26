import { apiClient } from "./client";

export async function getCategories(): Promise<string[]> {
  const { data } = await apiClient.get<string[]>("/api/meta/categories");
  return data;
}
