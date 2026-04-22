import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { Platform } from "react-native";

export async function registerForPushNotificationsAsync() {
  const { status: existingStatus } =
    await Notifications.getPermissionsAsync();

  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    return null;
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ??
    Constants.easConfig?.projectId;

  if (!projectId) {
    throw new Error("Missing EAS projectId for push notifications");
  }

  const token = await Notifications.getExpoPushTokenAsync({
    projectId,
  });

  return token.data;
}