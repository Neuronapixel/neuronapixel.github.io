<template>
  <main class="sky-window" :lang="locale">
    <section
      id="sky-controls"
      class="sky-controls"
      :aria-label="t('ar.controls')"
    >
      <template v-if="!active">
        <div class="top-bar">
          <a class="back-link" href="#/">{{ t('ar.brand') }}</a>
          <select
            v-model="locale"
            :aria-label="t('ar.language')"
            class="language-select"
          >
            <option value="en" lang="en" :aria-label="t('ar.english')">
              EN
            </option>
            <option value="es" lang="es" :aria-label="t('ar.spanish')">
              ES
            </option>
          </select>
        </div>
        <div class="invitation">
          <p class="eyebrow">{{ t('ar.eyebrow') }}</p>
          <h1>{{ t('ar.title') }}</h1>
          <p id="sky-status" role="status" aria-live="polite">
            {{
              quickLookSupported && status.state === 'unsupported'
                ? t('ar.invitation')
                : statusMessage
            }}
          </p>
          <ArQuickLook @support="quickLookSupported = $event" />
          <button
            v-if="status.state !== 'unsupported'"
            :disabled="!canEnter"
            aria-describedby="sky-status"
            @click="controller?.enter()"
          >
            {{ t(status.state === 'error' ? 'ar.retry' : 'ar.enter') }}
          </button>
          <a
            v-if="status.state === 'unsupported'"
            class="explore-link"
            href="#/"
            >{{ t('ar.explore') }}</a
          >
        </div>
      </template>
      <div v-else-if="status.overlay" class="session-controls">
        <p role="status" aria-live="polite">{{ statusMessage }}</p>
        <button @click="controller?.exit()">{{ t('ar.exit') }}</button>
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
            :value="statusMessage"
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
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { saveLocale } from '@/i18n';
import LogoMark from '@/components/logo-mark.vue';
import ArQuickLook from '@/components/ar-quick-look.vue';
import SkyEnvironment from '@/components/sky-environment.vue';
import {
  createRoomArSession,
  type ArCapabilities,
  type ArStatus,
} from '@/utils/roomArSession';
import type { SceneEntity, SkyScene } from '@/utils/skyScene';

const { t, locale } = useI18n();
watch(locale, saveLocale);
const inspectorAttribute = import.meta.env.DEV ? '' : null;
const sceneRef = ref<SkyScene | null>(null);
const logoRef = ref<SceneEntity | null>(null);
const quickLookSupported = ref(false);
const status = ref<ArStatus>({
  state: 'checking',
  messageKey: 'checking',
  overlay: false,
});
const statusMessage = computed(() => t(`arStatus.${status.value.messageKey}`));
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
  padding: max(28px, env(safe-area-inset-top))
    max(28px, env(safe-area-inset-right));
  box-sizing: border-box;
}
.sky-controls a,
.sky-controls button,
.sky-controls select {
  pointer-events: auto;
}
.top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}
.back-link,
.language-select,
.invitation {
  background: rgba(255, 255, 255, 0.94);
  border: 1px solid rgba(31, 34, 51, 0.14);
  box-shadow: 0 4px 24px rgba(15, 20, 36, 0.08);
}
.language-select {
  color: inherit;
  font: inherit;
  font-size: 14px;
  min-height: 44px;
  border-radius: 24px;
  padding: 8px 12px;
}
.back-link {
  color: inherit;
  text-decoration: none;
  font-size: 15px;
  letter-spacing: 0.06em;
  padding: 12px 16px;
  border-radius: 24px;
}
.invitation {
  position: absolute;
  left: 28px;
  right: 28px;
  bottom: max(40px, env(safe-area-inset-bottom));
  max-width: 480px;
  max-height: calc(100% - 144px);
  box-sizing: border-box;
  overflow-y: auto;
  padding: 20px 24px;
  border-radius: 24px;
  pointer-events: auto;
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
a:focus-visible,
select:focus-visible {
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
    padding: 16px 20px;
  }
  .explore-link {
    display: block;
    margin-left: 0;
  }
}
</style>
