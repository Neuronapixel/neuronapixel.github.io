import type { ViewerPose } from './skyScene';
import type { SkyPosition } from './cloudField';

export const getArPlacement = (
  pose: ViewerPose,
  distance = 1.5,
): SkyPosition | null => {
  const { position, orientation: q } = pose.transform;
  if (
    pose.emulatedPosition ||
    ![position.x, position.y, position.z].every(Number.isFinite) ||
    ![q.x, q.y, q.z, q.w, distance].every(Number.isFinite) ||
    distance <= 0
  )
    return null;
  // Rotate (0, 0, -1) by the tracked quaternion and project onto the horizon.
  const x = -2 * (q.x * q.z + q.w * q.y);
  const z = 2 * (q.x * q.x + q.y * q.y) - 1;
  const length = Math.hypot(x, z);
  if (length < 0.1) return null;
  return {
    x: position.x + (distance * x) / length,
    y: position.y,
    z: position.z + (distance * z) / length,
  };
};
