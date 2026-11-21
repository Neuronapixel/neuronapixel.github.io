import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import LogoMark from './logo-mark.vue';

describe('shared logo', () => {
  it('preserves all 27 cube positions and the original colour pattern', () => {
    const wrapper = mount(LogoMark);
    const cubes = wrapper.findAll('.logo-cube');
    expect(cubes).toHaveLength(27);
    expect(new Set(cubes.map((cube) => cube.attributes('position'))).size).toBe(
      27,
    );
    for (const cube of cubes) {
      const [x, y] = cube.attributes('position')!.split(' ').map(Number);
      const white = (y < 2 && x === 1) || (y === 2 && x === 2);
      expect(cube.attributes('material')).toContain(
        white ? '#ffffff' : '#ff2f2f',
      );
    }
    expect(wrapper.find('[animation]').exists()).toBe(false);
  });
});
