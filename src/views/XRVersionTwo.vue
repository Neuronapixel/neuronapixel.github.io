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

        <a-sky color="#fff" />
      </a-scene>
    </section>
  </div>
</template>

<script setup lang="ts">
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
