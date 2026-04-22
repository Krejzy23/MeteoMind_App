import { Pressable, ScrollView, Text, View } from "react-native";
import { getSymptomMeta } from "@/utils/symptoms";

export type FilterType =
  | "all"
  | "headache"
  | "migraine"
  | "joint_pain"
  | "nausea"
  | "dizziness"
  | "fatigue";

const FILTERS: { key: FilterType }[] = [
  { key: "all" },
  { key: "headache" },
  { key: "migraine" },
  { key: "joint_pain" },
  { key: "nausea" },
  { key: "dizziness" },
  { key: "fatigue" },
];

type Props = {
  selectedFilter: FilterType;
  onSelect: (filter: FilterType) => void;
};

function getFilterColor(filter: FilterType) {
  switch (filter) {
    case "migraine":
      return "#f43f5e";
    case "headache":
      return "#f97316";
    case "joint_pain":
      return "#a855f7";
    case "nausea":
      return "#eab308";
    case "dizziness":
      return "#84cc16";
    case "fatigue":
      return "#3b82f6";
    default:
      return "#22d3ee";
  }
}

export default function SymptomFilterCard({ selectedFilter, onSelect }: Props) {
  return (
    <View className="rounded-2xl border border-white/8 bg-slate-950/25 p-4">
      <Text className="text-xs font-medium uppercase tracking-[2px] text-cyan-300">
        Filter symptom markers
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 12, paddingRight: 12 }}
      >
        <View className="flex-row gap-2">
          {FILTERS.map((filter) => {
            const active = selectedFilter === filter.key;
            const color = getFilterColor(filter.key);

            const meta =
              filter.key === "all"
                ? { label: "All", emoji: "📊" }
                : getSymptomMeta(filter.key);

            return (
              <Pressable key={filter.key} onPress={() => onSelect(filter.key)}>
                {({ pressed }) => (
                  <View
                    className={`rounded-2xl border px-3 py-2 ${
                      pressed ? "opacity-80" : "opacity-100"
                    }`}
                    style={{
                      backgroundColor: active
                        ? `${color}33`
                        : "rgba(2, 6, 23, 0.4)",
                      borderColor: active ? color : "rgba(255,255,255,0.10)",
                    }}
                  >
                    <View className="flex-row items-center gap-2">
                      <Text className="text-sm">{meta.emoji}</Text>

                      <Text
                        style={{ color: active ? color : "#ffffff" }}
                        className="font-medium"
                      >
                        {meta.label}
                      </Text>
                    </View>
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}
