import { useCallback, useEffect, useState } from "react";
import { getSymptomEntryById } from "@/services/firebase/firestore";

export interface SymptomEntryDetail {
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

export function useSymptomEntry(userId: string, entryId?: string) {
  const [entry, setEntry] = useState<SymptomEntryDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEntry = useCallback(async () => {
    if (!userId) {
      setEntry(null);
      setError(null);
      setLoading(false);
      return;
    }

    if (!entryId) {
      setEntry(null);
      setError("Missing entry ID");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const data = await getSymptomEntryById(userId, entryId);
      setEntry(data as SymptomEntryDetail);
    } catch (err) {
      setEntry(null);

      const message =
        err instanceof Error ? err.message : "Failed to load entry";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [userId, entryId]);

  useEffect(() => {
    fetchEntry();
  }, [fetchEntry]);

  return {
    entry,
    loading,
    error,
    refetch: fetchEntry,
  };
}