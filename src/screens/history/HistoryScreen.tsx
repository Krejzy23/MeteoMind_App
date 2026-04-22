import { useCallback } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useFocusEffect } from "expo-router";
import SymptomEntryCard from "@/components/symptoms/SymptomEntryCard";
import { useSymptomEntries } from "@/hooks/useSymptomEntries";
import { useAuth } from "@/hooks/useAuth";
import BackButton from "@/components/ui/BackButton";
import ScreenBackground from "@/components/ui/ScreenBackground";
import GlassCard from "@/components/ui/GlassCard";

export default function HistoryScreen() {
  const { user, loading: authLoading } = useAuth();

  const { entries, loading, error, refetch } = useSymptomEntries(
    user?.uid ?? ""
  );

  useFocusEffect(
    useCallback(() => {
      if (user) {
        refetch();
      }
    }, [user, refetch])
  );

  if (authLoading) {
    return (
      <ScreenBackground>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator />
        </View>
      </ScreenBackground>
    );
  }

  if (!user) {
    return (
      <ScreenBackground>
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-xl font-semibold text-white">Not signed in</Text>
          <Text className="mt-2 text-center text-slate-400">
            Please sign in to view your symptom history.
          </Text>
        </View>
      </ScreenBackground>
    );
  }

  return (
    <ScreenBackground>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refetch} />
        }
        showsVerticalScrollIndicator={false}
      >
        <View className="pt-10">
          <View className="mb-8">
            <BackButton fallbackHref="/(tabs)/home" />
          </View>

          <Text className="text-3xl font-bold uppercase tracking-tight text-white">
            History
          </Text>

          <Text className="mt-2 uppercase text-sm leading-6 text-slate-400">
            Your saved symptoms and weather triggers
          </Text>

          <Text className="mt-3 text-sm text-slate-500">
            {entries.length} saved {entries.length === 1 ? "entry" : "entries"}
          </Text>
        </View>

        {error ? (
          <GlassCard className="mt-4 p-4" intensity={20}>
            <Text className="font-semibold text-red-200">Something went wrong</Text>
            <Text className="mt-2 text-red-100">{error}</Text>
          </GlassCard>
        ) : null}

        {loading && entries.length === 0 ? (
          <GlassCard className="mt-4 p-5" intensity={20}>
            <View className="items-center py-6">
              <ActivityIndicator />
              <Text className="mt-3 text-slate-300">
                Loading symptom history...
              </Text>
            </View>
          </GlassCard>
        ) : null}

        {!loading && entries.length === 0 ? (
          <GlassCard className="mt-4 p-5" intensity={20}>
            <Text className="text-lg font-bold text-white">No entries yet</Text>
            <Text className="mt-2 text-slate-400 leading-6">
              Add your first symptom entry to start tracking pressure patterns.
            </Text>
          </GlassCard>
        ) : null}

        <View className="mt-4 flex-row flex-wrap justify-between">
          {entries.map((entry) => (
            <View key={entry.id} className="mb-4 w-[48%]">
              <SymptomEntryCard entry={entry} />
            </View>
          ))}
        </View>
      </ScrollView>
    </ScreenBackground>
  );
}