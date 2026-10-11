import { mount } from '@vue/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import XRVersionTwo from './XRVersionTwo.vue';

describe('XRVersionTwo', () => {
  afterEach(() => vi.restoreAllMocks());

  it('renders the complete floating logo without its former pedestal and keeps flight controls', () => {
    const wrapper = mount(XRVersionTwo);
    const logo = wrapper.find('#logo');
    expect(
      logo.findAll(
        '[mixin="cube primary-material"], [mixin="cube secondary-material"]',
      ),
    ).toHaveLength(27);
    expect(logo.attributes('position')).toBe('0 0 0');
    expect(logo.attributes('animation')).toContain('loop: true');
    expect(wrapper.find('.copy-table').exists()).toBe(false);
    expect(wrapper.find('#camera').attributes('wasd-controls')).toBe(
      'fly: true',
    );
    expect(wrapper.find('#camera').attributes('look-controls')).toContain(
      'pointerLockEnabled: true',
    );
    wrapper.unmount();
  });

  it('updates the sky and cloud coverage around the flying camera', async () => {
    const requestFrame = vi
      .spyOn(window, 'requestAnimationFrame')
      .mockReturnValue(1);
    const wrapper = mount(XRVersionTwo);
    const viewer = { x: 1500, y: -720, z: 2300 };
    Object.assign(wrapper.find('#camera').element, {
      object3D: { position: viewer },
    });
    const sky = { position: { x: 0, y: 0, z: 0 } };
    Object.assign(wrapper.find('#day-night-sky').element, { object3D: sky });
    const clouds = wrapper.findAll('.day-cloud').map((cloud) => {
      const object3D = { position: { x: 0, y: 0, z: 0 }, visible: false };
      Object.assign(cloud.element, { object3D });
      return object3D;
    });

    await wrapper.find('a-scene').trigger('loaded');
    requestFrame.mock.calls[0][0](performance.now() + 100);

    expect(sky.position).toEqual(viewer);
    const visible = clouds.filter((cloud) => cloud.visible);
    for (const axis of ['x', 'y', 'z'] as const) {
      expect(visible.some((cloud) => cloud.position[axis] < viewer[axis])).toBe(
        true,
      );
      expect(visible.some((cloud) => cloud.position[axis] > viewer[axis])).toBe(
        true,
      );
    }
    wrapper.unmount();
  });
});
