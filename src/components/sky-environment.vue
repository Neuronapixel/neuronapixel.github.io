<template>
  <a-entity ref="hostRef">
    <a-entity id="cloud-field" />

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

    <a-entity id="day-night-sky" />
  </a-entity>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { getDayNightFrame } from '@/utils/dayNightCycle';
import { createSkyRenderer, type SkyRenderer } from '@/utils/skyRenderer';
import { createCloudRenderer, type CloudRenderer } from '@/utils/cloudRenderer';
import {
  readViewerPose,
  type SceneEntity,
  type SkyScene,
} from '@/utils/skyScene';

const props = defineProps<{ cameraId: string }>();
const hostRef = ref<SceneEntity | null>(null);
let scene: SkyScene | null = null;
let cloudRenderer: CloudRenderer | null = null;
let skyRenderer: SkyRenderer | null = null;
let sky: SceneEntity | null = null;
let starField: SceneEntity | null = null;
let starNodes: {
  root: SceneEntity;
  parts: { el: SceneEntity; glow: boolean }[];
}[] = [];
let startedAt: number | null = null;
let attached = false;

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

const behavior = {
  get el() {
    return scene;
  },
  tick: () => {
    const now = performance.now();
    startedAt ??= now;
    const previewTime = import.meta.env.DEV
      ? new URLSearchParams(location.search).get('skyPreviewMs')
      : null;
    const elapsedMs =
      previewTime === null ? now - startedAt : Number(previewTime);
    const frame = getDayNightFrame(elapsedMs, stars.length);
    const camera = scene?.querySelector<SceneEntity>(`#${props.cameraId}`);
    // XR poses use the renderer's reference space, including physical translation.
    const viewer = readViewerPose(scene)?.transform.position ??
      camera?.object3D?.position ?? { x: 0, y: 0, z: 0 };
    skyRenderer?.update(frame);
    // DOMPointReadOnly coordinates are getters, not enumerable properties.
    const center = { x: viewer.x, y: viewer.y, z: viewer.z };
    if (sky?.object3D) Object.assign(sky.object3D.position, center);
    if (starField?.object3D) Object.assign(starField.object3D.position, center);
    cloudRenderer?.update(viewer, elapsedMs, frame.cloudColor);
    starNodes.forEach(({ root, parts }, index) => {
      const opacity = frame.starOpacities[index] ?? 0;
      if (root.object3D) root.object3D.visible = opacity > 0.0001;
      parts.forEach(({ el, glow }) => {
        const value = opacity * (glow ? 0.35 : 1);
        if (el.object3D) el.object3D.visible = value > 0.0001;
        const material = el.components?.material?.material;
        if (material) material.opacity = value;
      });
    });
  },
};

const start = () => {
  if (attached || !scene) return;
  attached = true;
  sky = hostRef.value?.querySelector<SceneEntity>('#day-night-sky') ?? null;
  starField = hostRef.value?.querySelector<SceneEntity>('#night-stars') ?? null;
  if (sky) skyRenderer = createSkyRenderer(sky);
  starNodes = Array.from(
    hostRef.value?.querySelectorAll<SceneEntity>('.night-star') ?? [],
  ).map((root) => ({
    root,
    parts: Array.from(
      root.querySelectorAll<SceneEntity>('.star-core, .star-glow'),
    ).map((el) => ({
      el,
      glow: el.classList.contains('star-glow'),
    })),
  }));
  const cloudField = hostRef.value?.querySelector<SceneEntity>('#cloud-field');
  if (cloudField) cloudRenderer = createCloudRenderer(cloudField);
  startedAt = performance.now();
  scene.addBehavior?.(behavior);
};
onMounted(() => {
  scene = hostRef.value?.closest<SkyScene>('a-scene') ?? null;
  if (scene?.hasLoaded) start();
  else scene?.addEventListener('loaded', start);
});
onBeforeUnmount(() => {
  scene?.removeEventListener('loaded', start);
  if (attached) scene?.removeBehavior?.(behavior);
  cloudRenderer?.dispose();
  skyRenderer?.dispose();
  starNodes = [];
  sky = null;
  starField = null;
  scene = null;
});
</script>
