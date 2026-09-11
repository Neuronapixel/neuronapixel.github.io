import { describe, expect, it } from 'vitest';
import {
  CLOUD_PASSES,
  DAY_NIGHT_CYCLE_DURATION_MS,
  getDayNightFrame,
} from './dayNightCycle';

describe('getDayNightFrame', () => {
  it('starts and ends a full 3-minute cycle in daylight', () => {
    expect(DAY_NIGHT_CYCLE_DURATION_MS).toBe(3 * 60 * 1000);
    expect(getDayNightFrame(0, 3).skyColor).toBe('#ffffff');
    expect(getDayNightFrame(DAY_NIGHT_CYCLE_DURATION_MS, 3).skyColor).toBe(
      '#ffffff',
    );
  });

  it('fades evenly through dusk and dawn', () => {
    expect(getDayNightFrame(75 * 1000, 0).skyColor).toBe('#808080');
    expect(getDayNightFrame(165 * 1000, 0).skyColor).toBe('#808080');
  });

  it('holds a black sky through the night', () => {
    expect(getDayNightFrame(120 * 1000, 4).skyColor).toBe('#000000');
  });

  it('shows clouds only inside their occasional daylight passes', () => {
    const firstPassMidpoint =
      (CLOUD_PASSES[0].startMs + CLOUD_PASSES[0].endMs) / 2;
    const hiddenClouds = Array(CLOUD_PASSES.length).fill(0);

    expect(getDayNightFrame(1 * 1000, 0).cloudOpacities).toEqual(hiddenClouds);
    expect(getDayNightFrame(firstPassMidpoint, 0).cloudOpacities[0]).toBe(1);
    expect(getDayNightFrame(90 * 1000, 0).cloudOpacities).toEqual(hiddenClouds);
  });

  it('overlaps cloud passes so clusters can scatter across the sky', () => {
    const activeClouds = getDayNightFrame(20 * 1000, 0).cloudOpacities.filter(
      (opacity) => opacity > 0,
    );

    expect(activeClouds.length).toBeGreaterThanOrEqual(10);
  });

  it('keeps stars hidden during the day and fills the night with stars', () => {
    expect(getDayNightFrame(30 * 1000, 8).starOpacities).toEqual(
      Array(8).fill(0),
    );
    const nightStars = getDayNightFrame(120 * 1000, 8).starOpacities;

    expect(nightStars.every((opacity) => opacity >= 0.35)).toBe(true);
  });
});
