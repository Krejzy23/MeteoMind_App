import { MeteoRisk, PressurePoint, PressureTrend, RiskAssessment, ForecastRisk } from "@/types/weather";

function round1(value: number) {
  return Math.round(value * 10) / 10;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function getDelta(points: PressurePoint[], hoursAgo: number): number | null {
  if (!points.length) return null;

  const now = points[points.length - 1];
  const targetIndex = points.length - 1 - hoursAgo;

  if (targetIndex < 0) return null;

  const previous = points[targetIndex];
  return round1(now.pressure - previous.pressure);
}

export function calculatePressureTrend(points: PressurePoint[]): PressureTrend {
  return {
    delta3h: getDelta(points, 3),
    delta6h: getDelta(points, 6),
    delta12h: getDelta(points, 12),
  };
}

export function getTrendArrow(delta: number | null) {
  if (delta === null) return "→";
  if (delta > 0.3) return "↑";
  if (delta < -0.3) return "↓";
  return "→";
}

export function formatDelta(delta: number | null) {
  if (delta === null) return "N/A";
  const sign = delta > 0 ? "+" : "";
  return `${sign}${delta.toFixed(1)} hPa`;
}

export function assessMeteoRisk(
  pressure: number | null,
  trend: PressureTrend,
  personalBonus = 0
): RiskAssessment {
  let score = 0;
  const reasons: string[] = [];

  const delta3h = trend.delta3h ?? 0;
  const delta6h = trend.delta6h ?? 0;
  const delta12h = trend.delta12h ?? 0;

  if (delta3h <= -2) {
    score += 15;
    reasons.push(`drop ${Math.abs(delta3h).toFixed(1)} hPa / 3h`);
  }

  if (delta6h <= -4) {
    score += 25;
    reasons.push(`drop ${Math.abs(delta6h).toFixed(1)} hPa / 6h`);
  }

  if (delta6h <= -6) {
    score += 15;
  }

  if (delta12h <= -6) {
    score += 20;
    reasons.push(`drop ${Math.abs(delta12h).toFixed(1)} hPa / 12h`);
  }

  if (pressure !== null) {
    if (pressure <= 1005) {
      score += 15;
      reasons.push(`low pressure ${pressure.toFixed(1)} hPa`);
    }

    if (pressure <= 1000) {
      score += 10;
    }
  }

  score += personalBonus;
  score = clamp(score, 0, 100);

  let risk: MeteoRisk = "low";
  if (score >= 65) risk = "high";
  else if (score >= 35) risk = "moderate";

  const reason =
    reasons.length > 0 ? reasons.slice(0, 2).join(" • ") : "stable pressure";

  return {
    risk,
    score,
    reason,
  };
}

export function assessForecastRisk(
  hourlyPressure: PressurePoint[],
  currentTime: string,
  personalBonus = 0
): ForecastRisk | null {
  if (!hourlyPressure.length) return null;

  const currentHour = new Date(currentTime);
  currentHour.setMinutes(0, 0, 0);

  const nowIndex = hourlyPressure.findIndex((point) => {
    const pointDate = new Date(point.time);
    pointDate.setMinutes(0, 0, 0);
    return pointDate.getTime() === currentHour.getTime();
  });

  if (nowIndex === -1) return null;

  const current = hourlyPressure[nowIndex];
  const point6h = hourlyPressure[nowIndex + 6];
  const point12h = hourlyPressure[nowIndex + 12];

  const next12hPoints = hourlyPressure.slice(nowIndex, nowIndex + 13);

  const next6hDelta =
    point6h ? round1(point6h.pressure - current.pressure) : null;

  const next12hDelta =
    point12h ? round1(point12h.pressure - current.pressure) : null;

  const minPressureNext12h =
    next12hPoints.length > 0
      ? round1(Math.min(...next12hPoints.map((p) => p.pressure)))
      : null;

  const forecastTrend: PressureTrend = {
    delta3h: null,
    delta6h: next6hDelta,
    delta12h: next12hDelta,
  };

  const assessment = assessMeteoRisk(
    minPressureNext12h ?? current.pressure,
    forecastTrend,
    personalBonus
  );


  return {
    next6hDelta,
    next12hDelta,
    minPressureNext12h,
    assessment,
  };
}