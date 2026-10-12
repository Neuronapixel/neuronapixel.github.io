<template>
  <div class="xr-experience">
    <section class="viewport desktop">
      <a-scene
        ref="sceneRef"
        embedded
        vr-mode-ui="enabled: false"
        renderer="antialias: true; colorManagement: true"
        :inspector="inspectorAttribute"
      >
        <a-assets>
          <a-mixin
            id="primary-material"
            material="color: #ff2f2f; metalness: 0.05; roughness: 0.4"
          />
          <a-mixin
            id="secondary-material"
            material="color: #ffffff; roughness: 0.4; emissive: #ffffff; emissiveIntensity: 0.4"
          />
          <a-mixin
            id="animated-white-material"
            material="color: #ffffff; roughness: 0.4; emissive: #ffffff; emissiveIntensity: 0.4; opacity: 0; transparent: true"
          />
          <a-mixin
            id="cube"
            geometry="primitive: box; depth: 1; height: 1; width: 1"
          />
        </a-assets>
        <a-entity id="rig" position="0 0 0">
          <a-entity
            id="camera"
            camera="fov: 50"
            rotation="0 0 0"
            position="0 0 9.034"
            look-controls="pointerLockEnabled: true"
            wasd-controls="fly: true"
          />
        </a-entity>

        <a-entity
          light="type: directional; intensity: 0.75"
          position="-1.5 3 2"
        />
        <a-entity
          light="type: directional; intensity: 0.45"
          position="2 2.5 -1"
        />
        <a-entity light="type: ambient; intensity: 0.35" />

        <a-entity
          id="logo"
          class="logo-mark"
          position="0 0 0"
          rotation="12 -22 0"
          animation="property: position; from: 0 -0.12 0; to: 0 0.12 0; dur: 6000; dir: alternate; loop: true; easing: easeInOutSine"
          scale="0.75 0.75 0.75"
        >
          <a-entity position="-1 -1 -1">
            <a-entity position="0 0 0" mixin="cube primary-material" />
            <a-entity position="1 0 0" mixin="cube secondary-material" />
            <a-entity position="2 0 0" mixin="cube primary-material" />

            <a-entity position="0 1 0" mixin="cube primary-material" />
            <a-entity position="1 1 0" mixin="cube secondary-material" />
            <a-entity position="2 1 0" mixin="cube primary-material" />

            <a-entity position="0 2 0" mixin="cube primary-material" />
            <a-entity position="1 2 0" mixin="cube primary-material" />
            <a-entity position="2 2 0" mixin="cube secondary-material" />

            <a-entity position="0 0 1" mixin="cube primary-material" />
            <a-entity position="1 0 1" mixin="cube secondary-material" />
            <a-entity position="2 0 1" mixin="cube primary-material" />

            <a-entity position="0 1 1" mixin="cube primary-material" />
            <a-entity position="1 1 1" mixin="cube secondary-material" />
            <a-entity position="2 1 1" mixin="cube primary-material" />

            <a-entity position="0 2 1" mixin="cube primary-material" />
            <a-entity position="1 2 1" mixin="cube primary-material" />
            <a-entity position="2 2 1" mixin="cube secondary-material" />

            <a-entity position="0 0 2" mixin="cube primary-material" />
            <a-entity position="1 0 2" mixin="cube secondary-material" />
            <a-entity position="2 0 2" mixin="cube primary-material" />

            <a-entity position="0 1 2" mixin="cube primary-material" />
            <a-entity position="1 1 2" mixin="cube secondary-material" />
            <a-entity position="2 1 2" mixin="cube primary-material" />

            <a-entity position="0 2 2" mixin="cube primary-material" />
            <a-entity position="1 2 2" mixin="cube primary-material" />
            <a-entity position="2 2 2" mixin="cube secondary-material" />
          </a-entity>
        </a-entity>

        <a-entity
          v-for="(cloud, cloudIndex) in clouds"
          :key="cloud.id"
          class="day-cloud"
          :data-cloud-index="cloudIndex"
          :position="`${cloud.x} ${cloud.y} ${cloud.z}`"
          :scale="`${cloud.scale} ${cloud.scale} ${cloud.scale}`"
          :rotation="`0 ${cloud.rotation} 0`"
          visible="false"
        >
          <a-entity
            v-for="cubeDefinition in cloud.cubes"
            :key="`${cloud.id}-${cubeDefinition.position}`"
            class="day-cloud-cube"
            mixin="cube animated-white-material"
            material="emissiveIntensity: 0.12"
            :position="cubeDefinition.position"
            :scale="cubeDefinition.scale"
          />
        </a-entity>

        <a-entity id="night-stars" position="0 0 9.034">
          <a-entity
            v-for="(star, starIndex) in stars"
            :key="star.position"
            class="night-star"
            :data-star-index="starIndex"
            :position="star.position"
            visible="false"
          >
            <a-sphere
              class="star-core"
              radius="0.065"
              material="shader: flat; color: #e7efff; transparent: true; opacity: 0; depthWrite: false"
            />
            <a-image
              class="star-glow"
              src="/star-glow.svg"
              width="0.8"
              height="0.8"
              :rotation="star.rotation"
              material="shader: flat; transparent: true; opacity: 0; depthWrite: false; blending: additive; side: double"
            />
          </a-entity>
        </a-entity>

        <a-sky id="day-night-sky" color="#a6d0ed" />
      </a-scene>
    </section>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { getDayNightFrame } from '@/utils/dayNightCycle';
