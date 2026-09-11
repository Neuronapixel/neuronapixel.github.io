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
            rotation="-10 0 0"
            position="1 -0.5 21"
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
          class="logo-mark"
          position="0.25 0.8 0"
          scale="0.75 0.75 0.75"
        >
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

        <a-entity class="copy-table" position="1 -4.075 0.75">
          <a-box
            width="9"
            height="9"
            depth="9"
            material="color: #ffffff; emissive: #ffffff; emissiveIntensity: 0.25; roughness: 0.5"
          />
          <a-text
            class="copy-heading"
            position="0 2.6 4.51"
            value="neuronapixel"
            align="center"
            anchor="center"
            baseline="center"
            color="#1f2233"
            font="roboto"
            width="7.5"
            wrap-count="20"
            shader="msdf"
          />
          <a-text
            class="copy-paragraph"
            position="0 0.45 4.51"
            value="Web development, scripting, coding, creativity; multimedia as a language of countless interpretations in which each experience is a different message"
            align="center"
            anchor="center"
            baseline="center"
            color="#1f2233"
            font="roboto"
            width="7.2"
            wrap-count="44"
            shader="msdf"
          />
          <a-text
            class="copy-paragraph"
            position="0 -2.55 4.51"
            value="neuronapixel believes in the intrinsic value of interaction as a vehicle for the transit of ideas."
            align="center"
            anchor="center"
            baseline="center"
            color="#1f2233"
            font="roboto"
            width="7.2"
            wrap-count="44"
            shader="msdf"
          />
        </a-entity>

        <a-entity
          v-for="(cloud, cloudIndex) in clouds"
          :key="cloud.id"
          class="day-cloud"
          :data-cloud-index="cloudIndex"
          :position="`${cloud.startX} ${cloud.startY} ${cloud.z}`"
          visible="false"
        >
          <a-entity
            v-for="cubeDefinition in cloud.cubes"
            :key="`${cloud.id}-${cubeDefinition.position}`"
            class="day-cloud-cube"
            mixin="cube animated-white-material"
            :position="cubeDefinition.position"
            :scale="cubeDefinition.scale"
          />
        </a-entity>

        <a-entity
          v-for="(star, starIndex) in stars"
          :key="star.position"
          class="night-star"
          mixin="cube animated-white-material"
          :data-star-index="starIndex"
          :position="star.position"
          visible="false"
        />

        <a-sky id="day-night-sky" color="#fff" />
      </a-scene>
    </section>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { getDayNightFrame } from '@/utils/dayNightCycle';

