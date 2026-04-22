import { useCallback, useEffect, useState } from "react";
import { getSymptomEntries } from "@/services/firebase/firestore";

export interface SymptomEntryItem {
  id: string;
  createdAt: string;
  symptoms: string[];
  intensity: number;
  note?: string;
  pressure: number | null;
  pressureDelta3h: number | null;
  pressureDelta6h: number | null;
  pressureDelta12h: number | null;
  temperature: number | null;
  weatherCode: number | null;
  latitude: number;
  longitude: number;
}

export function useSymptomEntries(userId: string) {
  const [entries, setEntries] = useState<SymptomEntryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEntries = useCallback(async () => {
    if (!userId) {
      setEntries([]);
      setError(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const data = await getSymptomEntries(userId);
      setEntries(data as SymptomEntryItem[]);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load entries";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  return {
    entries,
    loading,
    error,
    refetch: fetchEntries,
  };
}