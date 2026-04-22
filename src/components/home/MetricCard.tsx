import { Text, View } from "react-native";

type Props = {
  title: string;
  value: string;
};

export default function MetricCard({ title, value }: Props) {
  return (
    <View className="rounded-3xl border border-slate-800 bg-slate-900 p-5">
      <Text className="text-sm text-slate-400">{title}</Text>
      <Text className="mt-2 text-2xl font-semibold text-white">{value}</Text>
    </View>
  );
}