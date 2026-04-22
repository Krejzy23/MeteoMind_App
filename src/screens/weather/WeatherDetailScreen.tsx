import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { BlurView } from "expo-blur";
import BackButton from "@/components/ui/BackButton";
import InfoCard from "@/components/ui/InfoCard";
import { useWeather } from "@/hooks/useWeather";
import { useLocationName } from "@/hooks/useLocationName";
import { getWeatherEmoji, getWeatherLabel } from "@/utils/weather";
import ScreenBackground from "@/components/ui/ScreenBackground";
import MoonPhaseIcon from "@/components/weather/MoonPhaseIcon";
import { getMoonPhase } from "@/utils/moon";
import GlassCard from "@/components/ui/GlassCard";

function formatDayLabel(dateString: string, index: number) {
  if (index === 0) return "Today";
  if (index === 1) return "Tomorrow";

  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
  }).format(new Date(dateString));
}

function formatHourLabel(dateString: string) {
  return new Intl.DateTimeFormat("cs-CZ", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateString));
}

function isSameDay(dateA: Date, dateB: Date) {
  return (
    dateA.getFullYear() === dateB.getFullYear() &&
    dateA.getMonth() === dateB.getMonth() &&
    dateA.getDate() === dateB.getDate()
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <View className="w-[48%] rounded-3xl border border-white/10 bg-slate-950/55 px-4 py-4">
      <Text className="text-sm text-slate-400">{label}</Text>
      <Text className="mt-2 text-2xl font-semibold text-white">{value}</Text>
    </View>
  );
}

