import { useMemo, useState, useCallback } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  View,
  Image,
} from "react-native";
import { useFocusEffect } from "expo-router";
import PressureChart from "@/components/charts/PressureChart";
import PressureOverviewCard from "@/components/weather/PressureOverviewCard";
import SymptomFilterCard, {
  FilterType,
} from "@/components/home/SymptomFilterCard";
import PredictionsEntryCard from "@/components/home/PredictionsEntryCard";
import { useWeather } from "@/hooks/useWeather";
import { useAuth } from "@/hooks/useAuth";
import { useUserSettings } from "@/hooks/useUserSettings";
import { BlurView } from "expo-blur";
import { useLocationName } from "@/hooks/useLocationName";
import { useSymptomEntries } from "@/hooks/useSymptomEntries";
import { assessMeteoRisk } from "@/utils/pressure";
import { assessPersonalRisk } from "@/utils/personalRisk";
import { assessSymptomPrediction } from "@/utils/symptomPrediction";
import PredictionHighlightCard from "@/components/home/PredictionHighlightCard";
import { getTopPredictionHighlight } from "@/utils/predictionHighlight";
import WeatherSummaryCard from "@/components/home/WeatherSummaryCard";
import ScreenBackground from "@/components/ui/ScreenBackground";

const EMPTY_TREND = {
  delta3h: null,
  delta6h: null,
  delta12h: null,
} as const;

const PREDICTED_SYMPTOMS = [
  "migraine",
  "headache",
  "joint_pain",
  "nausea",
  "dizziness",
  "fatigue",
] as const;

export default function HomeScreen() {
  const { user, loading: authLoading } = useAuth();

  const { settings } = useUserSettings(user?.uid);
  const { data, loading, error, refetch, location } = useWeather();
  const { entries, refetch: refetchEntries } = useSymptomEntries(
    user?.uid ?? ""
  );
  const [selectedFilter, setSelectedFilter] = useState<FilterType>("all");

  useFocusEffect(
    useCallback(() => {
      if (user?.uid) {
        refetchEntries?.();
      }
    }, [user?.uid, refetchEntries])
  );

  const trend = data?.trend ?? EMPTY_TREND;
  const currentPressure = data?.current.pressure ?? null;

  async function handleRefresh() {
    await Promise.all([refetch(), refetchEntries?.()]);
  }

  const filteredMarkers = useMemo(() => {
    return (entries ?? [])
      .filter((entry) => {
        if (selectedFilter === "all") return true;
        return entry.symptoms?.includes(selectedFilter);
      })
      .map((entry) => ({
        id: entry.id,
        time: entry.createdAt,
        symptoms: entry.symptoms,
        intensity: entry.intensity,
        note: entry.note,
        pressure: entry.pressure,
      }));
  }, [entries, selectedFilter]);

  const personalRisk = useMemo(() => {
    return assessPersonalRisk(entries ?? [], currentPressure, trend);
  }, [entries, currentPressure, trend]);

  const mergedRiskAssessment = useMemo(() => {
    return assessMeteoRisk(currentPressure, trend, personalRisk.bonus);
  }, [currentPressure, trend, personalRisk.bonus]);

  const forecastRisk = useMemo(() => {
    if (!data?.forecastRisk) return null;

    return {
      ...data.forecastRisk,
      assessment: assessMeteoRisk(
        data.forecastRisk.minPressureNext12h,
        {
          delta3h: null,
          delta6h: data.forecastRisk.next6hDelta,
          delta12h: data.forecastRisk.next12hDelta,
        },
        personalRisk.bonus
      ),
    };
  }, [data, personalRisk.bonus]);

  const enabledPredictionsCount = useMemo(() => {
    return PREDICTED_SYMPTOMS.map((symptom) =>
      assessSymptomPrediction(entries ?? [], forecastRisk, symptom)
    ).filter((prediction) => prediction.enabled).length;
  }, [entries, forecastRisk]);

  const predictions = useMemo(() => {
    return PREDICTED_SYMPTOMS.map((symptom) =>
      assessSymptomPrediction(entries ?? [], forecastRisk, symptom)
    );
  }, [entries, forecastRisk]);

  const predictionHighlight = useMemo(() => {
    return getTopPredictionHighlight(predictions, forecastRisk);
  }, [predictions, forecastRisk]);

  const { locationName } = useLocationName(
    location?.latitude,
    location?.longitude
  );

  const locationValue = locationName
    ? `${locationName.city ?? "Unknown"}, ${locationName.country ?? ""}`
    : location
    ? `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`
    : "Not available";

  if (authLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-950">
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <ScreenBackground>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, gap: 16 }}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={handleRefresh} />
        }
      >
        <View className="mt-10">
          <View className="flex-row mt-5">
            <View className="flex-col">
              <Text className="text-4xl font-bold uppercase tracking-tight text-white">
                Dashboard
              </Text>
              <Text className="mt-2 uppercase text-sm leading-6 text-slate-400">
                Track pressure changes and weather triggers
              </Text>
            </View>
            <View className="absolute -right-10 -top-12">
              <Image
                source={require("../../../assets/mind_hero.png")}
                className="h-40 w-40"
                resizeMode="contain"
              />
            </View>
          </View>
        </View>

        {error ? (
          <View className="rounded-2xl border border-red-900 bg-red-950 p-4">
            <Text className="text-red-200">{error}</Text>
          </View>
        ) : null}

        <PressureOverviewCard
          pressure={currentPressure}
          trend={trend}
          risk={mergedRiskAssessment.risk}
          riskAssessment={mergedRiskAssessment}
          personalRisk={personalRisk}
          forecastRisk={forecastRisk}
        />

        {settings.predictionHighlightEnabled ? (
          <PredictionHighlightCard highlight={predictionHighlight} />
        ) : null}

        <BlurView
          intensity={18}
          tint="dark"
          style={{
            overflow: "hidden",
            borderRadius: 24,
          }}
        >
          <View className="rounded-3xl border border-white/10 bg-slate-900/45 p-4">
            <SymptomFilterCard
              selectedFilter={selectedFilter}
              onSelect={setSelectedFilter}
            />
            <PressureChart
              data={data?.hourlyPressure ?? []}
              markers={filteredMarkers}
              currentTime={data?.current.time}
              forecastRiskLevel={forecastRisk?.assessment.risk}
            />
          </View>
        </BlurView>
        <PredictionsEntryCard enabledCount={enabledPredictionsCount} />
        <WeatherSummaryCard
          location={locationValue}
          temperature={data?.current.temperature ?? null}
          weatherCode={data?.current.weatherCode ?? null}
          dailyForecast={data?.dailyForecast ?? []}
        />
      </ScrollView>
    </ScreenBackground>
  );
}
