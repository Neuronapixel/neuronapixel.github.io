import {
  createCloudField,
  getCloudPlacement,
  type SkyPosition,
} from './cloudField';

// Use the Three.js runtime shipped with A-Frame, avoiding a second WebGL runtime.
interface CloudMatrix {
  elements: ArrayLike<number>;
  multiplyMatrices: (a: CloudMatrix, b: CloudMatrix) => void;
  clone: () => CloudMatrix;
}

interface CloudTransform {
  position: SkyPosition & { set: (x: number, y: number, z: number) => void };
  scale: { setScalar: (value: number) => void };
  rotation: { y: number };
  matrix: CloudMatrix;
  updateMatrix: () => void;
}

interface CloudAttribute {
  needsUpdate: boolean;
  setUsage: (usage: number) => void;
}

interface CloudGeometry {
  setAttribute: (name: string, attribute: CloudAttribute) => void;
  dispose: () => void;
}

interface CloudShader {
  vertexShader: string;
  fragmentShader: string;
}

interface CloudMaterial {
  color: { set: (color: string) => void };
  onBeforeCompile: (shader: CloudShader) => void;
  dispose: () => void;
}

interface CloudMesh extends CloudTransform {
  count: number;
  renderOrder: number;
  frustumCulled: boolean;
  instanceMatrix: CloudAttribute;
  setMatrixAt: (index: number, matrix: CloudMatrix) => void;
  dispose: () => void;
}

interface CloudThree {
  DynamicDrawUsage: number;
  BoxGeometry: new (x: number, y: number, z: number) => CloudGeometry;
  InstancedBufferAttribute: new (
    array: Float32Array,
    itemSize: number,
  ) => CloudAttribute;
  MeshStandardMaterial: new (options: Record<string, unknown>) => CloudMaterial;
  InstancedMesh: new (
    geometry: CloudGeometry,
    material: CloudMaterial,
    count: number,
  ) => CloudMesh;
  Object3D: new () => CloudTransform;
  Matrix4: new () => CloudMatrix;
  Vector3: new (x: number, y: number, z: number) => SkyPosition;
}

interface CloudHost {
  sceneEl?: {
    camera?: { getWorldDirection: (target: SkyPosition) => SkyPosition };
  };
  setObject3D?: (name: string, object: unknown) => void;
  removeObject3D?: (name: string) => void;
}

interface CubeDefinition {
  position: string;
  scale: number;
}

export interface CloudRenderer {
  update: (viewer: SkyPosition, elapsedMs: number, color: string) => void;
  dispose: () => void;
}

const cloudShapes: CubeDefinition[][] = [
  [
    { position: '-3 0 0', scale: 1 },
    { position: '-2 0 0', scale: 2 },
    { position: '0 0 0', scale: 2 },
    { position: '2 0 0', scale: 2 },
    { position: '4 0 0', scale: 1 },
    { position: '0 2 0', scale: 2 },
  ],
  [
    { position: '-4 0 0', scale: 1 },
    { position: '-3 0 0', scale: 2 },
    { position: '-1 0 0', scale: 2 },
    { position: '1 0 0', scale: 2 },
    { position: '3 0 0', scale: 1 },
    { position: '-1 2 0', scale: 2 },
    { position: '1 2 0', scale: 1 },
  ],
  [
    { position: '-4 0 0', scale: 1 },
    { position: '-3 0 0', scale: 2 },
    { position: '-1 0 0', scale: 2 },
    { position: '1 0 0', scale: 1 },
    { position: '-1 2 0', scale: 2 },
  ],
  [
    { position: '-2 0 0', scale: 1 },
    { position: '-1 0 0', scale: 2 },
    { position: '1 0 0', scale: 2 },
    { position: '3 0 0', scale: 1 },
    { position: '1 2 0', scale: 1 },
  ],
  [
    { position: '-3 0 0', scale: 2 },
    { position: '-1 0 0', scale: 2 },
    { position: '1 0 0', scale: 2 },
    { position: '3 0 0', scale: 2 },
    { position: '-1 2 0', scale: 1 },
    { position: '1 2 0', scale: 2 },
  ],
  [
    { position: '-2 0 0', scale: 1 },
    { position: '-1 0 0', scale: 1 },
    { position: '0 0 0', scale: 2 },
    { position: '2 0 0', scale: 2 },
    { position: '4 0 0', scale: 1 },
    { position: '2 2 0', scale: 1 },
  ],
];

