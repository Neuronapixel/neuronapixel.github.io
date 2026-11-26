import { describe, expect, it } from 'vitest';
import { getArPlacement } from './arPlacement';
import type { ViewerPose } from './skyScene';

const pose = (angle = 0): ViewerPose => ({
  transform: {
    position: { x: 4, y: 1.6, z: -2 },
    orientation: { x: 0, y: Math.sin(angle / 2), z: 0, w: Math.cos(angle / 2) },
  },
});
describe('AR placement', () => {
  it('places 1.5 metres horizontally ahead at the tracked height', () => {
    expect(getArPlacement(pose())).toEqual({ x: 4, y: 1.6, z: -3.5 });
    const sideways = getArPlacement(pose(Math.PI / 2));
    expect(sideways?.x).toBeCloseTo(2.5);
    expect(sideways?.z).toBeCloseTo(-2);
    expect(getArPlacement(pose(Math.PI))?.z).toBeCloseTo(-0.5);
  });
  it('waits for a usable horizontal heading and real positional tracking', () => {
    const vertical = pose();
    vertical.transform.orientation = {
      x: Math.SQRT1_2,
      y: 0,
      z: 0,
      w: Math.SQRT1_2,
    };
    expect(getArPlacement(vertical)).toBeNull();
    expect(getArPlacement({ ...pose(), emulatedPosition: true })).toBeNull();
    const invalid = pose();
    invalid.transform.position.x = NaN;
    expect(getArPlacement(invalid)).toBeNull();
  });
});
