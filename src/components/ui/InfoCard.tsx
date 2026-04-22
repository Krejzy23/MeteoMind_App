import { ReactNode } from "react";
import { StyleProp, Text, View, ViewStyle } from "react-native";
import { BlurView } from "expo-blur";

type Props = {
  title?: string;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  style?: StyleProp<ViewStyle>;
  blurIntensity?: number;
};

export default function InfoCard({
  title,
  children,
  className = "",
  contentClassName = "",
  style,
  blurIntensity = 20,
}: Props) {
  return (
    <BlurView
      intensity={blurIntensity}
      tint="dark"
      style={{
        overflow: "hidden",
        borderRadius: 24,
      }}
    >
      <View
        className={`rounded-3xl border border-white/10 bg-slate-900/45 p-4 ${className}`}
        style={style}
      >
        {title ? (
          <Text className="text-xs font-medium uppercase tracking-[2px] text-cyan-300">
            {title}
          </Text>
        ) : null}

        <View className={title ? `mt-2 ${contentClassName}` : contentClassName}>
          {children}
        </View>
      </View>
    </BlurView>
  );
}