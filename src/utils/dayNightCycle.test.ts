import { describe, expect, it } from 'vitest';
import { DAY_NIGHT_CYCLE_DURATION_MS, getDayNightFrame } from './dayNightCycle';

const colors = [
  'zenithColor',
  'horizonColor',
  'nadirColor',
  'cloudColor',
] as const;
const boundaries = [
  0, 42_000, 60_000, 75_000, 90_000, 104_000, 138_000, 153_000, 168_000,
  180_000,
];

describe('getDayNightFrame', () => {
  it('wraps the three-minute cycle exactly, including negative preview times', () => {
    expect(DAY_NIGHT_CYCLE_DURATION_MS).toBe(180_000);
    expect(getDayNightFrame(180_000, 8)).toEqual(getDayNightFrame(0, 8));
    expect(getDayNightFrame(-1000, 8)).toEqual(getDayNightFrame(179_000, 8));
  });

  it('gives sunset a warm horizon, keeps the upper sky cooler, and gives dawn its own palette', () => {
    const sunset = getDayNightFrame(75_000, 0);
    const dawn = getDayNightFrame(168_000, 0);
    expect(sunset.horizonColor[0]).toBeGreaterThan(sunset.horizonColor[2]);
    expect(sunset.zenithColor[2]).toBeGreaterThan(sunset.zenithColor[0]);
    expect(dawn.horizonColor).not.toEqual(sunset.horizonColor);
    expect(sunset.cloudColor[0]).toBeGreaterThan(sunset.cloudColor[1]);
  });

  it('keeps sky and cloud colors continuous with smooth velocity at every phase and loop boundary', () => {
    for (const boundary of boundaries) {
      const before = getDayNightFrame(boundary - 10, 32);
      const at = getDayNightFrame(boundary, 32);
      const after = getDayNightFrame(boundary + 10, 32);
      for (const key of colors) {
        at[key].forEach((channel, index) => {
          expect(Math.abs(channel - before[key][index])).toBeLessThan(0.000001);
          expect(Math.abs(after[key][index] - channel)).toBeLessThan(0.000001);
        });
      }
      after.starOpacities.forEach((opacity, index) => {
        expect(Math.abs(opacity - before.starOpacities[index])).toBeLessThan(
          0.005,
        );
      });
    }
  });

  it('preserves sub-byte color changes instead of quantizing every animation frame', () => {
    const before = getDayNightFrame(70_000, 0);
    const after = getDayNightFrame(70_001, 0);
    expect(before.horizonColor).not.toEqual(after.horizonColor);
    expect(
      Math.abs(before.horizonColor[0] - after.horizonColor[0]),
    ).toBeLessThan(1 / 255);
  });

  it('holds a dark blue night with visible clouds and gently varied stars', () => {
    const night = getDayNightFrame(120_000, 64);
    expect(night.daylight).toBe(0);
    expect(night.zenithColor[2]).toBeGreaterThan(night.zenithColor[0]);
    expect(Math.max(...night.zenithColor)).toBeLessThan(0.03);
    expect(Math.max(...night.cloudColor)).toBeGreaterThan(
      Math.max(...night.zenithColor),
    );
    expect(
      night.starOpacities.every((opacity) => opacity > 0.4 && opacity <= 1),
    ).toBe(true);
    expect(new Set(night.starOpacities).size).toBeGreaterThan(32);
  });

  it('reveals stars gradually after sunset and hides them during daylight', () => {
    expect(getDayNightFrame(30_000, 32).starOpacities).toEqual(
      Array(32).fill(0),
    );
    expect(getDayNightFrame(175_000, 32).starOpacities).toEqual(
      Array(32).fill(0),
    );
    const dusk = getDayNightFrame(75_000, 32).starOpacities;
    const night = getDayNightFrame(120_000, 32).starOpacities;
    expect(
      dusk.every((opacity, index) => opacity > 0 && opacity < night[index]),
    ).toBe(true);
  });

  it('keeps every frame finite and in gamut across the full cycle', () => {
    for (let time = 0; time <= DAY_NIGHT_CYCLE_DURATION_MS; time += 250) {
      const frame = getDayNightFrame(time, 32);
      const values = [
        ...colors.flatMap((key) => frame[key]),
        ...frame.starOpacities,
        frame.daylight,
      ];
      expect(
        values.every(
          (value) => Number.isFinite(value) && value >= 0 && value <= 1,
        ),
      ).toBe(true);
    }
  });
});
