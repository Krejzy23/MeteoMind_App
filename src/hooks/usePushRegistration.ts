import { useEffect, useRef } from "react";
import { Platform } from "react-native";
import { registerForPushNotificationsAsync } from "@/services/notifications/push";
import { savePushToken } from "@/services/firebase/firestore";

export function usePushRegistration(userId?: string) {
  const hasRegistered = useRef(false);

  useEffect(() => {
    if (!userId || hasRegistered.current) return;

    let cancelled = false;
    hasRegistered.current = true;

    async function setup() {
      try {
        const token = await registerForPushNotificationsAsync();

        if (!token) {
          console.warn("No push token received");
          return;
        }

        if (cancelled) return;

        await savePushToken(userId!, token, Platform.OS);
      } catch (error) {
        console.warn("Push registration failed", error);
      }
    }

    setup();

    return () => {
      cancelled = true;
    };
  }, [userId]);
}