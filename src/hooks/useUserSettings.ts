import { useCallback, useEffect, useState } from "react";
import {
  getUserSettings,
  saveUserSettings,
} from "@/services/firebase/firestore";
import { UserSettings } from "@/types/user";

const DEFAULT_SETTINGS: UserSettings = {
  forecastAlertsEnabled: true,
  predictionHighlightEnabled: true,
  dailySummaryEnabled: false,
  temperatureUnit: "celsius",
};

export function useUserSettings(userId?: string) {
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSettings = useCallback(async () => {
    if (!userId) {
      setSettings(DEFAULT_SETTINGS);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const data = await getUserSettings(userId);
      setSettings(data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load settings";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const updateSettings = useCallback(
    async (patch: Partial<UserSettings>) => {
      if (!userId) return;

      const nextSettings = {
        ...settings,
        ...patch,
      };

      try {
        setSaving(true);
        setError(null);
        setSettings(nextSettings);

        await saveUserSettings(userId, nextSettings);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to save settings";
        setError(message);
      } finally {
        setSaving(false);
      }
    },
    [userId, settings]
  );

  return {
    settings,
    loading,
    saving,
    error,
    reload: loadSettings,
    updateSettings,
  };
}