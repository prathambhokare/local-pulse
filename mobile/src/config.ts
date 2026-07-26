import Constants from "expo-constants";

/**
 * In production (GitHub Pages / any hosted environment) set the repository
 * variable EXPO_PUBLIC_API_URL to your deployed backend URL, e.g.
 *   https://your-backend.railway.app
 *
 * In development the URL is resolved automatically from the Expo dev-server
 * host so it works on physical devices and simulators without changes.
 */
const API_PORT = 8080;

function resolveHost(): string {
  const hostUri =
    Constants.expoConfig?.hostUri ??
    (Constants as any)?.expoGoConfig?.debuggerHost ??
    "";
  const host = hostUri.split(":")[0];
  return host || "localhost";
}

export const API_BASE_URL: string =
  process.env.EXPO_PUBLIC_API_URL ??
  `http://${resolveHost()}:${API_PORT}`;

export function resolveApiUrl(path: string | null): string | undefined {
  if (!path) return undefined;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
