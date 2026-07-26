import Constants from "expo-constants";

/**
 * Resolves the backend base URL automatically from the Expo dev server host,
 * so it works out of the box on physical devices, simulators and emulators
 * without hardcoding your machine's LAN IP. Falls back to localhost (works
 * for iOS simulator / web) if it can't be determined.
 *
 * If you run the backend on a different port, change API_PORT below.
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

export const API_BASE_URL = `http://${resolveHost()}:${API_PORT}`;

export function resolveApiUrl(path: string | null): string | undefined {
  if (!path) return undefined;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
