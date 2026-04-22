export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface CurrentWeatherData {
  time: string;
  temperature: number | null;
  pressure: number | null;
  weatherCode: number | null;
  humidity?: number | null;
  uvIndex?: number | null;
  windSpeed?: number | null;
}

export interface PressurePoint {
  time: string;
  pressure: number;
}

export interface PressureTrend {
  delta3h: number | null;
  delta6h: number | null;
  delta12h: number | null;
}

export interface DailyForecastItem {
  date: string;
  weatherCode: number | null;
  temperatureMax: number | null;
  temperatureMin: number | null;
}

export type MeteoRisk = "low" | "moderate" | "high";

export interface HourlyForecastItem {
  time: string;
  temperature: number | null;
  weatherCode: number | null;
}

export interface ForecastRisk {
  next6hDelta: number | null;
  next12hDelta: number | null;
  minPressureNext12h: number | null;
  assessment: RiskAssessment;
}

export interface WeatherSnapshot {
  current: CurrentWeatherData;
  hourlyPressure: PressurePoint[];
  trend: PressureTrend;
  risk: MeteoRisk;
  riskAssessment: RiskAssessment;
  forecastRisk?: ForecastRisk;
  dailyForecast?: DailyForecastItem[];
  hourlyForecast?: HourlyForecastItem[];
}

export interface RiskAssessment {
  risk: MeteoRisk;
  score: number;
  reason: string;
}

export interface SymptomPattern {
  symptom: string;
  count: number;
  avgPressure: number | null;
  avgDelta6h: number | null;
  avgDelta12h: number | null;
}

export interface PersonalRiskAssessment {
  enabled: boolean;
  bonus: number;
  reason: string;
  strongestSymptom?: string;
}

export type PredictionLevel = "low" | "moderate" | "high";

export interface SymptomPrediction {
  enabled: boolean;
  symptom: string;
  level: PredictionLevel;
  score: number;
  reason: string;
  matchingEntries: number;
}