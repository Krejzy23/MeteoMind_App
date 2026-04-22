import { useMemo } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import SymptomPredictionCard from "@/components/weather/SymptomPredictionCard";
import PatternsCard from "@/components/home/PatternsCard";
import { useAuth } from "@/hooks/useAuth";
import { useSymptomEntries } from "@/hooks/useSymptomEntries";
import { useWeather } from "@/hooks/useWeather";
import { assessMeteoRisk } from "@/utils/pressure";
import { assessPersonalRisk, buildSymptomPatterns } from "@/utils/personalRisk";
import { assessSymptomPrediction } from "@/utils/symptomPrediction";
import BackButton from "@/components/ui/BackButton";
import SymptomTimelineChart from "@/components/charts/SymptomTimelineChart";
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
  "dizziness",
  "nausea",
  "fatigue",
] as const;

export default function PredictionsScreen() {
  const { user, loading: authLoading } = useAuth();
  const { data, loading, refetch } = useWeather();
  const { entries } = useSymptomEntries(user?.uid ?? "");

  const trend = data?.trend ?? EMPTY_TREND;
  const currentPressure = data?.current.pressure ?? null;

  const personalRisk = useMemo(() => {
    return assessPersonalRisk(entries ?? [], currentPressure, trend);
  }, [entries, currentPressure, trend]);

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

  const predictions = useMemo(() => {
    return PREDICTED_SYMPTOMS.map((symptom) => ({
      symptom,
      prediction: assessSymptomPrediction(entries ?? [], forecastRisk, symptom),
    }));
  }, [entries, forecastRisk]);

  const symptomPatterns = useMemo(() => {
    return buildSymptomPatterns(entries ?? []);
  }, [entries]);

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
          <RefreshControl refreshing={loading} onRefresh={refetch} />
        }
      >
        <View className="pt-10 ">
          <View className="mb-10">
            <BackButton />
          </View>
          <Text className="text-4xl font-bold uppercase text-white">
            Predictions
          </Text>
          <Text className="mt-2 text-lg text-slate-400">
            Personal symptom predictions based on your history and forecast
          </Text>
        </View>

        <View className="flex-row flex-wrap gap-4">
          {predictions.map(({ symptom, prediction }) => (
            <View key={symptom} className="w-[48%]">
              <SymptomPredictionCard prediction={prediction} />
            </View>
          ))}
        </View>
        <PatternsCard patterns={symptomPatterns} />
        <SymptomTimelineChart entries={entries ?? []} />
      </ScrollView>
    </ScreenBackground>
  );
}
