import { SymptomPrediction } from "@/types/weather";

type EntryLike = {
  symptoms?: string[];
  pressure?: number | null;
  pressureDelta6h?: number | null;
  pressureDelta12h?: number | null;
};

type ForecastLike = {
  minPressureNext12h?: number | null;
  next6hDelta?: number | null;
  next12hDelta?: number | null;
};

function average(values: number[]) {
  if (!values.length) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function formatSymptom(symptom: string) {
  return symptom.replaceAll("_", " ");
}

export function assessSymptomPrediction(
  entries: EntryLike[],
  forecast: ForecastLike | null | undefined,
  symptom: string
): SymptomPrediction {
  const matchingEntries = entries.filter((entry) =>
    entry.symptoms?.includes(symptom)
  );

  if (matchingEntries.length < 5) {
    return {
      enabled: false,
      symptom,
      level: "low",
      score: 0,
      reason: `Add more ${formatSymptom(symptom)} entries to unlock prediction.`,
      matchingEntries: matchingEntries.length,
    };
  }

  if (!forecast) {
    return {
      enabled: false,
      symptom,
      level: "low",
      score: 0,
      reason: "Forecast data is not available.",
      matchingEntries: matchingEntries.length,
    };
  }

  const avgPressure = average(
    matchingEntries
      .map((entry) => entry.pressure)
      .filter((value): value is number => typeof value === "number")
  );

  const avgDelta6h = average(
    matchingEntries
      .map((entry) => entry.pressureDelta6h)
      .filter((value): value is number => typeof value === "number")
  );

  const avgDelta12h = average(
    matchingEntries
      .map((entry) => entry.pressureDelta12h)
      .filter((value): value is number => typeof value === "number")
  );

  let score = 0;
  const reasons: string[] = [];

  if (
    avgPressure !== null &&
    forecast.minPressureNext12h !== null &&
    forecast.minPressureNext12h !== undefined
  ) {
    const diff = Math.abs(forecast.minPressureNext12h - avgPressure);

    if (diff <= 2) {
      score += 35;
      reasons.push(
        `forecast pressure is very close to your past ${formatSymptom(symptom)} pattern`
      );
    } else if (diff <= 4) {
      score += 20;
      reasons.push(
        `forecast pressure is somewhat close to your ${formatSymptom(symptom)} pattern`
      );
    }
  }

  if (
    avgDelta6h !== null &&
    forecast.next6hDelta !== null &&
    forecast.next6hDelta !== undefined &&
    avgDelta6h < 0
  ) {
    if (forecast.next6hDelta <= avgDelta6h) {
      score += 30;
      reasons.push(
        `next 6h pressure drop matches your typical ${formatSymptom(symptom)} trigger`
      );
    } else if (forecast.next6hDelta <= avgDelta6h + 1.5) {
      score += 15;
      reasons.push(
        `next 6h pressure drop is partially similar to your ${formatSymptom(symptom)} pattern`
      );
    }
  }

  if (
    avgDelta12h !== null &&
    forecast.next12hDelta !== null &&
    forecast.next12hDelta !== undefined &&
    avgDelta12h < 0
  ) {
    if (forecast.next12hDelta <= avgDelta12h) {
      score += 25;
      reasons.push(
        `next 12h pressure change is similar to your ${formatSymptom(symptom)} history`
      );
    } else if (forecast.next12hDelta <= avgDelta12h + 2) {
      score += 10;
      reasons.push(
        `next 12h pressure change is somewhat similar to your ${formatSymptom(symptom)} history`
      );
    }
  }

  score = clamp(score, 0, 100);

  let level: "low" | "moderate" | "high" = "low";
  if (score >= 65) level = "high";
  else if (score >= 35) level = "moderate";

  return {
    enabled: true,
    symptom,
    level,
    score,
    reason:
      reasons.length > 0
        ? reasons.slice(0, 2).join(" • ")
        : `Forecast does not strongly match your past ${formatSymptom(symptom)} entries.`,
    matchingEntries: matchingEntries.length,
  };
}