import { createAppI18n } from '@/i18n';
import { flushPromises, mount } from '@vue/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import ArQuickLook from './ar-quick-look.vue';

afterEach(() => vi.restoreAllMocks());

describe('Apple AR Quick Look', () => {
  it('offers the native viewer using feature detection and the required single image child', async () => {
    vi.spyOn(DOMTokenList.prototype, 'supports').mockImplementation(
      (token) => token === 'ar',
    );
    const wrapper = mount(ArQuickLook, {
      global: { plugins: [createAppI18n()] },
    });
    await flushPromises();
    const link = wrapper.get('a');
    expect(link.attributes('rel')).toBe('ar');
    expect(link.attributes('href')).toBe(
      '/models/neuronapixel-logo.usdz#allowsContentScaling=0',
    );
    expect(link.attributes('download')).toBeUndefined();
    expect(link.attributes('aria-label')).toBe('Put it on your desk');
    expect(link.element.children).toHaveLength(1);
    expect(link.element.firstElementChild?.tagName).toBe('IMG');
    expect(wrapper.get('img').attributes('src')).toBe(
      '/models/neuronapixel-logo.png',
    );
    expect(wrapper.emitted('support')).toEqual([[true]]);
    wrapper.unmount();
  });

  it.each(['unsupported', 'unavailable'])(
    'provides a working model download when detection is %s',
    (mode) => {
      vi.spyOn(DOMTokenList.prototype, 'supports').mockImplementation(() => {
        if (mode === 'unavailable') throw new TypeError('Unsupported API');
        return false;
      });
      const wrapper = mount(ArQuickLook, {
        global: { plugins: [createAppI18n()] },
      });
      expect(wrapper.get('a').attributes('rel')).toBeUndefined();
      expect(wrapper.get('a').attributes('download')).toBe(
        'neuronapixel-logo.usdz',
      );
      expect(wrapper.get('a').attributes('href')).toBe(
        '/models/neuronapixel-logo.usdz',
      );
      expect(wrapper.get('a').attributes('aria-label')).toBe(
        'Put it on your desk',
      );
      expect(wrapper.text()).toContain('Safari on iPhone or iPad');
      expect(wrapper.emitted('support')).toEqual([[false]]);
      wrapper.unmount();
    },
  );
});