interface MaterialComponent {
  material?: {
    opacity: number;
    transparent: boolean;
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

const clouds: Array<{
  cubes: CubeDefinition[];
  endX: number;
  endY: number;
  id: string;
  startX: number;
  startY: number;
  z: number;
}> = [
  {
    id: 'cloud-one',
    startX: -28,
    startY: 10,
    endX: 26,
    endY: 8,
    z: -18,
    cubes: [
      { position: '-3 0 0', scale: '1 1 1' },
      { position: '-2 0 0', scale: '2 2 2' },
      { position: '0 0 0', scale: '2 2 2' },
      { position: '2 0 0', scale: '2 2 2' },
      { position: '4 0 0', scale: '1 1 1' },
      { position: '0 2 0', scale: '2 2 2' },
    ],
  },
  {
    id: 'cloud-two',
    startX: 26,
    startY: 4,
    endX: -24,
    endY: 7,
    z: -14,
    cubes: [
      { position: '-4 0 0', scale: '1 1 1' },
      { position: '-3 0 0', scale: '2 2 2' },
      { position: '-1 0 0', scale: '2 2 2' },
      { position: '1 0 0', scale: '2 2 2' },
      { position: '3 0 0', scale: '1 1 1' },
      { position: '-1 2 0', scale: '2 2 2' },
      { position: '1 2 0', scale: '1 1 1' },
    ],
  },
  {
    id: 'cloud-three',
    startX: -26,
    startY: 8,
    endX: 20,
    endY: 4,
    z: -22,
    cubes: [
      { position: '-4 0 0', scale: '1 1 1' },
      { position: '-3 0 0', scale: '2 2 2' },
      { position: '-1 0 0', scale: '2 2 2' },
      { position: '1 0 0', scale: '1 1 1' },
      { position: '-1 2 0', scale: '2 2 2' },
    ],
  },
  {
    id: 'cloud-four',
    startX: 22,
    startY: 12,
    endX: -26,
    endY: 9,
    z: -30,
    cubes: [
      { position: '-2 0 0', scale: '1 1 1' },
      { position: '-1 0 0', scale: '2 2 2' },
      { position: '1 0 0', scale: '2 2 2' },
      { position: '3 0 0', scale: '1 1 1' },
      { position: '1 2 0', scale: '1 1 1' },
    ],
  },
  {
    id: 'cloud-five',
    startX: -20,
    startY: 6,
    endX: 22,
    endY: 11,
    z: -26,
    cubes: [
      { position: '-3 0 0', scale: '2 2 2' },
      { position: '-1 0 0', scale: '2 2 2' },
      { position: '1 0 0', scale: '2 2 2' },
      { position: '3 0 0', scale: '2 2 2' },
      { position: '-1 2 0', scale: '1 1 1' },
      { position: '1 2 0', scale: '2 2 2' },
    ],
  },
  {
    id: 'cloud-six',
    startX: 24,
    startY: 3,
    endX: -18,
    endY: 6,
    z: -18,
    cubes: [
      { position: '-2 0 0', scale: '1 1 1' },
      { position: '-1 0 0', scale: '1 1 1' },
      { position: '0 0 0', scale: '2 2 2' },
      { position: '2 0 0', scale: '2 2 2' },
      { position: '4 0 0', scale: '1 1 1' },
      { position: '2 2 0', scale: '1 1 1' },
    ],
  },
  {
    id: 'cloud-seven',
    startX: -32,
    startY: 3,
    endX: 30,
    endY: 9,
    z: -34,
    cubes: [
      { position: '-3 0 0', scale: '1 1 1' },
      { position: '-2 0 0', scale: '2 2 2' },
      { position: '0 0 0', scale: '2 2 2' },
      { position: '2 0 0', scale: '1 1 1' },
      { position: '0 2 0', scale: '1 1 1' },
    ],
  },
  {
    id: 'cloud-eight',
    startX: 30,
    startY: 14,
    endX: -30,
    endY: 11,
    z: -24,
    cubes: [
      { position: '-4 0 0', scale: '1 1 1' },
      { position: '-3 0 0', scale: '2 2 2' },
      { position: '-1 0 0', scale: '2 2 2' },
      { position: '1 0 0', scale: '2 2 2' },
      { position: '3 0 0', scale: '1 1 1' },
      { position: '-1 2 0', scale: '1 1 1' },
    ],
  },
  {
    id: 'cloud-nine',
    startX: -24,
    startY: 12,
    endX: 28,
    endY: 5,
    z: -16,
    cubes: [
      { position: '-2 0 0', scale: '2 2 2' },
      { position: '0 0 0', scale: '2 2 2' },
      { position: '2 0 0', scale: '2 2 2' },
      { position: '4 0 0', scale: '1 1 1' },
      { position: '0 2 0', scale: '2 2 2' },
      { position: '2 2 0', scale: '1 1 1' },
    ],
  },
  {
    id: 'cloud-ten',
    startX: 18,
    startY: 7,
    endX: -28,
    endY: 13,
    z: -38,
    cubes: [
      { position: '-3 0 0', scale: '1 1 1' },
      { position: '-2 0 0', scale: '1 1 1' },
      { position: '-1 0 0', scale: '2 2 2' },
      { position: '1 0 0', scale: '2 2 2' },
      { position: '3 0 0', scale: '1 1 1' },
      { position: '1 2 0', scale: '2 2 2' },
    ],
  },
  {
    id: 'cloud-eleven',
    startX: -28,
    startY: 8,
    endX: 24,
    endY: 14,
    z: 34,
    cubes: [
      { position: '-3 0 0', scale: '1 1 1' },
      { position: '-2 0 0', scale: '2 2 2' },
      { position: '0 0 0', scale: '2 2 2' },
      { position: '2 0 0', scale: '1 1 1' },
      { position: '0 2 0', scale: '2 2 2' },
    ],
  },
  {
    id: 'cloud-twelve',
    startX: 26,
    startY: 16,
    endX: -30,
    endY: 12,
    z: 44,
    cubes: [
      { position: '-4 0 0', scale: '1 1 1' },
      { position: '-3 0 0', scale: '2 2 2' },
      { position: '-1 0 0', scale: '2 2 2' },
      { position: '1 0 0', scale: '2 2 2' },
      { position: '3 0 0', scale: '1 1 1' },
      { position: '-1 2 0', scale: '1 1 1' },
    ],
  },
  {
    id: 'cloud-thirteen',
    startX: -20,
    startY: 24,
    endX: 20,
    endY: 20,
    z: 28,
    cubes: [
      { position: '-2 0 0', scale: '2 2 2' },
      { position: '0 0 0', scale: '2 2 2' },
      { position: '2 0 0', scale: '2 2 2' },
      { position: '0 2 0', scale: '1 1 1' },
      { position: '2 2 0', scale: '1 1 1' },
    ],
  },
  {
    id: 'cloud-fourteen',
    startX: 22,
    startY: 28,
    endX: -22,
    endY: 22,
    z: 40,
    cubes: [
      { position: '-3 0 0', scale: '1 1 1' },
      { position: '-2 0 0', scale: '2 2 2' },
      { position: '0 0 0', scale: '2 2 2' },
      { position: '2 0 0', scale: '2 2 2' },
      { position: '4 0 0', scale: '1 1 1' },
      { position: '0 2 0', scale: '1 1 1' },
    ],
  },
  {
    id: 'cloud-fifteen',
    startX: -26,
    startY: 30,
    endX: 26,
    endY: 24,
    z: 12,
    cubes: [
      { position: '-3 0 0', scale: '1 1 1' },
      { position: '-2 0 0', scale: '2 2 2' },
      { position: '0 0 0', scale: '2 2 2' },
      { position: '2 0 0', scale: '1 1 1' },
      { position: '0 2 0', scale: '2 2 2' },
    ],
  },
  {
    id: 'cloud-sixteen',
    startX: 24,
    startY: 22,
    endX: -24,
    endY: 28,
    z: 20,
    cubes: [
      { position: '-4 0 0', scale: '1 1 1' },
      { position: '-3 0 0', scale: '2 2 2' },
      { position: '-1 0 0', scale: '2 2 2' },
      { position: '1 0 0', scale: '2 2 2' },
      { position: '3 0 0', scale: '1 1 1' },
      { position: '-1 2 0', scale: '2 2 2' },
    ],
  },
  {
    id: 'cloud-seventeen',
    startX: -30,
    startY: 6,
    endX: 22,
    endY: 12,
    z: 52,
    cubes: [
      { position: '-2 0 0', scale: '1 1 1' },
      { position: '-1 0 0', scale: '2 2 2' },
      { position: '1 0 0', scale: '2 2 2' },
      { position: '3 0 0', scale: '1 1 1' },
      { position: '1 2 0', scale: '1 1 1' },
    ],
  },
  {
    id: 'cloud-eighteen',
    startX: 18,
    startY: 34,
    endX: -26,
    endY: 30,
    z: 18,
    cubes: [
      { position: '-3 0 0', scale: '1 1 1' },
      { position: '-2 0 0', scale: '2 2 2' },
      { position: '0 0 0', scale: '2 2 2' },
      { position: '2 0 0', scale: '2 2 2' },
      { position: '4 0 0', scale: '1 1 1' },
      { position: '0 2 0', scale: '1 1 1' },
    ],
  },
];

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
];

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

