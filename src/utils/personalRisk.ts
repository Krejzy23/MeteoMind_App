import {
  PersonalRiskAssessment,
  SymptomPattern,
  PressureTrend,
} from "@/types/weather";

type EntryLike = {
  symptoms?: string[];
  pressure?: number | null;
  pressureDelta6h?: number | null;
  pressureDelta12h?: number | null;
};

function average(values: number[]) {
  if (!values.length) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function round1(value: number | null) {
  if (value === null) return null;
  return Math.round(value * 10) / 10;
}

export function buildSymptomPatterns(entries: EntryLike[]): SymptomPattern[] {
  const symptomMap = new Map<
    string,
    {
      count: number;
      pressures: number[];
      delta6h: number[];
      delta12h: number[];
    }
  >();

  entries.forEach((entry) => {
    const symptoms = [...new Set(entry.symptoms ?? [])];

    symptoms.forEach((symptom) => {
      const current = symptomMap.get(symptom) ?? {
        count: 0,
        pressures: [],
        delta6h: [],
        delta12h: [],
      };

      current.count += 1;

      if (typeof entry.pressure === "number") {
        current.pressures.push(entry.pressure);
      }

      if (typeof entry.pressureDelta6h === "number") {
        current.delta6h.push(entry.pressureDelta6h);
      }

      if (typeof entry.pressureDelta12h === "number") {
        current.delta12h.push(entry.pressureDelta12h);
      }

      symptomMap.set(symptom, current);
    });
  });

  return Array.from(symptomMap.entries())
    .map(([symptom, value]) => ({
      symptom,
      count: value.count,
      avgPressure: round1(average(value.pressures)),
      avgDelta6h: round1(average(value.delta6h)),
      avgDelta12h: round1(average(value.delta12h)),
    }))
    .sort((a, b) => b.count - a.count);
}

export function assessPersonalRisk(
  entries: EntryLike[],
  currentPressure: number | null,
  trend: PressureTrend
): PersonalRiskAssessment {
  const patterns = buildSymptomPatterns(entries);

  const symptomEntriesCount = entries.filter(
    (entry) => (entry.symptoms ?? []).length > 0
  ).length;

  if (symptomEntriesCount < 5 || patterns.length === 0) {
    return {
      enabled: false,
      bonus: 0,
      reason: "Collect more entries to unlock personal insights.",
    };
  }

  let bonus = 0;
  const reasons: string[] = [];
  const strongest = patterns[0];

  if (strongest.avgPressure !== null && currentPressure !== null) {
    const diff = Math.abs(currentPressure - strongest.avgPressure);

    if (diff <= 2) {
      bonus += 12;
      reasons.push(
        `current pressure is close to your usual ${strongest.symptom.replaceAll("_", " ")} pattern`
      );
    }
  }

  if (
    strongest.avgDelta6h !== null &&
    trend.delta6h !== null &&
    strongest.avgDelta6h < 0 &&
    trend.delta6h <= strongest.avgDelta6h
  ) {
    bonus += 15;
    reasons.push(
      `6h pressure drop matches your typical ${strongest.symptom.replaceAll("_", " ")} trigger`
    );
  }

  if (
    strongest.avgDelta12h !== null &&
    trend.delta12h !== null &&
    strongest.avgDelta12h < 0 &&
    trend.delta12h <= strongest.avgDelta12h
  ) {
    bonus += 10;
    reasons.push(
      `12h pressure change is similar to your past symptom entries`
    );
  }

  bonus = Math.min(bonus, 30);

  return {
    enabled: true,
    bonus,
    reason: reasons.length
      ? reasons.join(" • ")
      : "Current weather does not strongly match your past symptom patterns.",
    strongestSymptom: strongest.symptom,
  };
}