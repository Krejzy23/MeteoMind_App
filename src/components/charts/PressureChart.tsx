import { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import Svg, {
  Path,
  Line,
  Circle,
  Rect,
  Text as SvgText,
} from "react-native-svg";
import type { PressurePoint } from "@/types/weather";

type SymptomType =
  | "headache"
  | "migraine"
  | "joint_pain"
  | "nausea"
  | "dizziness"
  | "fatigue";

type SymptomMarker = {
  id: string;
  time: string;
  symptoms?: string[];
  intensity?: number;
  note?: string;
  pressure?: number | null;
};

type Props = {
  data: PressurePoint[];
  markers?: SymptomMarker[];
  currentTime?: string;
  forecastRiskLevel?: "low" | "moderate" | "high";
  height?: number;
};

type MatchedMarker = {
  marker: SymptomMarker;
  point: PressurePoint;
  index: number;
};

function getMinMax(values: number[]) {
  const min = Math.min(...values);
  const max = Math.max(...values);

  if (min === max) {
    return { min: min - 1, max: max + 1 };
  }

  return { min, max };
}

function toHourKey(dateString: string) {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  const hour = `${date.getHours()}`.padStart(2, "0");
  return `${year}-${month}-${day}-${hour}`;
}

function formatDate(dateString: string) {
  return new Intl.DateTimeFormat("cs-CZ", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(dateString));
}

function formatSymptoms(symptoms?: string[]) {
  if (!symptoms?.length) return "Unknown symptom";

  return symptoms
    .map((symptom) =>
      symptom
        .replaceAll("_", " ")
        .replace(/\b\w/g, (char) => char.toUpperCase())
    )
    .join(", ");
}

function getMarkerColor(symptoms?: string[]) {
  const primary = symptoms?.[0] as SymptomType | undefined;

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
      return "#84cc16";
    case "fatigue":
      return "#3b82f6";
    default:
      return "#f43f5e";
  }
}

function getForecastZoneColor(risk?: "low" | "moderate" | "high") {
  switch (risk) {
    case "high":
      return "#ef4444";
    case "moderate":
      return "#eab308";
    case "low":
      return "#22c55e";
    default:
      return "#000000";
  }
}

function findNowIndex(data: PressurePoint[], currentTime?: string) {
  if (!currentTime) return -1;

  const currentHour = new Date(currentTime);
  currentHour.setMinutes(0, 0, 0);

  return data.findIndex((point) => {
    const pointDate = new Date(point.time);
    pointDate.setMinutes(0, 0, 0);
    return pointDate.getTime() === currentHour.getTime();
  });
}

