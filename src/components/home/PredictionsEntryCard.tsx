import { Pressable, Text, View } from "react-native";
import { BlurView } from "expo-blur";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

type Props = {
  enabledCount?: number;
};

export default function PredictionsEntryCard({ enabledCount = 0 }: Props) {
  return (
    <Pressable
      onPress={() => router.push("/predictions")}
      style={({ pressed }) => ({
        transform: [{ scale: pressed ? 0.98 : 1 }],
        opacity: pressed ? 0.95 : 1,
      })}
    >
      <BlurView
        intensity={18}
        tint="dark"
        style={{
          overflow: "hidden",
          borderRadius: 24,
        }}
      >
        <View className="rounded-3xl border border-cyan-400/20 bg-cyan-500/10 p-5">
          <View className="flex-row items-center justify-between">
            <Text className="text-xs font-medium uppercase tracking-[2px] text-cyan-300">
              Predictions
            </Text>

            <View className="rounded-full bg-slate-950/40 px-3 py-1 border border-white/10">
              <Text className="text-xs font-semibold uppercase tracking-[1px] text-slate-300">
                Active: {enabledCount}
              </Text>
            </View>
          </View>

          <Text className="mt-3 text-xl font-semibold leading-7 text-white">
            🧠 Personal symptom predictions
          </Text>

          <Text className="mt-2 text-sm leading-6 text-slate-300">
            See forecast-based predictions built from your symptom history.
          </Text>

          {/* CTA */}
          <View className="mt-4 self-start overflow-hidden rounded-2xl">
            <LinearGradient
              colors={["#22d3ee", "#06b6d4", "#8b5cf6"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                borderRadius: 16,
                paddingHorizontal: 16,
                paddingVertical: 10,
              }}
            >
              <Text className="text-xs font-semibold uppercase tracking-[2px] text-slate-950">
                Open predictions →
              </Text>
            </LinearGradient>
          </View>
        </View>
      </BlurView>
    </Pressable>
  );
}