  const frame = getDayNightFrame(timestamp - cycleStartedAt, stars.length);
  scene
    .querySelector<HTMLElement>('#day-night-sky')
    ?.setAttribute('color', frame.skyColor);

  scene.querySelectorAll<SceneEntity>('.day-cloud').forEach((cloud, index) => {
    const cloudDefinition = clouds[index];
    const opacity = frame.cloudOpacities[index] ?? 0;
    if (cloud.object3D && cloudDefinition) {
      const progress = frame.cloudProgress[index] ?? 0;
      cloud.object3D.position.x =
        cloudDefinition.startX +
        (cloudDefinition.endX - cloudDefinition.startX) * progress;
      cloud.object3D.position.y =
        cloudDefinition.startY +
        (cloudDefinition.endY - cloudDefinition.startY) * progress;
      cloud.object3D.visible = opacity > 0.01;
    }
    cloud.querySelectorAll<SceneEntity>('.day-cloud-cube').forEach((cube) => {
      setEntityOpacity(cube, opacity);
    });
  });

  scene.querySelectorAll<SceneEntity>('.night-star').forEach((star, index) => {
    setEntityOpacity(star, frame.starOpacities[index] ?? 0);
  });

  animationFrameId = window.requestAnimationFrame(updateScene);
};

const startCycle = () => {
  if (animationFrameId !== null) {
    return;
  }

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

:global(body) {
  overflow: hidden;
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
