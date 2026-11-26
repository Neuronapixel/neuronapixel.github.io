<template>
  <main class="sky-window" :lang="locale">
    <section
      id="sky-controls"
      class="sky-controls"
      :aria-label="t('ar.controls')"
      @focusin="controlsFocused = true"
      @focusout="controlsFocused = false"
    >
      <template v-if="!immersive">
        <div class="invitation">
          <p class="eyebrow">
            <span class="text-highlight">{{ t('ar.eyebrow') }}</span>
          </p>
          <h1>
            <span class="text-highlight">{{ t('ar.title') }}</span>
          </h1>
          <p id="sky-status" role="status" aria-live="polite">
            <span class="text-highlight">
              {{
                quickLookSupported && status.state === 'unsupported'
                  ? t('ar.invitation')
                  : statusMessage
              }}
            </span>
          </p>
          <p v-if="desktop" class="navigation-hint">
            <span class="text-highlight">{{ t('ar.navigation') }}</span>
          </p>
          <ArQuickLook @support="quickLookSupported = $event" />
          <button
            v-if="status.state !== 'unsupported'"
            :disabled="!canEnter"
            aria-describedby="sky-status"
            @click="enterSky"
          >
            {{ t(status.state === 'error' ? 'ar.retry' : 'ar.enter') }}
          </button>
          <button
            v-if="
              !desktop &&
              requiresMotionPermission &&
              !active &&
              (motionPermission === 'prompt' ||
                motionPermission === 'requesting')
            "
            class="motion-button"
            :aria-disabled="motionPermission === 'requesting'"
            @click="enablePreviewMotion"
          >
            {{ t('ar.enablePreviewMotion') }}
          </button>
          <div v-if="requiresMotionPermission" role="status" aria-live="polite">
            <p
              v-if="
                !active &&
                (motionPermission === 'granted' ||
                  motionPermission === 'denied')
              "
              ref="motionResultRef"
              class="motion-result"
              tabindex="-1"
            >
              <span class="text-highlight">
                {{
                  t(
                    motionPermission === 'granted'
                      ? 'ar.previewMotionEnabled'
                      : 'ar.dragPreview',
                  )
                }}
              </span>
            </p>
          </div>
        </div>
        <div class="bottom-controls">
          <a
            class="back-link"
            href="#/xr"
            @click="trackSkyWindowClick('return_to_sky')"
          >
            <img
              src="/favicon.ico"
              :alt="t('ar.brand')"
              width="32"
              height="32"
            />
            <span aria-hidden="true">↗</span>
          </a>
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
      </template>
      <div v-else-if="status.overlay" class="session-controls">
        <p role="status" aria-live="polite">{{ statusMessage }}</p>
        <button @click="exitSky">{{ t('ar.exit') }}</button>
      </div>
    </section>
    <a-scene
      ref="sceneRef"
      embedded
      device-orientation-permission-ui="enabled: false"
      xr-mode-ui="enabled: false"
      webxr="referenceSpaceType: local; requiredFeatures: local; optionalFeatures: dom-overlay; overlayElement: #sky-controls"
      renderer="antialias: true; colorManagement: true; alpha: false"
      :inspector="inspectorAttribute"
    >
      <a-entity
        id="sky-camera"
        ref="cameraRef"
        camera="fov: 50"
        position="0 0 0"
        :look-controls="`pointerLockEnabled: false; magicWindowTrackingEnabled: ${previewMotionEnabled}`"
        :wasd-controls="
          desktop && !active && !controlsFocused
            ? 'fly: true; acceleration: 3'
            : undefined
        "
      >
        <a-entity v-if="immersive && !status.overlay" position="0 -0.3 -0.8">
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
        <a-entity
          :key="active ? 'tracked' : 'preview'"
          position="0 0 0"
          rotation="12 -22 0"
          scale="0.1 0.1 0.1"
          :animation="
            active
              ? undefined
              : 'property: position; from: 0 -0.02 0; to: 0 0.02 0; dur: 6000; dir: alternate; loop: true; easing: easeInOutSine'
          "
        >
          <LogoMark />
        </a-entity>
      </a-entity>
      <SkyEnvironment camera-id="sky-camera" />
    </a-scene>
  </main>
</template>

<script setup lang="ts">
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
} from 'vue';
import { useI18n } from 'vue-i18n';
import { saveLocale } from '@/i18n';
import LogoMark from '@/components/logo-mark.vue';
import ArQuickLook from '@/components/ar-quick-look.vue';
import SkyEnvironment from '@/components/sky-environment.vue';
import { trackSkyWindowClick } from '@/utils/analytics';
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
const cameraRef = ref<SceneEntity | null>(null);
const logoRef = ref<SceneEntity | null>(null);
const motionResultRef = ref<HTMLParagraphElement | null>(null);
const desktop = ref(false);
const controlsFocused = ref(false);
const orientation = window.DeviceOrientationEvent as
  | (typeof DeviceOrientationEvent & {
      requestPermission?: () => Promise<PermissionState>;
    })
  | undefined;
