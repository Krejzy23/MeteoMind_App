import { Text, View } from "react-native";
import Slider from "@react-native-community/slider";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";

type Props = {
  value: number;
  onChange: (value: number) => void;
};

function getIntensityLabel(value: number) {
  if (value <= 2) return "Very mild";
  if (value <= 4) return "Mild";
  if (value <= 6) return "Moderate";
  if (value <= 8) return "Strong";
  return "Severe";
}

function getIntensityEmoji(value: number) {
  if (value <= 2) return "😌";
  if (value <= 4) return "🙂";
  if (value <= 6) return "😐";
  if (value <= 8) return "😣";
  return "🤯";
}

export default function IntensitySlider({ value, onChange }: Props) {
  return (
    <BlurView
      intensity={18}
      tint="dark"
      style={{
        overflow: "hidden",
        borderRadius: 24,
      }}
    >
      <View className="rounded-3xl border border-white/10 bg-slate-900/45 p-5">
        <Text className="text-xs font-medium uppercase tracking-[2px] text-cyan-300">
          Intensity
        </Text>

        <View className="mt-4 flex-row items-center justify-between">
          <View>
            <Text className="text-base font-medium text-white">
              {getIntensityLabel(value)}
            </Text>
            <Text className="mt-1 text-sm text-slate-400">
              How strong does it feel right now?
            </Text>
          </View>

          <View className="flex-row items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3">
            <Text className="text-2xl">{getIntensityEmoji(value)}</Text>
            <Text className="text-xl font-semibold text-white">{value}/10</Text>
          </View>
        </View>

        <View className="mt-5 rounded-2xl border border-white/8 bg-slate-950/35 px-4 py-4">
          <View>
            <LinearGradient
              colors={["#22c55e", "#eab308", "#f97316", "#ef4444"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                position: "absolute",
                top: 17,
                left: 0,
                right: 0,
                height: 6,
                borderRadius: 999,
              }}
            />

            <Slider
              minimumValue={0}
              maximumValue={10}
              step={1}
              value={value}
              onValueChange={onChange}
              minimumTrackTintColor="transparent"
              maximumTrackTintColor="transparent"
              thumbTintColor="#22d3ee"
              style={{ height: 40 }}
            />
          </View>

          <View className="mt-1 flex-row justify-between">
            <Text className="text-sm text-slate-500">0</Text>
            <Text className="text-sm text-slate-500">10</Text>
          </View>
        </View>
      </View>
    </BlurView>
  );
}