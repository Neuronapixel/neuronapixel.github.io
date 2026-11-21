export const DAY_NIGHT_CYCLE_DURATION_MS = 3 * 60 * 1000;

/** Linear-light RGB, shared by the atmosphere shader and cloud material. */
export type SkyColor = [number, number, number];

export interface DayNightFrame {
  cycleElapsedMs: number;
  zenithColor: SkyColor;
  horizonColor: SkyColor;
  nadirColor: SkyColor;
  cloudColor: SkyColor;
  daylight: number;
  starOpacities: number[];
}

const linearChannel = (value: number) =>
  value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;

const color = (hex: string): SkyColor =>
  [1, 3, 5].map((start) =>
    linearChannel(parseInt(hex.slice(start, start + 2), 16) / 255),
  ) as SkyColor;

const palette = (
  time: number,
  zenith: string,
  horizon: string,
  nadir: string,
  cloud: string,
  daylight: number,
) => ({
  time,
  zenithColor: color(zenith),
  horizonColor: color(horizon),
  nadirColor: color(nadir),
  cloudColor: color(cloud),
  daylight,
});

// Golden hour, sunset, blue hour and dawn each get their own palette. The last
// key matches the first so the sky has no jump when the three-minute loop wraps.
const keyframes = [
  palette(0, '#589bd8', '#c4e3ef', '#789fc8', '#f5f8ff', 1),
  palette(42_000, '#659bd0', '#d3e4ec', '#819dc2', '#f8f4ee', 1),
  palette(60_000, '#7185ba', '#f1c49d', '#8a87a6', '#f5cfb2', 0.72),
  palette(75_000, '#373b70', '#de8f85', '#615777', '#bf94ae', 0.28),
  palette(90_000, '#141e43', '#59618e', '#252b4b', '#6e7b9c', 0.04),
  palette(104_000, '#050a1c', '#172849', '#090f26', '#485a7d', 0),
  palette(138_000, '#050a1c', '#172849', '#090f26', '#485a7d', 0),
  palette(153_000, '#2d3c70', '#9b85a8', '#3e466f', '#989dc2', 0.15),
  palette(168_000, '#7d9aca', '#f4cbb6', '#939ebd', '#edd6d1', 0.65),
  palette(180_000, '#589bd8', '#c4e3ef', '#789fc8', '#f5f8ff', 1),
];

const clamp = (value: number) => Math.min(1, Math.max(0, value));

// Zero velocity and acceleration at each key prevents a hitch at phase changes.
const smootherstep = (value: number) => {
  const t = clamp(value);
  return t * t * t * (t * (t * 6 - 15) + 10);
};

const mix = (from: number, to: number, amount: number) =>
  from + (to - from) * amount;
const mixColor = (from: SkyColor, to: SkyColor, amount: number): SkyColor => [
  mix(from[0], to[0], amount),
  mix(from[1], to[1], amount),
  mix(from[2], to[2], amount),
];

export const getDayNightFrame = (
  elapsedMs: number,
  starCount: number,
): DayNightFrame => {
  const cycleElapsedMs =
    ((elapsedMs % DAY_NIGHT_CYCLE_DURATION_MS) + DAY_NIGHT_CYCLE_DURATION_MS) %
    DAY_NIGHT_CYCLE_DURATION_MS;
  const nextIndex = keyframes.findIndex((key) => key.time > cycleElapsedMs);
  const from = keyframes[nextIndex - 1];
  const to = keyframes[nextIndex];
  const blend = smootherstep(
    (cycleElapsedMs - from.time) / (to.time - from.time),
  );
  const daylight = mix(from.daylight, to.daylight, blend);
  const phase = (cycleElapsedMs / DAY_NIGHT_CYCLE_DURATION_MS) * Math.PI * 2;

  return {
    cycleElapsedMs,
    zenithColor: mixColor(from.zenithColor, to.zenithColor, blend),
    horizonColor: mixColor(from.horizonColor, to.horizonColor, blend),
    nadirColor: mixColor(from.nadirColor, to.nadirColor, blend),
    cloudColor: mixColor(from.cloudColor, to.cloudColor, blend),
    daylight,
    starOpacities: Array.from({ length: starCount }, (_, index) => {
      // Bright stars emerge first; small, independent oscillations avoid blinking.
      const brightness = 0.55 + 0.45 * ((index * 0.61803398875) % 1);
      const visibility = smootherstep(
        (0.52 - daylight) / (0.3 + brightness * 0.22),
      );
      const twinkle =
        0.92 +
        0.05 * Math.sin(phase * (17 + (index % 5)) + index * 1.71) +
        0.03 * Math.sin(phase * (29 + (index % 7)) + index * 2.31);
      return brightness * visibility * twinkle;
    }),
  };
};