const requiresMotionPermission =
  typeof orientation?.requestPermission === 'function';
const motionPermission = ref<PermissionState | 'requesting'>('prompt');
const previewMotionEnabled = computed(
  () => !requiresMotionPermission || motionPermission.value === 'granted',
);
const enablePreviewMotion = async (event: MouseEvent) => {
  if (!orientation?.requestPermission || motionPermission.value !== 'prompt')
    return;
  const button = event.currentTarget;
  const startedWithFocus = document.activeElement === button;
  motionPermission.value = 'requesting';
  try {
    motionPermission.value = await orientation.requestPermission();
  } catch {
    motionPermission.value = 'denied';
  }
  const focused = document.activeElement;
  const shouldMoveFocus =
    focused === button || (startedWithFocus && focused === document.body);
  if (!shouldMoveFocus) return;
  await nextTick();
  if (document.activeElement === document.body) {
    motionResultRef.value?.focus();
  }
};
let desktopQuery: MediaQueryList | undefined;
const updateDesktop = () => {
  desktop.value = desktopQuery?.matches ?? false;
};
const quickLookSupported = ref(false);
const status = ref<ArStatus>({
  state: 'checking',
  messageKey: 'checking',
  overlay: false,
});
const statusMessage = computed(() => t(`arStatus.${status.value.messageKey}`));
const immersive = computed(
  () => status.value.state === 'tracking' || status.value.state === 'placed',
);
const active = computed(
  () => status.value.state === 'starting' || immersive.value,
);
watch(immersive, () => {
  // Switching overlays can remove a focused control without firing focusout.
  controlsFocused.value = false;
});
const canEnter = computed(() =>
  ['ready', 'error'].includes(status.value.state),
);
let controller: ReturnType<typeof createRoomArSession> | undefined;
const enterSky = () => {
  trackSkyWindowClick(status.value.state === 'error' ? 'retry_ar' : 'enter_ar');
  // Desktop exploration must not offset the tracked camera's reference space.
  cameraRef.value?.setAttribute('position', '0 0 0');
  controller?.enter();
};
const exitSky = () => {
  trackSkyWindowClick('exit_ar');
  controller?.exit();
};
onMounted(() => {
  desktopQuery = window.matchMedia?.('(hover: hover) and (pointer: fine)');
  updateDesktop();
  desktopQuery?.addEventListener('change', updateDesktop);
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
onBeforeUnmount(() => {
  desktopQuery?.removeEventListener('change', updateDesktop);
  controller?.dispose();
});
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
  --controls-bottom: max(40px, env(safe-area-inset-bottom));
  --bottom-controls-height: 48px;
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
.bottom-controls,
.invitation {
  position: absolute;
  left: max(28px, env(safe-area-inset-left));
  right: max(28px, env(safe-area-inset-right));
}
.bottom-controls {
  bottom: var(--controls-bottom);
  display: flex;
  justify-content: space-between;
  height: var(--bottom-controls-height);
  pointer-events: none;
}
.language-select {
  appearance: none;
  color-scheme: dark;
  color: #fff;
  background-color: #000;
  border: 1px solid #000;
  font: inherit;
  font-size: 14px;
  min-width: 64px;
  border-radius: 0;
  padding: 8px 28px 8px 12px;
  cursor: pointer;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12' fill='none'%3E%3Cpath d='m2.5 4.5 3.5 3.5 3.5-3.5' stroke='%23fff' stroke-width='1.6'/%3E%3C/svg%3E");
  background-position: right 8px center;
  background-repeat: no-repeat;
}
.back-link {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 10px 0 8px;
  background: #000;
  color: #fff;
  text-decoration: none;
}
.invitation {
  --invitation-bottom: calc(
    var(--controls-bottom) + var(--bottom-controls-height) + 8px
  );
  bottom: var(--invitation-bottom);
  max-width: 480px;
  max-height: calc(
    100% - var(--invitation-bottom) - max(28px, env(safe-area-inset-top))
  );
  box-sizing: border-box;
  overflow-y: auto;
  padding-block: 20px;
  pointer-events: auto;
}
.text-highlight {
  background: #000;
  color: #fff;
  padding-inline: 0.2em;
  -webkit-box-decoration-break: clone;
  box-decoration-break: clone;
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
.navigation-hint {
  font-size: 13px;
  line-height: 1.5;
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
button:disabled,
button[aria-disabled='true'] {
  opacity: 0.5;
  cursor: default;
}
.invitation button {
  border-color: #000;
  background: #000;
}
.motion-button {
  border-radius: 0;
}
button:focus-visible,
a:focus-visible,
select:focus-visible,
.motion-result:focus-visible {
  outline: 2px solid #fff;
  outline-offset: 2px;
  box-shadow: 0 0 0 5px #000;
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
  .sky-controls {
    --controls-bottom: max(24px, env(safe-area-inset-bottom));
  }
  .invitation {
    padding-block: 16px;
  }
}
</style>
