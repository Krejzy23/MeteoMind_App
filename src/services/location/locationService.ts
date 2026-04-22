import * as Location from "expo-location";
import { Coordinates } from "@/types/weather";

export async function getUserLocation(): Promise<Coordinates> {
  const permission = await Location.requestForegroundPermissionsAsync();

  if (!permission.granted) {
    throw new Error("Location permission denied");
  }

  const location = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });

  return {
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
  };
}