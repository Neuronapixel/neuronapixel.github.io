<template>
  <div class="xr-experience">
    <section class="viewport desktop">
      <a-scene
        embedded
        vr-mode-ui="enabled: false"
        renderer="antialias: true; colorManagement: true"
        :inspector="inspectorAttribute"
      >
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
          <LogoMark />
        </a-entity>

        <SkyEnvironment camera-id="camera" />
      </a-scene>
    </section>
  </div>
</template>

<script setup lang="ts">
import LogoMark from '@/components/logo-mark.vue';
import SkyEnvironment from '@/components/sky-environment.vue';
const inspectorAttribute = import.meta.env.DEV ? '' : null;
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
