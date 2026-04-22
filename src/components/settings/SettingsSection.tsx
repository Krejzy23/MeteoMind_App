import { ReactNode } from "react";
import { Text, View } from "react-native";
import { BlurView } from "expo-blur";

type Props = {
  title: string;
  children: ReactNode;
};

export default function SettingsSection({ title, children }: Props) {
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
          {title}
        </Text>

        <View className="mt-4 gap-3">{children}</View>
      </View>
    </BlurView>
  );
}