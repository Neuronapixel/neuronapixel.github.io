import { afterEach, describe, expect, it, vi } from 'vitest';
import { createCloudRenderer } from './cloudRenderer';
import {
  createCloudField,
  getCloudPlacement,
  type SkyPosition,
} from './cloudField';

vi.mock('./cloudField', async (importOriginal) => ({
  ...(await importOriginal<typeof import('./cloudField')>()),
  createCloudField: () => [
    { id: 'near', x: 40, y: 0, z: -60, scale: 1, rotation: 0 },
    { id: 'far', x: 0, y: 0, z: -120, scale: 1, rotation: 0 },
  ],
}));

const createRuntime = () => {
  // These unit-scale, unrotated fixtures only need translation composition.
  class Matrix {
    elements = new Float32Array(16);
    clone() {
      const matrix = new Matrix();
      matrix.elements.set(this.elements);
      return matrix;
    }
    multiplyMatrices(a: Matrix, b: Matrix) {
      for (const axis of [12, 13, 14]) {
        this.elements[axis] = a.elements[axis] + b.elements[axis];
      }
    }
  }
  class Vector {
    constructor(
      public x = 0,
      public y = 0,
      public z = 0,
    ) {}
    set(x: number, y: number, z: number) {
      Object.assign(this, { x, y, z });
    }
  }
  class Transform {
    position = new Vector();
    scale = { setScalar: vi.fn() };
    rotation = { y: 0 };
    matrix = new Matrix();
    updateMatrix() {
      this.matrix.elements.set(
        [this.position.x, this.position.y, this.position.z],
        12,
      );
    }
  }
  class Attribute {
    needsUpdate = false;
    setUsage = vi.fn();
    constructor(public array: Float32Array) {}
  }
  class Mesh extends Transform {
    count = 0;
    renderOrder = 0;
    instanceMatrix = new Attribute(new Float32Array());
    matrices: Matrix[] = [];
    setMatrixAt(index: number, matrix: Matrix) {
      this.matrices[index] = matrix.clone();
    }
    dispose = vi.fn();
  }
  const mesh = new Mesh();
  const material = { color: { set: vi.fn() }, dispose: vi.fn() };
  const geometry = {
    setAttribute: vi.fn<(name: string, attribute: Attribute) => void>(),
    dispose: vi.fn(),
  };
  vi.stubGlobal('AFRAME', {
    THREE: {
      DynamicDrawUsage: 35048,
      Object3D: Transform,
      Matrix4: Matrix,
      Vector3: Vector,
      BoxGeometry: vi.fn(function () {
        return geometry;
      }),
      InstancedBufferAttribute: Attribute,
      MeshStandardMaterial: vi.fn(function () {
        return material;
      }),
      InstancedMesh: vi.fn(function () {
        return mesh;
      }),
    },
  });
  const direction = new Vector(0, 0, -1);
  const host = {
    sceneEl: {
      camera: {
        getWorldDirection: (target: SkyPosition) =>
          Object.assign(target, direction),
      },
    },
    setObject3D: vi.fn(),
    removeObject3D: vi.fn(),
  };
  const renderer = createCloudRenderer(host)!;
  const opacity = geometry.setAttribute.mock.calls[0][1];
  return { direction, mesh, renderer, opacity };
};

describe('cloud renderer depth ordering', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('composites clouds after the background stars regardless of scene-tree order', () => {
    const { mesh, renderer } = createRuntime();
    const starCore = { renderOrder: 0 };
    const starGlow = { renderOrder: 0 };
    // A-Frame 1.5's default transparent sort compares renderOrder within a group.
    const transparentObjects = [mesh, starCore, starGlow];
    transparentObjects.sort((a, b) => a.renderOrder - b.renderOrder);
    expect(transparentObjects).toEqual([starCore, starGlow, mesh]);
    renderer.dispose();
  });

  it('reorders cubes with camera rotation and keeps their fades paired', () => {
    const { direction, mesh, renderer, opacity } = createRuntime();
    const viewer = { x: 0, y: 0, z: 0 };
    const clouds = createCloudField();
    for (const facing of [
      [0, 0, -1],
      [0, 0, 1],
      [1, 0, 0],
      [0, 1, 0],
    ]) {
      direction.set(facing[0], facing[1], facing[2]);
      renderer.update(viewer, 0, '#f5f8ff');
      expect(mesh.count).toBe(13);
      const matrices = mesh.matrices.slice(0, mesh.count);
      const depths = matrices.map(
        ({ elements: e }) =>
          e[12] * direction.x + e[13] * direction.y + e[14] * direction.z,
      );
      expect(depths).toEqual([...depths].sort((a, b) => b - a));
      matrices.forEach(({ elements }, index) => {
        const cloud = clouds.find((cloud) => cloud.z === elements[14])!;
        expect(opacity.array[index]).toBeCloseTo(
          getCloudPlacement(cloud, viewer, 0).opacity * 0.86,
        );
      });
    }
    renderer.dispose();
  });

  it('drops hidden instances after moving without retaining stale sorted cubes', () => {
    const { mesh, renderer, opacity } = createRuntime();
    renderer.update({ x: 0, y: 0, z: 0 }, 0, '#f5f8ff');
    expect(mesh.count).toBe(13);
    renderer.update({ x: 0, y: 0, z: -100 }, 0, '#323e5b');
    expect(mesh.count).toBe(6);
    expect(
      mesh.matrices
        .slice(0, mesh.count)
        .every(({ elements }) => elements[14] === 40),
    ).toBe(true);
    expect(mesh.instanceMatrix.needsUpdate).toBe(true);
    expect(opacity.needsUpdate).toBe(true);
    renderer.dispose();
  });
});
