import { Pressable, Text, View } from "react-native";
import { router } from "expo-router";
import { PredictionHighlight } from "@/utils/predictionHighlight";

type Props = {
  highlight: PredictionHighlight;
};

function getAlertStyles(level: "moderate" | "high") {
  if (level === "high") {
    return {
      container: "border-red-700 bg-red-950/50",
      eyebrow: "text-red-300",
      badge: "bg-red-500",
      button: "border-red-700 bg-slate-950/70",
      icon: "⚠️",
      detailBox: "border-red-500/10 bg-white/5",
    };
  }

  return {
    container: "border-yellow-700 bg-yellow-950/40",
    eyebrow: "text-yellow-300",
    badge: "bg-yellow-500",
    button: "border-yellow-700 bg-slate-950/70",
    icon: "🟡",
    detailBox: "border-yellow-500/10 bg-white/5",
  };
}

function getPressureChangeText(delta: number | null) {
  if (delta == null) return null;

  if (Math.abs(delta) < 0.3) {
    return "Pressure will remain nearly stable in the next 6 hours";
  }

  if (delta < 0) {
    return `Pressure drop ${Math.abs(delta).toFixed(1)} hPa in the next 6 hours`;
  }

  if (delta > 0) {
    return `Pressure rise +${delta.toFixed(1)} hPa in the next 6 hours`;
  }

  return "Pressure will remain stable in the next 6 hours";
}

export default function PredictionHighlightCard({ highlight }: Props) {
  if (!highlight) return null;

  const styles = getAlertStyles(highlight.level);
  const pressureChangeText = getPressureChangeText(highlight.delta6h ?? null);

  return (
    <Pressable
      onPress={() => router.push("/predictions")}
      className={`rounded-[28px] border p-5 ${styles.container}`}
      style={({ pressed }) => ({
        opacity: pressed ? 0.94 : 1,
        transform: [{ scale: pressed ? 0.99 : 1 }],
      })}
    >
      <View className="flex-row items-center justify-between">
        <Text
          className={`text-sm font-semibold uppercase tracking-[2px] ${styles.eyebrow}`}
        >
          Prediction alert
        </Text>

        <View className={`rounded-full px-3 py-1 ${styles.badge}`}>
          <Text className="text-xs font-bold uppercase text-slate-950">
            {highlight.level}
          </Text>
        </View>
      </View>

      <Text className="mt-4 text-2xl font-extrabold leading-8 text-white">
        {styles.icon} {highlight.title}
      </Text>

      <Text className="mt-3 text-base leading-6 text-slate-200">
        {highlight.subtitle}
      </Text>

      {pressureChangeText ? (
        <View className={`mt-4 rounded-2xl border p-4 ${styles.detailBox}`}>
          <Text className="text-sm leading-6 text-slate-300">
            {pressureChangeText}
          </Text>
        </View>
      ) : null}

      <View
        className={`mt-5 self-start rounded-2xl border px-4 py-3 ${styles.button}`}
      >
        <Text className="text-sm font-semibold uppercase tracking-[1.5px] text-white">
          Open predictions
        </Text>
      </View>
    </Pressable>
  );
}