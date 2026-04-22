import { router } from "expo-router";
import { Text, View, Pressable } from "react-native";

import InfoCard from "@/components/ui/InfoCard";
import { getWeatherEmoji, getWeatherLabel } from "@/utils/weather";

type DailyForecastItem = {
  date: string;
  weatherCode: number | null;
  temperatureMax: number | null;
  temperatureMin: number | null;
};

type Props = {
  location: string;
  temperature: number | null;
  weatherCode: number | null;
  dailyForecast?: DailyForecastItem[];
};

function formatDayLabel(dateString: string, index: number) {
  if (index === 0) return "Today";
  if (index === 1) return "Tomorrow";

  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
  }).format(new Date(dateString));
}

function ForecastDayCard({
  item,
  index,
}: {
  item: DailyForecastItem;
  index: number;
}) {
  return (
    <View className="flex-1 rounded-2xl border border-white/8 bg-slate-950/35 px-3 py-3">
      <Text className="text-xs uppercase font-medium text-slate-400">
        {formatDayLabel(item.date, index)}
      </Text>

      <View className="mt-2 items-center">
        <Text className="text-4xl">{getWeatherEmoji(item.weatherCode)}</Text>

        <Text className="mt-2 text-base font-semibold text-white">
          {item.temperatureMax != null
            ? `${item.temperatureMax.toFixed(0)}°`
            : "N/A"}
          {" / "}
          {item.temperatureMin != null
            ? `${item.temperatureMin.toFixed(0)}°`
            : "N/A"}
        </Text>
      </View>
    </View>
  );
}

export default function WeatherSummaryCard({
  location,
  temperature,
  weatherCode,
  dailyForecast = [],
}: Props) {
  const weatherLabel = getWeatherLabel(weatherCode);
  const weatherEmoji = getWeatherEmoji(weatherCode);
  const nextThreeDays = dailyForecast.slice(1, 4);

  return (
    <InfoCard title="Current weather">
      <View className="mt-2 flex-row items-center justify-between">
        <View className="flex-1">
          <Text className="text-3xl font-semibold text-white">
            {weatherEmoji}{" "}
            {temperature != null ? `${temperature.toFixed(1)} °C` : "N/A"}
          </Text>

          <Text className="mt-2 text-base uppercase text-slate-300">
            {weatherLabel}
          </Text>
        </View>

        <View className="ml-4 mb-4 rounded-full border border-white/10 bg-slate-950/40 px-3 py-2">
          <Text className="text-xs font-medium uppercase tracking-[1px] text-slate-300">
            📍 {location}
          </Text>
        </View>
      </View>

      {nextThreeDays.length > 0 ? (
        <View className="mt-5 rounded-2xl border border-green-400/20 bg-green-500/10 p-4">
          <Text className="text-xs font-medium uppercase tracking-[2px] text-green-300">
            Upcoming forecast
          </Text>

          <View className="mt-4 flex-row gap-3">
            {nextThreeDays.map((item, index) => (
              <ForecastDayCard
                key={`${item.date}-${index}`}
                item={item}
                index={index + 1}
              />
            ))}
          </View>
        </View>
      ) : null}
      <Pressable
        onPress={() => router.push("/weather")}
        className=" mt-4 rounded-xl items-center border border-green-700 px-4 py-2 bg-slate-900/60"
      >
        <Text className="text-white text-sm uppercase tracking-widest font-medium">
          More weather details →
        </Text>
      </Pressable>
    </InfoCard>
  );
}
