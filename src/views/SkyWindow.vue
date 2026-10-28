<template>
  <main class="sky-window">
    <section
      id="sky-controls"
      class="sky-controls"
      :class="{ immersive: active }"
      aria-label="Sky controls"
    >
      <template v-if="!active">
        <a class="back-link" href="#/">Neuronapixel ↗</a>
        <div class="invitation">
          <p class="eyebrow">A window into a hidden world</p>
          <h1>Take the sky with you.</h1>
          <p id="sky-status" role="status" aria-live="polite">
            {{ status.message }}
          </p>
          <button
            :disabled="!canEnter"
            aria-describedby="sky-status"
            @click="controller?.enter()"
          >
            {{ status.state === 'error' ? 'Try again' : 'Enter the sky' }}
          </button>
          <a
            v-if="status.state === 'unsupported'"
            class="explore-link"
            href="#/"
            >Explore the original sky</a
          >
        </div>
      </template>
      <div v-else-if="status.overlay" class="session-controls">
        <p role="status" aria-live="polite">{{ status.message }}</p>
        <button @click="controller?.exit()">Exit sky</button>
      </div>
    </section>
    <a-scene
      ref="sceneRef"
      embedded
      xr-mode-ui="enabled: false"
      webxr="referenceSpaceType: local; requiredFeatures: local; optionalFeatures: dom-overlay; overlayElement: #sky-controls"
      renderer="antialias: true; colorManagement: true; alpha: false"
      :inspector="inspectorAttribute"
    >
      <a-entity
        id="sky-camera"
        camera="fov: 50"
        position="0 0 0"
        look-controls="pointerLockEnabled: false; magicWindowTrackingEnabled: false"
      >
        <a-entity
          v-if="status.state === 'tracking' && !status.overlay"
          position="0 -0.3 -0.8"
        >
          <a-plane
            width="1"
            height="0.16"
            color="#1f2233"
            material="shader: flat"
          />
          <a-text
            :value="status.message"
            align="center"
            width="0.9"
            position="0 0 0.005"
            color="#ffffff"
          />
        </a-entity>
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
      <a-entity id="sky-logo-placement" ref="logoRef" position="0 0 -1.5">
        <a-entity rotation="12 -22 0" scale="0.1 0.1 0.1">
          <LogoMark />
        </a-entity>
      </a-entity>
      <SkyEnvironment camera-id="sky-camera" />
    </a-scene>
  </main>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import LogoMark from '@/components/logo-mark.vue';
import SkyEnvironment from '@/components/sky-environment.vue';
import {
  createRoomArSession,
  type ArCapabilities,
  type ArStatus,
} from '@/utils/roomArSession';
import type { SceneEntity, SkyScene } from '@/utils/skyScene';

const inspectorAttribute = import.meta.env.DEV ? '' : null;
const sceneRef = ref<SkyScene | null>(null);
const logoRef = ref<SceneEntity | null>(null);
const status = ref<ArStatus>({
  state: 'checking',
  message: 'Checking movement tracking…',
  overlay: false,
});
const active = computed(() =>
  ['starting', 'tracking', 'placed'].includes(status.value.state),
);
const canEnter = computed(() =>
  ['ready', 'error'].includes(status.value.state),
);
let controller: ReturnType<typeof createRoomArSession> | undefined;
onMounted(() => {
  if (!sceneRef.value || !logoRef.value) return;
  const xr = (navigator as Navigator & { xr?: ArCapabilities['xr'] }).xr;
  controller = createRoomArSession(
    sceneRef.value,
    logoRef.value,
    {
      secure: window.isSecureContext,
      xr,
    },
    (next) => {
      status.value = next;
    },
  );
});
onBeforeUnmount(() => controller?.dispose());
</script>

<style scoped>
.sky-window {
  position: fixed;
  inset: 0;
  background: #a6d0ed;
  text-align: left;
}
a-scene {
  width: 100%;
  height: 100%;
}
.sky-controls {
  position: absolute;
  inset: 0;
  z-index: 2;
  color: #1f2233;
  pointer-events: none;
  background: linear-gradient(
    to bottom,
    rgba(255, 255, 255, 0.55),
    transparent 18%,
    transparent 55%,
    rgba(255, 255, 255, 0.85)
  );
  padding: max(28px, env(safe-area-inset-top))
    max(28px, env(safe-area-inset-right));
  box-sizing: border-box;
}
.sky-controls.immersive {
  background: transparent;
}
.sky-controls a,
.sky-controls button {
  pointer-events: auto;
}
.back-link {
  color: inherit;
  text-decoration: none;
  font-size: 15px;
  letter-spacing: 0.06em;
}
.invitation {
  position: absolute;
  left: 28px;
  right: 28px;
  bottom: max(40px, env(safe-area-inset-bottom));
  max-width: 480px;
}
.eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.16em;
  font-size: 11px;
}
h1 {
  font-size: clamp(28px, 5vw, 46px);
  line-height: 1.1;
  margin: 14px 0;
  font-weight: 500;
  letter-spacing: -0.035em;
}
#sky-status {
  max-width: 400px;
  font-size: 15px;
  line-height: 1.55;
}
button {
  border: 1px solid #1f2233;
  border-radius: 28px;
  background: #1f2233;
  color: white;
  padding: 14px 24px;
  font: inherit;
  cursor: pointer;
}
button:disabled {
  opacity: 0.5;
  cursor: default;
}
button:focus-visible,
a:focus-visible {
  outline: 3px solid #ff2f2f;
  outline-offset: 5px;
}
.explore-link {
  display: inline-block;
  color: inherit;
  margin: 16px 18px;
  font-size: 14px;
}
.session-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  background: rgba(255, 255, 255, 0.9);
  padding: 12px 20px;
  border-radius: 20px;
}
@media (max-width: 480px) {
  .invitation {
    bottom: max(24px, env(safe-area-inset-bottom));
  }
  .explore-link {
    display: block;
    margin-left: 0;
  }
}
</style>