import { createCloudField, getCloudPlacement } from '@/utils/cloudField';

interface MaterialComponent {
  material?: {
    opacity: number;
    transparent: boolean;
    color?: { set: (color: string) => void };
  };
}

interface SceneEntity extends HTMLElement {
  components?: {
    material?: MaterialComponent;
  };
  hasLoaded?: boolean;
  object3D?: {
    position: {
      x: number;
      y: number;
      z: number;
    };
    visible: boolean;
  };
}

interface CubeDefinition {
  position: string;
  scale: '1 1 1' | '2 2 2';
}

const inspectorAttribute = import.meta.env.DEV ? '' : null;
const sceneRef = ref<SceneEntity | null>(null);
let animationFrameId: number | null = null;
let cycleStartedAt = 0;

const cloudShapes: CubeDefinition[][] = [
  [
    { position: '-3 0 0', scale: '1 1 1' },
    { position: '-2 0 0', scale: '2 2 2' },
    { position: '0 0 0', scale: '2 2 2' },
    { position: '2 0 0', scale: '2 2 2' },
    { position: '4 0 0', scale: '1 1 1' },
    { position: '0 2 0', scale: '2 2 2' },
  ],
  [
    { position: '-4 0 0', scale: '1 1 1' },
    { position: '-3 0 0', scale: '2 2 2' },
    { position: '-1 0 0', scale: '2 2 2' },
    { position: '1 0 0', scale: '2 2 2' },
    { position: '3 0 0', scale: '1 1 1' },
    { position: '-1 2 0', scale: '2 2 2' },
    { position: '1 2 0', scale: '1 1 1' },
  ],
  [
    { position: '-4 0 0', scale: '1 1 1' },
    { position: '-3 0 0', scale: '2 2 2' },
    { position: '-1 0 0', scale: '2 2 2' },
    { position: '1 0 0', scale: '1 1 1' },
    { position: '-1 2 0', scale: '2 2 2' },
  ],
  [
    { position: '-2 0 0', scale: '1 1 1' },
    { position: '-1 0 0', scale: '2 2 2' },
    { position: '1 0 0', scale: '2 2 2' },
    { position: '3 0 0', scale: '1 1 1' },
    { position: '1 2 0', scale: '1 1 1' },
  ],
  [
    { position: '-3 0 0', scale: '2 2 2' },
    { position: '-1 0 0', scale: '2 2 2' },
    { position: '1 0 0', scale: '2 2 2' },
    { position: '3 0 0', scale: '2 2 2' },
    { position: '-1 2 0', scale: '1 1 1' },
    { position: '1 2 0', scale: '2 2 2' },
  ],
  [
    { position: '-2 0 0', scale: '1 1 1' },
    { position: '-1 0 0', scale: '1 1 1' },
    { position: '0 0 0', scale: '2 2 2' },
    { position: '2 0 0', scale: '2 2 2' },
    { position: '4 0 0', scale: '1 1 1' },
    { position: '2 2 0', scale: '1 1 1' },
  ],
];

