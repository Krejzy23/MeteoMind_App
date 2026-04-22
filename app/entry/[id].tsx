import { useLocalSearchParams, router } from "expo-router";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { getWeatherEmoji, getWeatherLabel } from "@/utils/weather";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { useSymptomEntry } from "@/hooks/useSymptomEntry";
import { formatSymptomsWithEmoji } from "@/utils/symptoms";
import { deleteSymptomEntry } from "@/services/firebase/firestore";
import { useAuth } from "@/hooks/useAuth";
import { useLocationName } from "@/hooks/useLocationName";
import BackButton from "@/components/ui/BackButton";
import ScreenBackground from "@/components/ui/ScreenBackground";
import InfoCard from "@/components/ui/InfoCard";

function formatDate(dateString?: string) {
  if (!dateString) return "N/A";

  return new Intl.DateTimeFormat("cs-CZ", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(dateString));
}

function formatValue(value: number | null | undefined, suffix = "") {
  if (value == null) return "N/A";
  return `${value.toFixed(1)}${suffix}`;
}

function StatRow({
  label,
  value,
  valueColor,
}: {
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <View className="flex-row items-center justify-between">
      <Text className="text-slate-300">{label}</Text>
      <Text
        className="ml-4 text-right font-semibold"
        style={{ color: valueColor ?? "#ffffff" }}
      >
        {value}
      </Text>
    </View>
  );
}

