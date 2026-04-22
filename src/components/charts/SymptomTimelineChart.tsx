import { useEffect, useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import Svg, {
  Circle,
  Line,
  Path,
  Rect,
  Text as SvgText,
} from "react-native-svg";
import { getSymptomMeta } from "@/utils/symptoms";

type EntryPoint = {
  id: string;
  createdAt: string;
  pressure: number | null;
  pressureDelta6h?: number | null;
  intensity: number;
  symptoms: string[];
  note?: string;
};

type TimelineMetric = "pressure" | "delta6h" | "intensity";

type Props = {
  entries: EntryPoint[];
  height?: number;
};

const METRICS: { key: TimelineMetric; label: string }[] = [
  { key: "pressure", label: "Pressure" },
  { key: "delta6h", label: "Delta 6h" },
  { key: "intensity", label: "Intensity" },
];

function getMinMax(values: number[]) {
  if (!values.length) {
    return { min: 0, max: 1 };
  }

  const min = Math.min(...values);
  const max = Math.max(...values);

  if (min === max) {
    return { min: min - 1, max: max + 1 };
  }

  return { min, max };
}

function formatShortDate(dateString: string) {
  return new Intl.DateTimeFormat("cs-CZ", {
    month: "short",
    day: "numeric",
  }).format(new Date(dateString));
}

function formatFullDate(dateString: string) {
  return new Intl.DateTimeFormat("cs-CZ", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(dateString));
}

function getMarkerColor(symptoms?: string[]) {
  const primary = symptoms?.[0];

  switch (primary) {
    case "migraine":
      return "#f43f5e";
    case "headache":
      return "#f97316";
    case "joint_pain":
      return "#a855f7";
    case "nausea":
      return "#eab308";
    case "dizziness":
      return "#06b6d4";
    case "fatigue":
      return "#3b82f6";
    default:
      return "#94a3b8";
  }
}

function getMetricValue(entry: EntryPoint, metric: TimelineMetric) {
  switch (metric) {
    case "pressure":
      return entry.pressure;
    case "delta6h":
      return entry.pressureDelta6h ?? null;
    case "intensity":
      return entry.intensity;
    default:
      return null;
  }
}

function getMetricLabel(metric: TimelineMetric) {
  switch (metric) {
    case "pressure":
      return "Pressure timeline";
    case "delta6h":
      return "Pressure change in last 6h";
    case "intensity":
      return "Symptom intensity timeline";
    default:
      return "Timeline";
  }
}

function getMetricUnit(metric: TimelineMetric) {
  switch (metric) {
    case "pressure":
      return "hPa";
    case "delta6h":
      return "hPa";
    case "intensity":
      return "/10";
    default:
      return "";
  }
}

function formatMetricValue(value: number, metric: TimelineMetric) {
  if (metric === "delta6h") {
    const sign = value > 0 ? "+" : "";
    return `${sign}${value.toFixed(1)}`;
  }

  if (metric === "intensity") {
    return `${Math.round(value)}`;
  }

  return value.toFixed(1);
}

function getMigraineZone(entries: EntryPoint[], metric: TimelineMetric) {
  if (metric !== "pressure") return null;

  const migraineValues = entries
    .filter((entry) => entry.symptoms?.includes("migraine"))
    .map((entry) => getMetricValue(entry, metric))
    .filter((value): value is number => typeof value === "number");

  if (migraineValues.length < 3) {
    return null;
  }

  return {
    min: Math.min(...migraineValues),
    max: Math.max(...migraineValues),
    count: migraineValues.length,
  };
}

function buildLinePath(
  entries: EntryPoint[],
  metric: TimelineMetric,
  getX: (index: number) => number,
  getY: (value: number) => number
) {
  if (!entries.length) return "";

  return entries
    .map((entry, index) => {
      const value = getMetricValue(entry, metric);
      if (typeof value !== "number") return "";

      const x = getX(index);
      const y = getY(value);

      return `${index === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .filter(Boolean)
    .join(" ");
}

export default function SymptomTimelineChart({
  entries,
  height = 340,
}: Props) {
  const [metric, setMetric] = useState<TimelineMetric>("pressure");
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);

  const validEntries = useMemo(() => {
    return entries
      .filter((entry) => typeof getMetricValue(entry, metric) === "number")
      .sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
  }, [entries, metric]);

  useEffect(() => {
    setSelectedEntryId(null);
  }, [metric]);

  const selectedEntry =
    validEntries.find((entry) => entry.id === selectedEntryId) ?? null;

  if (!validEntries.length) {
    return (
      <View className="rounded-3xl border border-slate-800 bg-slate-900/55 p-5">
        <Text className="text-sm text-slate-400">Symptom timeline</Text>
        <Text className="mt-2 text-white">Not enough entry data yet.</Text>
      </View>
    );
  }

  const width = 380;
  const padding = 20;
  const values = validEntries
    .map((entry) => getMetricValue(entry, metric))
    .filter((value): value is number => typeof value === "number");

  const { min, max } = getMinMax(values);
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  const getX = (index: number) => {
    if (validEntries.length === 1) return padding;
    return padding + (index / (validEntries.length - 1)) * chartWidth;
  };

  const getY = (value: number) => {
    const normalized = (value - min) / (max - min);
    return padding + chartHeight - normalized * chartHeight;
  };

  const linePath = buildLinePath(validEntries, metric, getX, getY);
  const zeroLineY =
    metric === "delta6h" && min <= 0 && max >= 0 ? getY(0) : null;

  const migraineZone = getMigraineZone(validEntries, metric);

  const selectedIndex = selectedEntry
    ? validEntries.findIndex((entry) => entry.id === selectedEntry.id)
    : -1;

  const selectedValue =
    selectedEntry && selectedIndex >= 0
      ? (getMetricValue(selectedEntry, metric) as number)
      : null;

  const selectedX = selectedIndex >= 0 ? getX(selectedIndex) : null;
  const selectedY =
    selectedValue !== null ? getY(selectedValue) : null;

  return (
    <View className="rounded-3xl border border-slate-800 bg-slate-900/55 p-5">
      <Text className="text-lg uppercase tracking-widest text-slate-400">
        Symptom timeline
      </Text>

      <Text className="mt-2 text-slate-300">{getMetricLabel(metric)}</Text>

      <View className="mt-4 flex-row flex-wrap gap-3">
        {METRICS.map((item) => {
          const active = metric === item.key;

          return (
            <Pressable
              key={item.key}
              onPress={() => setMetric(item.key)}
              className={`rounded-full px-4 py-2 ${
                active ? "bg-cyan-500" : "bg-slate-800"
              }`}
            >
              <Text
                className={active ? "font-medium text-slate-950" : "text-white"}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {migraineZone ? (
        <Text className="mt-3 text-slate-300">
          Personal migraine zone: {migraineZone.min.toFixed(1)}–
          {migraineZone.max.toFixed(1)} {getMetricUnit(metric)}
        </Text>
      ) : metric === "pressure" ? (
        <Text className="mt-3 text-slate-400">
          Add at least 3 symptom entries to unlock symptom zone
        </Text>
      ) : (
        <Text className="mt-3 text-slate-400">
          Showing personal symptom changes for the selected metric
        </Text>
      )}

      <View className="mt-4">
        <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
          {migraineZone ? (
            <Rect
              x={padding}
              y={getY(migraineZone.max)}
              width={chartWidth}
              height={Math.max(
                6,
                getY(migraineZone.min) - getY(migraineZone.max)
              )}
              fill="#f43f5e"
              opacity={0.12}
            />
          ) : null}

          <Line
            x1={padding}
            y1={padding}
            x2={padding}
            y2={height - padding}
            stroke="#334155"
            strokeWidth={1}
          />
          <Line
            x1={padding}
            y1={height - padding}
            x2={width - padding}
            y2={height - padding}
            stroke="#334155"
            strokeWidth={1}
          />

          <Line
            x1={padding}
            y1={padding}
            x2={width - padding}
            y2={padding}
            stroke="#1e293b"
            strokeWidth={1}
            strokeDasharray="4 4"
          />
          <Line
            x1={padding}
            y1={padding + chartHeight / 2}
            x2={width - padding}
            y2={padding + chartHeight / 2}
            stroke="#1e293b"
            strokeWidth={1}
            strokeDasharray="4 4"
          />

          {zeroLineY !== null ? (
            <Line
              x1={padding}
              y1={zeroLineY}
              x2={width - padding}
              y2={zeroLineY}
              stroke="#f59e0b"
              strokeWidth={1.5}
              strokeDasharray="6 4"
            />
          ) : null}

          {linePath ? (
            <Path
              d={linePath}
              fill="none"
              stroke={
                metric === "delta6h"
                  ? "#f59e0b"
                  : metric === "intensity"
                  ? "#a78bfa"
                  : "#38bdf8"
              }
              strokeWidth={2.5}
              strokeLinejoin="round"
              strokeLinecap="round"
              opacity={0.8}
            />
          ) : null}

          {selectedX !== null ? (
            <Line
              x1={selectedX}
              y1={padding}
              x2={selectedX}
              y2={height - padding}
              stroke="#03d7fc"
              strokeWidth={1}
              strokeDasharray="4 4"
            />
          ) : null}

          {validEntries.map((entry, index) => {
            const value = getMetricValue(entry, metric) as number;
            const x = getX(index);
            const y = getY(value);
            const color = getMarkerColor(entry.symptoms);
            const radius = Math.min(9, 4 + Math.max(0, entry.intensity) * 0.45);
            const isSelected = entry.id === selectedEntryId;

            return (
              <Circle
                key={`tap-target-${entry.id}`}
                cx={x}
                cy={y}
                r={14}
                fill="transparent"
                onPress={() =>
                  setSelectedEntryId((prev) =>
                    prev === entry.id ? null : entry.id
                  )
                }
              />
            );
          })}

          {validEntries.map((entry, index) => {
            const value = getMetricValue(entry, metric) as number;
            const x = getX(index);
            const y = getY(value);
            const color = getMarkerColor(entry.symptoms);
            const radius = Math.min(9, 4 + Math.max(0, entry.intensity) * 0.45);
            const isSelected = entry.id === selectedEntryId;

            return (
              <Circle
                key={entry.id}
                cx={x}
                cy={y}
                r={radius}
                fill={color}
                stroke={isSelected ? "#facc15" : "#ffffff"}
                strokeWidth={isSelected ? 3 : 2}
                onPress={() =>
                  setSelectedEntryId((prev) =>
                    prev === entry.id ? null : entry.id
                  )
                }
              />
            );
          })}

          {validEntries.map((entry, index) => {
            const value = getMetricValue(entry, metric) as number;
            const x = getX(index);
            const y = Math.max(
              16,
              getY(value) - (12 + Math.max(0, entry.intensity) * 0.45)
            );
            const primary = entry.symptoms?.[0];
            const meta = primary
              ? getSymptomMeta(primary)
              : { emoji: "•", label: "Entry" };

            return (
              <SvgText
                key={`${entry.id}-emoji`}
                x={x}
                y={y}
                fontSize="16"
                textAnchor="middle"
              >
                {meta.emoji}
              </SvgText>
            );
          })}

          {selectedEntry && selectedX !== null && selectedY !== null ? (
            <SvgText
              x={selectedX}
              y={Math.max(14, selectedY - 38)}
              fill="#03d7fc"
              fontSize="14"
              textAnchor="middle"
              fontWeight="500"
            >
              {formatMetricValue(selectedValue as number, metric)}{" "}
              {getMetricUnit(metric)}
            </SvgText>
          ) : null}

          <SvgText x={padding} y={12} fill="#94a3b8" fontSize="11">
            {formatMetricValue(max, metric)} {getMetricUnit(metric)}
          </SvgText>

          <SvgText x={padding} y={height - 4} fill="#94a3b8" fontSize="11">
            {formatMetricValue(min, metric)} {getMetricUnit(metric)}
          </SvgText>

          {validEntries.map((entry, index) => {
            if (
              index !== 0 &&
              index !== validEntries.length - 1 &&
              index !== Math.floor(validEntries.length / 2)
            ) {
              return null;
            }

            return (
              <SvgText
                key={`${entry.id}-date`}
                x={getX(index)}
                y={height - 10}
                fill="#94a3b8"
                fontSize="10"
                textAnchor="middle"
              >
                {formatShortDate(entry.createdAt)}
              </SvgText>
            );
          })}
        </Svg>
      </View>

      <View className="mt-3 flex-row flex-wrap gap-4">
        <Text className="text-xs text-slate-400">Dot size = intensity</Text>
        <Text className="text-xs text-slate-400">Emoji = primary symptom</Text>
        <Text className="text-xs text-slate-400">Tap dot for detail</Text>
      </View>

      {selectedEntry ? (
  <View className="mt-4 rounded-2xl border border-white/10 bg-slate-900/45 p-4">
    <Text className="text-xs font-semibold uppercase tracking-[2px] text-cyan-300">
      Selected entry
    </Text>

    <Text className="mt-3 text-lg font-bold text-white">
      {selectedEntry.symptoms?.[0]
        ? getSymptomMeta(selectedEntry.symptoms[0]).label
        : "Entry"}
    </Text>

    <Text className="mt-1 text-sm text-slate-400">
      {formatFullDate(selectedEntry.createdAt)}
    </Text>

    <View className="mt-4 gap-2 rounded-2xl border border-white/10 bg-white/5 p-4">
      <View className="flex-row items-center justify-between">
        <Text className="text-sm text-slate-400">Intensity</Text>
        <Text className="text-sm font-medium text-white">
          {selectedEntry.intensity}/10
        </Text>
      </View>

      <View className="flex-row items-center justify-between">
        <Text className="text-sm text-slate-400">Pressure</Text>
        <Text className="text-sm font-medium text-white">
          {selectedEntry.pressure !== null
            ? `${selectedEntry.pressure.toFixed(1)} hPa`
            : "N/A"}
        </Text>
      </View>

      <View className="flex-row items-center justify-between">
        <Text className="text-sm text-slate-400">Δ6h</Text>
        <Text className="text-sm font-medium text-white">
          {selectedEntry.pressureDelta6h != null
            ? `${selectedEntry.pressureDelta6h > 0 ? "+" : ""}${selectedEntry.pressureDelta6h.toFixed(1)} hPa`
            : "N/A"}
        </Text>
      </View>

      <View className="flex-row items-center justify-between">
        <Text className="text-sm text-slate-400">Current metric</Text>
        <Text className="text-sm font-medium text-white">
          {formatMetricValue(selectedValue as number, metric)} {getMetricUnit(metric)}
        </Text>
      </View>
    </View>

    {selectedEntry.note ? (
      <View className="mt-3 rounded-2xl border border-white/10 bg-white/5 p-4">
        <Text className="text-xs font-semibold uppercase tracking-[2px] text-slate-500">
          Note
        </Text>
        <Text className="mt-2 text-sm leading-6 text-slate-300">
          {selectedEntry.note}
        </Text>
      </View>
    ) : null}

    <Pressable
      onPress={() => setSelectedEntryId(null)}
      className="mt-4 self-start rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2"
    >
      <Text className="font-medium text-white">Close</Text>
    </Pressable>
  </View>
) : null}
    </View>
  );
}