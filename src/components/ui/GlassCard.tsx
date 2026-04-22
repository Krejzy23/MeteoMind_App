import { ReactNode } from "react";
import { StyleProp, View, ViewStyle } from "react-native";
import { BlurView } from "expo-blur";

type Props = {
  children: ReactNode;
  className?: string;
  intensity?: number;
  style?: StyleProp<ViewStyle>;
};

export default function GlassCard({
  children,
  className = "",
  intensity = 30,
  style,
}: Props) {
  return (
    <BlurView
      intensity={intensity}
      tint="dark"
      style={{
        overflow: "hidden",
        borderRadius: 24,
      }}
    >
      <View
        className={`rounded-3xl border border-white/10 bg-slate-950/55 p-6 ${className}`}
        style={style}
      >
        {children}
      </View>
    </BlurView>
  );
}