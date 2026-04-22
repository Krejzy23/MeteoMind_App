import { Text, View } from "react-native";
import { MeteoRisk, RiskAssessment } from "@/types/weather";

type Props = {
  risk: MeteoRisk;
  assessment?: RiskAssessment;
};

function getRiskLabel(risk: MeteoRisk) {
  switch (risk) {
    case "high":
      return "High";
    case "moderate":
      return "Moderate";
    default:
      return "Low";
  }
}

function getRiskIcon(risk: MeteoRisk) {
  switch (risk) {
    case "high":
      return "⚠️";
    case "moderate":
      return "🟡";
    default:
      return "🟢";
  }
}

function getRiskStyles(risk: MeteoRisk) {
  switch (risk) {
    case "high":
      return {
        badge: "border-red-500/20 bg-red-500/15",
        badgeText: "text-red-300",
        score: "text-red-200",
      };
    case "moderate":
      return {
        badge: "border-yellow-500/20 bg-yellow-500/15",
        badgeText: "text-yellow-300",
        score: "text-yellow-200",
      };
    default:
      return {
        badge: "border-lime-400/20 bg-lime-400/15",
        badgeText: "text-lime-300",
        score: "text-lime-200",
      };
  }
}

export default function RiskSummary({ risk, assessment }: Props) {
  const styles = getRiskStyles(risk);

  return (
    <View className="mt-4">
      <View className="flex-row items-center justify-between">
        <Text className="text-2xl font-bold text-white">
          {getRiskIcon(risk)} {getRiskLabel(risk)}
        </Text>

        <View className={`rounded-full border px-3 py-1 ${styles.badge}`}>
          <Text className={`text-xs font-bold uppercase ${styles.badgeText}`}>
            {getRiskLabel(risk)}
          </Text>
        </View>
      </View>

      {assessment ? (
        <>
          <View className="mt-4 flex-row items-end gap-2">
            <Text className={`text-3xl font-extrabold ${styles.score}`}>
              {assessment.score}
            </Text>
            <Text className="mb-1 text-sm uppercase tracking-[1.5px] text-slate-400">
              / 100
            </Text>
          </View>

          <View className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
            <Text className="text-sm leading-6 text-slate-300">
              {assessment.reason}
            </Text>
          </View>
        </>
      ) : null}
    </View>
  );
}