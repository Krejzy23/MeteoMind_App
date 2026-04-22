type EntryLike = {
  id: string;
  createdAt?: string;
  symptoms?: string[];
  intensity?: number;
  note?: string;
  pressure?: number | null;
  pressureDelta3h?: number | null;
  pressureDelta6h?: number | null;
  pressureDelta12h?: number | null;
  temperature?: number | null;
  weatherCode?: number | null;
  latitude?: number | null;
  longitude?: number | null;
};

function escapeCsvValue(value: unknown) {
  if (value == null) return "";

  const stringValue = String(value);

  if (
    stringValue.includes(",") ||
    stringValue.includes('"') ||
    stringValue.includes("\n")
  ) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
}

function average(values: number[]) {
  if (!values.length) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function getMostCommonSymptom(entries: EntryLike[]) {
  const counts: Record<string, number> = {};

  for (const entry of entries) {
    for (const symptom of entry.symptoms ?? []) {
      counts[symptom] = (counts[symptom] ?? 0) + 1;
    }
  }

  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);

  if (!sorted.length) return null;

  return {
    symptom: sorted[0][0],
    count: sorted[0][1],
  };
}

export function buildEntriesCsv(entries: EntryLike[]) {
  const headers = [
    "id",
    "createdAt",
    "symptoms",
    "intensity",
    "note",
    "pressure",
    "pressureDelta3h",
    "pressureDelta6h",
    "pressureDelta12h",
    "temperature",
    "weatherCode",
    "latitude",
    "longitude",
  ];

  const migraineEntries = entries.filter((entry) =>
    entry.symptoms?.includes("migraine")
  );

  const headacheEntries = entries.filter((entry) =>
    entry.symptoms?.includes("headache")
  );

  const pressures = entries
    .map((entry) => entry.pressure)
    .filter((value): value is number => typeof value === "number");

  const intensities = entries
    .map((entry) => entry.intensity)
    .filter((value): value is number => typeof value === "number");

  const avgPressure = average(pressures);
  const avgIntensity = average(intensities);
  const mostCommonSymptom = getMostCommonSymptom(entries);

  const summaryRows = [
    ["Report generated at", new Date().toISOString()],
    ["Total entries", entries.length],
    ["Migraine entries", migraineEntries.length],
    ["Headache entries", headacheEntries.length],
    [
      "Average pressure",
      avgPressure != null ? `${avgPressure.toFixed(1)} hPa` : "N/A",
    ],
    [
      "Average intensity",
      avgIntensity != null ? `${avgIntensity.toFixed(1)}/10` : "N/A",
    ],
    [
      "Most common symptom",
      mostCommonSymptom
        ? `${mostCommonSymptom.symptom} (${mostCommonSymptom.count})`
        : "N/A",
    ],
  ];

  const rows = entries.map((entry) => [
    entry.id,
    entry.createdAt ?? "",
    entry.symptoms?.join("|") ?? "",
    entry.intensity ?? "",
    entry.note ?? "",
    entry.pressure ?? "",
    entry.pressureDelta3h ?? "",
    entry.pressureDelta6h ?? "",
    entry.pressureDelta12h ?? "",
    entry.temperature ?? "",
    entry.weatherCode ?? "",
    entry.latitude ?? "",
    entry.longitude ?? "",
  ]);

  return [
    ...summaryRows.map((row) => row.map(escapeCsvValue).join(",")),
    "",
    headers.map(escapeCsvValue).join(","),
    ...rows.map((row) => row.map(escapeCsvValue).join(",")),
  ].join("\n");
}