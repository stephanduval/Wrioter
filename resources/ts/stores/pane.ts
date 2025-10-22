import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export type PaneViewMode = 'manuscript' | 'corkboard' | 'outline' | 'mindmap' | 'item' | 'edit'

export interface PaneViewSettings {
  // Manuscript settings
  fontSize?: 'small' | 'medium' | 'large'
  lineSpacing?: 'single' | '1.5' | 'double'
  showPageBreaks?: boolean

  // Corkboard settings
  zoom?: 'small' | 'medium' | 'large'
  columns?: number

  // Outline settings
  visibleColumns?: string[]
  columnWidths?: Record<string, number>

  // Mindmap settings
  mindmapZoom?: number
  mindmapPan?: { x: number, y: number }
  showMindmapGrid?: boolean

  // Item settings
  itemEditorFontSize?: 'small' | 'medium' | 'large'
  showSynopsis?: boolean
  autoSave?: boolean

  // Common settings
  scrollPosition?: number
}

export interface PaneState {
  id: string
  viewMode: PaneViewMode

  // Content context
  folderId?: number
  folderData?: any // The actual folder object
  folderItems?: any[] // The items in this folder (cached per pane)
  editingItemId?: number // For edit mode

  // Selection state
  selectedItemIds: Set<number>
  focusedItemId?: number

  // View configuration
  viewSettings: PaneViewSettings

  // UI state
  isActive: boolean
  isLoading: boolean
  error?: string
}

/**
 * Pane Store
 *
 * Manages independent state for each pane in split view.
 * Each pane can have its own view mode, selection, and settings.
 */
