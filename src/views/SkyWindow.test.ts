import { flushPromises, mount } from '@vue/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import SkyWindow from './SkyWindow.vue';
import type { SkyScene } from '@/utils/skyScene';

const support = (available: boolean) => {
  vi.stubGlobal('isSecureContext', true);
  vi.stubGlobal('navigator', {
    xr: { isSessionSupported: () => Promise.resolve(available) },
  });
};
afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});
describe('sky window preview', () => {
  it.each([true, false])(
    'offers session guidance with DOM overlay %s',
    async (overlay) => {
      support(true);
      const wrapper = mount(SkyWindow);
      const scene = wrapper.get('a-scene').element as SkyScene;
      const session = Object.assign(new EventTarget(), {
        domOverlayState: overlay ? { type: 'screen' } : undefined,
        end: vi.fn(() => {
          session.dispatchEvent(new Event('end'));
          return Promise.resolve();
        }),
      });
      scene.enterAR = () => {
        scene.xrSession = session;
        scene.dispatchEvent(new Event('enter-vr'));
        return Promise.resolve();
      };
      await wrapper.get('a-scene').trigger('loaded');
      await flushPromises();
      await wrapper.get('button').trigger('click');
      await flushPromises();
      if (overlay) {
        expect(wrapper.get('.session-controls').text()).toContain(
          'Move your device gently',
        );
        await wrapper.get('.session-controls button').trigger('click');
        expect(session.end).toHaveBeenCalledOnce();
      } else {
        expect(wrapper.find('.session-controls').exists()).toBe(false);
        expect(wrapper.get('a-text').attributes('value')).toContain(
          'Move your device gently',
        );
        session.dispatchEvent(new Event('end'));
        await flushPromises();
      }
      expect(wrapper.get('button').text()).toBe('Enter the sky');
      wrapper.unmount();
    },
  );
  it('renders an opaque environment, identity camera, stable logo and fallback link', async () => {
    support(false);
    const wrapper = mount(SkyWindow);
    await flushPromises();
    expect(wrapper.find('[role="status"]').text()).toContain(
      'Movement tracking is unavailable',
    );
    expect(wrapper.find('button').exists()).toBe(false);
    expect(wrapper.get('.quick-look-link').attributes('download')).toBe(
      'neuronapixel-logo.usdz',
    );
    expect(wrapper.get('.explore-link').attributes('href')).toBe('#/');
    expect(wrapper.findAll('a-scene')).toHaveLength(1);
    expect(wrapper.findAll('.logo-cube')).toHaveLength(27);
    expect(wrapper.get('#sky-camera').attributes('position')).toBe('0 0 0');
    expect(wrapper.find('[wasd-controls]').exists()).toBe(false);
    expect(wrapper.find('[animation]').exists()).toBe(false);
    expect(wrapper.get('a-scene').attributes('webxr')).toContain(
      'referenceSpaceType: local',
    );
    expect(
      wrapper.get('#sky-logo-placement > a-entity').attributes('scale'),
    ).toBe('0.1 0.1 0.1');
    wrapper.unmount();
  });
  it('offers native logo AR even when immersive WebXR is unavailable', async () => {
    support(false);
    vi.spyOn(DOMTokenList.prototype, 'supports').mockImplementation(
      (token) => token === 'ar',
    );
    const wrapper = mount(SkyWindow);
    await flushPromises();
    expect(wrapper.get('.quick-look-link').attributes('rel')).toBe('ar');
    expect(wrapper.get('.quick-look-link').attributes('aria-label')).toBe(
      'View in your space',
    );
    expect(wrapper.get('#sky-status').text()).toContain(
      'Bring a little Neuronapixel',
    );
    expect(wrapper.find('button').exists()).toBe(false);
    expect(wrapper.get('.explore-link').attributes('href')).toBe('#/');
    wrapper.unmount();
  });
  it('enables explicit entry only after scene readiness and exposes retry after denial', async () => {
    support(true);
    const wrapper = mount(SkyWindow);
    const scene = wrapper.get('a-scene').element as SkyScene;
    scene.enterAR = vi.fn().mockRejectedValue(new Error('denied'));
    await flushPromises();
    expect(wrapper.get('button').attributes('disabled')).toBeDefined();
    await wrapper.get('a-scene').trigger('loaded');
    expect(wrapper.get('button').attributes('disabled')).toBeUndefined();
    expect(scene.enterAR).not.toHaveBeenCalled();
    await wrapper.get('button').trigger('click');
    await flushPromises();
    expect(scene.enterAR).toHaveBeenCalledOnce();
    expect(wrapper.get('button').text()).toBe('Try again');
    expect(wrapper.get('[role="status"]').text()).toContain(
      'Allow tracking access',
    );
    wrapper.unmount();
  });
});
