import { mount } from '@vue/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import SkyWindow from '@/views/SkyWindow.vue';
import { createAppI18n } from '@/i18n';
import { createCloudRenderer } from '@/utils/cloudRenderer';
import type {
  SceneBehavior,
  SceneEntity,
  SkyScene,
  ViewerPose,
} from '@/utils/skyScene';

vi.mock('@/utils/cloudRenderer', () => ({ createCloudRenderer: vi.fn() }));

describe('tracked sky environment', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });
  it('uses tracked translation, keeps orientation and logo independent, and retains the cycle across sessions', async () => {
    const clock = vi.spyOn(performance, 'now').mockReturnValue(0);
    const requestFrame = vi.spyOn(window, 'requestAnimationFrame');
    const update = vi.fn();
    const dispose = vi.fn();
    vi.mocked(createCloudRenderer).mockReturnValue({ update, dispose });
    const wrapper = mount(SkyWindow, {
      global: { plugins: [createAppI18n()] },
    });
    const scene = wrapper.find('a-scene').element as SkyScene;
    const behaviors: SceneBehavior[] = [];
    scene.addBehavior = vi.fn((behavior: SceneBehavior) => {
      behaviors.push(behavior);
    });
    scene.removeBehavior = vi.fn();
    const reference = new EventTarget();
    // XR DOMPoint coordinates may be prototype getters rather than enumerable keys.
    const position = Object.create(null, {
      x: { get: () => 12 },
      y: { get: () => 1.7 },
      z: { get: () => -4 },
    }) as ViewerPose['transform']['position'];
    const pose: ViewerPose = {
      transform: { position, orientation: { x: 0, y: 1, z: 0, w: 0 } },
    };
    scene.renderer = { xr: { getReferenceSpace: () => reference } };
    scene.frame = { getViewerPose: () => pose };
    const sky = wrapper.find('#day-night-sky').element as SceneEntity;
    const stars = wrapper.find('#night-stars').element as SceneEntity;
    sky.object3D = { position: { x: 0, y: 0, z: 0 }, visible: true };
    stars.object3D = { position: { x: 0, y: 0, z: 0 }, visible: true };
    await wrapper.find('a-scene').trigger('loaded');
    expect(behaviors).toHaveLength(2);
    expect(requestFrame).not.toHaveBeenCalled();
    scene.xrSession = Object.assign(new EventTarget(), {
      end: () => Promise.resolve(),
    });
    clock.mockReturnValue(110_000);
    behaviors.forEach((behavior) => behavior.tick());
    expect(sky.object3D.position).toEqual({ x: 12, y: 1.7, z: -4 });
    expect(stars.object3D.position).toEqual(sky.object3D.position);
    expect(sky.getAttribute('rotation')).toBeNull();
    expect(sky.getAttribute('color')).toBe('#090f23');
    expect(sky.getAttribute('material')).toContain(
      'transparent: false; opacity: 1',
    );
    expect(update).toHaveBeenLastCalledWith(position, 110_000, '#323e5b');
    expect(wrapper.find('#sky-logo-placement').attributes('position')).toBe(
      '0 0 -1.5',
    );
    scene.xrSession = undefined;
    clock.mockReturnValue(111_000);
    behaviors.forEach((behavior) => behavior.tick());
    scene.xrSession = Object.assign(new EventTarget(), {
      end: () => Promise.resolve(),
    });
    clock.mockReturnValue(112_000);
    behaviors.forEach((behavior) => behavior.tick());
    expect(update).toHaveBeenLastCalledWith(position, 112_000, '#323e5b');
    expect(scene.addBehavior).toHaveBeenCalledTimes(2);
    expect(wrapper.findAll('[hide-on-enter-ar]')).toHaveLength(0);
    wrapper.unmount();
    expect(dispose).toHaveBeenCalledOnce();
    expect(scene.removeBehavior).toHaveBeenCalledTimes(2);
  });
});
