import { mount } from '@vue/test-utils';
import { describe, it, expect } from 'vitest';
import App from '@/App.vue'; // Adjust path if needed

describe('App.vue', () => {
  it('renders without crashing and contains router-view', () => {
    const wrapper = mount(App, {
      global: {
        stubs: ['router-view'], // Stub router-view so that it's not resolved
      },
    });

    // Check that the component is mounted
    expect(wrapper.exists()).toBe(true);

    // Since router-view is stubbed, we can check for the stub's existence
    expect(wrapper.find('router-view-stub').exists()).toBe(true);
  });
});
