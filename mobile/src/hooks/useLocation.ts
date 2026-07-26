import { useCallback, useState } from "react";
import * as Location from "expo-location";

export interface Coordinates {
  latitude: number;
  longitude: number;
}

interface UseLocationResult {
  coords: Coordinates | null;
  isLoading: boolean;
  errorMessage: string | null;
  requestLocation: () => Promise<Coordinates | null>;
}

/** Wraps expo-location permission request + current position fetch. */
export function useLocation(): UseLocationResult {
  const [coords, setCoords] = useState<Coordinates | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const requestLocation = useCallback(async (): Promise<Coordinates | null> => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMessage("Location permission denied. You can still search without a location filter.");
        return null;
      }
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const next = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };
      setCoords(next);
      return next;
    } catch (err) {
      setErrorMessage("Could not get your location. Please try again.");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { coords, isLoading, errorMessage, requestLocation };
}
