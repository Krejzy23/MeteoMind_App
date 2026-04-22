import { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import InfoCard from "@/components/ui/InfoCard";
import RiskSummary from "@/components/weather/RiskSummary";
import {
  ForecastRisk,
  MeteoRisk,
  PersonalRiskAssessment,
  PressureTrend,
  RiskAssessment,
} from "@/types/weather";
import { formatDelta, getTrendArrow } from "@/utils/pressure";

type Props = {
  pressure: number | null;
  trend: PressureTrend;
  risk: MeteoRisk;
  riskAssessment?: RiskAssessment;
  personalRisk?: PersonalRiskAssessment;
  forecastRisk?: ForecastRisk | null;
};

type TrendWindow = "3h" | "6h" | "12h";

function getPressureColor(pressure: number | null) {
  if (pressure === null) return "#ffffff";

  if (pressure < 980) return "#f87171";
  if (pressure < 1000) return "#fb7185";
  if (pressure <= 1020) return "#22c55e";
  if (pressure <= 1040) return "#fb7185";
  return "#f87171";
}

export default function PressureOverviewCard({
  pressure,
  trend,
  risk,
  riskAssessment,
  personalRisk,
  forecastRisk,
}: Props) {
  const [selectedTrendWindow, setSelectedTrendWindow] =
    useState<TrendWindow>("6h");

  const currentTrendDelta = useMemo(() => {
    switch (selectedTrendWindow) {
      case "3h":
        return trend.delta3h;
      case "6h":
        return trend.delta6h;
      case "12h":
        return trend.delta12h;
      default:
        return trend.delta6h;
    }
  }, [selectedTrendWindow, trend.delta3h, trend.delta6h, trend.delta12h]);

  const arrow = getTrendArrow(currentTrendDelta);

  return (
    <InfoCard title="Atmospheric pressure">
      <Text className="mt-2 text-xs uppercase tracking-[2px] text-slate-400">
        Current pressure
      </Text>

      <Text
        className="mt-2 text-5xl font-bold"
        style={{ color: getPressureColor(pressure) }}
      >
        {pressure !== null ? `${pressure.toFixed(1)} hPa` : "N/A"}
      </Text>

      <View className="mt-5 rounded-[24px] border border-white/10 bg-slate-900/45 p-4">
        <View className="flex-row items-center justify-between">
          <Text className="text-sm font-semibold uppercase tracking-[2px] text-slate-400">
            Current trend
          </Text>

          <View className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
            <Text className="text-xs font-bold uppercase text-slate-300">
              Live
            </Text>
          </View>
        </View>

        <View className="mt-4 flex-row gap-2">
          {(["3h", "6h", "12h"] as TrendWindow[]).map((window) => {
            const active = selectedTrendWindow === window;

            return (
              <Pressable
                key={window}
                onPress={() => setSelectedTrendWindow(window)}
                className={`rounded-full border px-4 py-2 ${
                  active
                    ? "border-cyan-400/30 bg-cyan-400/15"
                    : "border-white/10 bg-white/5"
                }`}
              >
                <Text
                  className={`text-xs font-bold uppercase tracking-[1.5px] ${
                    active ? "text-cyan-300" : "text-slate-300"
                  }`}
                >
                  {window}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text className="mt-4 text-3xl font-extrabold text-white">
          {arrow} {formatDelta(currentTrendDelta)}
        </Text>

        <Text className="mt-2 text-sm text-slate-300">
          Pressure change over the last {selectedTrendWindow}
        </Text>
      </View>

      <View className="mt-3 rounded-[24px] border border-white/10 bg-slate-900/45 p-4">
        <View className="flex-row items-center justify-between">
          <Text className="text-sm font-semibold uppercase tracking-[2px] text-slate-400">
            Current risk
          </Text>

          <View className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
            <Text className="text-xs font-bold uppercase text-slate-300">
              Now
            </Text>
          </View>
        </View>

        <RiskSummary risk={risk} assessment={riskAssessment} />
      </View>

      {forecastRisk ? (
        <View className="mt-3 rounded-[24px] border border-white/10 bg-slate-900/45 p-4">
          <View className="flex-row items-center justify-between">
            <Text className="text-sm font-semibold uppercase tracking-[2px] text-slate-400">
              Forecast risk
            </Text>

            <View className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1">
              <Text className="text-xs font-bold uppercase text-cyan-200">
                Next 12h
              </Text>
            </View>
          </View>

          <RiskSummary
            risk={forecastRisk.assessment.risk}
            assessment={forecastRisk.assessment}
          />

          <View className="mt-4 gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
            <View className="flex-row items-center justify-between">
              <Text className="text-sm text-slate-400">Next 6h delta</Text>
              <Text className="text-sm font-semibold text-white">
                {formatDelta(forecastRisk.next6hDelta)}
              </Text>
            </View>

            <View className="flex-row items-center justify-between">
              <Text className="text-sm text-slate-400">Next 12h delta</Text>
              <Text className="text-sm font-semibold text-white">
                {formatDelta(forecastRisk.next12hDelta)}
              </Text>
            </View>

            <View className="flex-row items-center justify-between">
              <Text className="text-sm text-slate-400">Lowest pressure</Text>
              <Text className="text-sm font-semibold text-white">
                {forecastRisk.minPressureNext12h != null
                  ? `${forecastRisk.minPressureNext12h.toFixed(1)} hPa`
                  : "N/A"}
              </Text>
            </View>
          </View>
        </View>
      ) : (
        <View className="mt-5 rounded-[24px] border border-white/10 bg-slate-900/35 p-4">
          <View className="flex-row items-center justify-between">
            <Text className="text-sm font-semibold uppercase tracking-[2px] text-slate-400">
              Forecast risk
            </Text>

            <View className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
              <Text className="text-xs font-bold uppercase text-slate-400">
                Unavailable
              </Text>
            </View>
          </View>

          <Text className="mt-4 text-base leading-6 text-slate-300">
            Forecast risk is not available.
          </Text>
        </View>
      )}

      {personalRisk ? (
        <View className="mt-3 rounded-[24px] border border-cyan-400/20 bg-cyan-500/10 p-4">
          <View className="flex-row items-center justify-between">
            <Text className="text-sm font-semibold uppercase tracking-[2px] text-cyan-300">
              Personal insight
            </Text>

            <View className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1">
              <Text className="text-xs font-bold uppercase text-cyan-200">
                {personalRisk.enabled ? "Active" : "Learning"}
              </Text>
            </View>
          </View>

          {personalRisk.enabled ? (
            <>
              <View className="mt-4 flex-row items-end gap-2">
                <Text className="text-3xl font-extrabold text-white">
                  +{personalRisk.bonus}
                </Text>
                <Text className="mb-1 text-sm uppercase tracking-[1.5px] text-cyan-200">
                  risk points
                </Text>
              </View>

              <Text className="mt-2 text-sm text-slate-300">
                Based on your symptom history and current pressure pattern
              </Text>
            </>
          ) : (
            <>
              <Text className="mt-4 text-lg font-semibold text-white">
                Personal model not ready yet
              </Text>

              <Text className="mt-2 text-sm text-slate-300">
                Keep logging symptoms to unlock more accurate personal insights.
              </Text>
            </>
          )}

          <View className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
            <Text className="text-sm leading-6 text-slate-200">
              {personalRisk.reason}
            </Text>
          </View>
        </View>
      ) : null}
    </InfoCard>
  );
}