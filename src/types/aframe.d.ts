export {};

declare global {
  const AFRAME: any;
  interface Window {
    AFRAME: typeof AFRAME;
  }
  namespace AFrame {
    type Scene = any;
    type Entity = any;
  }
}
