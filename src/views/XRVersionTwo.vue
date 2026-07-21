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
          :position="`-24 ${cloud.y} ${cloud.z}`"
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
  id: string;
  y: number;
  z: number;
}> = [
  {
    id: 'cloud-one',
    y: 6,
    z: -14,
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
    y: 4,
    z: -16,
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
];

const stars = [
  { position: '-20 9 -28' },
  { position: '-16 5 -32' },
  { position: '-12 11 -26' },
  { position: '-8 4 -30' },
  { position: '-4 8 -34' },
  { position: '0 12 -29' },
  { position: '4 6 -33' },
  { position: '8 10 -27' },
  { position: '12 4 -35' },
  { position: '16 8 -31' },
  { position: '20 12 -36' },
  { position: '22 5 -30' },
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
    const opacity = frame.cloudOpacities[index] ?? 0;
    if (cloud.object3D) {
      cloud.object3D.position.x = -24 + (frame.cloudProgress[index] ?? 0) * 48;
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
