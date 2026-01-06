import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import WelcomePanel from './welcome-panel.vue';

describe('WelcomePanel.vue', () => {
  it('renders without exploding', () => {
    const wrapper = mount(WelcomePanel);
    expect(wrapper.text()).toContain(`Neuronapixel`);
  });
});
