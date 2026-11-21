import { createAppI18n } from '@/i18n';
import { flushPromises, mount } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import SkyWindow from './SkyWindow.vue';
import type { SceneBehavior, SkyScene, ViewerPose } from '@/utils/skyScene';

const support = (available: boolean) => {
  vi.stubGlobal('isSecureContext', true);
  vi.stubGlobal('navigator', {
    xr: { isSessionSupported: () => Promise.resolve(available) },
  });
};
const desktopInput = () => {
  const query = Object.assign(new EventTarget(), { matches: true });
  vi.stubGlobal('matchMedia', () => query);
  return query;
};
beforeEach(() => {
  vi.stubEnv('VITE_GTM_ID', 'GTM-TEST123');
  window.dataLayer = [];
});
afterEach(() => {
  delete window.dataLayer;
  localStorage.clear();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});
describe('sky window preview', () => {
  it('enables desktop navigation, protects focused controls, and follows input capability changes', async () => {
    support(false);
    const query = desktopInput();
    const wrapper = mount(SkyWindow, {
      global: { plugins: [createAppI18n()] },
    });
    await flushPromises();
    const camera = wrapper.get('#sky-camera');
    expect(camera.attributes('wasd-controls')).toContain('fly: true');
    expect(wrapper.get('.navigation-hint').text()).toContain(
      'WASD or arrow keys',
    );
    await wrapper.get('select').trigger('focusin');
    expect(camera.attributes('wasd-controls')).toBeUndefined();
    await wrapper.get('select').setValue('es');
    expect(wrapper.get('.navigation-hint').text()).toContain(
      'Usa WASD o las flechas',
    );
    await wrapper.get('select').trigger('focusout');
    expect(camera.attributes('wasd-controls')).toBeDefined();
    query.matches = false;
    query.dispatchEvent(new Event('change'));
    await flushPromises();
    expect(camera.attributes('wasd-controls')).toBeUndefined();
    expect(wrapper.find('.navigation-hint').exists()).toBe(false);
    const removeListener = vi.spyOn(query, 'removeEventListener');
    wrapper.unmount();
    expect(removeListener).toHaveBeenCalledWith('change', expect.any(Function));
  });
  it('switches the invitation, fallback guidance and Quick Look action between English and Spanish', async () => {
    support(false);
    const wrapper = mount(SkyWindow, {
      global: { plugins: [createAppI18n()] },
    });
    await flushPromises();
    expect(wrapper.get('.eyebrow').text()).toBe('Small spaces');
    expect(wrapper.get('h1').text()).toBe('inside');
    expect(wrapper.findAll('option').map((option) => option.text())).toEqual([
      'EN',
      'ES',
    ]);
    expect(wrapper.get('option[value="en"]').attributes('aria-label')).toBe(
      'English',
    );
    expect(wrapper.get('option[value="es"]').attributes('aria-label')).toBe(
      'Español',
    );
    expect(wrapper.get('.quick-look-link').attributes('aria-label')).toBe(
      'outside',
    );
    await wrapper.get('select').setValue('es');
    expect(wrapper.get('main').attributes('lang')).toBe('es');
    expect(wrapper.get('h1').text()).toBe('dentro');
    expect(wrapper.get('.eyebrow').text()).toBe('Pequeños espacios');
    expect(wrapper.get('#sky-status').text()).toBe(
      'El seguimiento de movimiento no está disponible en este navegador.',
    );
    expect(wrapper.get('.quick-look-link').attributes('data-label')).toBe(
      'fuera',
    );
    expect(wrapper.get('#quick-look-description').text()).toContain(
      'Abre esta página en Safari',
    );
    expect(wrapper.get('select').attributes('aria-label')).toBe('Idioma');
    expect(localStorage.getItem('neuronapixel.locale')).toBe('es');
    await wrapper.get('select').setValue('en');
    expect(wrapper.get('h1').text()).toBe('inside');
    expect(wrapper.get('#sky-status').text()).toBe(
      'Movement tracking is unavailable in this browser.',
    );
    wrapper.unmount();
  });
  it('translates retry guidance and in-scene session instructions', async () => {
    support(true);
    const i18n = createAppI18n('es');
    const wrapper = mount(SkyWindow, { global: { plugins: [i18n] } });
    const scene = wrapper.get('a-scene').element as SkyScene;
    scene.enterAR = vi.fn().mockRejectedValueOnce(new Error('denied'));
    await wrapper.get('a-scene').trigger('loaded');
    await flushPromises();
    expect(wrapper.get('button').text()).toBe('Entrar al cielo');
    await wrapper.get('button').trigger('click');
    await flushPromises();
    expect(wrapper.get('button').text()).toBe('Intentar de nuevo');
    expect(wrapper.get('#sky-status').text()).toContain('Permite el acceso');
    const session = Object.assign(new EventTarget(), {
      end: vi.fn(() => Promise.resolve()),
    });
    scene.enterAR = () => {
      scene.xrSession = session;
      scene.dispatchEvent(new Event('enter-vr'));
      return Promise.resolve();
    };
    await wrapper.get('button').trigger('click');
    await flushPromises();
    expect(wrapper.get('a-text').attributes('value')).toContain(
      'Mueve tu dispositivo suavemente',
    );
    i18n.global.locale.value = 'en';
    await flushPromises();
    expect(wrapper.get('a-text').attributes('value')).toContain(
      'Move your device gently',
    );
    expect(window.dataLayer).toEqual([
      { event: 'ui_click', action_name: 'enter_ar' },
      { event: 'ui_click', action_name: 'retry_ar' },
    ]);
    wrapper.unmount();
  });
  it.each([true, false])(
    'offers session guidance with DOM overlay %s',
    async (overlay) => {
      support(true);
      desktopInput();
      const wrapper = mount(SkyWindow, {
        global: { plugins: [createAppI18n()] },
      });
      const scene = wrapper.get('a-scene').element as SkyScene;
      const session = Object.assign(new EventTarget(), {
        domOverlayState: overlay ? { type: 'screen' } : undefined,
        end: vi.fn(() => {
          session.dispatchEvent(new Event('end'));
          return Promise.resolve();
        }),
      });
      const behaviors: SceneBehavior[] = [];
      scene.addBehavior = (behavior) => behaviors.push(behavior);
      const reference = new EventTarget();
      let pose: ViewerPose | null = {
        transform: {
          position: { x: 0, y: 1.6, z: 0 },
          orientation: { x: 0, y: 0, z: 0, w: 1 },
        },
      };
      scene.renderer = { xr: { getReferenceSpace: () => reference } };
      scene.frame = { session, getViewerPose: () => pose };
      scene.enterAR = () => {
        expect(wrapper.get('#sky-camera').attributes('position')).toBe('0 0 0');
        scene.xrSession = session;
        scene.dispatchEvent(new Event('enter-vr'));
        return Promise.resolve();
      };
      await wrapper.get('a-scene').trigger('loaded');
      await flushPromises();
      expect(
        wrapper.get('#sky-camera').attributes('wasd-controls'),
      ).toBeDefined();
      await wrapper.get('button').trigger('focusin');
      expect(
        wrapper.get('#sky-camera').attributes('wasd-controls'),
      ).toBeUndefined();
      wrapper.get('#sky-camera').element.setAttribute('position', '1 2 3');
      await wrapper.get('button').trigger('click');
      await flushPromises();
      expect(
        wrapper.get('#sky-camera').attributes('wasd-controls'),
      ).toBeUndefined();
      const trackedLogo = wrapper.get('#sky-logo-placement > a-entity');
      expect(trackedLogo.attributes('animation')).toBeUndefined();
      expect(trackedLogo.attributes('position')).toBe('0 0 0');
      const guidance = () =>
        overlay
          ? wrapper.get('.session-controls [role="status"]').text()
          : wrapper.get('#sky-camera a-text').attributes('value');
      expect(guidance()).toContain('Move your device gently');
      behaviors.forEach((behavior) => behavior.tick());
      await flushPromises();
      expect(guidance()).toContain('Use the browser’s XR control to exit');
      pose = null;
      behaviors.forEach((behavior) => behavior.tick());
      await flushPromises();
      expect(guidance()).toContain('Tracking paused');
      if (overlay) {
        await wrapper.get('.session-controls button').trigger('click');
        expect(session.end).toHaveBeenCalledOnce();
        expect(window.dataLayer).toEqual([
          { event: 'ui_click', action_name: 'enter_ar' },
          { event: 'ui_click', action_name: 'exit_ar' },
        ]);
      } else {
        expect(wrapper.find('.session-controls').exists()).toBe(false);
        session.dispatchEvent(new Event('end'));
        await flushPromises();
      }
      expect(wrapper.get('button').text()).toBe('Enter the sky');
      expect(wrapper.find('#sky-camera a-text').exists()).toBe(false);
      expect(
        wrapper.get('#sky-camera').attributes('wasd-controls'),
      ).toBeDefined();
      expect(
        wrapper.get('#sky-logo-placement > a-entity').attributes('animation'),
      ).toContain('loop: true');
      wrapper.unmount();
    },
  );
  it('renders the floating preview with a single return link in the invitation', async () => {
    support(false);
    const wrapper = mount(SkyWindow, {
      global: { plugins: [createAppI18n()] },
    });
    await flushPromises();
    expect(wrapper.find('[role="status"]').text()).toContain(
      'Movement tracking is unavailable',
    );
    expect(wrapper.find('button').exists()).toBe(false);
    expect(wrapper.get('.quick-look-link').attributes('download')).toBe(
      'neuronapixel-logo.usdz',
    );
    const backLink = wrapper.get('.invitation > .back-link');
    expect(wrapper.findAll('a[href="#/"]')).toHaveLength(1);
    expect(backLink.attributes('href')).toBe('#/');
    expect(backLink.get('img').attributes()).toMatchObject({
      src: '/favicon.ico',
      alt: 'Neuronapixel',
    });
    expect(backLink.get('img + [aria-hidden="true"]').text()).toBe('↗');
    expect(wrapper.findAll('a-scene')).toHaveLength(1);
    expect(wrapper.findAll('.logo-cube')).toHaveLength(27);
    expect(wrapper.get('#sky-camera').attributes('position')).toBe('0 0 0');
    expect(wrapper.get('#sky-camera').attributes('look-controls')).toContain(
      'magicWindowTrackingEnabled: true',
    );
    expect(wrapper.find('[wasd-controls]').exists()).toBe(false);
    expect(
      wrapper.get('#sky-logo-placement').attributes('animation'),
    ).toBeUndefined();
    expect(
      wrapper.get('#sky-logo-placement > a-entity').attributes('animation'),
    ).toContain('from: 0 -0.02 0; to: 0 0.02 0');
    expect(wrapper.get('a-scene').attributes('webxr')).toContain(
      'referenceSpaceType: local',
    );
    expect(
      wrapper.get('#sky-logo-placement > a-entity').attributes('scale'),
    ).toBe('0.1 0.1 0.1');
    const activation = new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
    });
    backLink.get('img').element.dispatchEvent(activation);
    expect(activation.defaultPrevented).toBe(false);
    expect(window.dataLayer).toEqual([
      { event: 'ui_click', action_name: 'return_to_sky' },
    ]);
    wrapper.unmount();
  });
  it('offers native logo AR even when immersive WebXR is unavailable', async () => {
    support(false);
    vi.spyOn(DOMTokenList.prototype, 'supports').mockImplementation(
      (token) => token === 'ar',
    );
    const wrapper = mount(SkyWindow, {
      global: { plugins: [createAppI18n()] },
    });
    await flushPromises();
    expect(wrapper.get('.quick-look-link').attributes('rel')).toBe('ar');
    expect(wrapper.get('.quick-look-link').attributes('aria-label')).toBe(
      'outside',
    );
    expect(wrapper.get('#sky-status').text()).toContain(
      'Bring a little Neuronapixel',
    );
    expect(wrapper.find('button').exists()).toBe(false);
    expect(wrapper.get('.invitation > .back-link').attributes('href')).toBe(
      '#/',
    );
    wrapper.unmount();
  });
  it('enables explicit entry only after scene readiness and exposes retry after denial', async () => {
    support(true);
    const wrapper = mount(SkyWindow, {
      global: { plugins: [createAppI18n()] },
    });
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
