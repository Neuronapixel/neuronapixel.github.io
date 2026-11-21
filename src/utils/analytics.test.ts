import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { trackSkyWindowClick, trackVisitDevice } from './analytics';

describe('analytics events', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_GTM_ID', 'GTM-TEST123');
    window.dataLayer = [];
  });

  afterEach(() => {
    delete window.dataLayer;
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it.each(['(X11; Linux x86_64; Quest 3)', '(Linux; Android 12; Quest 3)'])(
    'reports a coarse Meta Quest value for the browser in %s mode',
    (platform) => {
      vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue(
        `Mozilla/5.0 ${platform} OculusBrowser/39.2.0.0.56.754450099`,
      );

      trackVisitDevice();

      expect(window.dataLayer).toEqual([
        { event: 'visit_device', headset_type: 'meta_quest' },
      ]);
    },
  );

  it('leaves browsers without a Quest signal unclassified', () => {
    vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue(
      'Mozilla/5.0 (Linux; Android 14) Chrome/136.0.0.0 Mobile Safari/537.36',
    );

    trackVisitDevice();

    expect(window.dataLayer).toEqual([
      { event: 'visit_device', headset_type: 'unclassified' },
    ]);
  });

  it('leaves the data layer untouched without a configured container', () => {
    vi.stubEnv('VITE_GTM_ID', '   ');

    trackVisitDevice();
    trackSkyWindowClick('enter_ar');

    expect(window.dataLayer).toEqual([]);
  });
});
