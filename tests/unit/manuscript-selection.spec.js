import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { nextTick } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import { createI18n } from 'vue-i18n';
import { createVuetify } from 'vuetify';

// Import components to test
import ManuscriptSelectionDrawer from '@/components/dialogs/ManuscriptSelectionDrawer.vue';
import VerticalNavLink from '@/@layouts/components/VerticalNavLink.vue';
import { useManuscriptStore } from '@/stores/manuscript';

// Mock the API composable
vi.mock('@/composables/useApi', () => ({
  useApi: () => ({
    api: {
      get: vi.fn()
    }
  })
}));

// Mock the CASL permissions
vi.mock('@layouts/plugins/casl', () => ({
  can: vi.fn(() => true)
}));

// Mock the layout config
vi.mock('@layouts', () => ({
  layoutConfig: {
    app: {
      iconRenderer: 'div',
      i18n: { enable: true }
    },
    verticalNav: {
      defaultNavItemIconProps: {}
    }
  }
}));

// Mock layout utils
vi.mock('@layouts/utils', () => ({
  getComputedNavLinkToProp: vi.fn(() => ({})),
  getDynamicI18nProps: vi.fn(() => ({})),
  isNavLinkActive: vi.fn(() => false)
}));

// Mock layout store
vi.mock('@layouts/stores/config', () => ({
  useLayoutConfigStore: () => ({
    isVerticalNavMini: () => false
  })
}));

/**
 * Unit Test Suite for Manuscript Selection Components
 * 
 * This test suite covers individual component functionality in isolation,
 * ensuring each component works correctly on its own.
 */

