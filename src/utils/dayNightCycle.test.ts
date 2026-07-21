import { describe, expect, it } from 'vitest';
import {
  CLOUD_PASSES,
  DAY_NIGHT_CYCLE_DURATION_MS,
  getDayNightFrame,
} from './dayNightCycle';

describe('getDayNightFrame', () => {
  it('starts and ends a full 12-minute cycle in daylight', () => {
    expect(getDayNightFrame(0, 3).skyColor).toBe('#ffffff');
    expect(getDayNightFrame(DAY_NIGHT_CYCLE_DURATION_MS, 3).skyColor).toBe(
      '#ffffff',
    );
  });

  it('fades evenly through dusk and dawn', () => {
    expect(getDayNightFrame(5 * 60 * 1000, 0).skyColor).toBe('#808080');
    expect(getDayNightFrame(11 * 60 * 1000, 0).skyColor).toBe('#808080');
  });

  it('holds a black sky through the night', () => {
    expect(getDayNightFrame(8 * 60 * 1000, 4).skyColor).toBe('#000000');
  });

  it('shows clouds only inside their occasional daylight passes', () => {
    const firstPassMidpoint =
      (CLOUD_PASSES[0].startMs + CLOUD_PASSES[0].endMs) / 2;

    expect(getDayNightFrame(10 * 1000, 0).cloudOpacities).toEqual([0, 0]);
    expect(getDayNightFrame(firstPassMidpoint, 0).cloudOpacities[0]).toBe(1);
    expect(getDayNightFrame(7 * 60 * 1000, 0).cloudOpacities).toEqual([0, 0]);
  });

  it('keeps stars hidden during the day and lets some glimpse at night', () => {
    expect(getDayNightFrame(2 * 60 * 1000, 8).starOpacities).toEqual(
      Array(8).fill(0),
    );
    expect(
      getDayNightFrame(8 * 60 * 1000, 8).starOpacities.some(
        (opacity) => opacity > 0,
      ),
    ).toBe(true);
  });
});
