import { ReactNode, useRef } from "react";
import { View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView, BlurTargetView } from "expo-blur";

type Props = {
  children: ReactNode;
};

export default function ScreenBackground({ children }: Props) {
  const blurTargetRef = useRef<View | null>(null);

  return (
    <View style={{ flex: 1, backgroundColor: "#020617" }}>
      <BlurTargetView
        ref={blurTargetRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      >
        <LinearGradient
          colors={["#020617", "#0f172a", "#111827"]}
          style={{ flex: 1 }}
        >
          <LinearGradient
            colors={[
              "rgba(6,182,212,0.50)",
              "rgba(139,92,246,0.24)",
              "transparent",
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              position: "absolute",
              top: -140,
              left: -120,
              width: 420,
              height: 420,
              borderRadius: 999,
            }}
          />

          <LinearGradient
            colors={[
              "rgba(139,92,246,0.42)",
              "rgba(6,182,212,0.18)",
              "transparent",
            ]}
            start={{ x: 1, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={{
              position: "absolute",
              bottom: -160,
              right: -120,
              width: 420,
              height: 420,
              borderRadius: 999,
            }}
          />

          <LinearGradient
            colors={[
              "rgba(34,211,238,0.14)",
              "rgba(139,92,246,0.08)",
              "transparent",
            ]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={{
              position: "absolute",
              top: 150,
              left: 70,
              width: 240,
              height: 240,
              borderRadius: 999,
            }}
          />
        </LinearGradient>
      </BlurTargetView>

      <BlurView
        blurTarget={blurTargetRef}
        blurMethod="dimezisBlurViewSdk31Plus"
        intensity={85}
        tint="dark"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      />

      <LinearGradient
        colors={[
          "rgba(255,255,255,0.05)",
          "transparent",
          "rgba(255,255,255,0.02)",
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      />

      <View style={{ flex: 1 }}>
        {children}
      </View>
    </View>
  );
}