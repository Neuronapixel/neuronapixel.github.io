import { afterEach, describe, expect, it, vi } from 'vitest';
import { createSkyRenderer } from './skyRenderer';
import { getDayNightFrame } from './dayNightCycle';
import type { SceneEntity } from './skyScene';

afterEach(() => vi.unstubAllGlobals());

describe('sky renderer', () => {
  it('uses an opaque background draw, updates its float colors and releases GPU resources', () => {
    const colors: { setRGB: ReturnType<typeof vi.fn> }[] = [];
    class Color {
      setRGB = vi.fn();
      constructor() {
        colors.push(this);
      }
    }
    const geometry = { dispose: vi.fn() };
    const material = { dispose: vi.fn() };
    const mesh = { renderOrder: 0, frustumCulled: true };
    const ShaderMaterial = vi.fn(function () {
      return material;
    });
    vi.stubGlobal('AFRAME', {
      THREE: {
        Color,
        BackSide: 1,
        SphereGeometry: vi.fn(function () {
          return geometry;
        }),
        ShaderMaterial,
        Mesh: vi.fn(function () {
          return mesh;
        }),
      },
    });
    const host = document.createElement('a-entity') as SceneEntity;
    host.setObject3D = vi.fn();
    host.removeObject3D = vi.fn();
    const renderer = createSkyRenderer(host)!;
    expect(host.setObject3D).toHaveBeenCalledWith('mesh', mesh);
    expect(ShaderMaterial).toHaveBeenCalledWith(
      expect.objectContaining({ depthWrite: false, depthTest: false, side: 1 }),
    );
    expect(mesh.renderOrder).toBeLessThan(0);
    for (const time of [0, 75_000, 120_000, 168_000, 180_000]) {
      const frame = getDayNightFrame(time, 0);
      renderer.update(frame);
      expect(colors[0].setRGB).toHaveBeenLastCalledWith(...frame.zenithColor);
      expect(colors[1].setRGB).toHaveBeenLastCalledWith(...frame.horizonColor);
      expect(colors[2].setRGB).toHaveBeenLastCalledWith(...frame.nadirColor);
    }
    renderer.dispose();
    expect(host.removeObject3D).toHaveBeenCalledWith('mesh');
    expect(geometry.dispose).toHaveBeenCalledOnce();
    expect(material.dispose).toHaveBeenCalledOnce();
  });

  it('tolerates an unavailable A-Frame runtime', () => {
    vi.stubGlobal('AFRAME', undefined);
    expect(
      createSkyRenderer(document.createElement('a-entity') as SceneEntity),
    ).toBeNull();
  });
});
