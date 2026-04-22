import { SymptomType } from "@/types/symptoms";

export function getSymptomMeta(symptom: string): {
  label: string;
  emoji: string;
} {
  switch (symptom as SymptomType) {
    case "headache":
      return { label: "Headache", emoji: "🤕" };
    case "dizziness":
      return { label: "Dizziness", emoji: "😵‍💫" };
    case "migraine":
      return { label: "Migraine", emoji: "🧠" };
    case "joint_pain":
      return { label: "Joint pain", emoji: "🦴" };
    case "nausea":
      return { label: "Nausea", emoji: "🤢" };
    case "fatigue":
      return { label: "Fatigue", emoji: "😴" };
    default:
      return { label: symptom.replaceAll("_", " "), emoji: "•" };
  }
}

export function formatSymptomsWithEmoji(symptoms?: string[]) {
  if (!symptoms?.length) return "N/A";

  return symptoms
    .map((symptom) => {
      const meta = getSymptomMeta(symptom);
      return `${meta.emoji} ${meta.label}`;
    })
    .join(", ");
}