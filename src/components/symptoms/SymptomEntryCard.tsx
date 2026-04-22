import { Pressable, Text, View } from "react-native";
import { BlurView } from "expo-blur";
import { router } from "expo-router";
import type { SymptomEntryItem } from "@/hooks/useSymptomEntries";
import { formatSymptomsWithEmoji } from "@/utils/symptoms";

type Props = {
  entry: SymptomEntryItem;
};

function formatDate(dateString: string) {
  const date = new Date(dateString);

  return new Intl.DateTimeFormat("cs-CZ", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function formatDelta(value: number | null | undefined) {
  if (value == null) return "N/A";
  return `${value > 0 ? "+" : ""}${value.toFixed(1)} hPa`;
}

function getDeltaColor(value: number | null | undefined) {
  if (value == null) return "#cbd5e1";
  if (value <= -6 || value >= 6) return "#f87171";
  if (value <= -3 || value >= 3) return "#fb7185";
  return "#cbd5e1";
}

export default function SymptomEntryCard({ entry }: Props) {
  return (
    <BlurView
      intensity={18}
      tint="dark"
      style={{
        overflow: "hidden",
        borderRadius: 24,
      }}
    >
      <Pressable
        onPress={() => router.push(`/entry/${entry.id}`)}
        className="rounded-3xl border border-white/10 bg-slate-900/45 p-4"
        style={({ pressed }) => ({
          opacity: pressed ? 0.92 : 1,
          transform: [{ scale: pressed ? 0.985 : 1 }],
        })}
      >
        <View className="flex-row items-center justify-between">
          <View className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
            <Text className="text-[11px] font-semibold uppercase tracking-[1px] text-slate-300">
              {formatDate(entry.createdAt)}
            </Text>
          </View>
        </View>

        <Text className="mt-4 text-xl font-bold leading-7 text-white">
          {formatSymptomsWithEmoji(entry.symptoms)}
        </Text>

        <View className="mt-4 rounded-2xl border border-white/8 bg-slate-950/35 p-4">
          <View className="flex-row items-center justify-between">
            <Text className="text-sm text-slate-400">Intensity</Text>
            <Text className="text-sm font-semibold text-white">
              {entry.intensity}/10
            </Text>
          </View>

          <View className="mt-3 flex-row items-center justify-between">
            <Text className="text-sm text-slate-400">Pressure</Text>
            <Text className="text-sm font-semibold text-white">
              {entry.pressure != null
                ? `${entry.pressure.toFixed(1)} hPa`
                : "N/A"}
            </Text>
          </View>

          <View className="mt-3 flex-row items-center justify-between">
            <Text className="text-sm text-slate-400">Delta 6h</Text>
            <Text
              className="text-sm font-semibold"
              style={{ color: getDeltaColor(entry.pressureDelta6h) }}
            >
              {formatDelta(entry.pressureDelta6h)}
            </Text>
          </View>
        </View>

        {entry.note ? (
          <View className="mt-4 rounded-2xl border border-white/8 bg-white/5 p-4">
            <Text className="text-xs font-medium uppercase tracking-[2px] text-slate-500">
              Note
            </Text>
            <Text
              className="mt-2 text-sm leading-6 text-slate-300"
              numberOfLines={2}
            >
              {entry.note}
            </Text>
          </View>
        ) : null}
      </Pressable>
    </BlurView>
  );
}
