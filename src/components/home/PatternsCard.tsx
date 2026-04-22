import { Text, View } from "react-native";
import InfoCard from "@/components/ui/InfoCard";
import { SymptomPattern } from "@/types/weather";
import { getSymptomMeta } from "@/utils/symptoms";

type Props = {
  patterns: SymptomPattern[];
};

function formatDelta(value: number | null | undefined) {
  if (value == null) return "N/A";
  return `${value > 0 ? "+" : ""}${value.toFixed(1)} hPa`;
}

function getDeltaColor(value: number | null | undefined) {
  if (value == null) return "#cbd5e1";
  if (value <= -6 || value >= 6) return "#f87171";
  if (value <= -3 || value >= 3) return "#fb7185";
  return "#cbd5e1";
}

export default function PatternsCard({ patterns }: Props) {
  if (!patterns.length) return null;

  return (
    <InfoCard title="Your patterns">
      <View className="mt-3 flex-row flex-wrap justify-between">
        {patterns.slice(0, 6).map((pattern) => {
          const meta = getSymptomMeta(pattern.symptom);

          return (
            <View
              key={pattern.symptom}
              className="mb-3 w-[48.5%] rounded-2xl border border-white/8 bg-slate-950/35 p-4"
            >
              <Text className="text-base font-semibold text-white">
                {meta.emoji} {meta.label}
              </Text>

              <View className="mt-3 rounded-2xl border border-white/8 bg-white/5 px-3 py-3">
                <Text className="text-slate-300">
                  Entries:{" "}
                  <Text className="font-semibold text-white">
                    {pattern.count}
                  </Text>
                </Text>

                <Text className="mt-2 text-slate-300">
                  Avg pressure:{" "}
                  <Text className="font-semibold text-white">
                    {pattern.avgPressure != null
                      ? `${pattern.avgPressure.toFixed(1)} hPa`
                      : "N/A"}
                  </Text>
                </Text>

                <Text className="mt-2 text-slate-300">
                  Avg delta 6h:{" "}
                  <Text
                    className="font-semibold"
                    style={{ color: getDeltaColor(pattern.avgDelta6h) }}
                  >
                    {formatDelta(pattern.avgDelta6h)}
                  </Text>
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </InfoCard>
  );
}