export type MoonPhaseLabel =
  | "New Moon"
  | "Waxing Crescent"
  | "First Quarter"
  | "Waxing Gibbous"
  | "Full Moon"
  | "Waning Gibbous"
  | "Last Quarter"
  | "Waning Crescent";

export function getMoonPhase(date = new Date()) {
  const synodicMonth = 29.53058867;
  const knownNewMoon = new Date("2000-01-06T18:14:00Z");

  const days =
    (date.getTime() - knownNewMoon.getTime()) /
    (1000 * 60 * 60 * 24);

  const moonAge = ((days % synodicMonth) + synodicMonth) % synodicMonth;
  const phase = moonAge / synodicMonth;

  let label: MoonPhaseLabel = "New Moon";
  let emoji = "🌑";
  let boundary = 0.0625;

  if (phase < 0.0625) {
    label = "New Moon";
    emoji = "🌑";
    boundary = 0.0625;
  } else if (phase < 0.1875) {
    label = "Waxing Crescent";
    emoji = "🌒";
    boundary = 0.1875;
  } else if (phase < 0.3125) {
    label = "First Quarter";
    emoji = "🌓";
    boundary = 0.3125;
  } else if (phase < 0.4375) {
    label = "Waxing Gibbous";
    emoji = "🌔";
    boundary = 0.4375;
  } else if (phase < 0.5625) {
    label = "Full Moon";
    emoji = "🌕";
    boundary = 0.5625;
  } else if (phase < 0.6875) {
    label = "Waning Gibbous";
    emoji = "🌖";
    boundary = 0.6875;
  } else if (phase < 0.8125) {
    label = "Last Quarter";
    emoji = "🌗";
    boundary = 0.8125;
  } else {
    label = "Waning Crescent";
    emoji = "🌘";
    boundary = 1.0625;
  }

  const illumination = (1 - Math.cos(2 * Math.PI * phase)) / 2;
  const nextBoundaryAge = (boundary % 1) * synodicMonth;
  const daysToNextPhase =
    nextBoundaryAge >= moonAge
      ? nextBoundaryAge - moonAge
      : synodicMonth - moonAge + nextBoundaryAge;

  let nextPhase: MoonPhaseLabel = "New Moon";

  switch (label) {
    case "New Moon":
      nextPhase = "Waxing Crescent";
      break;
    case "Waxing Crescent":
      nextPhase = "First Quarter";
      break;
    case "First Quarter":
      nextPhase = "Waxing Gibbous";
      break;
    case "Waxing Gibbous":
      nextPhase = "Full Moon";
      break;
    case "Full Moon":
      nextPhase = "Waning Gibbous";
      break;
    case "Waning Gibbous":
      nextPhase = "Last Quarter";
      break;
    case "Last Quarter":
      nextPhase = "Waning Crescent";
      break;
    case "Waning Crescent":
      nextPhase = "New Moon";
      break;
  }

  return {
    emoji,
    label,
    illumination: Math.round(illumination * 100),
    age: Number(moonAge.toFixed(1)),
    nextPhase,
    daysToNextPhase: Number(daysToNextPhase.toFixed(1)),
  };
}