import { describe, expect, it } from 'vitest';
import {
  CLOUD_FIELD_SIZE,
  createCloudField,
  getCloudPlacement,
} from './cloudField';

describe('endless cloud field', () => {
  it('keeps visible clouds in all eight directions after flying far from the logo', () => {
    const clouds = createCloudField();
    for (const viewer of [
      { x: 0, y: 0, z: 12 },
      { x: 1500, y: -720, z: 2300 },
      { x: -4300, y: 2500, z: -8100 },
    ]) {
      const octants = new Set<string>();
      for (const cloud of clouds) {
        const placement = getCloudPlacement(cloud, viewer, 120_000);
        if (placement.opacity > 0.1) {
          octants.add(
            [
              placement.x > viewer.x,
              placement.y > viewer.y,
              placement.z > viewer.z,
            ].join(','),
          );
        }
      }
      expect(octants.size).toBe(8);
    }
  });

  it('keeps nearby clouds in world space as the viewer moves', () => {
    const cloud = { ...createCloudField()[0], x: 35, y: 10, z: -25 };
    const before = getCloudPlacement(cloud, { x: 0, y: 0, z: 0 }, 0);
    const after = getCloudPlacement(cloud, { x: 5, y: 2, z: -4 }, 0);
    expect([after.x, after.y, after.z]).toEqual([before.x, before.y, before.z]);
  });

  it('hides clouds while they wrap across the distant edge', () => {
    const cloud = { ...createCloudField()[0], x: 0, y: 0, z: 0 };
    const before = getCloudPlacement(
      cloud,
      { x: CLOUD_FIELD_SIZE / 2 - 0.01, y: 0, z: 0 },
      0,
    );
    const after = getCloudPlacement(
      cloud,
      { x: CLOUD_FIELD_SIZE / 2 + 0.01, y: 0, z: 0 },
      0,
    );
    expect(Math.abs(after.x - before.x)).toBeCloseTo(CLOUD_FIELD_SIZE);
    expect(before.opacity).toBeLessThan(0.001);
    expect(after.opacity).toBeLessThan(0.001);
  });

  it('drifts continuously across day/night cycle boundaries and clears the camera', () => {
    const cloud = { ...createCloudField()[0], x: 0, y: 0, z: 0 };
    const viewer = { x: 0, y: 0, z: 0 };
    expect(getCloudPlacement(cloud, viewer, 0).opacity).toBe(0);
    const before = getCloudPlacement(cloud, viewer, 179_999);
    const after = getCloudPlacement(cloud, viewer, 180_001);
    expect(Math.abs(after.x - before.x)).toBeLessThan(0.01);
    expect(Math.abs(after.z - before.z)).toBeLessThan(0.01);
  });
});
