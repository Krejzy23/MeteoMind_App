import { useState } from "react";
import { Alert, ScrollView, Switch, Text, View } from "react-native";
import { signOut } from "firebase/auth";
import SettingsRow from "@/components/settings/SettingsRow";
import SettingsSection from "@/components/settings/SettingsSection";
import { auth } from "@/services/firebase/config";
import { useAuth } from "@/hooks/useAuth";
import { useUserSettings } from "@/hooks/useUserSettings";
import { deleteAllSymptomEntries } from "@/services/firebase/firestore";
import { getAllSymptomEntries } from "@/services/firebase/firestore";
import { buildEntriesCsv } from "@/utils/exportCsv";
import { exportCsvFile } from "@/services/storage/exportService";
import BackButton from "@/components/ui/BackButton";
import ScreenBackground from "@/components/ui/ScreenBackground";

export default function SettingsScreen() {
  const { user } = useAuth();

  const { settings, loading, saving, error, updateSettings } = useUserSettings(
    user?.uid
  );

  const [deletingAll, setDeletingAll] = useState(false);

  async function handleLogout() {
    try {
      await signOut(auth);
    } catch {
      Alert.alert("Logout failed", "Please try again.");
    }
  }

  async function handleExport() {
    if (!user) {
      Alert.alert("Not signed in", "Please sign in first.");
      return;
    }

    try {
      const entries = await getAllSymptomEntries(user.uid);

      if (entries.length === 0) {
        Alert.alert("No data", "There are no entries to export.");
        return;
      }

      const csv = buildEntriesCsv(entries);

      const date = new Date().toISOString().slice(0, 10);
      const fileName = `meteo-app-entries-${date}.csv`;

      await exportCsvFile(fileName, csv);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to export data.";

      Alert.alert("Export failed", message);
    }
  }

  function handleDeleteAll() {
    if (!user) {
      Alert.alert("Not signed in", "Please sign in first.");
      return;
    }

    Alert.alert(
      "Delete all entries",
      "This will permanently delete all your symptom entries. This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete all",
          style: "destructive",
          onPress: async () => {
            try {
              setDeletingAll(true);

              const deletedCount = await deleteAllSymptomEntries(user.uid);

              if (deletedCount === 0) {
                Alert.alert("No entries", "There are no entries to delete.");
                return;
              }

              Alert.alert(
                "Entries deleted",
                `${deletedCount} entr${
                  deletedCount === 1 ? "y has" : "ies have"
                } been deleted.`
              );
            } catch (error) {
              const message =
                error instanceof Error
                  ? error.message
                  : "Failed to delete entries.";

              Alert.alert("Delete failed", message);
            } finally {
              setDeletingAll(false);
            }
          },
        },
      ]
    );
  }

  return (
    <ScreenBackground>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, gap: 16 }}
      >
        <View className="pt-10">
          <View className="mb-10">
            <BackButton />
          </View>
          <Text className="text-3xl tracking-tight font-bold uppercase text-white">
            Settings
          </Text>
          <Text className="mt-2 uppercase text-sm leading-6 text-slate-400">
            Manage your account, alerts and app preferences
          </Text>
        </View>

        {error ? (
          <View className="rounded-2xl border border-red-900 bg-red-950 p-4">
            <Text className="text-red-200">{error}</Text>
          </View>
        ) : null}

        <SettingsSection title="Account">
          <SettingsRow label="Signed in as" value={user?.email ?? "Unknown"} />
          <SettingsRow label="Log out" onPress={handleLogout} danger />
        </SettingsSection>

        <SettingsSection title="Notifications">
          <SettingsRow
            label="Forecast alerts"
            right={
              <Switch
                value={settings.predictionHighlightEnabled}
                onValueChange={(value) =>
                  updateSettings({ predictionHighlightEnabled: value })
                }
                disabled={loading || saving}
                trackColor={{ false: "#334155", true: "#06b6d4" }}
                thumbColor={
                  settings.forecastAlertsEnabled ? "#ffffff" : "#cbd5e1"
                }
              />
            }
          />

          <SettingsRow
            label="Prediction highlight on Home"
            right={
              <Switch
                value={settings.forecastAlertsEnabled}
                onValueChange={(value) =>
                  updateSettings({ forecastAlertsEnabled: value })
                }
                disabled={loading || saving}
                trackColor={{ false: "#334155", true: "#06b6d4" }}
                thumbColor={
                  settings.forecastAlertsEnabled ? "#ffffff" : "#cbd5e1"
                }
              />
            }
          />

          <SettingsRow
            label="Daily summary"
            right={
              <Switch
                value={settings.dailySummaryEnabled}
                onValueChange={(value) =>
                  updateSettings({ dailySummaryEnabled: value })
                }
                disabled={loading || saving}
                trackColor={{ false: "#334155", true: "#06b6d4" }}
                thumbColor={
                  settings.forecastAlertsEnabled ? "#ffffff" : "#cbd5e1"
                }
              />
            }
          />
        </SettingsSection>

        <SettingsSection title="Data">
          <SettingsRow label="Export data" onPress={handleExport} />
          <SettingsRow
            label={deletingAll ? "Deleting entries..." : "Delete all entries"}
            onPress={deletingAll ? undefined : handleDeleteAll}
            danger
          />
        </SettingsSection>

        <SettingsSection title="About">
          <SettingsRow label="App version" value="1.3.0" />
          <View className="rounded-2xl bg-slate-800 px-4 py-4">
            <Text className="text-slate-300">
              MeteoMind helps you track atmospheric pressure, symptoms and
              personal weather triggers.
            </Text>
          </View>
        </SettingsSection>
      </ScrollView>
    </ScreenBackground>
  );
}
