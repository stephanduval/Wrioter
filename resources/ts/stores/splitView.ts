/**
 * Split View Store
 *
 * Manages the split view layout, panes, and tabs state
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import type {
  SplitNode,
  Pane,
  Tab,
  TabCreateOptions,
  SplitDirection,
  NavigationDirection,
  LayoutData,
  LayoutPreset
} from '@/types/splitView'
import { $api } from '@/utils/api'

export const useSplitViewStore = defineStore('splitView', () => {
  // State - Initialize panes and focusedPaneId first
  const panes = ref<Map<string, Pane>>(new Map())
  const focusedPaneId = ref<string | null>(null)
  const isDragging = ref(false)
  const draggedTab = ref<Tab | null>(null)
  const isFocusMode = ref(false)

  // Layout Management
  function createDefaultLayout(): SplitNode {
    const paneId = uuidv4()
    const pane: Pane = {
      id: paneId,
      tabs: [],
      activeTabId: null,
      focused: true,
      viewConfig: {
        scrollPosition: 0,
        zoom: 100,
        fontSize: 'medium'
      }
    }
    panes.value.set(paneId, pane)
    focusedPaneId.value = paneId

    return {
      id: uuidv4(),
      type: 'pane',
      size: 100,
      paneId
    }
  }

  // Initialize layout after defining createDefaultLayout
  const layout = ref<SplitNode>(createDefaultLayout())

  // Computed
  const focusedPane = computed(() =>
    focusedPaneId.value ? panes.value.get(focusedPaneId.value) : null
  )

  const allTabs = computed(() => {
    const tabs: Tab[] = []
    panes.value.forEach(pane => {
      tabs.push(...pane.tabs)
    })
    return tabs
  })

  const paneCount = computed(() => panes.value.size)

  function splitPane(
    paneId: string,
    direction: SplitDirection,
    ratio: number = 50
  ): string {
    const newPaneId = uuidv4()
    const newPane: Pane = {
      id: newPaneId,
      tabs: [],
      activeTabId: null,
      focused: false,
      viewConfig: {
        scrollPosition: 0,
        zoom: 100,
        fontSize: 'medium'
      }
    }
    panes.value.set(newPaneId, newPane)

    // Update layout tree
    layout.value = splitNodeRecursive(
      layout.value,
      paneId,
      direction,
      ratio,
      newPaneId
    )

    return newPaneId
  }

  function splitNodeRecursive(
    node: SplitNode,
    targetPaneId: string,
    direction: SplitDirection,
    ratio: number,
    newPaneId: string
  ): SplitNode {
    if (node.type === 'pane' && node.paneId === targetPaneId) {
      // Replace pane with container
      return {
        id: uuidv4(),
        type: 'container',
        orientation: direction,
        size: node.size,
        children: [
          {
            id: uuidv4(),
            type: 'pane',
            size: ratio,
            paneId: targetPaneId
          },
          {
            id: uuidv4(),
            type: 'pane',
            size: 100 - ratio,
            paneId: newPaneId
          }
        ]
      }
    }

    if (node.type === 'container' && node.children) {
      return {
        ...node,
        children: node.children.map(child =>
          splitNodeRecursive(child, targetPaneId, direction, ratio, newPaneId)
        )
      }
    }

    return node
  }

  // Tab Management
  function addTab(paneId: string, tabOptions: TabCreateOptions): string {
    const pane = panes.value.get(paneId)
    if (!pane) throw new Error(`Pane ${paneId} not found`)

    const tabId = uuidv4()
    const newTab: Tab = {
      id: tabId,
      type: tabOptions.type,
      itemId: tabOptions.itemId,
      folderId: tabOptions.folderId,
      title: tabOptions.title,
      isDirty: tabOptions.isDirty ?? false,
      isPinned: tabOptions.isPinned ?? false,
      isLoading: tabOptions.isLoading ?? false,
      lastModified: new Date(),
      viewState: {
        scrollTop: 0
      }
    }

    pane.tabs.push(newTab)
    pane.activeTabId = tabId
    return tabId
  }

  function closeTab(paneId: string, tabId: string) {
    const pane = panes.value.get(paneId)
    if (!pane) return

    const tabIndex = pane.tabs.findIndex(t => t.id === tabId)
    if (tabIndex === -1) return

    pane.tabs.splice(tabIndex, 1)

    // Update active tab
    if (pane.activeTabId === tabId) {
      if (pane.tabs.length > 0) {
        const newIndex = Math.min(tabIndex, pane.tabs.length - 1)
        pane.activeTabId = pane.tabs[newIndex].id
      } else {
        pane.activeTabId = null
      }
    }

    // Close pane if no tabs left and not the only pane
    if (pane.tabs.length === 0 && paneCount.value > 1) {
      closePane(paneId)
    }
  }

  function closeAllTabs(paneId: string, exceptPinned: boolean = true) {
    const pane = panes.value.get(paneId)
    if (!pane) return

    if (exceptPinned) {
      pane.tabs = pane.tabs.filter(tab => tab.isPinned)
    } else {
      pane.tabs = []
    }

    if (pane.tabs.length > 0) {
      pane.activeTabId = pane.tabs[0].id
    } else {
      pane.activeTabId = null
      if (paneCount.value > 1) {
        closePane(paneId)
      }
    }
  }

  function moveTab(
    tabId: string,
    sourcePaneId: string,
    targetPaneId: string,
    targetIndex: number
  ) {
    const sourcePane = panes.value.get(sourcePaneId)
    const targetPane = panes.value.get(targetPaneId)
    if (!sourcePane || !targetPane) return

    const tabIndex = sourcePane.tabs.findIndex(t => t.id === tabId)
    if (tabIndex === -1) return

    const [tab] = sourcePane.tabs.splice(tabIndex, 1)
    targetPane.tabs.splice(targetIndex, 0, tab)
    targetPane.activeTabId = tabId

    // Update source pane active tab
    if (sourcePane.activeTabId === tabId && sourcePane.tabs.length > 0) {
      sourcePane.activeTabId = sourcePane.tabs[0].id
    }

    // Close source pane if empty and not the only pane
    if (sourcePane.tabs.length === 0 && paneCount.value > 1) {
      closePane(sourcePaneId)
    }
  }

  function selectTab(paneId: string, tabId: string) {
    const pane = panes.value.get(paneId)
    if (!pane) return

    const tab = pane.tabs.find(t => t.id === tabId)
    if (tab) {
      pane.activeTabId = tabId
      focusPane(paneId)
    }
  }

  function selectNextTab() {
    if (!focusedPane.value || !focusedPane.value.activeTabId) return

    const currentIndex = focusedPane.value.tabs.findIndex(
      t => t.id === focusedPane.value!.activeTabId
    )

    if (currentIndex !== -1) {
      const nextIndex = (currentIndex + 1) % focusedPane.value.tabs.length
      focusedPane.value.activeTabId = focusedPane.value.tabs[nextIndex].id
    }
  }

  function selectPreviousTab() {
    if (!focusedPane.value || !focusedPane.value.activeTabId) return

    const currentIndex = focusedPane.value.tabs.findIndex(
      t => t.id === focusedPane.value!.activeTabId
    )

    if (currentIndex !== -1) {
      const prevIndex =
        (currentIndex - 1 + focusedPane.value.tabs.length) %
        focusedPane.value.tabs.length
      focusedPane.value.activeTabId = focusedPane.value.tabs[prevIndex].id
    }
  }

  function selectTabByIndex(index: number) {
    if (!focusedPane.value) return

    if (index >= 0 && index < focusedPane.value.tabs.length) {
      focusedPane.value.activeTabId = focusedPane.value.tabs[index].id
    }
  }

  // Pane Management
  function closePane(paneId: string) {
    if (paneCount.value <= 1) return

    panes.value.delete(paneId)
    layout.value = removePaneFromLayout(layout.value, paneId)

    // Update focus
    if (focusedPaneId.value === paneId) {
      const firstPane = panes.value.keys().next().value
      focusedPaneId.value = firstPane
    }
  }

  function removePaneFromLayout(node: SplitNode, paneId: string): SplitNode {
    if (node.type === 'container' && node.children) {
      const filteredChildren = node.children.filter(child => {
        if (child.type === 'pane') {
          return child.paneId !== paneId
        }
        return true
      })

      // If only one child left, replace container with child
      if (filteredChildren.length === 1) {
        const child = filteredChildren[0]
        child.size = node.size
        return child
      }

      // Rebalance sizes
      const removedChild = node.children.find(
        c => c.type === 'pane' && c.paneId === paneId
      )
      const removedSize = removedChild?.size || 0

      if (removedSize > 0 && filteredChildren.length > 0) {
        const sizePerChild = removedSize / filteredChildren.length
        filteredChildren.forEach(child => {
          child.size += sizePerChild
        })
      }

      return {
        ...node,
        children: filteredChildren.map(child =>
          removePaneFromLayout(child, paneId)
        )
      }
    }

    return node
  }

  // Focus Management
  function focusPane(paneId: string) {
    if (panes.value.has(paneId)) {
      // Unfocus all panes
      panes.value.forEach(pane => {
        pane.focused = false
      })

      // Focus target pane
      const pane = panes.value.get(paneId)
      if (pane) {
        pane.focused = true
        focusedPaneId.value = paneId
      }
    }
  }

  function navigateToPane(direction: NavigationDirection) {
    // TODO: Implement spatial navigation between panes
    // This requires calculating pane positions in the layout
    console.log('Navigate to pane:', direction)
  }

  function toggleFocusMode() {
    isFocusMode.value = !isFocusMode.value
  }

  // Layout Presets
  function applyPreset(preset: LayoutPreset) {
    // Clear existing panes
    panes.value.clear()

    // Create new panes from preset
    preset.defaultPanes.forEach(paneData => {
      const paneId = paneData.id!
      const pane: Pane = {
        id: paneId,
        tabs: paneData.tabs || [],
        activeTabId: paneData.activeTabId || null,
        focused: paneData.focused || false,
        viewConfig: paneData.viewConfig || {
          scrollPosition: 0,
          zoom: 100,
          fontSize: 'medium'
        }
      }
      panes.value.set(paneId, pane)
    })

    // Apply layout
    layout.value = preset.layout

    // Set focus
    const focusedPane = preset.defaultPanes.find(p => p.focused)
    focusedPaneId.value = focusedPane?.id || null
  }

  // Resize Management
  function updateNodeSizes(nodeId: string, sizes: number[]) {
    layout.value = updateNodeSizesRecursive(layout.value, nodeId, sizes)
  }

  function updateNodeSizesRecursive(
    node: SplitNode,
    nodeId: string,
    sizes: number[]
  ): SplitNode {
    if (node.id === nodeId && node.children) {
      return {
        ...node,
        children: node.children.map((child, index) => ({
          ...child,
          size: sizes[index] || child.size
        }))
      }
    }

    if (node.type === 'container' && node.children) {
      return {
        ...node,
        children: node.children.map(child =>
          updateNodeSizesRecursive(child, nodeId, sizes)
        )
      }
    }

    return node
  }

  // Persistence
  async function saveLayout(manuscriptId: string, name?: string) {
    const layoutData: LayoutData = {
      layout: layout.value,
      panes: Array.from(panes.value.entries()).map(([id, pane]) => ({
        id,
        tabs: pane.tabs,
        activeTabId: pane.activeTabId,
        focused: pane.focused,
        viewConfig: pane.viewConfig
      })),
      focusedPaneId: focusedPaneId.value
    }

    try {
      const response = await $api('/layouts', {
        method: 'POST',
        body: {
          manuscript_id: manuscriptId,
          name: name || 'Current Layout',
          layout_config: layoutData
        }
      })
      return response
    } catch (error) {
      console.error('Failed to save layout:', error)
      throw error
    }
  }

  async function loadLayout(layoutId: string) {
    try {
      const response = await $api(`/layouts/${layoutId}`)
      const layoutData: LayoutData = response.layout_config

      // Clear existing panes
      panes.value.clear()

      // Restore panes
      layoutData.panes.forEach(paneData => {
        panes.value.set(paneData.id, {
          id: paneData.id,
          tabs: paneData.tabs || [],
          activeTabId: paneData.activeTabId,
          focused: paneData.focused,
          viewConfig: paneData.viewConfig
        })
      })

      // Restore layout
      layout.value = layoutData.layout
      focusedPaneId.value = layoutData.focusedPaneId
    } catch (error) {
      console.error('Failed to load layout:', error)
      throw error
    }
  }

  function restoreSession(sessionData: any) {
    // Clear existing state
    panes.value.clear()

    // Restore panes
    sessionData.panes.forEach(([id, pane]: [string, Pane]) => {
      panes.value.set(id, pane)
    })

    // Restore layout
    layout.value = sessionData.layout
  }

  // Reset to default
  function reset() {
    panes.value.clear()
    layout.value = createDefaultLayout()
    isDragging.value = false
    draggedTab.value = null
    isFocusMode.value = false
  }

  return {
    // State
    layout,
    panes,
    focusedPaneId,
    isDragging,
    draggedTab,
    isFocusMode,

    // Computed
    focusedPane,
    allTabs,
    paneCount,

    // Actions
    splitPane,
    closePane,
    focusPane,
    navigateToPane,
    toggleFocusMode,
    addTab,
    closeTab,
    closeAllTabs,
    moveTab,
    selectTab,
    selectNextTab,
    selectPreviousTab,
    selectTabByIndex,
    applyPreset,
    updateNodeSizes,
    saveLayout,
    loadLayout,
    restoreSession,
    reset
  }
})
