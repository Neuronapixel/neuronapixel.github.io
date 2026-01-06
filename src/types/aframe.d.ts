export {};

declare global {
  const AFRAME: unknown;
  interface Window {
    AFRAME: typeof AFRAME;
  }
  namespace AFrame {
    type Scene = unknown;
    type Entity = unknown;
  }
}
