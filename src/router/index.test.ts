import { describe, expect, it } from 'vitest';
import router from './index';

describe('router', () => {
  it('redirects the root path to the AR landing page', async () => {
    await router.push('/');
    expect(router.currentRoute.value).toMatchObject({
      path: '/ar',
      name: 'SkyWindow',
    });
  });

  it('keeps the core public routes available', () => {
    expect(router.resolve('/xr').name).toBe('XRHome');
    expect(router.resolve('/ar').name).toBe('SkyWindow');
    expect(router.resolve('/classic').name).toBe('Home');
    expect(router.resolve('/about').name).toBe('About');
  });

  it('falls back to the 404 route for unknown paths', () => {
    expect(router.resolve('/missing-page').name).toBe('NotFound');
  });
});
