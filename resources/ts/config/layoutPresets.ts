/**
 * Layout Presets Configuration
 *
 * Defines pre-configured layouts for the split view system
 */

import type { LayoutPreset } from '@/types/splitView'

export const layoutPresets: Record<string, LayoutPreset> = {
  single: {
    id: 'single',
    name: 'Single Pane',
    icon: 'mdi-square-outline',
    description: 'Single document view',
    layout: {
      id: 'root',
      type: 'pane',
      size: 100,
      paneId: 'main'
    },
    defaultPanes: [
      {
        id: 'main',
        tabs: [],
        activeTabId: null,
        focused: true,
        viewConfig: {
          scrollPosition: 0,
          zoom: 100,
          fontSize: 'medium'
        }
      }
    ]
  },

  vertical: {
    id: 'vertical',
    name: 'Vertical Split',
    icon: 'mdi-view-column-outline',
    description: 'Two panes side by side',
    layout: {
      id: 'root',
      type: 'container',
      orientation: 'horizontal',
      size: 100,
      children: [
        {
          id: 'left',
          type: 'pane',
          size: 50,
          paneId: 'left-pane'
        },
        {
          id: 'right',
          type: 'pane',
          size: 50,
          paneId: 'right-pane'
        }
      ]
    },
    defaultPanes: [
      {
        id: 'left-pane',
        tabs: [],
        activeTabId: null,
        focused: true,
        viewConfig: {
          scrollPosition: 0,
          zoom: 100,
          fontSize: 'medium'
        }
      },
      {
        id: 'right-pane',
        tabs: [],
        activeTabId: null,
        focused: false,
        viewConfig: {
          scrollPosition: 0,
          zoom: 100,
          fontSize: 'medium'
        }
      }
    ]
  },

  horizontal: {
    id: 'horizontal',
    name: 'Horizontal Split',
    icon: 'mdi-view-row-outline',
    description: 'Two panes stacked',
    layout: {
      id: 'root',
      type: 'container',
      orientation: 'vertical',
      size: 100,
      children: [
        {
          id: 'top',
          type: 'pane',
          size: 50,
          paneId: 'top-pane'
        },
        {
          id: 'bottom',
          type: 'pane',
          size: 50,
          paneId: 'bottom-pane'
        }
      ]
    },
    defaultPanes: [
      {
        id: 'top-pane',
        tabs: [],
        activeTabId: null,
        focused: true,
        viewConfig: {
          scrollPosition: 0,
          zoom: 100,
          fontSize: 'medium'
        }
      },
      {
        id: 'bottom-pane',
        tabs: [],
        activeTabId: null,
        focused: false,
        viewConfig: {
          scrollPosition: 0,
          zoom: 100,
          fontSize: 'medium'
        }
      }
    ]
  },

  grid: {
    id: 'grid',
    name: 'Grid',
    icon: 'mdi-view-grid-outline',
    description: 'Four panes in a grid',
    layout: {
      id: 'root',
      type: 'container',
      orientation: 'horizontal',
      size: 100,
      children: [
        {
          id: 'left-column',
          type: 'container',
          orientation: 'vertical',
          size: 50,
          children: [
            {
              id: 'top-left',
              type: 'pane',
              size: 50,
              paneId: 'tl-pane'
            },
            {
              id: 'bottom-left',
              type: 'pane',
              size: 50,
              paneId: 'bl-pane'
            }
          ]
        },
        {
          id: 'right-column',
          type: 'container',
          orientation: 'vertical',
          size: 50,
          children: [
            {
              id: 'top-right',
              type: 'pane',
              size: 50,
              paneId: 'tr-pane'
            },
            {
              id: 'bottom-right',
              type: 'pane',
              size: 50,
              paneId: 'br-pane'
            }
          ]
        }
      ]
    },
    defaultPanes: [
      {
        id: 'tl-pane',
        tabs: [],
        activeTabId: null,
        focused: true,
        viewConfig: {
          scrollPosition: 0,
          zoom: 100,
          fontSize: 'medium'
        }
      },
      {
        id: 'bl-pane',
        tabs: [],
        activeTabId: null,
        focused: false,
        viewConfig: {
          scrollPosition: 0,
          zoom: 100,
          fontSize: 'medium'
        }
      },
      {
        id: 'tr-pane',
        tabs: [],
        activeTabId: null,
        focused: false,
        viewConfig: {
          scrollPosition: 0,
          zoom: 100,
          fontSize: 'medium'
        }
      },
      {
        id: 'br-pane',
        tabs: [],
        activeTabId: null,
        focused: false,
        viewConfig: {
          scrollPosition: 0,
          zoom: 100,
          fontSize: 'medium'
        }
      }
    ]
  },

  writerFocus: {
    id: 'writerFocus',
    name: 'Writer Focus',
    icon: 'mdi-file-document-edit-outline',
    description: 'Large editor with small reference pane',
    layout: {
      id: 'root',
      type: 'container',
      orientation: 'horizontal',
      size: 100,
      children: [
        {
          id: 'main',
          type: 'pane',
          size: 70,
          paneId: 'main-pane'
        },
        {
          id: 'reference',
          type: 'pane',
          size: 30,
          paneId: 'ref-pane'
        }
      ]
    },
    defaultPanes: [
      {
        id: 'main-pane',
        tabs: [],
        activeTabId: null,
        focused: true,
        viewConfig: {
          scrollPosition: 0,
          zoom: 100,
          fontSize: 'medium'
        }
      },
      {
        id: 'ref-pane',
        tabs: [],
        activeTabId: null,
        focused: false,
        viewConfig: {
          scrollPosition: 0,
          zoom: 100,
          fontSize: 'small'
        }
      }
    ]
  },

  research: {
    id: 'research',
    name: 'Research',
    icon: 'mdi-book-open-page-variant',
    description: 'Multiple reference panes with notes',
    layout: {
      id: 'root',
      type: 'container',
      orientation: 'horizontal',
      size: 100,
      children: [
        {
          id: 'references',
          type: 'container',
          orientation: 'vertical',
          size: 60,
          children: [
            {
              id: 'ref1',
              type: 'pane',
              size: 50,
              paneId: 'ref1-pane'
            },
            {
              id: 'ref2',
              type: 'pane',
              size: 50,
              paneId: 'ref2-pane'
            }
          ]
        },
        {
          id: 'notes',
          type: 'pane',
          size: 40,
          paneId: 'notes-pane'
        }
      ]
    },
    defaultPanes: [
      {
        id: 'ref1-pane',
        tabs: [],
        activeTabId: null,
        focused: false,
        viewConfig: {
          scrollPosition: 0,
          zoom: 100,
          fontSize: 'small'
        }
      },
      {
        id: 'ref2-pane',
        tabs: [],
        activeTabId: null,
        focused: false,
        viewConfig: {
          scrollPosition: 0,
          zoom: 100,
          fontSize: 'small'
        }
      },
      {
        id: 'notes-pane',
        tabs: [],
        activeTabId: null,
        focused: true,
        viewConfig: {
          scrollPosition: 0,
          zoom: 100,
          fontSize: 'medium'
        }
      }
    ]
  }
}
