// Navigation.spec.ts
import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import NavigationBar from '@/components/NavigationBar.vue'

// Create an explicit stub for router-link that renders an anchor element
const RouterLinkStub = {
  name: 'RouterLink',
  template: '<a><slot /></a>',
  props: ['to']
}

describe('NavigationBar.vue', () => {
  it('renders all navigationBar links correctly', () => {
    const wrapper = mount(NavigationBar, {
      global: {
        stubs: {
          'router-link': RouterLinkStub
        }
      }
    })

    // Using findAllComponents returns wrappers with the .props() method available
    const links = wrapper.findAllComponents(RouterLinkStub)
    expect(links.length).toBe(5)

    expect(links[0].text()).toBe('Home')
    expect(links[1].text()).toBe('About')
    expect(links[2].text()).toBe('VR-ama')
    expect(links[3].text()).toBe('Memoria virtual')
    expect(links[4].text()).toBe('Neurona Tornasol')

    // Check that the "to" prop on each link is correct
    expect(links[0].props('to')).toBe('/')
    expect(links[1].props('to')).toBe('/about')
    expect(links[2].props('to')).toBe('/vr-ama')
    expect(links[3].props('to')).toBe('/memoria-virtual')
    expect(links[4].props('to')).toBe('/neurona-tornasol')
  })
})
