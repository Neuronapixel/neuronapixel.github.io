import { describe, expect, it } from 'vitest';
import {
  CLOUD_PASSES,
  DAY_NIGHT_CYCLE_DURATION_MS,
  getDayNightFrame,
} from './dayNightCycle';

describe('getDayNightFrame', () => {
  it('starts and ends a full 3-minute cycle in daylight', () => {
    expect(DAY_NIGHT_CYCLE_DURATION_MS).toBe(3 * 60 * 1000);
    expect(getDayNightFrame(0, 3).skyColor).toBe('#a6d0ed');
    expect(getDayNightFrame(DAY_NIGHT_CYCLE_DURATION_MS, 3).skyColor).toBe(
      '#a6d0ed',
    );
  });

  it('passes through a muted twilight at dusk and dawn', () => {
    expect(getDayNightFrame(75 * 1000, 0).skyColor).toBe('#6f709d');
    expect(getDayNightFrame(165 * 1000, 0).skyColor).toBe('#6f709d');
  });

  it('holds a deep blue sky through the night', () => {
    expect(getDayNightFrame(120 * 1000, 4).skyColor).toBe('#090f23');
  });

  it('keeps every cloud visible and drifting through the night', () => {
    const dusk = getDayNightFrame(90_000, 0);
    const night = getDayNightFrame(120_000, 0);
    expect(night.cloudOpacities).toHaveLength(CLOUD_PASSES.length);
    expect(night.cloudOpacities.every((opacity) => opacity > 0.5)).toBe(true);
    expect(night.cloudProgress).not.toEqual(dusk.cloudProgress);
    expect(night.cloudColor).not.toBe(getDayNightFrame(0, 0).cloudColor);
  });

  it('fades stars throughout twilight without jumping at night boundaries', () => {
    expect(
      getDayNightFrame(75_000, 8).starOpacities.every((opacity) => opacity > 0),
    ).toBe(true);
    expect(
      getDayNightFrame(165_000, 8).starOpacities.every(
        (opacity) => opacity > 0,
      ),
    ).toBe(true);
    for (const boundary of [60_000, 90_000, 150_000, 180_000]) {
      const before = getDayNightFrame(boundary - 1, 8);
      const after = getDayNightFrame(boundary + 1, 8);
      after.starOpacities.forEach((opacity, index) => {
        expect(Math.abs(opacity - before.starOpacities[index])).toBeLessThan(
          0.001,
        );
      });
      after.cloudProgress.forEach((progress, index) => {
        expect(Math.abs(progress - before.cloudProgress[index])).toBeLessThan(
          0.001,
        );
      });
    }
  });

  it('keeps stars hidden during the day and fills the night with stars', () => {
    expect(getDayNightFrame(30 * 1000, 8).starOpacities).toEqual(
      Array(8).fill(0),
    );
    const nightStars = getDayNightFrame(120 * 1000, 8).starOpacities;

    expect(nightStars.every((opacity) => opacity >= 0.35)).toBe(true);
  });
});
