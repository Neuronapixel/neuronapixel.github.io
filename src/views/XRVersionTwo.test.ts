import { mount } from '@vue/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import XRVersionTwo from './XRVersionTwo.vue';
import { createCloudRenderer } from '@/utils/cloudRenderer';

vi.mock('@/utils/cloudRenderer', () => ({ createCloudRenderer: vi.fn() }));

describe('XRVersionTwo', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

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

  it('keeps the sky, clouds, and nighttime stars around the flying camera', async () => {
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
    const starField = { position: { x: 0, y: 0, z: 9.034 } };
    Object.assign(wrapper.find('#night-stars').element, {
      object3D: starField,
    });
    const stars = wrapper.findAll('.night-star').map((star) => {
      const object3D = { visible: false };
      Object.assign(star.element, { object3D });
      return { object3D, localPosition: star.attributes('position') };
    });
    const updateClouds = vi.fn();
    const disposeClouds = vi.fn();
    vi.mocked(createCloudRenderer).mockReturnValue({
      update: updateClouds,
      dispose: disposeClouds,
    });

    await wrapper.find('a-scene').trigger('loaded');
    requestFrame.mock.calls[0][0](performance.now() + 100);

    expect(sky.position).toEqual(viewer);
    expect(starField.position).toEqual(viewer);
    expect(updateClouds).toHaveBeenLastCalledWith(
      viewer,
      expect.any(Number),
      '#f5f8ff',
    );
    expect(wrapper.findAll('.day-cloud-cube')).toHaveLength(0);
    const secondViewer = { x: -4000, y: 2100, z: -3600 };
    Object.assign(viewer, secondViewer);
    requestFrame.mock.calls[1][0](performance.now() + 110_000);
    expect(starField.position).toEqual(secondViewer);
    expect(updateClouds).toHaveBeenLastCalledWith(
      secondViewer,
      expect.any(Number),
      '#323e5b',
    );
    expect(stars.every(({ object3D }) => object3D.visible)).toBe(true);
    wrapper.findAll('.night-star').forEach((star, index) => {
      expect(star.attributes('position')).toBe(stars[index].localPosition);
    });
    wrapper.unmount();
    expect(disposeClouds).toHaveBeenCalledOnce();
  });
});
