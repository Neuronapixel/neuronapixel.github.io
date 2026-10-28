import { describe, expect, it } from 'vitest';
import { readViewerPose, type SkyScene } from './skyScene';

describe('viewer pose runtime compatibility', () => {
  it('keeps the preview working when the fallback renderer lacks WebXR APIs', () => {
    const scene = document.createElement('a-scene') as SkyScene;
    scene.renderer = { xr: {} };
    expect(readViewerPose(scene)).toBeNull();
    scene.xrSession = Object.assign(new EventTarget(), {
      end: () => Promise.resolve(),
    });
    scene.frame = {
      getViewerPose: () => {
        throw new Error('Must not query a pose without reference space');
      },
    };
    expect(readViewerPose(scene)).toBeNull();
  });
});
