import { beforeEach, describe, expect, it } from 'vitest';
import { injectTagManager } from './injectTagManager';

describe('injectTagManager', () => {
  beforeEach(() => {
    document.head.innerHTML = '';
    document.body.innerHTML = '';
    window.dataLayer = [];
  });

  it('does nothing when no GTM id is configured', () => {
    injectTagManager('');

    expect(document.getElementById('gtm-script')).toBeNull();
    expect(window.dataLayer).toEqual([]);
  });

  it('injects the GTM script once when an id is configured', () => {
    injectTagManager('GTM-TEST123');
    injectTagManager('GTM-TEST123');

    const script = document.getElementById(
      'gtm-script',
    ) as HTMLScriptElement | null;

    expect(script).not.toBeNull();
    expect(script?.src).toContain(
      'https://www.googletagmanager.com/gtm.js?id=GTM-TEST123',
    );
    expect(window.dataLayer).toHaveLength(1);
    expect(window.dataLayer?.[0]).toMatchObject({ event: 'gtm.js' });
  });
});
