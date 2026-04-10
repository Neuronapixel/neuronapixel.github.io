import { describe, expect, it } from 'vitest';
import router from './index';

describe('router', () => {
  it('keeps the core public routes available', () => {
    expect(router.resolve('/').name).toBe('XRHome');
    expect(router.resolve('/classic').name).toBe('Home');
    expect(router.resolve('/about').name).toBe('About');
  });

  it('falls back to the 404 route for unknown paths', () => {
    expect(router.resolve('/missing-page').name).toBe('NotFound');
  });
});
