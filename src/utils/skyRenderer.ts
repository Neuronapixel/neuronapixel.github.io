import { getDayNightFrame, type DayNightFrame } from './dayNightCycle';
import type { SceneEntity } from './skyScene';

interface ColorUniform {
  setRGB: (red: number, green: number, blue: number) => void;
}
interface Disposable {
  dispose: () => void;
}
interface SkyThree {
  BackSide: number;
  Color: new () => ColorUniform;
  SphereGeometry: new (
    radius: number,
    width: number,
    height: number,
  ) => Disposable;
  ShaderMaterial: new (options: Record<string, unknown>) => Disposable;
  Mesh: new (
    geometry: Disposable,
    material: Disposable,
  ) => {
    frustumCulled: boolean;
    renderOrder: number;
  };
}

export interface SkyRenderer {
  update: (frame: DayNightFrame) => void;
  dispose: () => void;
}

// A single opaque sky draw, using A-Frame's Three.js rather than another runtime.
export const createSkyRenderer = (host: SceneEntity): SkyRenderer | null => {
  const three = (window.AFRAME as { THREE?: SkyThree } | undefined)?.THREE;
  if (!three || !host.setObject3D || !host.removeObject3D) return null;
  const uniforms = {
    zenith: { value: new three.Color() },
    horizon: { value: new three.Color() },
    nadir: { value: new three.Color() },
  };
  const geometry = new three.SphereGeometry(500, 32, 16);
  const material = new three.ShaderMaterial({
    uniforms,
    side: three.BackSide,
    depthWrite: false,
    depthTest: false,
    toneMapped: false,
    vertexShader: `
      varying vec3 vDirection;
      void main() {
        vDirection = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 zenith;
      uniform vec3 horizon;
      uniform vec3 nadir;
      varying vec3 vDirection;
      void main() {
        float height = normalize(vDirection).y;
        float upper = smoothstep(0.0, 0.85, max(height, 0.0));
        float lower = smoothstep(0.0, 0.95, max(-height, 0.0));
        vec3 sky = mix(horizon, zenith, upper);
        sky = mix(sky, nadir, lower);
        gl_FragColor = vec4(sky, 1.0);
        #include <colorspace_fragment>
        // Sub-pixel output dithering removes visible bands without animated noise.
        float noise = fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715))));
        gl_FragColor.rgb += (noise - 0.5) / 255.0;
      }
    `,
  });
  const mesh = new three.Mesh(geometry, material);
  mesh.frustumCulled = false;
  mesh.renderOrder = -100;
  host.setObject3D('mesh', mesh);
  const update = (frame: DayNightFrame) => {
    uniforms.zenith.value.setRGB(...frame.zenithColor);
    uniforms.horizon.value.setRGB(...frame.horizonColor);
    uniforms.nadir.value.setRGB(...frame.nadirColor);
  };
  update(getDayNightFrame(0, 0));
  return {
    update,
    dispose() {
      host.removeObject3D?.('mesh');
      geometry.dispose();
      material.dispose();
    },
  };
};
