<template>
  <div class="xr-experience">
    <section class="viewport desktop">

      <a-scene
        embedded
        vr-mode-ui="enabled: false"
        renderer="antialias: true; colorManagement: true"
        :inspector="inspectorAttribute"
      >
        <a-assets>
          <a-mixin id="primary-material" material="color: #ff2f2f; metalness: 0.05; roughness: 0.4"></a-mixin>
        </a-assets>

        <a-entity
          id="desktop-camera"
          camera
          position="0 1.6 0"
          look-controls="pointerLockEnabled: false"
          wasd-controls="enabled: false"
        ></a-entity>

        <a-entity light="type: directional; intensity: 0.75" position="-1.5 3 2"></a-entity>
        <a-entity light="type: directional; intensity: 0.45" position="2 2.5 -1"></a-entity>
        <a-entity light="type: ambient; intensity: 0.35"></a-entity>

        <a-box
          id="xr-model"
          position="-1 0.75 -3"
          rotation="0 45 0"
          depth="1.4"
          height="1.4"
          width="1.4"
          mixin="primary-material"
        >
          <a-animation attribute="rotation" dur="12000" easing="linear" repeat="indefinite" to="0 405 0"></a-animation>
        </a-box>

        <a-plane rotation="-90 0 0" width="8" height="8" color="#ffffff" shadow="receive: true"></a-plane>
        <a-sky color="#fff"></a-sky>
      </a-scene>
    </section>
    <section>
      <div class="info">
        <h2>Neuronapixel</h2>
         <p>
        Web development, scripting, coding, creativity; multimedia as a language
        of countless interpretations in which each experience is a different
        message
      </p>
      <p>
        Neuronapixel believes in the intrinsic value of interaction as a vehicle
        for the transit of ideas.
      </p>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";

const isMobile = ref(false);
const isIOS = ref(false);

const inspectorAttribute = import.meta.env.DEV ? "" : null;

const isIOSDevice = () =>
  typeof navigator !== "undefined" && /iP(hone|ad|od)/i.test(navigator.userAgent);

const updateViewport = () => {
  isMobile.value = window.innerWidth <= 900;
};

onMounted(() => {
  isIOS.value = isIOSDevice();
  updateViewport();
  window.addEventListener("resize", updateViewport);
});

onUnmounted(() => {
  window.removeEventListener("resize", updateViewport);
});
</script>

<style scoped lang="scss">

.xr-experience {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  color: #1f2233;
}

.viewport {
  width: 100%;
  height: 100vh;
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
