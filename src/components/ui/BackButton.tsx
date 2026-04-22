import { Pressable, Text, View } from "react-native";
import { router } from "expo-router";
import { BlurView } from "expo-blur";

type Props = {
  fallbackHref?: "/(tabs)/home" | "/(tabs)/history" | "/(tabs)/add-entry";
};

export default function BackButton({
  fallbackHref = "/(tabs)/home",
}: Props) {
  function handlePress() {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace(fallbackHref);
  }

  return (
    <BlurView
      intensity={18}
      tint="dark"
      style={{
        overflow: "hidden",
        borderRadius: 999,
        alignSelf: "flex-start",
      }}
    >
      <Pressable onPress={handlePress}>
        {({ pressed }) => (
          <View
            className={`flex items-center justify-center rounded-xl border border-white/20 bg-slate-950/55 px-5 py-2 ${
              pressed ? "opacity-50" : "opacity-100"
            }`}
          >
            <Text className="mr-1 text-base tracking-widest text-slate-300">
              ← Back
            </Text>
          </View>
        )}
      </Pressable>
    </BlurView>
  );
}