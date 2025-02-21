import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Welcome from './Welcome.vue'


describe('Welcome.vue', () => {
  it('renders without exploding', () => {
    const wrapper = mount(Welcome)
    expect(wrapper.text()).toContain(`Neuronapixel`)
  })
})
