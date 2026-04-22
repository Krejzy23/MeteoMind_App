import { useMemo, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { saveSymptomEntry } from "@/services/firebase/firestore";
import { useAuth } from "@/hooks/useAuth";
import { useWeather } from "@/hooks/useWeather";
import { useLocationName } from "@/hooks/useLocationName";
import { SymptomType } from "@/types/symptoms";
import IntensitySlider from "@/components/symptoms/IntensitySlider";
import BackButton from "@/components/ui/BackButton";
import ScreenBackground from "@/components/ui/ScreenBackground";

const SYMPTOMS: { key: SymptomType; label: string; emoji: string }[] = [
  { key: "dizziness", label: "Dizziness", emoji: "😵‍💫" },
  { key: "fatigue", label: "Fatigue", emoji: "😴" },
  { key: "migraine", label: "Migraine", emoji: "🧠" },
  { key: "joint_pain", label: "Joint pain", emoji: "🦴" },
  { key: "nausea", label: "Nausea", emoji: "🤢" },
  { key: "headache", label: "Headache", emoji: "🤕" },
];

export default function AddEntryScreen() {
  const { data, location, loading, error, refetch } = useWeather();
  const { user } = useAuth();

  const { locationName, loading: locationLoading } = useLocationName(
    location?.latitude,
    location?.longitude
  );

  const [selectedSymptoms, setSelectedSymptoms] = useState<SymptomType[]>([]);
  const [intensity, setIntensity] = useState(5);
  const [note, setNote] = useState("");

  const canSave = useMemo(() => {
    return (
      !!user &&
      selectedSymptoms.length > 0 &&
      !!location &&
      !!data &&
      !loading &&
      !Number.isNaN(Number(intensity))
    );
  }, [user, selectedSymptoms, location, data, loading, intensity]);

  function toggleSymptom(symptom: SymptomType) {
    setSelectedSymptoms((prev) =>
      prev.includes(symptom)
        ? prev.filter((item) => item !== symptom)
        : [...prev, symptom]
    );
  }

  async function handleSave() {
    if (!user) {
      Alert.alert("Not signed in", "Please sign in first.");
      return;
    }

    if (!data || !location) {
      Alert.alert(
        "Missing weather data",
        "Weather data is not available yet. Try refreshing this screen."
      );
      return;
    }

    const parsedIntensity = intensity;

    if (
      Number.isNaN(parsedIntensity) ||
      parsedIntensity < 0 ||
      parsedIntensity > 10
    ) {
      Alert.alert(
        "Invalid intensity",
        "Please enter a number between 0 and 10."
      );
      return;
    }

    const payload = {
      symptoms: selectedSymptoms,
      intensity: parsedIntensity,
      note: note.trim(),
      createdAt: new Date().toISOString(),
      pressure: data.current.pressure,
      pressureDelta3h: data.trend.delta3h,
      pressureDelta6h: data.trend.delta6h,
      pressureDelta12h: data.trend.delta12h,
      temperature: data.current.temperature,
      weatherCode: data.current.weatherCode,
      latitude: location.latitude,
      longitude: location.longitude,
    };

    try {
      await saveSymptomEntry(user.uid, payload);

      setSelectedSymptoms([]);
      setIntensity(5);
      setNote("");

      router.replace("/(tabs)/history");
    } catch (saveError) {
      const message =
        saveError instanceof Error
          ? saveError.message
          : "Failed to save entry.";

      Alert.alert("Save failed", message);
    }
  }

  return (
    <ScreenBackground>
      <View className="flex-1">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            showsVerticalScrollIndicator={false}
          >
            <View className="pt-10">
              <View className="mb-8">
                <BackButton />
              </View>

              <Text className="text-3xl font-bold uppercase tracking-tight text-white">
                New entry
              </Text>

              <Text className="mt-2 uppercase text-sm leading-6 text-slate-400">
                Save symptoms with current pressure and weather
              </Text>
            </View>

            {error ? (
              <BlurView
                intensity={20}
                tint="dark"
                style={{
                  overflow: "hidden",
                  borderRadius: 16,
                  marginTop: 16,
                }}
              >
                <View className="rounded-2xl border border-red-900/70 bg-red-950/50 p-4">
                  <Text className="text-red-200">{error}</Text>

                  <Pressable
                    onPress={refetch}
                    className="mt-3 overflow-hidden rounded-xl"
                  >
                    <LinearGradient
                      colors={["#ef4444", "#dc2626"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={{
                        borderRadius: 12,
                        paddingHorizontal: 16,
                        paddingVertical: 12,
                      }}
                    >
                      <Text className="text-center font-medium text-white">
                        Retry weather load
                      </Text>
                    </LinearGradient>
                  </Pressable>
                </View>
              </BlurView>
            ) : null}

            <BlurView
              intensity={18}
              tint="dark"
              style={{
                overflow: "hidden",
                borderRadius: 24,
                marginTop: 16,
              }}
            >
              <View className="rounded-3xl border border-white/10 bg-slate-900/45 p-5">
                <Text className="text-xs font-medium uppercase tracking-[2px] text-cyan-300">
                  Symptoms
                </Text>

                <View className="mt-4 flex-row flex-wrap gap-2">
                  {SYMPTOMS.map((item) => {
                    const active = selectedSymptoms.includes(item.key);

                    return (
                      <Pressable
                        key={item.key}
                        onPress={() => toggleSymptom(item.key)}
                        className={`rounded-2xl border px-3 py-3 ${
                          active
                            ? "border-cyan-300 bg-cyan-400"
                            : "border-white/10 bg-slate-950/40"
                        }`}
                      >
                        <View className="flex-row items-center gap-2">
                          <Text className="text-xl">{item.emoji}</Text>
                          <Text
                            className={
                              active
                                ? "font-medium text-slate-950"
                                : "font-medium text-white"
                            }
                          >
                            {item.label}
                          </Text>
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            </BlurView>

            <View className="mt-4">
              <IntensitySlider value={intensity} onChange={setIntensity} />
            </View>

            <BlurView
              intensity={18}
              tint="dark"
              style={{
                overflow: "hidden",
                borderRadius: 24,
                marginTop: 16,
              }}
            >
              <View className="rounded-3xl border border-white/10 bg-slate-900/45 p-5">
                <Text className="text-xs font-medium uppercase tracking-[2px] text-cyan-300">
                  Note
                </Text>

                <TextInput
                  value={note}
                  onChangeText={setNote}
                  multiline
                  numberOfLines={4}
                  placeholder="Describe how you feel..."
                  placeholderTextColor="#94a3b8"
                  className="mt-4 rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-white"
                  style={{ minHeight: 100, textAlignVertical: "top" }}
                />
              </View>
            </BlurView>

            <BlurView
              intensity={18}
              tint="dark"
              style={{
                overflow: "hidden",
                borderRadius: 24,
                marginTop: 16,
              }}
            >
              <View className="rounded-3xl border border-green-400/20 bg-green-500/10 p-5">
                <View className="flex-row items-center justify-between">
                  <Text className="text-xs font-medium uppercase tracking-[2px] text-green-300">
                    Weather snapshot
                  </Text>

                  <View className="rounded-full border border-green-300/20 bg-green-300/10 px-3 py-1">
                    <Text className="text-xs font-bold uppercase text-green-200">
                      Live
                    </Text>
                  </View>
                </View>

                <View className="mt-4 rounded-2xl border border-white/8 bg-slate-950/35 px-4 py-4">
                  <View className="flex-row items-center justify-between">
                    <Text className="text-slate-300">Pressure</Text>
                    <Text className="font-semibold text-white">
                      {data?.current.pressure != null
                        ? `${data.current.pressure.toFixed(1)} hPa`
                        : "N/A"}
                    </Text>
                  </View>

                  <View className="my-3 h-px bg-white/5" />

                  <View className="flex-row items-center justify-between">
                    <Text className="text-slate-300">Delta 3h</Text>
                    <Text className="font-semibold text-white">
                      {data?.trend.delta3h != null
                        ? `${data.trend.delta3h.toFixed(1)} hPa`
                        : "N/A"}
                    </Text>
                  </View>

                  <View className="my-3 h-px bg-white/5" />

                  <View className="flex-row items-center justify-between">
                    <Text className="text-slate-300">Delta 6h</Text>
                    <Text className="font-semibold text-white">
                      {data?.trend.delta6h != null
                        ? `${data.trend.delta6h.toFixed(1)} hPa`
                        : "N/A"}
                    </Text>
                  </View>

                  <View className="my-3 h-px bg-white/5" />

                  <View className="flex-row items-center justify-between">
                    <Text className="text-slate-300">Temperature</Text>
                    <Text className="font-semibold text-white">
                      {data?.current.temperature != null
                        ? `${data.current.temperature.toFixed(1)} °C`
                        : "N/A"}
                    </Text>
                  </View>

                  <View className="my-3 h-px bg-white/5" />

                  <View className="flex-row items-start justify-between">
                    <Text className="text-slate-300">Location</Text>

                    <View className="ml-4 flex-1 items-end">
                      <Text className="text-right font-semibold text-white">
                        {locationLoading
                          ? "Fetching location..."
                          : locationName
                          ? `📍 ${locationName.city ?? "Unknown"}, ${
                              locationName.country ?? ""
                            }`
                          : location
                          ? `${location.latitude.toFixed(
                              4
                            )}, ${location.longitude.toFixed(4)}`
                          : "N/A"}
                      </Text>

                      {location && !locationLoading ? (
                        <Text className="mt-1 text-right text-xs text-slate-500">
                          {location.latitude.toFixed(4)},{" "}
                          {location.longitude.toFixed(4)}
                        </Text>
                      ) : null}
                    </View>
                  </View>
                </View>
              </View>
            </BlurView>
            <Pressable
              onPress={handleSave}
              disabled={!canSave}
              className="mt-6 mb-8 overflow-hidden rounded-2xl"
            >
              <LinearGradient
                colors={
                  canSave
                    ? ["#22d3ee", "#06b6d4", "#8b5cf6"]
                    : ["#475569", "#334155"]
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                  borderRadius: 16,
                  paddingHorizontal: 20,
                  paddingVertical: 16,
                  opacity: canSave ? 1 : 0.75,
                }}
              >
                <Text className="text-center font-semibold text-slate-950">
                  {user ? "Save entry" : "Sign in to save"}
                </Text>
              </LinearGradient>
            </Pressable>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </ScreenBackground>
  );
}
