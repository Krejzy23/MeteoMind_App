import { Text } from "react-native";
import InfoCard from "@/components/ui/InfoCard";
import { SymptomPrediction } from "@/types/weather";
import { getSymptomMeta } from "@/utils/symptoms";

type Props = {
  prediction?: SymptomPrediction | null;
};

function getRiskStyle(level: "low" | "moderate" | "high") {
  switch (level) {
    case "high":
      return {
        borderColor: "#ef4444",
        backgroundColor: "rgba(69, 10, 10, 0.5)",
      };

    case "moderate":
      return {
        borderColor: "#eab308",
        backgroundColor: "rgba(113, 63, 18, 0.5)",
      };

    default:
      return {
        borderColor: "#22c55e",
        backgroundColor: "rgba(5, 46, 22, 0.5)",
      };
  }
}

function getPredictionLabel(level: "low" | "moderate" | "high") {
  switch (level) {
    case "high":
      return "High";
    case "moderate":
      return "Moderate";
    default:
      return "Low";
  }
}

function getPredictionIcon(level: "low" | "moderate" | "high") {
  switch (level) {
    case "high":
      return "⚠️";
    case "moderate":
      return "🟡";
    default:
      return "🟢";
  }
}

export default function SymptomPredictionCard({ prediction }: Props) {
  if (!prediction) return null;

  const meta = getSymptomMeta(prediction.symptom);
  const riskStyle = getRiskStyle(prediction.level);

  return (
    <InfoCard title="Personal symptom" style={riskStyle}>
      <Text className="mt-2 text-xl tracking-[2px] leading-6 font-semibold uppercase text-slate-200">
        {meta.emoji} {meta.label}
      </Text>

      <Text className="mt-2 text-lg text-white">
        {getPredictionIcon(prediction.level)}{" "}
        {getPredictionLabel(prediction.level)}
      </Text>

      <Text className="mt-2 text-slate-300">
        Score: {prediction.score}/100
      </Text>

      <Text className="mt-1 text-slate-400">{prediction.reason}</Text>

      <Text className="mt-3 text-xs text-slate-500">
        Based on {prediction.matchingEntries} entries
      </Text>
    </InfoCard>
  );
}