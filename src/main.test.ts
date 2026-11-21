import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import router from './router';

describe('Main entry file', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="app"></div>';
    vi.stubEnv('VITE_GTM_ID', 'GTM-TEST123');
  });

  afterEach(() => {
    document.getElementById('gtm-script')?.remove();
    delete window.dataLayer;
    vi.unstubAllEnvs();
  });

  it('mounts the app and queues one device event for the full page load', async () => {
    await import('@/main');
    await router.isReady();

    expect(document.querySelector('#app .xr-experience')).toBeTruthy();
    expect(window.dataLayer?.map(({ event }) => event)).toEqual([
      'gtm.js',
      'visit_device',
    ]);
    expect(window.dataLayer?.[1]).toEqual({
      event: 'visit_device',
      headset_type: 'unclassified',
    });

    await router.push('/ar');
    await router.push('/');
    expect(window.dataLayer).toHaveLength(2);
  });
});
