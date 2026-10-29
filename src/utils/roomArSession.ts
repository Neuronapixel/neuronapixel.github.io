import type { ArMessageKey } from '@/i18n';
import { getArPlacement } from './arPlacement';
import {
  readViewerPose,
  type ArSession,
  type SceneEntity,
  type SkyScene,
} from './skyScene';

export type ArState =
  | 'checking'
  | 'ready'
  | 'unsupported'
  | 'starting'
  | 'tracking'
  | 'placed'
  | 'error';
export interface ArStatus {
  state: ArState;
  messageKey: ArMessageKey;
  overlay: boolean;
}
export interface ArCapabilities {
  secure: boolean;
  xr?: { isSessionSupported: (mode: string) => Promise<boolean> };
}

export const createRoomArSession = (
  scene: SkyScene,
  logo: SceneEntity,
  capabilities: ArCapabilities,
  onChange: (status: ArStatus) => void,
) => {
  let status: ArStatus = {
    state: 'checking',
    messageKey: 'checking',
    overlay: false,
  };
  let disposed = false;
  let supported = false;
  let loaded = !!scene.hasLoaded;
  let owned: ArSession | null = null;
  let reference: EventTarget | null = null;
  let reset = false;
  let placed = false;
  let attached = false;
  let requesting = false;
  const publish = (
    state: ArState,
    messageKey: ArMessageKey,
    overlay = false,
  ) => {
    if (disposed) return;
    if (
      status.state === state &&
      status.messageKey === messageKey &&
      status.overlay === overlay
    )
      return;
    status = { state, messageKey, overlay };
    onChange(status);
  };
  const showLogo = (visible: boolean) => {
    logo.setAttribute('visible', String(visible));
  };
  const preview = () => {
    logo.setAttribute('position', '0 0 -1.5');
    showLogo(true);
  };
  const detachReference = () => {
    reference?.removeEventListener('reset', onReset);
    reference = null;
  };
  const onEnd = () => {
    owned?.removeEventListener('end', onEnd);
    owned = null;
    placed = false;
    detachReference();
    if (disposed) return;
    preview();
    publish(reset ? 'error' : 'ready', reset ? 'reset' : 'ready');
  };
  const end = () => {
    if (!owned) return;
    void owned.end().catch(() => {
      publish(status.state, 'exitFailed', status.overlay);
    });
  };
  const onReset = () => {
    reset = true;
    placed = false;
    showLogo(false);
    publish('tracking', 'resetting', status.overlay);
    end();
  };
  const onEnter = () => {
    if (disposed || !requesting || owned || !scene.xrSession) return;
    owned = scene.xrSession;
    owned.addEventListener('end', onEnd);
    publish('tracking', 'tracking', !!owned.domOverlayState);
  };
  const behavior = {
    el: scene,
    tick: () => {
      if (!owned || disposed || reset) return;
      const currentReference = scene.renderer?.xr.getReferenceSpace?.();
      if (currentReference !== reference) {
        if (reference) {
          onReset();
          return;
        }
        reference = currentReference ?? null;
        reference?.addEventListener('reset', onReset);
      }
      const pose = readViewerPose(scene);
      if (!pose || pose.emulatedPosition) {
        publish(placed ? 'placed' : 'tracking', 'paused', status.overlay);
        return;
      }
      if (placed) {
        publish('placed', 'placed', status.overlay);
        return;
      }
      const position = getArPlacement(pose);
      if (!position) {
        publish('tracking', 'lookAhead', status.overlay);
        return;
      }
      logo.setAttribute(
        'position',
        `${position.x} ${position.y} ${position.z}`,
      );
      showLogo(true);
      placed = true;
      publish('placed', 'placed', status.overlay);
    },
  };
  const ready = () => {
    if (disposed) return;
    loaded = true;
    if (!attached) {
      scene.addBehavior?.(behavior);
      attached = true;
    }
    if (supported && status.state === 'checking') publish('ready', 'ready');
  };
  scene.addEventListener('loaded', ready);
  scene.addEventListener('enter-vr', onEnter);
  if (loaded) ready();
  onChange(status);
  if (!capabilities.secure || !capabilities.xr) {
    publish('unsupported', capabilities.secure ? 'unsupported' : 'insecure');
  } else {
    const xr = capabilities.xr;
    void Promise.resolve()
      .then(() => xr.isSessionSupported('immersive-ar'))
      .then((available) => {
        if (disposed) return;
        supported = available;
        if (!available) publish('unsupported', 'unsupported');
        else if (loaded) publish('ready', 'ready');
        else publish('checking', 'preparing');
      })
      .catch(() => publish('unsupported', 'checkFailed'));
  }

  return {
    enter: () => {
      if (
        disposed ||
        requesting ||
        owned ||
        !supported ||
        !loaded ||
        !['ready', 'error'].includes(status.state)
      )
        return;
      requesting = true;
      reset = false;
      placed = false;
      showLogo(false);
      publish('starting', 'starting');
      // A-Frame 1.5 enterAR() must be called directly within the click gesture.
      try {
        void scene
          .enterAR()
          .then(() => {
            if (disposed) {
              void scene.xrSession?.end().catch(() => {});
            } else {
              onEnter();
              if (!owned) {
                preview();
                publish('error', 'notStarted');
              }
            }
          })
          .catch(() => {
            if (disposed) return;
            preview();
            publish('error', 'entryFailed');
          })
          .finally(() => {
            requesting = false;
          });
      } catch {
        requesting = false;
        preview();
        publish('error', 'entryFailed');
      }
    },
    exit: end,
    dispose: () => {
      disposed = true;
      scene.removeEventListener('loaded', ready);
      scene.removeEventListener('enter-vr', onEnter);
      if (attached) scene.removeBehavior?.(behavior);
      detachReference();
      owned?.removeEventListener('end', onEnd);
      end();
      owned = null;
    },
  };
};
