import {
  CurrentWeatherData,
  DailyForecastItem,
  HourlyForecastItem,
  PressurePoint,
  WeatherSnapshot,
} from "@/types/weather";
import {
  assessMeteoRisk,
  calculatePressureTrend,
  assessForecastRisk,
} from "@/utils/pressure";

interface OpenMeteoResponse {
  current?: {
    time?: string;
    temperature_2m?: number;
    pressure_msl?: number;
    weather_code?: number;
    relative_humidity_2m?: number;
    uv_index?: number;
    wind_speed_10m?: number;
  };
  hourly?: {
    time?: string[];
    pressure_msl?: number[];
    temperature_2m?: number[];
    weather_code?: number[];
    relative_humidity_2m?: number[];
    wind_speed_10m?: number[];
    uv_index?: number[];
  };
  daily?: {
    time?: string[];
    weather_code?: number[];
    temperature_2m_max?: number[];
    temperature_2m_min?: number[];
  };
}

export async function getWeatherSnapshot(
  latitude: number,
  longitude: number
): Promise<WeatherSnapshot> {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    current:  "temperature_2m,pressure_msl,weather_code,relative_humidity_2m,uv_index,wind_speed_10m",
    hourly: "pressure_msl,temperature_2m,weather_code,relative_humidity_2m,uv_index,wind_speed_10m",
    past_hours: "12",
    forecast_hours: "24",
    timezone: "auto",
    daily: "weather_code,temperature_2m_max,temperature_2m_min",
    forecast_days: "8",
  });

  const response = await fetch(
    `https://api.open-meteo.com/v1/forecast?${params.toString()}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch weather data");
  }

  const data: OpenMeteoResponse = await response.json();

  const current: CurrentWeatherData = {
    time: data.current?.time ?? new Date().toISOString(),
    temperature: data.current?.temperature_2m ?? null,
    pressure: data.current?.pressure_msl ?? null,
    weatherCode: data.current?.weather_code ?? null,
    humidity: data.current?.relative_humidity_2m ?? null,
    uvIndex: data.current?.uv_index ?? null,
    windSpeed: data.current?.wind_speed_10m ?? null,
  };

  const hourlyTimes = data.hourly?.time ?? [];
  const hourlyPressureValues = data.hourly?.pressure_msl ?? [];

  const hourlyPressure: PressurePoint[] = hourlyTimes
    .map((time, index) => {
      const pressure = hourlyPressureValues[index];
      if (typeof pressure !== "number") return null;
      return { time, pressure };
    })
    .filter((item): item is PressurePoint => item !== null);
  
    const hourlyTemperatureValues = data.hourly?.temperature_2m ?? [];
    const hourlyWeatherCodes = data.hourly?.weather_code ?? [];
    
    const hourlyForecast: HourlyForecastItem[] = hourlyTimes
      .map((time, index) => ({
        time,
        temperature: hourlyTemperatureValues[index] ?? null,
        weatherCode: hourlyWeatherCodes[index] ?? null,
      }))
      .filter((item) => item.time);

  const dailyTimes = data.daily?.time ?? [];
  const dailyWeatherCodes = data.daily?.weather_code ?? [];
  const dailyTemperatureMax = data.daily?.temperature_2m_max ?? [];
  const dailyTemperatureMin = data.daily?.temperature_2m_min ?? [];

  const dailyForecast: DailyForecastItem[] = dailyTimes.map((date, index) => ({
    date,
    weatherCode: dailyWeatherCodes[index] ?? null,
    temperatureMax: dailyTemperatureMax[index] ?? null,
    temperatureMin: dailyTemperatureMin[index] ?? null,
  }));

  const trend = calculatePressureTrend(hourlyPressure);
  const riskAssessment = assessMeteoRisk(current.pressure, trend);
  const forecastRisk = assessForecastRisk(hourlyPressure, current.time);

  return {
    current,
    hourlyPressure,
    hourlyForecast,
    trend,
    risk: riskAssessment.risk,
    riskAssessment,
    forecastRisk: forecastRisk ?? undefined,
    dailyForecast,
  };
}