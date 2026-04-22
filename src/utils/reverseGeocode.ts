import * as Location from "expo-location";

export type LocationName = {
  city?: string | null;
  region?: string | null;
  country?: string | null;
};

export async function getLocationName(
  latitude: number,
  longitude: number
): Promise<LocationName | null> {
  try {
    const result = await Location.reverseGeocodeAsync({
      latitude,
      longitude,
    });

    if (!result.length) return null;

    const place = result[0];

    return {
      city: place.city ?? place.subregion ?? null,
      region: place.region ?? null,
      country: place.country ?? null,
    };
  } catch (error) {
    console.warn("Reverse geocode failed", error);
    return null;
  }
}