function buildPath(
  data: PressurePoint[],
  startIndex: number,
  endIndex: number,
  getX: (index: number) => number,
  getY: (value: number) => number
) {
  if (startIndex < 0 || endIndex < startIndex || !data.length) return "";

  return data
    .slice(startIndex, endIndex + 1)
    .map((point, localIndex) => {
      const index = startIndex + localIndex;
      const x = getX(index);
      const y = getY(point.pressure);
      return `${localIndex === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");
}

function formatHourLabel(dateString: string) {
  const date = new Date(dateString);
  return `${date.getHours().toString().padStart(2, "0")}:00`;
}

export default function PressureChart({
  data,
  markers = [],
  currentTime,
  forecastRiskLevel,
  height = 340,
}: Props) {
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(null);

  const matchedMarkers = useMemo<MatchedMarker[]>(() => {
    if (!data.length || !markers.length) return [];

    const byHour = new Map<string, SymptomMarker[]>();

    markers.forEach((marker) => {
      const key = toHourKey(marker.time);
      const existing = byHour.get(key) ?? [];
      existing.push(marker);
      byHour.set(key, existing);
    });

    const result: MatchedMarker[] = [];

    data.forEach((point, index) => {
      const key = toHourKey(point.time);
      const hourMarkers = byHour.get(key);

      if (!hourMarkers?.length) return;

      hourMarkers.forEach((marker) => {
        result.push({ marker, point, index });
      });
    });

    return result;
  }, [data, markers]);

  if (!data.length) {
    return (
      <View className="rounded-3xl border border-slate-800 bg-slate-900 p-5">
        <Text className="text-white">No pressure data available.</Text>
      </View>
    );
  }

  const width = 400;
  const padding = 10;
  const values = data.map((item) => item.pressure);
  const { min, max } = getMinMax(values);

  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  const getX = (index: number) => {
    if (data.length === 1) return padding;
    return padding + (index / (data.length - 1)) * chartWidth;
  };

  const getY = (value: number) => {
    const normalized = (value - min) / (max - min);
    return padding + chartHeight - normalized * chartHeight;
  };

  const nowIndex = findNowIndex(data, currentTime);
  const nowX = nowIndex >= 0 ? getX(nowIndex) : null;

  const fullPath = buildPath(data, 0, data.length - 1, getX, getY);
  const pastPath =
    nowIndex >= 0 ? buildPath(data, 0, nowIndex, getX, getY) : fullPath;
  const forecastPath =
    nowIndex >= 0 && nowIndex < data.length - 1
      ? buildPath(data, nowIndex, data.length - 1, getX, getY)
      : "";

  const lastPoint = data[data.length - 1];
  const selectedMarker =
    matchedMarkers.find((item) => item.marker.id === selectedMarkerId) ?? null;

  return (
    <View className="mt-4 rounded-2xl border border-white/8 bg-slate-950/25 p-4">
      <Text className="text-xs font-semibold uppercase tracking-[2px] text-cyan-300">
        Pressure trend
      </Text>

      <View className="mt-3 flex-row items-end justify-between">
        <Text className="text-3xl font-extrabold text-white">
          {lastPoint.pressure.toFixed(1)} hPa
        </Text>

        <Text className="text-sm text-slate-400">Last {data.length} hours</Text>
      </View>

      <View className="mt-4">
        <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
          {nowX !== null ? (
            <Rect
              x={nowX}
              y={padding}
              width={width - padding - nowX}
              height={chartHeight}
              fill={getForecastZoneColor(forecastRiskLevel)}
              opacity={0.1}
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
            y1={(padding + (height - padding)) / 2}
            x2={width - padding}
            y2={(padding + (height - padding)) / 2}
            stroke="#1e293b"
            strokeWidth={1}
            strokeDasharray="4 4"
          />

          {pastPath ? (
            <Path
              d={pastPath}
              fill="none"
              stroke="#06b6d4"
              strokeWidth={3}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          ) : null}

          {forecastPath ? (
            <Path
              d={forecastPath}
              fill="none"
              stroke="#22d3ee"
              strokeWidth={3}
              strokeLinejoin="round"
              strokeLinecap="round"
              strokeDasharray="2 4"
            />
          ) : null}

          {nowX !== null ? (
            <>
              <Line
                x1={nowX}
                y1={padding}
                x2={nowX}
                y2={height - padding}
                stroke="#94a3b8"
                strokeWidth={1}
                strokeDasharray="4 4"
              />
              <SvgText
                x={nowX + 4}
                y={padding + 12}
                fill="#94a3b8"
                fontSize="11"
              >
                Now
              </SvgText>
            </>
          ) : null}

          {data.map((point, index) => {
            const x = getX(index);
            const y = getY(point.pressure);

            return (
              <Circle
                key={`${point.time}-${index}`}
                cx={x}
                cy={y}
                r={index === data.length - 1 ? 4 : 2.5}
                fill={index === data.length - 1 ? "#22d3ee" : "#67e8f9"}
              />
            );
          })}

          {matchedMarkers.map(({ marker, point, index }) => {
            const x = getX(index);
            const y = getY(point.pressure);
            const selected = marker.id === selectedMarkerId;
            const color = getMarkerColor(marker.symptoms);

            return (
              <Circle
                key={`marker-${marker.id}`}
                cx={x}
                cy={y}
                r={selected ? 8 : 6}
                fill={color}
                stroke="#fff"
                strokeWidth={2}
                onPress={() =>
                  setSelectedMarkerId((prev) =>
                    prev === marker.id ? null : marker.id
                  )
                }
              />
            );
          })}

          <SvgText x={padding} y={2} fill="#94a3b8" fontSize="14">
            {max.toFixed(1)} hPa
          </SvgText>

          <SvgText x={padding} y={height - 14} fill="#94a3b8" fontSize="14">
            {min.toFixed(1)} hPa
          </SvgText>

          {data.map((point, index) => {
            const isEdge = index === 0 || index === data.length - 1;

            const isEvery3h = index % 3 === 0;

            const isNow = index === nowIndex;

            if (!isEdge && !isEvery3h && !isNow) return null;

            const x = getX(index);

            return (
              <SvgText
                key={`x-label-${index}`}
                x={x}
                y={height + 2}
                fill={isNow ? "#22d3ee" : "#94a3b8"}
                fontSize="10"
                textAnchor="middle"
              >
                {isNow ? "Now" : formatHourLabel(point.time)}
                <Line
                  x1={x}
                  y1={height - padding}
                  x2={x}
                  y2={height - padding + 4}
                  stroke="#475569"
                  strokeWidth={1}
                />
              </SvgText>
            );
          })}
        </Svg>
      </View>

      <View className="mt-3 flex-row flex-wrap items-center justify-center gap-3 rounded-2xl border border-white/8 bg-slate-950/25 px-3 py-3">
        <View className="flex-row items-center gap-1">
          <View className="h-3 w-3 rounded-full bg-rose-500" />
          <Text className="text-sm text-slate-400">Migraine</Text>
        </View>

        <View className="flex-row items-center gap-1">
          <View className="h-3 w-3 rounded-full bg-orange-500" />
          <Text className="text-sm text-slate-400">Headache</Text>
        </View>

        <View className="flex-row items-center gap-1">
          <View className="h-3 w-3 rounded-full bg-violet-500" />
          <Text className="text-sm text-slate-400">Joint pain</Text>
        </View>

        <View className="flex-row items-center gap-1">
          <View className="h-3 w-3 rounded-full bg-yellow-500" />
          <Text className="text-sm text-slate-400">Nausea</Text>
        </View>

        <View className="flex-row items-center gap-1">
          <View className="h-3 w-3 rounded-full bg-lime-500" />
          <Text className="text-sm text-slate-400">Dizziness</Text>
        </View>

        <View className="flex-row items-center gap-1">
          <View className="h-3 w-3 rounded-full bg-blue-500" />
          <Text className="text-sm text-slate-400">Fatigue</Text>
        </View>

        <View className="mt-2 flex-row items-center gap-1">
          <View className="h-0.5 w-6 bg-cyan-500" />
          <Text className="text-sm text-slate-400">Past</Text>
          <View className="ml-3 h-0.5 w-6 bg-cyan-300" />
          <Text className="text-sm text-slate-400">Forecast</Text>
        </View>
      </View>

      {selectedMarker ? (
        <View className="mt-4 rounded-2xl border border-white/10 bg-slate-900/45 p-4">
          <Text className="text-xs font-semibold uppercase tracking-[2px] text-cyan-300">
            Selected symptom
          </Text>

          <Text className="mt-3 text-lg font-bold text-white">
            {formatSymptoms(selectedMarker.marker.symptoms)}
          </Text>

          <View className="mt-4 gap-2 rounded-2xl border border-white/10 bg-white/5 p-4">
            <View className="flex-row items-center justify-between">
              <Text className="text-sm text-slate-400">Time</Text>
              <Text className="text-sm font-medium text-white">
                {formatDate(selectedMarker.marker.time)}
              </Text>
            </View>

            <View className="flex-row items-center justify-between">
              <Text className="text-sm text-slate-400">Intensity</Text>
              <Text className="text-sm font-medium text-white">
                {selectedMarker.marker.intensity ?? "N/A"}/10
              </Text>
            </View>

            <View className="flex-row items-center justify-between">
              <Text className="text-sm text-slate-400">Pressure</Text>
              <Text className="text-sm font-medium text-white">
                {selectedMarker.marker.pressure != null
                  ? `${selectedMarker.marker.pressure.toFixed(1)} hPa`
                  : `${selectedMarker.point.pressure.toFixed(1)} hPa`}
              </Text>
            </View>
          </View>

          {selectedMarker.marker.note ? (
            <View className="mt-3 rounded-2xl border border-white/10 bg-white/5 p-4">
              <Text className="text-xs font-semibold uppercase tracking-[2px] text-slate-500">
                Note
              </Text>
              <Text className="mt-2 text-sm leading-6 text-slate-300">
                {selectedMarker.marker.note}
              </Text>
            </View>
          ) : null}

          <Pressable
            onPress={() => setSelectedMarkerId(null)}
            className="mt-4 self-start rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2"
          >
            <Text className="font-medium text-white">Close</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}