export const createCloudRenderer = (host: CloudHost): CloudRenderer | null => {
  const runtime = window.AFRAME as { THREE?: CloudThree } | undefined;
  const three = runtime?.THREE;
  if (!three || !host.setObject3D || !host.removeObject3D) return null;

  const transform = new three.Object3D();
  const cubeMatrices = cloudShapes.map((shape) =>
    shape.map((cube) => {
      const [x, y, z] = cube.position.split(' ').map(Number);
      transform.position.set(x, y, z);
      transform.scale.setScalar(cube.scale);
      transform.updateMatrix();
      return transform.matrix.clone();
    }),
  );
  const clouds = createCloudField();
  const capacity = clouds.reduce(
    (count, _, index) =>
      count + cubeMatrices[index % cubeMatrices.length].length,
    0,
  );
  const geometry = new three.BoxGeometry(1, 1, 1);
  const opacities = new Float32Array(capacity);
  const opacityAttribute = new three.InstancedBufferAttribute(opacities, 1);
  opacityAttribute.setUsage(three.DynamicDrawUsage);
  geometry.setAttribute('cloudOpacity', opacityAttribute);
  const material = new three.MeshStandardMaterial({
    color: '#f5f8ff',
    roughness: 0.4,
    emissive: '#ffffff',
    emissiveIntensity: 0.12,
    transparent: true,
    depthWrite: false,
  });
  // Preserve each cloud's smooth horizon/near-camera fade within one draw call.
  material.onBeforeCompile = (shader) => {
    shader.vertexShader = shader.vertexShader
      .replace(
        '#include <common>',
        '#include <common>\nattribute float cloudOpacity;\nvarying float vCloudOpacity;',
      )
      .replace(
        '#include <begin_vertex>',
        '#include <begin_vertex>\nvCloudOpacity = cloudOpacity;',
      );
    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        '#include <common>\nvarying float vCloudOpacity;',
      )
      .replace(
        '#include <alphatest_fragment>',
        'diffuseColor.a *= vCloudOpacity;\n#include <alphatest_fragment>',
      );
  };
  const mesh = new three.InstancedMesh(geometry, material, capacity);
  mesh.count = 0;
  // A-Frame otherwise draws transparent objects in scene-tree order. Composite
  // clouds over the background stars (renderOrder 0) without writing depth.
  mesh.renderOrder = 1;
  // Wrapped instances move every frame; a cached bounding sphere would be stale.
  mesh.frustumCulled = false;
  mesh.instanceMatrix.setUsage(three.DynamicDrawUsage);
  host.setObject3D('mesh', mesh);
  const viewDirection = new three.Vector3(0, 0, -1);
  // Reuse instance matrices and sorting storage between frames.
  const instances = Array.from({ length: capacity }, () => ({
    matrix: new three.Matrix4(),
    opacity: 0,
    depth: 0,
  }));
  const visibleInstances: (typeof instances)[number][] = [];

  return {
    update(viewer, elapsedMs, color) {
      // Keep GPU coordinates close to the camera even after long-distance flight.
      mesh.position.set(viewer.x, viewer.y, viewer.z);
      material.color.set(color);
      host.sceneEl?.camera?.getWorldDirection(viewDirection);
      visibleInstances.length = 0;
      clouds.forEach((cloud, index) => {
        const placement = getCloudPlacement(cloud, viewer, elapsedMs);
        const opacity = placement.opacity * 0.86;
        if (opacity <= 0.01) return;
        transform.position.set(
          placement.x - viewer.x,
          placement.y - viewer.y,
          placement.z - viewer.z,
        );
        transform.scale.setScalar(cloud.scale);
        transform.rotation.y = (cloud.rotation * Math.PI) / 180;
        transform.updateMatrix();
        for (const cube of cubeMatrices[index % cubeMatrices.length]) {
          const instance = instances[visibleInstances.length];
          instance.matrix.multiplyMatrices(transform.matrix, cube);
          const elements = instance.matrix.elements;
          instance.depth =
            elements[12] * viewDirection.x +
            elements[13] * viewDirection.y +
            elements[14] * viewDirection.z;
          instance.opacity = opacity;
          visibleInstances.push(instance);
        }
      });
      // Three.js sorts the mesh as a whole, not its transparent instances.
      // Sort individual cubes by camera-space depth, keeping their fades paired.
      visibleInstances.sort((a, b) => b.depth - a.depth);
      visibleInstances.forEach((instance, index) => {
        mesh.setMatrixAt(index, instance.matrix);
        opacities[index] = instance.opacity;
      });
      mesh.count = visibleInstances.length;
      mesh.instanceMatrix.needsUpdate = true;
      opacityAttribute.needsUpdate = true;
    },
    dispose() {
      host.removeObject3D?.('mesh');
      mesh.dispose();
      geometry.dispose();
      material.dispose();
    },
  };
};
