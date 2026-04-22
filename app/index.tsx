import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useAuth } from "@/hooks/useAuth";

function getOnboardingKey(userId: string) {
  return `onboarding_completed_${userId}`;
}

export default function Index() {
  const { user, loading } = useAuth();

  useEffect(() => {
    async function checkRoute() {
      if (loading) return;

      if (!user?.uid) {
        router.replace("/(auth)/login");
        return;
      }

      const completed = await AsyncStorage.getItem(
        getOnboardingKey(user.uid)
      );

      if (completed === "true") {
        router.replace("/(tabs)/home");
      } else {
        router.replace("/onboarding");
      }
    }

    checkRoute();
  }, [user?.uid, loading]);

  return (
    <View className="flex-1 items-center justify-center bg-slate-950">
      <ActivityIndicator color="#22d3ee" />
    </View>
  );
}