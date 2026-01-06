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
          <a-mixin
            id="primary-material"
            material="color: #ff2f2f; metalness: 0.05; roughness: 0.4"
          />
          <a-mixin
            id="secondary-material"
            material="color: #ffffff; roughness: 0.4; emissive: #ffffff; emissiveIntensity: 0.4"
          />
          <a-mixin
            id="cube"
            geometry="primitive: box; depth: 1; height: 1; width: 1"
          />
        </a-assets>
        <a-entity
          id="rig"
          position="1 1.5 9"
        >
          <a-entity
            id="camera"
            camera="fov:65"
            look-controls
            wasd-controls="fly:true"
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
          position="0 0 0"
          mixin="cube primary-material"
        />
        <a-entity
          position="1 0 0"
          mixin="cube secondary-material"
        />
        <a-entity
          position="2 0 0"
          mixin="cube primary-material"
        />

        <a-entity
          position="0 1 0"
          mixin="cube primary-material"
        />
        <a-entity
          position="1 1 0"
          mixin="cube secondary-material"
        />
        <a-entity
          position="2 1 0"
          mixin="cube primary-material"
        />

        <a-entity
          position="0 2 0"
          mixin="cube primary-material"
        />
        <a-entity
          position="1 2 0"
          mixin="cube primary-material"
        />
        <a-entity
          position="2 2 0"
          mixin="cube secondary-material"
        />

        <a-entity
          position="0 0 1"
          mixin="cube primary-material"
        />
        <a-entity
          position="1 0 1"
          mixin="cube secondary-material"
        />
        <a-entity
          position="2 0 1"
          mixin="cube primary-material"
        />

        <a-entity
          position="0 1 1"
          mixin="cube primary-material"
        />
        <a-entity
          position="1 1 1"
          mixin="cube secondary-material"
        /> 
        <a-entity
          position="2 1 1"
          mixin="cube primary-material"
        />

        <a-entity
          position="0 2 1"
          mixin="cube primary-material"
        />
        <a-entity
          position="1 2 1"
          mixin="cube primary-material"
        />
        <a-entity
          position="2 2 1"
          mixin="cube secondary-material"
        />

        <a-entity
          position="0 0 2"
          mixin="cube primary-material"
        />
        <a-entity
          position="1 0 2"
          mixin="cube secondary-material"
        /> 
        <a-entity
          position="2 0 2"
          mixin="cube primary-material"
        />

        <a-entity
          position="0 1 2"
          mixin="cube primary-material"
        />
        <a-entity
          position="1 1 2"
          mixin="cube secondary-material"
        />
        <a-entity
          position="2 1 2"
          mixin="cube primary-material"
        />

        <a-entity
          position="0 2 2"
          mixin="cube primary-material"
        />
        <a-entity
          position="1 2 2"
          mixin="cube primary-material"
        />
        <a-entity
          position="2 2 2"
          mixin="cube secondary-material"
        />

        <a-sky color="#fff" />
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

<style scoped>

.xr-experience {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  color: #1f2233;
}

.viewport {
  width: 100%;
  height: 75vh;
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
