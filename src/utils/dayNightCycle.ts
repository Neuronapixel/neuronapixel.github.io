export const DAY_NIGHT_CYCLE_DURATION_MS = 12 * 60 * 1000;

const DAY_END_MS = 4 * 60 * 1000;
const DUSK_END_MS = 6 * 60 * 1000;
const NIGHT_END_MS = 10 * 60 * 1000;
const CLOUD_FADE_MS = 8 * 1000;

export interface CloudPass {
  endMs: number;
  startMs: number;
}

export interface DayNightFrame {
  cloudOpacities: number[];
  cloudProgress: number[];
  cycleElapsedMs: number;
  skyColor: string;
  starOpacities: number[];
}

export const CLOUD_PASSES: CloudPass[] = [
  { startMs: 45 * 1000, endMs: 105 * 1000 },
  { startMs: 150 * 1000, endMs: 225 * 1000 },
];

const clamp = (value: number, minimum = 0, maximum = 1) =>
  Math.min(maximum, Math.max(minimum, value));

const wrapCycleTime = (elapsedMs: number) =>
  ((elapsedMs % DAY_NIGHT_CYCLE_DURATION_MS) + DAY_NIGHT_CYCLE_DURATION_MS) %
  DAY_NIGHT_CYCLE_DURATION_MS;

const getSkyLuminance = (cycleElapsedMs: number) => {
  if (cycleElapsedMs < DAY_END_MS) {
    return 1;
  }

  if (cycleElapsedMs < DUSK_END_MS) {
    return 1 - (cycleElapsedMs - DAY_END_MS) / (DUSK_END_MS - DAY_END_MS);
  }

  if (cycleElapsedMs < NIGHT_END_MS) {
    return 0;
  }

  return (
    (cycleElapsedMs - NIGHT_END_MS) /
    (DAY_NIGHT_CYCLE_DURATION_MS - NIGHT_END_MS)
  );
};

const luminanceToHex = (luminance: number) => {
  const channel = Math.round(clamp(luminance) * 255)
    .toString(16)
    .padStart(2, '0');

  return `#${channel}${channel}${channel}`;
};

const getCloudState = (cycleElapsedMs: number, pass: CloudPass) => {
  if (cycleElapsedMs < pass.startMs || cycleElapsedMs > pass.endMs) {
    return { opacity: 0, progress: 0 };
  }

  const duration = pass.endMs - pass.startMs;
  const elapsed = cycleElapsedMs - pass.startMs;
  const progress = clamp(elapsed / duration);
  const fadeIn = clamp(elapsed / CLOUD_FADE_MS);
  const fadeOut = clamp((pass.endMs - cycleElapsedMs) / CLOUD_FADE_MS);

  return {
    opacity: Math.min(fadeIn, fadeOut),
    progress,
  };
};

const getStarOpacity = (
  cycleElapsedMs: number,
  starIndex: number,
  skyLuminance: number,
) => {
  if (cycleElapsedMs < DUSK_END_MS || cycleElapsedMs > NIGHT_END_MS) {
    return 0;
  }

  const pulseDurationMs = 4700 + (starIndex % 4) * 1100;
  const phaseOffset = starIndex * 1.71;
  const pulse =
    0.5 +
    0.5 *
      Math.sin((cycleElapsedMs / pulseDurationMs) * Math.PI * 2 + phaseOffset);
  const glimpse = pulse > 0.42 ? (pulse - 0.42) / 0.58 : 0;

  return clamp(glimpse * (1 - skyLuminance));
};

export const getDayNightFrame = (
  elapsedMs: number,
  starCount: number,
): DayNightFrame => {
  const cycleElapsedMs = wrapCycleTime(elapsedMs);
  const skyLuminance = getSkyLuminance(cycleElapsedMs);
  const cloudStates = CLOUD_PASSES.map((pass) =>
    getCloudState(cycleElapsedMs, pass),
  );

  return {
    cycleElapsedMs,
    skyColor: luminanceToHex(skyLuminance),
    cloudOpacities: cloudStates.map(({ opacity }) => opacity),
    cloudProgress: cloudStates.map(({ progress }) => progress),
    starOpacities: Array.from({ length: starCount }, (_, index) =>
      getStarOpacity(cycleElapsedMs, index, skyLuminance),
    ),
  };
};
