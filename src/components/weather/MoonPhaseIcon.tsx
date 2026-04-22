import Svg, { Circle, ClipPath, Defs, G, Rect } from "react-native-svg";

type MoonPhaseName =
  | "New Moon"
  | "Waxing Crescent"
  | "First Quarter"
  | "Waxing Gibbous"
  | "Full Moon"
  | "Waning Gibbous"
  | "Last Quarter"
  | "Waning Crescent";

type Props = {
  phase: MoonPhaseName;
  size?: number;
};

export default function MoonPhaseIcon({ phase, size = 44 }: Props) {
  const r = size * 0.42;
  const cx = size / 2;
  const cy = size / 2;

  const moonId = `moonClip-${size}-${phase.replace(/\s+/g, "-")}`;

  const darkFill = "#0F172A";
  const lightFill ="#F8FAFC";
  const border = "rgba(255,255,255,0.18)";

  const crescentOffset = r * 0.55;
  const gibbousOffset = r * 0.32;

  function renderIllumination() {
    switch (phase) {
      case "New Moon":
        return null;
  
      case "Full Moon":
        return <Circle cx={cx} cy={cy} r={r} fill={lightFill} />;
  
      case "First Quarter":
        return (
          <Rect
            x={cx}
            y={cy - r}
            width={r}
            height={r * 2}
            fill={lightFill}
          />
        );
  
      case "Last Quarter":
        return (
          <Rect
            x={cx - r}
            y={cy - r}
            width={r}
            height={r * 2}
            fill={lightFill}
          />
        );
  
      case "Waxing Crescent":
        return (
          <Circle
            cx={cx - crescentOffset}
            cy={cy}
            r={r}
            fill={lightFill}
          />
        );
  
      case "Waning Crescent":
        return (
          <Circle
            cx={cx + crescentOffset}
            cy={cy}
            r={r}
            fill={lightFill}
          />
        );
  
      case "Waxing Gibbous":
        return (
          <G>
            <Circle cx={cx} cy={cy} r={r} fill={darkFill} />
            <Circle
              cx={cx + gibbousOffset}
              cy={cy}
              r={r}
              fill={lightFill}
            />
          </G>
        );
  
      case "Waning Gibbous":
        return (
          <G>
            <Circle cx={cx} cy={cy} r={r} fill={darkFill} />
            <Circle
              cx={cx - gibbousOffset}
              cy={cy}
              r={r}
              fill={lightFill}
            />
          </G>
        );
  
      default:
        return null;
    }
  }

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <Defs>
        <ClipPath id={moonId}>
          <Circle cx={cx} cy={cy} r={r} />
        </ClipPath>
      </Defs>

      <Circle cx={cx} cy={cy} r={r} fill={darkFill} opacity={0.95} />

      <G clipPath={`url(#${moonId})`}>{renderIllumination()}</G>

      <Circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke={border}
        strokeWidth={1}
      />
    </Svg>
  );
}