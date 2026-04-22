import { useEffect, useState } from "react";
import { getLocationName, LocationName } from "@/utils/reverseGeocode";

export function useLocationName(
  latitude?: number,
  longitude?: number
) {
  const [locationName, setLocationName] = useState<LocationName | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (latitude == null || longitude == null) return;

    const lat = latitude;
    const lon = longitude;

    let cancelled = false;

    async function load() {
      try {
        setLoading(true);

        const name = await getLocationName(lat, lon);

        if (!cancelled) {
          setLocationName(name);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [latitude, longitude]);

  return {
    locationName,
    loading,
  };
}