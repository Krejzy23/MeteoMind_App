export type SymptomType =
  | "headache"
  | "migraine"
  | "joint_pain"
  | "nausea"
  | "dizziness"
  | "fatigue";

export interface SymptomEntryInput {
  symptoms: SymptomType[];
  intensity: number;
  note?: string;
}

export interface SymptomEntry {
  id: string;
  createdAt: string;
  symptoms: SymptomType[];
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