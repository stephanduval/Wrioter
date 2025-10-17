import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { $api } from '@/utils/api'
import type { SplitNode } from '@/types/splitView'

export type ViewMode = 'manuscript' | 'corkboard' | 'outline'

export interface ViewPreference {
  view_mode: ViewMode
  settings: {
    manuscript?: ManuscriptViewSettings
    corkboard?: CorkboardViewSettings
    outline?: OutlineViewSettings
  }
}

export interface ManuscriptViewSettings {
  show_page_breaks: boolean
  font_size: 'small' | 'medium' | 'large'
  line_spacing: 'single' | 'double' | '1.5'
}

export interface CorkboardViewSettings {
  zoom: 'small' | 'medium' | 'large'
  layout: 'grid' | 'freeform'
  columns: number
  display_mode: 'synopsis' | 'excerpt' | 'metadata'
}

export interface OutlineViewSettings {
  visible_columns: string[]
  column_widths: Record<string, number>
  sort_column: string
  sort_direction: 'asc' | 'desc'
}

export interface FolderItem {
  id: number
  title: string
  type: string
  synopsis?: string
  content?: string
  excerpt?: string
  word_count?: number
  item_order?: number
  metadata?: any
  include_in_compile?: boolean
  updated_at: string
}

export interface FolderData {
  id: number
  title: string
  type: 'folder'
  parent_id?: number
}

/**
 * Folder View Store
 *
 * Manages view modes for folders (manuscript, corkboard, outline).
 * This is the central store that coordinates between different view implementations.
 */
