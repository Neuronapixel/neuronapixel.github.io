import type { SkyPosition } from './cloudField';

// Structural types for the CDN runtime; do not bundle another A-Frame or Three.js.
export interface ViewerPose {
  emulatedPosition?: boolean;
  transform: {
    position: SkyPosition;
    orientation: { x: number; y: number; z: number; w: number };
  };
}

export interface ArSession extends EventTarget {
  end: () => Promise<void>;
  domOverlayState?: { type: string };
}

export interface SceneEntity extends HTMLElement {
  setObject3D?: (name: string, object: unknown) => void;
  removeObject3D?: (name: string) => void;
  object3D?: { position: SkyPosition; visible: boolean };
  components?: {
    material?: { material?: { opacity: number; transparent: boolean } };
  };
}

export interface SceneBehavior {
  readonly el: SkyScene | null;
  tick: () => void;
}

export interface SkyScene extends SceneEntity {
  hasLoaded?: boolean;
  xrSession?: ArSession;
  frame?: {
    readonly session: ArSession;
    getViewerPose: (space: EventTarget) => ViewerPose | null;
  };
  renderer?: { xr: { getReferenceSpace?: () => EventTarget | null } };
  enterAR: () => Promise<void>;
  addBehavior?: (behavior: SceneBehavior) => void;
  removeBehavior?: (behavior: SceneBehavior) => void;
}

export const readViewerPose = (scene: SkyScene | null): ViewerPose | null => {
  if (!scene?.xrSession || !scene.frame) return null;
  const space = scene.renderer?.xr.getReferenceSpace?.();
  if (!space) return null;
  return scene.frame.getViewerPose(space);
};