export const usePaneStore = defineStore('pane', () => {
  // State
  const panes = ref<Map<string, PaneState>>(new Map())
  const activePaneId = ref<string | null>(null)

  // Getters
  const paneCount = computed(() => panes.value.size)

  const activePane = computed(() => {
    if (!activePaneId.value) return null
    return panes.value.get(activePaneId.value) || null
  })

  const allPanes = computed(() => Array.from(panes.value.values()))

  // Get pane by ID
  function getPane(paneId: string): PaneState | undefined {
    return panes.value.get(paneId)
  }

  // Check if pane exists
  function hasPane(paneId: string): boolean {
    return panes.value.has(paneId)
  }

  // Actions

  /**
   * Create a new pane with initial configuration
   */
  function createPane(
    id: string,
    config: Partial<PaneState> = {}
  ): PaneState {
    const defaultPane: PaneState = {
      id,
      viewMode: 'manuscript',
      selectedItemIds: new Set(),
      viewSettings: {},
      isActive: false,
      isLoading: false,
      ...config
    }

    panes.value.set(id, defaultPane)

    // Set as active if it's the first pane
    if (panes.value.size === 1) {
      activePaneId.value = id
      defaultPane.isActive = true
    }

    console.log(`[PaneStore] Created pane: ${id} with mode: ${defaultPane.viewMode}`)
    return defaultPane
  }

  /**
   * Remove a pane
   */
  function removePane(paneId: string) {
    if (!panes.value.has(paneId)) return

    panes.value.delete(paneId)

    // Update active pane if needed
    if (activePaneId.value === paneId) {
      const remainingPanes = Array.from(panes.value.keys())
      activePaneId.value = remainingPanes.length > 0 ? remainingPanes[0] : null
    }

    console.log(`[PaneStore] Removed pane: ${paneId}`)
  }

  /**
   * Clear all panes (used when split view is disabled)
   */
  function clearAllPanes() {
    panes.value.clear()
    activePaneId.value = null
    console.log('[PaneStore] Cleared all panes')
  }

  /**
   * Set active pane
   */
  function setActivePane(paneId: string) {
    if (!panes.value.has(paneId)) return

    // Deactivate current
    if (activePaneId.value) {
      const currentPane = panes.value.get(activePaneId.value)
      if (currentPane) currentPane.isActive = false
    }

    // Activate new
    activePaneId.value = paneId
    const newPane = panes.value.get(paneId)
    if (newPane) newPane.isActive = true

    console.log(`[PaneStore] Active pane: ${paneId}`)
  }

  /**
   * Update pane view mode
   */
  function updatePaneMode(paneId: string, mode: PaneViewMode) {
    const pane = panes.value.get(paneId)
    if (!pane) return

    pane.viewMode = mode

    // Clear edit-specific state if switching away from edit
    if (mode !== 'edit') {
      pane.editingItemId = undefined
    }

    console.log(`[PaneStore] Pane ${paneId} mode changed to: ${mode}`)
  }

  /**
   * Set the folder being viewed in a pane
   */
  function setPaneFolder(paneId: string, folderId: number) {
    const pane = panes.value.get(paneId)
    if (!pane) return

    pane.folderId = folderId
    // Clear selection when changing folders
    pane.selectedItemIds.clear()
    pane.focusedItemId = undefined

    console.log(`[PaneStore] Pane ${paneId} folder set to: ${folderId}`)
  }

  /**
   * Load folder content for a specific pane
   */
  async function loadFolderForPane(paneId: string, folderId: number) {
    const pane = panes.value.get(paneId)
    if (!pane) return

    pane.isLoading = true
    pane.error = undefined

    try {
      // Import API at runtime to avoid circular dependencies
      const { $api } = await import('@/utils/api')

      console.log(`[PaneStore] Loading folder ${folderId} for pane ${paneId}`)

      // Fetch folder contents
      const response = await $api(`/folders/${folderId}/contents`, {
        method: 'GET'
      })

      // Store folder data in the pane
      pane.folderId = folderId
      pane.folderData = response.folder
      pane.folderItems = response.items || []

      // Clear selection when changing folders
      pane.selectedItemIds.clear()
      pane.focusedItemId = undefined

      console.log(`[PaneStore] Loaded ${pane.folderItems.length} items for pane ${paneId}`)
    } catch (error) {
      console.error(`[PaneStore] Failed to load folder for pane ${paneId}:`, error)
      pane.error = 'Failed to load folder contents'
      pane.folderItems = []
    } finally {
      pane.isLoading = false
    }
  }

  /**
   * Set item being edited in a pane (for edit mode)
   */
  function setEditingItem(paneId: string, itemId: number) {
    const pane = panes.value.get(paneId)
    if (!pane) return

    pane.editingItemId = itemId
    pane.viewMode = 'edit' // Auto-switch to edit mode

    console.log(`[PaneStore] Pane ${paneId} editing item: ${itemId}`)
  }

  /**
   * Update pane selection
   */
  function setPaneSelection(paneId: string, itemIds: Set<number>) {
    const pane = panes.value.get(paneId)
    if (!pane) return

    pane.selectedItemIds = new Set(itemIds)
    console.log(`[PaneStore] Pane ${paneId} selection: ${itemIds.size} items`)
  }

  /**
   * Add item to pane selection
   */
  function addToSelection(paneId: string, itemId: number) {
    const pane = panes.value.get(paneId)
    if (!pane) return

    pane.selectedItemIds.add(itemId)
  }

  /**
   * Remove item from pane selection
   */
  function removeFromSelection(paneId: string, itemId: number) {
    const pane = panes.value.get(paneId)
    if (!pane) return

    pane.selectedItemIds.delete(itemId)
  }

  /**
   * Clear pane selection
   */
  function clearSelection(paneId: string) {
    const pane = panes.value.get(paneId)
    if (!pane) return

    pane.selectedItemIds.clear()
    pane.focusedItemId = undefined
  }

  /**
   * Set focused item in pane
   */
  function setFocusedItem(paneId: string, itemId: number | undefined) {
    const pane = panes.value.get(paneId)
    if (!pane) return

    pane.focusedItemId = itemId
  }

  /**
   * Update pane view settings
   */
  function updateViewSettings(
    paneId: string,
    settings: Partial<PaneViewSettings>
  ) {
    const pane = panes.value.get(paneId)
    if (!pane) return

    pane.viewSettings = {
      ...pane.viewSettings,
      ...settings
    }
  }

  /**
   * Sync selection from one pane to another
   */
  function syncPaneSelections(fromPaneId: string, toPaneId: string) {
    const fromPane = panes.value.get(fromPaneId)
    const toPane = panes.value.get(toPaneId)

    if (!fromPane || !toPane) return

    toPane.selectedItemIds = new Set(fromPane.selectedItemIds)
    toPane.focusedItemId = fromPane.focusedItemId

    console.log(`[PaneStore] Synced selection from ${fromPaneId} to ${toPaneId}`)
  }

  /**
   * Set pane loading state
   */
  function setPaneLoading(paneId: string, isLoading: boolean) {
    const pane = panes.value.get(paneId)
    if (!pane) return

    pane.isLoading = isLoading
  }

  /**
   * Set pane error state
   */
  function setPaneError(paneId: string, error: string | undefined) {
    const pane = panes.value.get(paneId)
    if (!pane) return

    pane.error = error
  }

  /**
   * Initialize default panes for split view
   */
  function initializeDefaultPanes() {
    // Clear any existing panes
    clearAllPanes()

    // Create two default panes
    createPane('pane-1', {
      viewMode: 'manuscript',
      isActive: true
    })

    createPane('pane-2', {
      viewMode: 'manuscript',
      isActive: false
    })

    activePaneId.value = 'pane-1'

    console.log('[PaneStore] Initialized default panes for split view')
  }

  /**
   * Get next pane in order (for Tab navigation)
   */
  function getNextPane(currentPaneId: string): string | null {
    const paneIds = Array.from(panes.value.keys())
    const currentIndex = paneIds.indexOf(currentPaneId)

    if (currentIndex === -1 || currentIndex === paneIds.length - 1) {
      return paneIds[0] || null
    }

    return paneIds[currentIndex + 1]
  }

  /**
   * Reset store state
   */
  function $reset() {
    clearAllPanes()
  }

  return {
    // State
    panes,
    activePaneId,

    // Getters
    paneCount,
    activePane,
    allPanes,

    // Methods
    getPane,
    hasPane,
    createPane,
    removePane,
    clearAllPanes,
    setActivePane,
    updatePaneMode,
    setPaneFolder,
    loadFolderForPane,
    setEditingItem,
    setPaneSelection,
    addToSelection,
    removeFromSelection,
    clearSelection,
    setFocusedItem,
    updateViewSettings,
    syncPaneSelections,
    setPaneLoading,
    setPaneError,
    initializeDefaultPanes,
    getNextPane,
    $reset
  }
})