export default function WeatherDetailScreen() {
  const { data, location, loading, error, refetch } = useWeather();

  const { locationName } = useLocationName(
    location?.latitude,
    location?.longitude
  );

  const locationValue = locationName
    ? `${locationName.city ?? "Unknown"}, ${locationName.country ?? ""}`
    : location
    ? `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`
    : "Not available";

  const now = new Date();
  const nowHour = new Date().getHours();
  const moon = getMoonPhase();

  const todayHourlyForecast = (data?.hourlyForecast ?? [])
    .filter((item) => {
      const itemDate = new Date(item.time);

      return isSameDay(itemDate, now) && itemDate.getHours() >= now.getHours();
    })
    .slice(0, 12);

  if (loading && !data) {
    return (
      <ScreenBackground>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator />
        </View>
      </ScreenBackground>
    );
  }

  return (
    <ScreenBackground>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refetch} />
        }
        showsVerticalScrollIndicator={false}
      >
        <View className="pt-10">
          <BackButton />
          <Text className="mt-6 text-4xl font-bold uppercase tracking-tight text-white">
            Weather
          </Text>
          <Text className="mt-2 text-sm uppercase leading-6 text-slate-400">
            Extended weather details and forecast
          </Text>
        </View>

        {error ? (
          <BlurView
            intensity={20}
            tint="dark"
            style={{
              overflow: "hidden",
              borderRadius: 16,
              marginTop: 16,
            }}
          >
            <View className="rounded-2xl border border-red-900/70 bg-red-950/50 p-4">
              <Text className="text-red-200">{error}</Text>
            </View>
          </BlurView>
        ) : null}

        <View className="mt-4">
          <InfoCard title="Current conditions">
            <View className="flex-col items-center">
              <View className="mt-3 flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="text-4xl font-bold text-white">
                    {data?.current.temperature != null
                      ? `${data.current.temperature.toFixed(1)} °C`
                      : "N/A"}
                  </Text>

                  <Text className="mt-2 text-lg text-slate-300">
                    {getWeatherEmoji(data?.current.weatherCode)}{" "}
                    {getWeatherLabel(data?.current.weatherCode)}
                  </Text>
                </View>

                <View className="ml-4 rounded-full border border-white/10 bg-slate-950/40 px-3 py-2">
                  <Text className="text-xs font-medium uppercase tracking-[1px] text-slate-300">
                    📍 {locationValue}
                  </Text>
                </View>
              </View>
              <View className="mt-4">
                <View className="mt-3 flex-row flex-wrap gap-1">
                  <MetricCard
                    label="HUMIDITY"
                    value={
                      data?.current.humidity != null
                        ? `💧  ${data.current.humidity}%`
                        : "N/A"
                    }
                  />

                  <MetricCard
                    label="UV INDEX"
                    value={
                      data?.current.uvIndex != null
                        ? `☀️  ${data.current.uvIndex.toFixed(1)}`
                        : "N/A"
                    }
                  />

                  <View className="mt-3" />

                  <MetricCard
                    label="WIND SPEED"
                    value={
                      data?.current.windSpeed != null
                        ? `💨  ${data.current.windSpeed.toFixed(1)} km/h`
                        : "N/A"
                    }
                  />

                  <MetricCard
                    label="PRESSURE"
                    value={
                      data?.current.pressure != null
                        ? `🌍  ${data.current.pressure.toFixed(1)} hPa`
                        : "N/A"
                    }
                  />
                </View>
              </View>
            </View>
          </InfoCard>
        </View>

        <View className="mt-4">
          <InfoCard title="Today's hourly forecast">
            {todayHourlyForecast.length > 0 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingRight: 8 }}
              >
                <View className="mt-3 flex-row gap-3">
                  {todayHourlyForecast.map((item, index) => {
                    const hour = new Date(item.time).getHours();
                    const isNow = hour === nowHour;

                    return (
                      <GlassCard
                        key={`${item.time}-${index}`}
                        className={`w-24 rounded-2xl px-3 py-4 border ${
                          isNow
                            ? "border-cyan-400 bg-cyan-950/40"
                            : "border-white/10 bg-slate-950/35"
                        }`}
                      >
                        <Text className="text-xs font-medium text-slate-400">
                          {formatHourLabel(item.time)}
                        </Text>

                        <View className="mt-3 flex-row items-center justify-center gap-2">
                          <Text className="text-2xl">
                            {getWeatherEmoji(item.weatherCode)}
                          </Text>

                          <Text className="text-lg font-semibold text-white">
                            {item.temperature != null
                              ? `${item.temperature.toFixed(0)}°`
                              : "N/A"}
                          </Text>
                        </View>
                      </GlassCard>
                    );
                  })}
                </View>
              </ScrollView>
            ) : (
              <Text className="mt-3 text-slate-300">
                Hourly forecast is not available.
              </Text>
            )}
          </InfoCard>
        </View>

        <View className="mt-4 mb-4">
          <InfoCard title="Weekly forecast">
            <View className="mt-3 gap-3">
              {(data?.dailyForecast ?? []).slice(0, 7).map((item, index) => (
                <GlassCard
                  key={`${item.date}-${index}`}
                  className="flex-row items-center justify-between rounded-2xl px-4 py-4"
                >
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-white">
                      {formatDayLabel(item.date, index)}
                    </Text>
                    <Text className="mt-1 text-slate-400">
                      {getWeatherLabel(item.weatherCode)}
                    </Text>
                  </View>

                  <Text className="mr-4 text-4xl">
                    {getWeatherEmoji(item.weatherCode)}
                  </Text>

                  <Text className="text-base font-semibold text-white">
                    {item.temperatureMax != null
                      ? `${item.temperatureMax.toFixed(0)}°`
                      : "N/A"}
                    {" / "}
                    {item.temperatureMin != null
                      ? `${item.temperatureMin.toFixed(0)}°`
                      : "N/A"}
                  </Text>
                </GlassCard>
              ))}
            </View>
          </InfoCard>
        </View>

        <InfoCard title="Moon phase">
          <GlassCard className="mt-2 px-4 py-4">
            <View className="flex-row items-center">
              <MoonPhaseIcon phase={moon.label} size={86} />

              <View className="ml-4 flex-1">
                <Text className="text-xl font-semibold text-white">
                  {moon.label} {moon.emoji}
                </Text>

                <Text className="mt-1 text-slate-300">
                  Illumination: {moon.illumination}%
                </Text>
                <View className="mt-2">
                  <Text className="text-slate-300">
                    Moon age:{" "}
                    <Text className="font-semibold text-white">
                      {moon.age} days
                    </Text>
                  </Text>

                  <Text className="mt-2 text-slate-300">
                    Next phase:{" "}
                    <Text className="font-semibold text-white">
                      {moon.nextPhase} in {moon.daysToNextPhase} days
                    </Text>
                  </Text>
                </View>
              </View>
            </View>
          </GlassCard>
        </InfoCard>
      </ScrollView>
    </ScreenBackground>
  );
}