const clouds = createCloudField().map((cloud, index) => ({
  ...cloud,
  cubes: cloudShapes[index % cloudShapes.length],
}));

const stars = [
  { position: '-30 7 -32' },
  { position: '-26 15 -36' },
  { position: '-22 23 -28' },
  { position: '-18 9 -42' },
  { position: '-14 19 -34' },
  { position: '-10 27 -38' },
  { position: '-6 13 -30' },
  { position: '-2 21 -44' },
  { position: '2 6 -35' },
  { position: '6 17 -28' },
  { position: '10 25 -40' },
  { position: '14 11 -32' },
  { position: '18 20 -36' },
  { position: '22 28 -30' },
  { position: '26 8 -42' },
  { position: '30 16 -34' },
  { position: '-28 29 -46' },
  { position: '-20 4 -48' },
  { position: '-12 31 -26' },
  { position: '-4 10 -50' },
  { position: '4 29 -24' },
  { position: '12 5 -46' },
  { position: '20 31 -44' },
  { position: '28 12 -50' },
  { position: '-28 8 48' },
  { position: '-24 18 56' },
  { position: '-20 28 44' },
  { position: '-14 12 60' },
  { position: '-8 24 50' },
  { position: '-2 6 54' },
  { position: '4 16 46' },
  { position: '10 30 58' },
  { position: '16 10 52' },
  { position: '22 22 42' },
  { position: '28 14 60' },
  { position: '-26 32 40' },
  { position: '-16 4 46' },
  { position: '-6 34 62' },
  { position: '8 8 64' },
  { position: '24 30 50' },
  { position: '-42 8 -10' },
  { position: '-46 18 0' },
  { position: '-40 28 12' },
  { position: '-48 12 24' },
  { position: '-44 24 38' },
  { position: '-50 32 50' },
  { position: '42 6 -14' },
  { position: '46 20 -2' },
  { position: '40 30 10' },
  { position: '48 10 22' },
  { position: '44 26 36' },
  { position: '50 16 52' },
  { position: '-24 38 -18' },
  { position: '-16 44 -4' },
  { position: '-8 36 10' },
  { position: '0 46 18' },
  { position: '8 38 30' },
  { position: '16 44 42' },
  { position: '24 36 54' },
  { position: '-28 48 34' },
  { position: '-18 40 58' },
  { position: '-6 50 48' },
  { position: '12 42 2' },
  { position: '28 46 20' },
].flatMap((star) => {
  const [x, y, z] = star.position.split(' ').map(Number);
  return [y, -y].map((height) => ({
    position: `${x} ${height} ${z - 9.034}`,
    rotation: `${(Math.atan2(height, Math.hypot(x, 9.034 - z)) * 180) / Math.PI} ${(Math.atan2(-x, 9.034 - z) * 180) / Math.PI} 0`,
  }));
});

const setEntityOpacity = (entity: SceneEntity, opacity: number) => {
  if (entity.object3D) {
    entity.object3D.visible = opacity > 0.01;
  }

  const material = entity.components?.material?.material;
  if (material) {
    material.opacity = opacity;
    material.transparent = opacity < 1;
  }
};