export default function EntryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();

  const {
    entry,
    error,
    refetch,
    loading: entryLoading,
  } = useSymptomEntry(user?.uid ?? "", id);

  const { locationName, loading: locationLoading } = useLocationName(
    entry?.latitude,
    entry?.longitude
  );

  async function handleDelete() {
    if (!user || !entry) return;

    Alert.alert("Delete entry", "Are you sure you want to delete this entry?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteSymptomEntry(user.uid, entry.id);
            Alert.alert("Deleted", "Entry was deleted successfully.");
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace("/(tabs)/history");
            }
          } catch (deleteError) {
            const message =
              deleteError instanceof Error
                ? deleteError.message
                : "Failed to delete entry.";

            Alert.alert("Delete failed", message);
          }
        },
      },
    ]);
  }

  if (authLoading) {
    return (
      <ScreenBackground>
        <View className="flex-1 mt-10">
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator />
          </View>
        </View>
      </ScreenBackground>
    );
  }

  if (!user) {
    return (
      <ScreenBackground>
        <View className="flex-1 mt-10">
          <View className="flex-1 items-center justify-center px-6">
            <Text className="text-xl font-semibold text-white">
              Not signed in
            </Text>
            <Text className="mt-2 text-center text-slate-400">
              Please sign in to view entry details.
            </Text>
          </View>
        </View>
      </ScreenBackground>
    );
  }

  return (
    <ScreenBackground>
      <View className="flex-1 mt-10">
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
          refreshControl={
            <RefreshControl refreshing={entryLoading} onRefresh={refetch} />
          }
          showsVerticalScrollIndicator={false}
        >
          <View className="pt-4">
            <View className="mb-8">
              <BackButton />
            </View>

            <Text className="text-3xl font-bold tracking-tight text-white">
              Entry detail
            </Text>

            <Text className="mt-2 max-w-[320px] text-base leading-6 text-slate-400">
              Full symptom and weather snapshot
            </Text>
          </View>

          {error ? (
            <BlurView
              intensity={20}
              tint="dark"
              style={{
                overflow: "hidden",
                borderRadius: 16,
                marginTop: 16,
              }}
            >
              <View className="rounded-2xl border border-red-900/70 bg-red-950/50 p-4">
                <Text className="text-red-200">{error}</Text>
              </View>
            </BlurView>
          ) : null}

          {entry ? (
            <>
              <View className="mt-4">
                <InfoCard title="Overview">
                  <View className="mt-3 rounded-2xl border border-white/8 bg-slate-950/35 px-4 py-4">
                    <Text className="text-xs font-medium uppercase tracking-[2px] text-slate-500">
                      Date
                    </Text>
                    <Text className="mt-2 text-lg font-semibold text-white">
                      {formatDate(entry.createdAt)}
                    </Text>

                    <Text className="mt-5 text-xs font-medium uppercase tracking-[2px] text-slate-500">
                      Symptoms
                    </Text>
                    <Text className="mt-2 text-lg font-semibold text-white">
                      {formatSymptomsWithEmoji(entry.symptoms)}
                    </Text>

                    <Text className="mt-5 text-xs font-medium uppercase tracking-[2px] text-slate-500 ">
                      Intensity
                    </Text>
                    <Text className="mt-2 text-lg font-semibold text-white">
                      {entry.intensity}/10
                    </Text>
                  </View>
                </InfoCard>
              </View>

              <View className="mt-4">
                <InfoCard title="Pressure snapshot">
                  <View className="mt-3 rounded-2xl border border-white/8 bg-slate-950/35 px-4 py-4">
                    <StatRow
                      label="Pressure"
                      value={formatValue(entry.pressure, " hPa")}
                    />
                    <View className="my-3 h-px bg-white/5" />
                    <StatRow
                      label="Delta 3h"
                      value={formatValue(entry.pressureDelta3h, " hPa")}
                    />
                    <View className="my-3 h-px bg-white/5" />
                    <StatRow
                      label="Delta 6h"
                      value={formatValue(entry.pressureDelta6h, " hPa")}
                    />
                    <View className="my-3 h-px bg-white/5" />
                    <StatRow
                      label="Delta 12h"
                      value={formatValue(entry.pressureDelta12h, " hPa")}
                    />
                  </View>
                </InfoCard>
              </View>

              <View className="mt-4">
                <InfoCard title="Weather">
                  <View className="mt-3 rounded-2xl border border-white/8 bg-slate-950/35 px-4 py-4">
                    <StatRow
                      label="Temperature"
                      value={formatValue(entry.temperature, " °C")}
                    />

                    <View className="my-3 h-px bg-white/5" />

                    <View className="flex-row items-center justify-between">
                      <Text className="text-slate-300">Condition</Text>

                      <View className="ml-4 items-end">
                        <Text className="font-semibold text-white">
                          {getWeatherEmoji(entry.weatherCode)}{" "}
                          {getWeatherLabel(entry.weatherCode)}
                        </Text>

                        <Text className="mt-1 text-xs text-slate-500">
                          Code: {entry.weatherCode ?? "N/A"}
                        </Text>
                      </View>
                    </View>
                  </View>
                </InfoCard>
              </View>

              <View className="mt-4">
                <InfoCard title="Location">
                  <View className="mt-3 rounded-2xl border border-white/8 bg-slate-950/35 px-4 py-4">
                    {locationLoading ? (
                      <Text className="text-slate-400">
                        Loading location...
                      </Text>
                    ) : locationName ? (
                      <>
                        <Text className="text-lg font-semibold text-white">
                          🌍 {locationName.city ?? "Unknown location"}
                        </Text>

                        <Text className="mt-1 text-sm text-slate-400">
                          {locationName.country}
                        </Text>

                        <View className="mt-3 h-px bg-white/10" />

                        <Text className="mt-3 text-xs text-slate-500">
                          {entry.latitude?.toFixed(4)},{" "}
                          {entry.longitude?.toFixed(4)}
                        </Text>
                      </>
                    ) : (
                      <Text className="text-slate-400">
                        Location not available
                      </Text>
                    )}
                  </View>
                </InfoCard>
              </View>

              {entry.note?.trim() ? (
                <View className="mt-4">
                  <InfoCard title="Note">
                    <View className="mt-3 rounded-2xl border border-white/8 bg-slate-950/35 px-4 py-4">
                      <Text className="text-slate-300">{entry.note}</Text>
                    </View>
                  </InfoCard>
                </View>
              ) : null}

              <View className="mt-4">
                <InfoCard title="Entry ID">
                  <View className="mt-3 rounded-2xl border border-white/8 bg-slate-950/35 px-4 py-4">
                    <Text className="text-slate-300">{entry.id}</Text>
                  </View>
                </InfoCard>
              </View>

              <Pressable
                onPress={handleDelete}
                className="mt-6 mb-8 overflow-hidden rounded-2xl"
              >
                {({ pressed }) => (
                  <LinearGradient
                    colors={["#ef4444", "#dc2626"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{
                      borderRadius: 16,
                      paddingHorizontal: 20,
                      paddingVertical: 16,
                      opacity: pressed ? 0.85 : 1,
                    }}
                  >
                    <Text className="text-center font-semibold text-white">
                      Delete entry
                    </Text>
                  </LinearGradient>
                )}
              </Pressable>
            </>
          ) : null}
        </ScrollView>
      </View>
    </ScreenBackground>
  );
}
