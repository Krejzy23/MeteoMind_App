import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { loginWithEmail } from "@/services/firebase/auth";
import ScreenBackground from "@/components/ui/ScreenBackground";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSub = Keyboard.addListener(showEvent, () =>
      setKeyboardVisible(true)
    );
    const hideSub = Keyboard.addListener(hideEvent, () =>
      setKeyboardVisible(false)
    );

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  async function handleLogin() {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Missing fields", "Enter email and password.");
      return;
    }

    try {
      setSubmitting(true);
      await loginWithEmail(email.trim(), password);
      router.replace("/(tabs)/home");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Login failed";
      Alert.alert("Login failed", message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ScreenBackground>
      <View className="flex-1 mt-10">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            showsVerticalScrollIndicator={false}
          >
            <View
              className={`flex-1 px-6 ${
                keyboardVisible
                  ? "justify-start pt-6 pb-8"
                  : "justify-center pb-8"
              }`}
            >
              <View className={keyboardVisible ? "mb-2" : "mb-4"}>
                <View className="flex-row items-center gap-3">
                  <View>
                    <View className="flex-row items-center justify-center">
                      <Text
                        className={`font-bold tracking-tight text-white ${
                          keyboardVisible ? "text-4xl" : "text-6xl"
                        }`}
                      >
                        MeteoMind
                      </Text>

                      {!keyboardVisible ? (
                        <Image
                          source={require("../../../assets/mind_hero.png")}
                          className="h-40 w-40 pb-4"
                          resizeMode="contain"
                        />
                      ) : (
                        <Image
                          source={require("../../../assets/mind_hero.png")}
                          className="h-20 w-20"
                          resizeMode="contain"
                        />
                      )}
                    </View>

                    <Text
                      className={`font-medium uppercase tracking-widest text-base text-cyan-300 ${
                        keyboardVisible ? "-mt-3 text-xs" : "-mt-8 text-base"
                      }`}
                    >
                      Understand your weather sensitivity
                    </Text>
                  </View>
                </View>

                {!keyboardVisible ? (
                  <>
                    <Text className="mt-4 max-w-[300px] text-sm leading-6 uppercase text-slate-400">
                      Track pressure changes, symptoms, and personal weather
                      sensitivity patterns.
                    </Text>

                    <Text className="mt-8 text-2xl font-bold tracking-tight text-white">
                      Sign in
                    </Text>

                  </>
                ) : (
                  <>
                    <Text className="mt-3 text-xl font-bold tracking-tight text-white">
                      Sign in
                    </Text>

                    <Text className="mt-1 max-w-[300px] text-sm leading-5 text-slate-400">
                      Continue to your account.
                    </Text>
                  </>
                )}
              </View>
              <View className="rounded-3xl border border-white/10 bg-slate-900/55 p-6">
                <View>
                  <Text className="mb-2 text-sm font-medium text-slate-300">
                    Email
                  </Text>
                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    placeholder="you@example.com"
                    placeholderTextColor="#64748b"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    autoCorrect={false}
                    returnKeyType="next"
                    className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-4 text-white"
                  />
                </View>

                <View className="mt-4">
                  <Text className="mb-2 text-sm font-medium text-slate-300">
                    Password
                  </Text>
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Enter your password"
                    placeholderTextColor="#64748b"
                    secureTextEntry
                    returnKeyType="done"
                    onSubmitEditing={handleLogin}
                    className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-4 text-white"
                  />
                </View>

                <Pressable
                  onPress={handleLogin}
                  disabled={submitting}
                  className={`mt-6 overflow-hidden rounded-2xl ${
                    submitting ? "opacity-70" : "opacity-100"
                  }`}
                >
                  <LinearGradient
                    colors={["#22d3ee", "#06b6d4", "#8b5cf6"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{
                      borderRadius: 16,
                      paddingHorizontal: 20,
                      paddingVertical: 16,
                    }}
                  >
                    <Text className="text-center text-base font-semibold text-slate-950">
                      {submitting ? "Signing in..." : "Sign in"}
                    </Text>
                  </LinearGradient>
                </Pressable>

                <Pressable
                  onPress={() => router.push("/(auth)/register")}
                  className="mt-5"
                >
                  <Text className="text-center text-sm text-slate-400">
                    Don&apos;t have an account?{" "}
                    <Text className="font-semibold text-cyan-400">
                      Register
                    </Text>
                  </Text>
                </Pressable>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </ScreenBackground>
  );
}
