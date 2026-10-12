export interface SkyPosition {
  x: number;
  y: number;
  z: number;
}

export interface SkyCloud extends SkyPosition {
  id: string;
  scale: number;
  rotation: number;
}

const CELLS_PER_AXIS = 7;
const CELL_SIZE = 42;
export const CLOUD_FIELD_SIZE = CELLS_PER_AXIS * CELL_SIZE;
const HALF_FIELD = CLOUD_FIELD_SIZE / 2;

const noise = (seed: number) => {
  const value = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return value - Math.floor(value);
};

// A jittered volume supplies near and distant clouds in every direction.
export const createCloudField = (): SkyCloud[] =>
  Array.from({ length: CELLS_PER_AXIS ** 3 }, (_, index) => ({
    id: `sky-cloud-${index}`,
    x:
      ((index % CELLS_PER_AXIS) + noise(index * 3) * 0.7 + 0.15) * CELL_SIZE -
      HALF_FIELD,
    y:
      ((Math.floor(index / CELLS_PER_AXIS) % CELLS_PER_AXIS) +
        noise(index * 3 + 1) * 0.7 +
        0.15) *
        CELL_SIZE -
      HALF_FIELD,
    z:
      (Math.floor(index / CELLS_PER_AXIS ** 2) +
        noise(index * 3 + 2) * 0.7 +
        0.15) *
        CELL_SIZE -
      HALF_FIELD,
    scale: 1.1 + noise(index + 500) * 1.3,
    rotation: noise(index + 700) * 360,
  }));

const wrapAroundViewer = (position: number, viewer: number) =>
  ((((position - viewer + HALF_FIELD) % CLOUD_FIELD_SIZE) + CLOUD_FIELD_SIZE) %
    CLOUD_FIELD_SIZE) -
  HALF_FIELD;

const smoothstep = (value: number) => {
  const t = Math.min(1, Math.max(0, value));
  return t * t * (3 - 2 * t);
};

export const getCloudPlacement = (
  cloud: SkyCloud,
  viewer: SkyPosition,
  elapsedMs: number,
) => {
  // Wind uses total elapsed time so it never resets at a day/night boundary.
  const x = wrapAroundViewer(cloud.x + elapsedMs * 0.00065, viewer.x);
  const y = wrapAroundViewer(cloud.y, viewer.y);
  const z = wrapAroundViewer(cloud.z + elapsedMs * 0.00018, viewer.z);
  const distance = Math.hypot(x, y, z);

  return {
    x: viewer.x + x,
    y: viewer.y + y,
    z: viewer.z + z,
    // Recycle only beyond the faded horizon, and keep the camera clear.
    opacity:
      smoothstep((distance - 26) / 14) *
      (1 - smoothstep((distance - HALF_FIELD * 0.72) / (HALF_FIELD * 0.28))),
  };
};
