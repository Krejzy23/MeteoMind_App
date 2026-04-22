import "../global.css";
import { Redirect, Stack, useSegments } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useAuth } from "@/hooks/useAuth";
import { ActivityIndicator, View } from "react-native";

export default function RootLayout() {
  const { user, loading } = useAuth();
  const segments = useSegments();

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-950">
        <ActivityIndicator />
      </View>
    );
  }

  const inAuthGroup = segments[0] === "(auth)";

  if (!user && !inAuthGroup) {
    return <Redirect href="/(auth)/login" />;
  }

  if (user && inAuthGroup) {
    return <Redirect href="/" />;
  }

  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </SafeAreaProvider>
  );
}