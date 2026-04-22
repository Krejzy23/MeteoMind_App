import { ForecastRisk, SymptomPrediction } from "@/types/weather";
import { getSymptomMeta } from "@/utils/symptoms";

export type PredictionHighlight = {
  title: string;
  subtitle: string;
  level: "moderate" | "high";
  delta6h?: number | null;
} | null;

function getLevelWeight(level: "low" | "moderate" | "high") {
  switch (level) {
    case "high":
      return 3;
    case "moderate":
      return 2;
    default:
      return 1;
  }
}

export function getTopPredictionHighlight(
  predictions: SymptomPrediction[],
  forecastRisk?: ForecastRisk | null
): PredictionHighlight {
  const alertPredictions = predictions.filter(
    (prediction): prediction is SymptomPrediction & { level: "moderate" | "high" } =>
      prediction.enabled &&
      (prediction.level === "moderate" || prediction.level === "high")
  );

  if (!alertPredictions.length) return null;

  const topPrediction = [...alertPredictions].sort((a, b) => {
    const levelDiff = getLevelWeight(b.level) - getLevelWeight(a.level);
    if (levelDiff !== 0) return levelDiff;
    return b.score - a.score;
  })[0];

  const meta = getSymptomMeta(topPrediction.symptom);

  const title =
    topPrediction.level === "high"
      ? `High ${meta.label.toLowerCase()} risk tonight`
      : `Moderate ${meta.label.toLowerCase()} risk in the next hours`;

  return {
    title,
    subtitle: topPrediction.reason,
    level: topPrediction.level,
    delta6h: forecastRisk?.next6hDelta ?? null,
  };
}