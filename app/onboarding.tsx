import { useEffect, useMemo, useRef, useState } from "react";
import { Alert, Animated, Image, Pressable, Text, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import { router } from "expo-router";
import { VideoView, useVideoPlayer } from "expo-video";

import ScreenBackground from "@/components/ui/ScreenBackground";
import { useAuth } from "@/hooks/useAuth";

function getOnboardingKey(userId: string) {
  return `onboarding_completed_${userId}`;
}

type OnboardingStep = {
  id: number;
  eyebrow: string;
  title: string;
  description: string;
  image?: any;
  video?: any;
  primaryLabel: string;
  secondaryLabel?: string;
};

type OnboardingVideoProps = {
  source: any;
  activeKey: string | number;
};

function OnboardingVideo({ source, activeKey }: OnboardingVideoProps) {
  const player = useVideoPlayer(source, (player) => {
    player.loop = true;
    player.muted = true;
    player.play();
  });

  useEffect(() => {
    player.play();
  }, [player, activeKey]);

  return (
    <VideoView
      player={player}
      style={{ width: 350, height: 220 }}
      contentFit="contain"
      nativeControls={false}
    />
  );
}

export default function OnboardingScreen() {
  const { user } = useAuth();

  const [stepIndex, setStepIndex] = useState(0);
  const [requestingLocation, setRequestingLocation] = useState(false);

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const translateAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const steps = useMemo<OnboardingStep[]>(
    () => [
      {
        id: 1,
        eyebrow: "Welcome",
        title: "Track symptoms. Understand pressure.",
        description:
          "MeteoMind helps you discover how atmospheric pressure and weather changes may affect your body.",
        video: require("../assets/understand.mp4"),
        primaryLabel: "Continue",
      },
      {
        id: 2,
        eyebrow: "Symptom journal",
        title: "Log symptoms in seconds",
        description:
          "Track migraine, headache, dizziness, nausea, joint pain, fatigue, intensity, and notes to build your personal history.",
        video: require("../assets/entrySymptom.mp4"),
        primaryLabel: "Continue",
      },
      {
        id: 3,
        eyebrow: "Location",
        title: "Enable location for accurate pressure data",
        description:
          "Your location helps MeteoMind show local pressure, forecast trends, and more accurate insights.",
        image: require("../assets/location.png"),
        primaryLabel: "Enable location",
        secondaryLabel: "Maybe later",
      },
      {
        id: 4,
        eyebrow: "Predictions",
        title: "Turn your history into insights",
        description:
          "As you save more entries, MeteoMind can detect personal patterns and help you anticipate difficult days.",
        video: require("../assets/predict.mp4"),
        primaryLabel: "Add first entry",
        secondaryLabel: "Go to dashboard",
      },
    ],
    []
  );

  const currentStep = steps[stepIndex];
  const isLastStep = stepIndex === steps.length - 1;
  const isLocationStep = currentStep.id === 3;
  const canGoBack = stepIndex > 0;

  useEffect(() => {
    fadeAnim.setValue(0);
    translateAnim.setValue(20);
    scaleAnim.setValue(0.98);

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(translateAnim, {
        toValue: 0,
        damping: 18,
        stiffness: 120,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        damping: 18,
        stiffness: 140,
        useNativeDriver: true,
      }),
    ]).start();
  }, [stepIndex, fadeAnim, translateAnim, scaleAnim]);

  async function completeOnboardingAndGo(
    path: "/(tabs)/home" | "/(tabs)/add-entry"
  ) {
    if (!user?.uid) {
      router.replace("/(auth)/login");
      return;
    }

    await AsyncStorage.setItem(getOnboardingKey(user.uid), "true");
    router.replace(path);
  }

  function animateOut(onComplete: () => void) {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(translateAnim, {
        toValue: -12,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.985,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onComplete();
    });
  }

  function goToNextStep() {
    if (isLastStep) {
      void completeOnboardingAndGo("/(tabs)/home");
      return;
    }

    animateOut(() => {
      setStepIndex((prev) => prev + 1);
    });
  }

  function goBack() {
    if (!canGoBack) return;

    animateOut(() => {
      setStepIndex((prev) => prev - 1);
    });
  }

  async function handleLocationPermission() {
    try {
      setRequestingLocation(true);

      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Location not enabled",
          "You can still use MeteoMind, but pressure and forecast data may be less accurate."
        );
      }

      animateOut(() => {
        setStepIndex((prev) => prev + 1);
      });
    } catch {
      Alert.alert(
        "Permission error",
        "Location permission could not be requested."
      );

      animateOut(() => {
        setStepIndex((prev) => prev + 1);
      });
    } finally {
      setRequestingLocation(false);
    }
  }

  function handlePrimaryPress() {
    if (isLocationStep) {
      void handleLocationPermission();
      return;
    }

    if (isLastStep) {
      void completeOnboardingAndGo("/(tabs)/add-entry");
      return;
    }

    goToNextStep();
  }

  function handleSecondaryPress() {
    if (currentStep.id === 3) {
      animateOut(() => {
        setStepIndex((prev) => prev + 1);
      });
      return;
    }

    if (currentStep.id === 4) {
      void completeOnboardingAndGo("/(tabs)/home");
    }
  }

  function handleSkip() {
    void completeOnboardingAndGo("/(tabs)/home");
  }

  return (
    <ScreenBackground>
      <View className="flex-1 px-6 pb-10 pt-16">
        <View className="flex-row items-center justify-between">
          <Pressable
            onPress={goBack}
            disabled={!canGoBack}
            className={`rounded-full border px-4 py-2 ${
              canGoBack
                ? "border-white/10 bg-white/5"
                : "border-white/5 bg-white/0"
            }`}
          >
            <Text
              className={`text-xs font-semibold uppercase tracking-[1.5px] ${
                canGoBack ? "text-slate-300" : "text-slate-600"
              }`}
            >
              Back
            </Text>
          </Pressable>

          <Text className="text-sm font-semibold uppercase tracking-[2px] text-cyan-300">
            MeteoMind
          </Text>

          <Pressable
            onPress={handleSkip}
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2"
          >
            <Text className="text-xs font-semibold uppercase tracking-[1.5px] text-slate-300">
              Skip
            </Text>
          </Pressable>
        </View>

        <View className="mt-5 flex-row items-center justify-between">
          <View className="flex-1 flex-row gap-2">
            {steps.map((step, index) => (
              <View
                key={step.id}
                className={`h-1 flex-1 rounded-full ${
                  index <= stepIndex ? "bg-cyan-400" : "bg-white/10"
                }`}
              />
            ))}
          </View>

          <Text className="ml-4 text-sm text-slate-400">
            {stepIndex + 1} / {steps.length}
          </Text>
        </View>

        <View className="flex-1 items-center mt-10">
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: translateAnim }, { scale: scaleAnim }],
              shadowColor: "#06b6d4",
              shadowOpacity: 0.08,
              shadowRadius: 24,
              shadowOffset: { width: 0, height: 8 },
            }}
            className="w-full rounded-[32px] border border-white/10 bg-slate-900/50 px-6 py-5"
          >
            <View className="items-center">
              <View className="mt-2  rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2">
                <Text className="text-xs font-bold uppercase tracking-[1.5px] text-cyan-300">
                  {currentStep.eyebrow}
                </Text>
              </View>

              <Text className="mt-6 mb-6 text-center text-4xl font-bold leading-tight text-white">
                {currentStep.title}
              </Text>
              <View className="rounded-[28px] border border-white/10 bg-black/20 px-2 py-2">
                {currentStep.video ? (
                  <OnboardingVideo
                    source={currentStep.video}
                    activeKey={currentStep.id}
                  />
                ) : currentStep.image ? (
                  <Image
                    source={currentStep.image}
                    resizeMode="contain"
                    className="h-[280px] w-[350px]"
                  />
                ) : null}
              </View>

              <Text className="mt-6 mb-6 max-w-[340px] text-center text-base leading-7 text-slate-200">
                {currentStep.description}
              </Text>
            </View>
          </Animated.View>
        </View>

        <View className="gap-3 mb-10">
          <Pressable
            onPress={handlePrimaryPress}
            disabled={requestingLocation}
            className={`rounded-2xl px-5 py-4 ${
              requestingLocation ? "bg-cyan-400/70" : "bg-cyan-400"
            }`}
          >
            <Text className="text-center text-base font-extrabold text-slate-950">
              {requestingLocation ? "Please wait..." : currentStep.primaryLabel}
            </Text>
          </Pressable>

          {currentStep.secondaryLabel ? (
            <Pressable
              onPress={handleSecondaryPress}
              className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4"
            >
              <Text className="text-center text-base font-semibold text-white">
                {currentStep.secondaryLabel}
              </Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    </ScreenBackground>
  );
}
