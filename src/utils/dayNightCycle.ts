export const DAY_NIGHT_CYCLE_DURATION_MS = 3 * 60 * 1000;

const DAY_END_MS = 60 * 1000;
const DUSK_END_MS = 90 * 1000;
const NIGHT_END_MS = 150 * 1000;

export interface CloudPass {
  endMs: number;
  startMs: number;
}

export interface DayNightFrame {
  cloudOpacities: number[];
  cloudProgress: number[];
  cycleElapsedMs: number;
  skyColor: string;
  cloudColor: string;
  starOpacities: number[];
}

export const CLOUD_PASSES: CloudPass[] = [
  { startMs: 4 * 1000, endMs: 28 * 1000 },
  { startMs: 9 * 1000, endMs: 38 * 1000 },
  { startMs: 18 * 1000, endMs: 49 * 1000 },
  { startMs: 26 * 1000, endMs: 59 * 1000 },
  { startMs: 3 * 1000, endMs: 20 * 1000 },
  { startMs: 35 * 1000, endMs: 60 * 1000 },
  { startMs: 5 * 1000, endMs: 33 * 1000 },
  { startMs: 14 * 1000, endMs: 45 * 1000 },
  { startMs: 24 * 1000, endMs: 55 * 1000 },
  { startMs: 31 * 1000, endMs: 60 * 1000 },
  { startMs: 7 * 1000, endMs: 44 * 1000 },
  { startMs: 16 * 1000, endMs: 57 * 1000 },
  { startMs: 10 * 1000, endMs: 36 * 1000 },
  { startMs: 22 * 1000, endMs: 60 * 1000 },
  { startMs: 4 * 1000, endMs: 50 * 1000 },
  { startMs: 28 * 1000, endMs: 59 * 1000 },
  { startMs: 12 * 1000, endMs: 54 * 1000 },
  { startMs: 6 * 1000, endMs: 40 * 1000 },
];

const clamp = (value: number, minimum = 0, maximum = 1) =>
  Math.min(maximum, Math.max(minimum, value));

const wrapCycleTime = (elapsedMs: number) =>
  ((elapsedMs % DAY_NIGHT_CYCLE_DURATION_MS) + DAY_NIGHT_CYCLE_DURATION_MS) %
  DAY_NIGHT_CYCLE_DURATION_MS;

const smoothstep = (value: number) => {
  const t = clamp(value);
  return t * t * (3 - 2 * t);
};

const getSkyLuminance = (time: number) => {
  if (time < DAY_END_MS) return 1;
  if (time < DUSK_END_MS) {
    return 1 - smoothstep((time - DAY_END_MS) / (DUSK_END_MS - DAY_END_MS));
  }
  if (time < NIGHT_END_MS) return 0;
  return smoothstep(
    (time - NIGHT_END_MS) / (DAY_NIGHT_CYCLE_DURATION_MS - NIGHT_END_MS),
  );
};

const mixColor = (from: number[], to: number[], amount: number) =>
  `#${from
    .map((channel, index) =>
      Math.round(channel + (to[index] - channel) * amount)
        .toString(16)
        .padStart(2, '0'),
    )
    .join('')}`;

const getSkyColor = (daylight: number) => {
  const night = [9, 15, 35];
  const twilight = [111, 112, 157];
  const day = [166, 208, 237];
  return daylight < 0.5
    ? mixColor(night, twilight, smoothstep(daylight * 2))
    : mixColor(twilight, day, smoothstep((daylight - 0.5) * 2));
};

const getCloudState = (time: number, pass: CloudPass) => {
  // A continuous orbit-like drift avoids disappearing or teleporting at night.
  const phase =
    (time / DAY_NIGHT_CYCLE_DURATION_MS + pass.startMs / DAY_END_MS) *
    Math.PI *
    2;
  return { opacity: 0.86, progress: (1 - Math.cos(phase)) / 2 };
};

const getStarOpacity = (time: number, index: number, daylight: number) => {
  const phase =
    (time / DAY_NIGHT_CYCLE_DURATION_MS) * Math.PI * 2 * (24 + (index % 4));
  const twinkle = 0.82 + 0.18 * Math.sin(phase + index * 1.71);
  return twinkle * smoothstep(1 - daylight);
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
    skyColor: getSkyColor(skyLuminance),
    cloudColor: mixColor([50, 62, 91], [245, 248, 255], skyLuminance),
    cloudOpacities: cloudStates.map(({ opacity }) => opacity),
    cloudProgress: cloudStates.map(({ progress }) => progress),
    starOpacities: Array.from({ length: starCount }, (_, index) =>
      getStarOpacity(cycleElapsedMs, index, skyLuminance),
    ),
  };
};