describe('Manuscript Selection Components', () => {
  let pinia;
  let router;
  let i18n;
  let vuetify;
  
  beforeEach(() => {
    // Setup Pinia
    pinia = createPinia();
    setActivePinia(pinia);
    
    // Setup router
    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/', component: { template: '<div>Home</div>' } },
        { path: '/manuscripts/:id', component: { template: '<div>Manuscript</div>' } }
      ]
    });
    
    // Setup i18n
    i18n = createI18n({
      locale: 'en',
      messages: {
        en: {
          'menu.selectManuscript': 'Select Manuscript',
          'buttons.cancel': 'Cancel',
          'buttons.select': 'Select'
        }
      }
    });
    
    // Setup Vuetify
    vuetify = createVuetify();
    
    // Clear all mocks
    vi.clearAllMocks();
  });

  describe('ManuscriptSelectionDrawer Component', () => {
    it('renders correctly when closed', () => {
      const wrapper = mount(ManuscriptSelectionDrawer, {
        props: {
          isDrawerOpen: false
        },
        global: {
          plugins: [pinia, router, i18n, vuetify]
        }
      });

      expect(wrapper.exists()).toBe(true);
      
      // Drawer should not be visible when closed
      const drawer = wrapper.find('.v-navigation-drawer');
      expect(drawer.exists()).toBe(true);
    });

    it('renders correctly when open', () => {
      const wrapper = mount(ManuscriptSelectionDrawer, {
        props: {
          isDrawerOpen: true
        },
        global: {
          plugins: [pinia, router, i18n, vuetify]
        }
      });

      expect(wrapper.exists()).toBe(true);
      
      // Should show drawer content
      expect(wrapper.text()).toContain('Select Manuscript');
      expect(wrapper.text()).toContain('Cancel');
      expect(wrapper.text()).toContain('Select');
    });

    it('fetches manuscripts when opened', async () => {
      const mockApi = {
        get: vi.fn().mockResolvedValue({
          data: {
            data: [
              { id: 1, title: 'Test Manuscript', manuscript_type: 'standard' }
            ]
          }
        })
      };

      // Mock the useApi composable
      const { useApi } = await import('@/composables/useApi');
      useApi.mockReturnValue({ api: mockApi });

      const wrapper = mount(ManuscriptSelectionDrawer, {
        props: {
          isDrawerOpen: true
        },
        global: {
          plugins: [pinia, router, i18n, vuetify]
        }
      });

      await nextTick();

      // Should call API to fetch manuscripts
      expect(mockApi.get).toHaveBeenCalledWith('/manuscripts');
    });

    it('displays loading state while fetching manuscripts', async () => {
      const mockApi = {
        get: vi.fn().mockImplementation(() => new Promise(resolve => {
          setTimeout(() => resolve({ data: { data: [] } }), 1000);
        }))
      };

      const { useApi } = await import('@/composables/useApi');
      useApi.mockReturnValue({ api: mockApi });

      const wrapper = mount(ManuscriptSelectionDrawer, {
        props: {
          isDrawerOpen: true
        },
        global: {
          plugins: [pinia, router, i18n, vuetify]
        }
      });

      await nextTick();

      // Should show loading indicator
      expect(wrapper.text()).toContain('Loading manuscripts');
    });

    it('displays error state when API fails', async () => {
      const mockApi = {
        get: vi.fn().mockRejectedValue(new Error('API Error'))
      };

      const { useApi } = await import('@/composables/useApi');
      useApi.mockReturnValue({ api: mockApi });

      const wrapper = mount(ManuscriptSelectionDrawer, {
        props: {
          isDrawerOpen: true
        },
        global: {
          plugins: [pinia, router, i18n, vuetify]
        }
      });

      await nextTick();
      await new Promise(resolve => setTimeout(resolve, 0)); // Wait for promise rejection

      // Should show error message
      expect(wrapper.text()).toContain('Failed to load manuscripts');
    });

    it('displays empty state when no manuscripts exist', async () => {
      const mockApi = {
        get: vi.fn().mockResolvedValue({
          data: { data: [] }
        })
      };

      const { useApi } = await import('@/composables/useApi');
      useApi.mockReturnValue({ api: mockApi });

      const wrapper = mount(ManuscriptSelectionDrawer, {
        props: {
          isDrawerOpen: true
        },
        global: {
          plugins: [pinia, router, i18n, vuetify]
        }
      });

      await nextTick();
      await new Promise(resolve => setTimeout(resolve, 0)); // Wait for API call

      // Should show empty state
      expect(wrapper.text()).toContain('No manuscripts found');
    });

    it('allows manuscript selection', async () => {
      const mockManuscripts = [
        { id: 1, title: 'Test Manuscript 1', manuscript_type: 'standard' },
        { id: 2, title: 'Test Manuscript 2', manuscript_type: 'scrivener' }
      ];

      const mockApi = {
        get: vi.fn().mockResolvedValue({
          data: { data: mockManuscripts }
        })
      };

      const { useApi } = await import('@/composables/useApi');
      useApi.mockReturnValue({ api: mockApi });

      const wrapper = mount(ManuscriptSelectionDrawer, {
        props: {
          isDrawerOpen: true
        },
        global: {
          plugins: [pinia, router, i18n, vuetify]
        }
      });

      await nextTick();
      await new Promise(resolve => setTimeout(resolve, 0)); // Wait for API call

      // Should display manuscripts
      expect(wrapper.text()).toContain('Test Manuscript 1');
      expect(wrapper.text()).toContain('Test Manuscript 2');

      // Click on first manuscript
      const firstManuscript = wrapper.find('.v-list-item').first();
      await firstManuscript.trigger('click');

      // Should select the manuscript
      expect(wrapper.vm.selectedManuscript).toEqual(mockManuscripts[0]);
    });

    it('emits manuscript-selected event when confirmed', async () => {
      const mockManuscripts = [
        { id: 1, title: 'Test Manuscript', manuscript_type: 'standard' }
      ];

      const mockApi = {
        get: vi.fn().mockResolvedValue({
          data: { data: mockManuscripts }
        })
      };

      const { useApi } = await import('@/composables/useApi');
      useApi.mockReturnValue({ api: mockApi });

      const wrapper = mount(ManuscriptSelectionDrawer, {
        props: {
          isDrawerOpen: true
        },
        global: {
          plugins: [pinia, router, i18n, vuetify]
        }
      });

      await nextTick();
      await new Promise(resolve => setTimeout(resolve, 0)); // Wait for API call

      // Select manuscript
      const firstManuscript = wrapper.find('.v-list-item').first();
      await firstManuscript.trigger('click');

      // Click Select button
      const selectButton = wrapper.find('button').filter(btn => btn.text() === 'Select').first();
      await selectButton.trigger('click');

      // Should emit manuscript-selected event
      expect(wrapper.emitted('manuscript-selected')).toBeTruthy();
      expect(wrapper.emitted('manuscript-selected')[0][0]).toEqual(mockManuscripts[0]);
    });

    it('emits update:isDrawerOpen event when cancelled', async () => {
      const wrapper = mount(ManuscriptSelectionDrawer, {
        props: {
          isDrawerOpen: true
        },
        global: {
          plugins: [pinia, router, i18n, vuetify]
        }
      });

      // Click Cancel button
      const cancelButton = wrapper.find('button').filter(btn => btn.text() === 'Cancel').first();
      await cancelButton.trigger('click');

      // Should emit update:isDrawerOpen event
      expect(wrapper.emitted('update:isDrawerOpen')).toBeTruthy();
      expect(wrapper.emitted('update:isDrawerOpen')[0][0]).toBe(false);
    });
  });

  describe('VerticalNavLink Component', () => {
    it('renders regular navigation item correctly', () => {
      const wrapper = mount(VerticalNavLink, {
        props: {
          item: {
            title: 'Regular Item',
            to: '/test',
            icon: { icon: 'mdi-test' }
          }
        },
        global: {
          plugins: [pinia, router, i18n, vuetify]
        }
      });

      expect(wrapper.exists()).toBe(true);
      expect(wrapper.text()).toContain('Regular Item');
    });

    it('renders custom navigation item correctly', () => {
      const wrapper = mount(VerticalNavLink, {
        props: {
          item: {
            title: 'menu.selectManuscript',
            custom: true,
            icon: { icon: 'mdi-test' }
          }
        },
        global: {
          plugins: [pinia, router, i18n, vuetify]
        }
      });

      expect(wrapper.exists()).toBe(true);
      expect(wrapper.text()).toContain('Select Manuscript');
    });

    it('handles custom click events', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

      const wrapper = mount(VerticalNavLink, {
        props: {
          item: {
            title: 'menu.selectManuscript',
            custom: true,
            icon: { icon: 'mdi-test' }
          }
        },
        global: {
          plugins: [pinia, router, i18n, vuetify]
        }
      });

      // Click the custom item
      const customItem = wrapper.find('a');
      await customItem.trigger('click');

      // Should call custom click handler
      expect(consoleSpy).toHaveBeenCalledWith('🖱️ Custom nav item clicked:', 'menu.selectManuscript');
      expect(alertSpy).toHaveBeenCalledWith('Select Manuscript clicked! This is a custom navigation item.');

      consoleSpy.mockRestore();
      alertSpy.mockRestore();
    });

    it('applies custom styling to custom items', () => {
      const wrapper = mount(VerticalNavLink, {
        props: {
          item: {
            title: 'menu.selectManuscript',
            custom: true,
            icon: { icon: 'mdi-test' }
          }
        },
        global: {
          plugins: [pinia, router, i18n, vuetify]
        }
      });

      const customItem = wrapper.find('a');
      const style = customItem.attributes('style');
      
      expect(style).toContain('cursor: pointer');
      expect(style).toContain('background: lightgreen');
      expect(style).toContain('border: 2px solid red');
    });

    it('does not apply custom styling to regular items', () => {
      const wrapper = mount(VerticalNavLink, {
        props: {
          item: {
            title: 'Regular Item',
            to: '/test',
            icon: { icon: 'mdi-test' }
          }
        },
        global: {
          plugins: [pinia, router, i18n, vuetify]
        }
      });

      const regularItem = wrapper.find('a');
      const style = regularItem.attributes('style');
      
      expect(style).not.toContain('background: lightgreen');
      expect(style).not.toContain('border: 2px solid red');
    });

    it('prevents default behavior on custom items', async () => {
      const wrapper = mount(VerticalNavLink, {
        props: {
          item: {
            title: 'menu.selectManuscript',
            custom: true,
            icon: { icon: 'mdi-test' }
          }
        },
        global: {
          plugins: [pinia, router, i18n, vuetify]
        }
      });

      const customItem = wrapper.find('a');
      
      // Mock event
      const mockEvent = {
        preventDefault: vi.fn(),
        stopPropagation: vi.fn()
      };

      // Trigger click with mock event
      await customItem.trigger('click', mockEvent);

      // Should prevent default and stop propagation
      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockEvent.stopPropagation).toHaveBeenCalled();
    });
  });

  describe('Manuscript Store', () => {
    it('initializes with correct default state', () => {
      const manuscriptStore = useManuscriptStore();
      
      expect(manuscriptStore.manuscripts).toEqual([]);
      expect(manuscriptStore.currentManuscript).toBeNull();
      expect(manuscriptStore.selectedManuscriptId).toBeNull();
      expect(manuscriptStore.loading).toBe(false);
      expect(manuscriptStore.error).toBeNull();
    });

    it('updates selectedManuscriptId when selecting manuscript', () => {
      const manuscriptStore = useManuscriptStore();
      const testManuscript = { id: 1, title: 'Test Manuscript' };
      
      manuscriptStore.selectManuscript(testManuscript);
      
      expect(manuscriptStore.selectedManuscriptId).toBe(1);
    });

    it('computes selectedManuscript correctly', () => {
      const manuscriptStore = useManuscriptStore();
      const testManuscript = { id: 1, title: 'Test Manuscript' };
      
      manuscriptStore.manuscripts = [testManuscript];
      manuscriptStore.selectedManuscriptId = 1;
      
      expect(manuscriptStore.selectedManuscript).toEqual(testManuscript);
    });

    it('computes hasSelectedManuscript correctly', () => {
      const manuscriptStore = useManuscriptStore();
      
      expect(manuscriptStore.hasSelectedManuscript).toBe(false);
      
      manuscriptStore.selectedManuscriptId = 1;
      expect(manuscriptStore.hasSelectedManuscript).toBe(true);
    });

    it('clears selection correctly', () => {
      const manuscriptStore = useManuscriptStore();
      
      manuscriptStore.selectedManuscriptId = 1;
      manuscriptStore.clearSelection();
      
      expect(manuscriptStore.selectedManuscriptId).toBeNull();
      expect(manuscriptStore.hasSelectedManuscript).toBe(false);
    });

    it('resets store state correctly', () => {
      const manuscriptStore = useManuscriptStore();
      
      // Set some state
      manuscriptStore.manuscripts = [{ id: 1, title: 'Test' }];
      manuscriptStore.selectedManuscriptId = 1;
      manuscriptStore.loading = true;
      manuscriptStore.error = 'Test error';
      
      // Reset
      manuscriptStore.$reset();
      
      // Should be back to initial state
      expect(manuscriptStore.manuscripts).toEqual([]);
      expect(manuscriptStore.selectedManuscriptId).toBeNull();
      expect(manuscriptStore.loading).toBe(false);
      expect(manuscriptStore.error).toBeNull();
    });

    it('handles API errors in fetchManuscripts', async () => {
      const mockApi = {
        get: vi.fn().mockRejectedValue(new Error('API Error'))
      };

      const { useApi } = await import('@/composables/useApi');
      useApi.mockReturnValue({ api: mockApi });

      const manuscriptStore = useManuscriptStore();
      
      try {
        await manuscriptStore.fetchManuscripts();
      } catch (error) {
        expect(error.message).toBe('API Error');
      }
      
      expect(manuscriptStore.error).toBe('Failed to fetch manuscripts');
      expect(manuscriptStore.loading).toBe(false);
    });

    it('handles API success in fetchManuscripts', async () => {
      const mockManuscripts = [
        { id: 1, title: 'Test Manuscript' }
      ];

      const mockApi = {
        get: vi.fn().mockResolvedValue({
          data: { data: mockManuscripts }
        })
      };

      const { useApi } = await import('@/composables/useApi');
      useApi.mockReturnValue({ api: mockApi });

      const manuscriptStore = useManuscriptStore();
      
      const result = await manuscriptStore.fetchManuscripts();
      
      expect(result).toEqual(mockManuscripts);
      expect(manuscriptStore.manuscripts).toEqual(mockManuscripts);
      expect(manuscriptStore.loading).toBe(false);
      expect(manuscriptStore.error).toBeNull();
    });
  });

  describe('Component Integration', () => {
    it('components work together correctly', async () => {
      const manuscriptStore = useManuscriptStore();
      
      // Mock successful API response
      const mockManuscripts = [
        { id: 1, title: 'Test Manuscript', manuscript_type: 'standard' }
      ];

      const mockApi = {
        get: vi.fn().mockResolvedValue({
          data: { data: mockManuscripts }
        })
      };

      const { useApi } = await import('@/composables/useApi');
      useApi.mockReturnValue({ api: mockApi });

      // Test drawer component
      const drawerWrapper = mount(ManuscriptSelectionDrawer, {
        props: {
          isDrawerOpen: true
        },
        global: {
          plugins: [pinia, router, i18n, vuetify]
        }
      });

      await nextTick();
      await new Promise(resolve => setTimeout(resolve, 0)); // Wait for API call

      // Select manuscript in drawer
      const firstManuscript = drawerWrapper.find('.v-list-item').first();
      await firstManuscript.trigger('click');

      // Confirm selection
      const selectButton = drawerWrapper.find('button').filter(btn => btn.text() === 'Select').first();
      await selectButton.trigger('click');

      // Check that event was emitted
      expect(drawerWrapper.emitted('manuscript-selected')).toBeTruthy();
      expect(drawerWrapper.emitted('manuscript-selected')[0][0]).toEqual(mockManuscripts[0]);
    });
  });
});