export const useFolderViewStore = defineStore('folderView', () => {
  // State
  const currentViewMode = ref<ViewMode>('corkboard')
  const currentFolderId = ref<number | null>(null)
  const currentFolder = ref<FolderData | null>(null)
  const folderItems = ref<FolderItem[]>([])
  const viewPreferences = ref<Map<number, ViewPreference>>(new Map())

  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Split view state
  const splitEnabled = ref(false)
  const splitLayouts = ref<{
    manuscript?: SplitNode
    corkboard?: SplitNode
    outline?: SplitNode
  }>({})

  // Getters
  const hasFolder = computed(() => currentFolderId.value !== null)

  const currentViewPreference = computed(() => {
    if (!currentFolderId.value) return null
    return viewPreferences.value.get(currentFolderId.value) || null
  })

  const itemCount = computed(() => folderItems.value.length)

  const currentViewSettings = computed(() => {
    const pref = currentViewPreference.value
    if (!pref) return null

    return pref.settings[currentViewMode.value] || null
  })

  // Actions

  /**
   * Set the current view mode and optionally load a folder
   */
  async function setViewMode(mode: ViewMode, folderId?: number) {
    currentViewMode.value = mode

    if (folderId !== undefined) {
      await loadFolder(folderId, mode)
    }

    // Save preference if folder is loaded
    if (currentFolderId.value) {
      await saveViewPreference(currentFolderId.value, { view_mode: mode })
    }
  }

  /**
   * Load folder contents optimized for the current view mode
   */
  async function loadFolder(folderId: number, viewMode: ViewMode = currentViewMode.value) {
    try {
      isLoading.value = true
      error.value = null
      currentFolderId.value = folderId

      console.log(`Loading folder ${folderId} in ${viewMode} view mode`)

      // Fetch folder contents with view mode optimization
      const response = await $api(`/folders/${folderId}/contents`, {
        params: { view_mode: viewMode }
      })

      console.log('Folder contents loaded:', response)

      currentFolder.value = response.folder
      folderItems.value = response.items || []

      // Load user preferences for this folder
      if (response.view_preferences) {
        viewPreferences.value.set(folderId, response.view_preferences)

        // Set view mode from preferences if different
        if (response.view_preferences.view_mode !== viewMode) {
          currentViewMode.value = response.view_preferences.view_mode
        }
      }

      console.log(`Loaded ${folderItems.value.length} items in ${viewMode} view`)
    } catch (err: any) {
      console.error('Failed to load folder:', err)
      error.value = err.message || 'Failed to load folder contents'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Reload the current folder with updated view mode
   */
  async function reloadFolder() {
    if (!currentFolderId.value) return
    await loadFolder(currentFolderId.value, currentViewMode.value)
  }

  /**
   * Load user preferences for a specific folder
   */
  async function loadFolderPreferences(folderId: number) {
    try {
      const response = await $api(`/preferences/folder-views/${folderId}`)

      if (response.data) {
        viewPreferences.value.set(folderId, response.data)
      }

      return response.data
    } catch (err: any) {
      console.error('Failed to load folder preferences:', err)
      // Don't throw - preferences are optional
      return null
    }
  }

  /**
   * Save view preferences for a folder
   */
  async function saveViewPreference(
    folderId: number,
    updates: Partial<ViewPreference>
  ) {
    try {
      const existing = viewPreferences.value.get(folderId) || {
        view_mode: currentViewMode.value,
        settings: {}
      }

      const updated = {
        ...existing,
        ...updates,
        settings: {
          ...existing.settings,
          ...updates.settings
        }
      }

      // Optimistic update
      viewPreferences.value.set(folderId, updated)

      // Save to backend (debounced in component)
      const response = await $api(`/preferences/folder-views/${folderId}`, {
        method: 'POST',
        body: updated
      })

      console.log('View preferences saved:', response)

      return response.data
    } catch (err: any) {
      console.error('Failed to save folder preferences:', err)
      // Revert optimistic update
      if (viewPreferences.value.has(folderId)) {
        viewPreferences.value.delete(folderId)
      }
      throw err
    }
  }

  /**
   * Save manuscript view settings
   */
  async function saveManuscriptSettings(settings: Partial<ManuscriptViewSettings>) {
    if (!currentFolderId.value) return

    const existing = currentViewSettings.value as ManuscriptViewSettings || {}
    const updated = { ...existing, ...settings }

    await saveViewPreference(currentFolderId.value, {
      settings: {
        ...viewPreferences.value.get(currentFolderId.value)?.settings,
        manuscript: updated
      }
    })
  }

  /**
   * Save corkboard view settings
   */
  async function saveCorkboardSettings(settings: Partial<CorkboardViewSettings>) {
    if (!currentFolderId.value) return

    const existing = currentViewSettings.value as CorkboardViewSettings || {}
    const updated = { ...existing, ...settings }

    await saveViewPreference(currentFolderId.value, {
      settings: {
        ...viewPreferences.value.get(currentFolderId.value)?.settings,
        corkboard: updated
      }
    })
  }

  /**
   * Save outline view settings
   */
  async function saveOutlineSettings(settings: Partial<OutlineViewSettings>) {
    if (!currentFolderId.value) return

    const existing = currentViewSettings.value as OutlineViewSettings || {}
    const updated = { ...existing, ...settings }

    await saveViewPreference(currentFolderId.value, {
      settings: {
        ...viewPreferences.value.get(currentFolderId.value)?.settings,
        outline: updated
      }
    })
  }

  /**
   * Clear current folder and view
   */
  function clearFolder() {
    currentFolderId.value = null
    currentFolder.value = null
    folderItems.value = []
    error.value = null
  }

  /**
   * Update items after reordering (optimistic update)
   */
  function updateItemOrder(itemId: number, newOrder: number) {
    const item = folderItems.value.find(i => i.id === itemId)
    if (item) {
      item.item_order = newOrder

      // Re-sort items by order
      folderItems.value.sort((a, b) =>
        (a.item_order || 0) - (b.item_order || 0)
      )
    }
  }

  /**
   * Update items after bulk reordering
   */
  function updateBulkItemOrder(updates: Array<{ itemId: number; order: number }>) {
    updates.forEach(({ itemId, order }) => {
      const item = folderItems.value.find(i => i.id === itemId)
      if (item) {
        item.item_order = order
      }
    })

    // Re-sort items by order
    folderItems.value.sort((a, b) =>
      (a.item_order || 0) - (b.item_order || 0)
    )
  }

  /**
   * Reset store state
   */
  function $reset() {
    currentViewMode.value = 'corkboard'
    currentFolderId.value = null
    currentFolder.value = null
    folderItems.value = []
    viewPreferences.value.clear()
    isLoading.value = false
    error.value = null
  }

  /**
   * Toggle split view on/off
   */
  function toggleSplitView() {
    splitEnabled.value = !splitEnabled.value

    // Initialize split layout for current view if needed
    if (splitEnabled.value && !splitLayouts.value[currentViewMode.value]) {
      splitLayouts.value[currentViewMode.value] = createDefaultSplitLayout()
    }
  }

  /**
   * Create a default split layout
   */
  function createDefaultSplitLayout(): SplitNode {
    return {
      id: 'root',
      type: 'container',
      orientation: 'horizontal',
      size: 100,
      children: [
        {
          id: 'pane-1',
          type: 'pane',
          size: 50,
          paneId: 'pane-1'
        },
        {
          id: 'pane-2',
          type: 'pane',
          size: 50,
          paneId: 'pane-2'
        }
      ]
    }
  }

  /**
   * Get current split layout for the active view mode
   */
  const currentSplitLayout = computed(() => {
    return splitLayouts.value[currentViewMode.value] || null
  })

  /**
   * Update the split layout for current view mode
   */
  function updateSplitLayout(layout: SplitNode) {
    if (currentViewMode.value) {
      splitLayouts.value[currentViewMode.value] = layout
    }
  }

  return {
    // State
    currentViewMode,
    currentFolderId,
    currentFolder,
    folderItems,
    viewPreferences,
    isLoading,
    error,
    splitEnabled,
    splitLayouts,

    // Getters
    hasFolder,
    currentViewPreference,
    currentViewSettings,
    itemCount,
    currentSplitLayout,

    // Actions
    setViewMode,
    loadFolder,
    reloadFolder,
    loadFolderPreferences,
    toggleSplitView,
    updateSplitLayout,
    saveViewPreference,
    saveManuscriptSettings,
    saveCorkboardSettings,
    saveOutlineSettings,
    clearFolder,
    updateItemOrder,
    updateBulkItemOrder,
    $reset
  }
})