const updateScene = (timestamp: number) => {
  const scene = sceneRef.value;
  if (!scene) {
    return;
  }

  const elapsedMs = timestamp - cycleStartedAt;
  const frame = getDayNightFrame(elapsedMs, stars.length);
  const viewer = cameraEntity?.object3D?.position ?? { x: 0, y: 0, z: 9.034 };
  skyEntity?.setAttribute('color', frame.skyColor);
  if (skyEntity?.object3D) {
    Object.assign(skyEntity.object3D.position, viewer);
  }

  if (starFieldEntity?.object3D) {
    Object.assign(starFieldEntity.object3D.position, viewer);
  }

  cloudEntities.forEach(({ entity, cubes }, index) => {
    const placement = getCloudPlacement(clouds[index], viewer, elapsedMs);
    const opacity = placement.opacity * 0.86;
    if (entity.object3D) {
      Object.assign(entity.object3D.position, {
        x: placement.x,
        y: placement.y,
        z: placement.z,
      });
      entity.object3D.visible = opacity > 0.01;
    }
    if (opacity <= 0.01) return;
    cubes.forEach((cube) => {
      setEntityOpacity(cube, opacity);
      cube.components?.material?.material?.color?.set(frame.cloudColor);
    });
  });

  scene.querySelectorAll<SceneEntity>('.night-star').forEach((star, index) => {
    const opacity = frame.starOpacities[index] ?? 0;
    if (star.object3D) star.object3D.visible = opacity > 0.001;
    star
      .querySelectorAll<SceneEntity>('.star-core, .star-glow')
      .forEach((part) => {
        setEntityOpacity(
          part,
          opacity * (part.classList.contains('star-glow') ? 0.45 : 1),
        );
      });
  });

  animationFrameId = window.requestAnimationFrame(updateScene);
};

let cameraEntity: SceneEntity | null = null;
let skyEntity: SceneEntity | null = null;
let starFieldEntity: SceneEntity | null = null;
let cloudEntities: Array<{ entity: SceneEntity; cubes: SceneEntity[] }> = [];

const startCycle = () => {
  if (animationFrameId !== null) {
    return;
  }

  cameraEntity = sceneRef.value?.querySelector<SceneEntity>('#camera') ?? null;
  skyEntity =
    sceneRef.value?.querySelector<SceneEntity>('#day-night-sky') ?? null;
  starFieldEntity =
    sceneRef.value?.querySelector<SceneEntity>('#night-stars') ?? null;
  cloudEntities = Array.from(
    sceneRef.value?.querySelectorAll<SceneEntity>('.day-cloud') ?? [],
    (entity) => ({
      entity,
      cubes: Array.from(
        entity.querySelectorAll<SceneEntity>('.day-cloud-cube'),
      ),
    }),
  );
  cycleStartedAt = performance.now();
  animationFrameId = window.requestAnimationFrame(updateScene);
};

onMounted(() => {
  const scene = sceneRef.value;
  if (!scene) {
    return;
  }

  if (scene.hasLoaded) {
    startCycle();
  } else {
    scene.addEventListener('loaded', startCycle, { once: true });
  }
});

onBeforeUnmount(() => {
  sceneRef.value?.removeEventListener('loaded', startCycle);

  if (animationFrameId !== null) {
    window.cancelAnimationFrame(animationFrameId);
  }
});
</script>

<style scoped>
:global(html),
:global(body),
:global(#app) {
  width: 100%;
  min-height: 100%;
  margin: 0;
}

.xr-experience {
  width: 100vw;
  min-height: 100vh;
  min-height: 100dvh;
  overflow: hidden;
  color: #1f2233;
}

.viewport {
  width: 100%;
  height: 100vh;
  height: 100dvh;
  overflow: hidden;
  position: relative;
}

.viewport.desktop {
  display: block;
}

.viewport.desktop a-scene {
  width: 100%;
  height: 100%;
}
</style>
