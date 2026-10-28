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
  message: string;
  overlay: boolean;
}
export interface ArCapabilities {
  secure: boolean;
  xr?: { isSessionSupported: (mode: string) => Promise<boolean> };
}

export const AR_FALLBACK =
  'Movement tracking is unavailable in this browser. You can still explore the sky.';

export const createRoomArSession = (
  scene: SkyScene,
  logo: SceneEntity,
  capabilities: ArCapabilities,
  onChange: (status: ArStatus) => void,
) => {
  let status: ArStatus = {
    state: 'checking',
    message: 'Checking movement tracking…',
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
  const publish = (state: ArState, message: string, overlay = false) => {
    if (disposed) return;
    if (
      status.state === state &&
      status.message === message &&
      status.overlay === overlay
    )
      return;
    status = { state, message, overlay };
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
    publish(
      reset ? 'error' : 'ready',
      reset
        ? 'Tracking origin changed. Enter the sky again to place the logo.'
        : 'Move your device to explore a hidden sky.',
    );
  };
  const end = () => {
    if (!owned) return;
    void owned.end().catch(() => {
      publish(
        status.state,
        'Use your browser’s XR exit control to return to the preview.',
        status.overlay,
      );
    });
  };
  const onReset = () => {
    reset = true;
    placed = false;
    showLogo(false);
    publish(
      'tracking',
      'Tracking origin changed. Returning to the preview…',
      status.overlay,
    );
    end();
  };
  const onEnter = () => {
    if (disposed || !requesting || owned || !scene.xrSession) return;
    owned = scene.xrSession;
    owned.addEventListener('end', onEnd);
    publish(
      'tracking',
      'Move your device gently to find tracking.',
      !!owned.domOverlayState,
    );
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
        publish(
          placed ? 'placed' : 'tracking',
          'Tracking paused. Move your device gently.',
          status.overlay,
        );
        return;
      }
      if (placed) {
        publish(
          'placed',
          'Walk around the logo. Use the browser’s XR control to exit.',
          status.overlay,
        );
        return;
      }
      const position = getArPlacement(pose);
      if (!position) {
        publish('tracking', 'Look ahead to place the logo.', status.overlay);
        return;
      }
      logo.setAttribute(
        'position',
        `${position.x} ${position.y} ${position.z}`,
      );
      showLogo(true);
      placed = true;
      publish(
        'placed',
        'Walk around the logo. Use the browser’s XR control to exit.',
        status.overlay,
      );
    },
  };
  const ready = () => {
    if (disposed) return;
    loaded = true;
    if (!attached) {
      scene.addBehavior?.(behavior);
      attached = true;
    }
    if (supported && status.state === 'checking')
      publish('ready', 'Move your device to explore a hidden sky.');
  };
  scene.addEventListener('loaded', ready);
  scene.addEventListener('enter-vr', onEnter);
  if (loaded) ready();
  onChange(status);
  if (!capabilities.secure || !capabilities.xr) {
    publish(
      'unsupported',
      capabilities.secure
        ? AR_FALLBACK
        : `${AR_FALLBACK} Open this page over HTTPS to enable tracking.`,
    );
  } else {
    const xr = capabilities.xr;
    void Promise.resolve()
      .then(() => xr.isSessionSupported('immersive-ar'))
      .then((available) => {
        if (disposed) return;
        supported = available;
        if (!available) publish('unsupported', AR_FALLBACK);
        else if (loaded)
          publish('ready', 'Move your device to explore a hidden sky.');
        else publish('checking', 'Preparing the sky…');
      })
      .catch(() =>
        publish(
          'unsupported',
          `${AR_FALLBACK} The tracking availability check failed.`,
        ),
      );
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
      publish('starting', 'Opening the sky…');
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
                publish(
                  'error',
                  'Movement tracking did not start. Please try again.',
                );
              }
            }
          })
          .catch(() => {
            if (disposed) return;
            preview();
            publish(
              'error',
              'Could not enter the sky. Allow tracking access and try again.',
            );
          })
          .finally(() => {
            requesting = false;
          });
      } catch {
        requesting = false;
        preview();
        publish(
          'error',
          'Could not enter the sky. Allow tracking access and try again.',
        );
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
