import { useCallback, useEffect, useState } from "react";
import { getUserLocation } from "@/services/location/locationService";
import { getWeatherSnapshot } from "@/services/weather/openMeteo";
import { Coordinates, WeatherSnapshot } from "@/types/weather";

interface UseWeatherResult {
  data: WeatherSnapshot | null;
  location: Coordinates | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useWeather(): UseWeatherResult {
  const [data, setData] = useState<WeatherSnapshot | null>(null);
  const [location, setLocation] = useState<Coordinates | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWeather = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const coords = await getUserLocation();
      setLocation(coords);

      const snapshot = await getWeatherSnapshot(
        coords.latitude,
        coords.longitude
      );

      setData(snapshot);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unknown weather error";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWeather();
  }, [fetchWeather]);

  return {
    data,
    location,
    loading,
    error,
    refetch: fetchWeather,
  };
}