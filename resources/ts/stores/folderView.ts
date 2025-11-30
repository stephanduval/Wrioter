import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { $api } from '@/utils/api'
import type { SplitNode } from '@/types/splitView'

export type ViewMode = 'manuscript' | 'corkboard' | 'outline' | 'mindmap' | 'item'

export interface ViewPreference {
  view_mode: ViewMode
  settings: {
    manuscript?: ManuscriptViewSettings
    corkboard?: CorkboardViewSettings
    outline?: OutlineViewSettings
    mindmap?: MindmapViewSettings
    item?: ItemViewSettings
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

export interface MindmapViewSettings {
  zoom: number
  pan: { x: number, y: number }
  show_grid: boolean
  layout_algorithm: 'hierarchical' | 'force' | 'circular'
}

export interface ItemViewSettings {
  font_size: 'small' | 'medium' | 'large'
  show_synopsis: boolean
  auto_save: boolean
  show_word_count: boolean
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
  // Scrivening-specific fields
  source_folder_id?: number
  source_folder_title?: string
  original_order?: number
  scrivening_order?: number
}

export interface FolderData {
  id: number
  title: string
  type: 'folder'
  parent_id?: number
  manuscript_id?: number
}

export interface ScriveningSelection {
  type: 'folder' | 'item'
  id: number
}

export interface ScriveningMetadata {
  total_items: number
  total_words: number
  sources: Array<{
    id: number
    title: string
    item_count: number
  }>
}

export interface ScriveningSeparator {
  afterItemId: number
  sourceFolder: string
  type: 'dashed' | 'header' | 'dot'
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

  // View lock state
  const isViewLocked = ref(false)

  // Load lock state from localStorage on init
  const savedLockState = localStorage.getItem('folderView:isViewLocked')
  if (savedLockState !== null) {
    isViewLocked.value = savedLockState === 'true'
  }

  // Scrivening state
  const scriveningMode = ref(false)
  const scriveningSelections = ref<ScriveningSelection[]>([])
  const scriveningItems = ref<FolderItem[]>([])
  const scriveningMetadata = ref<ScriveningMetadata | null>(null)
  const scriveningSeparators = ref<Map<number, ScriveningSeparator>>(new Map())

  // Convert Map to Array for component consumption (components expect arrays, not Maps)
  const scriveningSeparatorsArray = computed(() => {
    return Array.from(scriveningSeparators.value.values())
  })

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

  // Scrivening getters
  const displayItems = computed(() => {
    return scriveningMode.value ? scriveningItems.value : folderItems.value
  })

  const scriveningItemCount = computed(() => scriveningItems.value.length)

  const displayItemCount = computed(() => displayItems.value.length)

  // Actions

  /**
   * Set the current view mode and optionally load a folder
   */
  async function setViewMode(mode: ViewMode, folderId?: number) {
    // Check if view is locked
    if (isViewLocked.value && mode !== currentViewMode.value) {
      console.log('View switching blocked - view is locked')
      return false
    }

    currentViewMode.value = mode

    if (folderId !== undefined) {
      await loadFolder(folderId, mode)
    }

    // Save preference if folder is loaded
    // Don't save preferences for ephemeral views like 'item' and 'mindmap' which are context-specific
    if (currentFolderId.value && !['item', 'mindmap'].includes(mode)) {
      await saveViewPreference(currentFolderId.value, { view_mode: mode })
    }

    return true
  }

  /**
   * Toggle view lock state
   */
  function toggleViewLock() {
    isViewLocked.value = !isViewLocked.value
    // Persist to localStorage
    localStorage.setItem('folderView:isViewLocked', String(isViewLocked.value))
    console.log(`View lock ${isViewLocked.value ? 'enabled' : 'disabled'}`)
    return isViewLocked.value
  }

  /**
   * Set view lock state explicitly
   */
  function setViewLock(locked: boolean) {
    isViewLocked.value = locked
    // Persist to localStorage
    localStorage.setItem('folderView:isViewLocked', String(locked))
    console.log(`View lock set to ${locked}`)
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

  /**
   * Enable scrivening mode with multiple selections
   */
  async function enableScrivening(selections: ScriveningSelection[]) {
    try {
      if (!selections || selections.length === 0) {
        throw new Error('No selections provided')
      }

      isLoading.value = true
      error.value = null

      console.log('Enabling scrivening mode with selections:', selections)

      // Call scrivening API
      const response = await $api('/folders/scrivening/contents', {
        method: 'POST',
        body: {
          selections,
          view_mode: currentViewMode.value
        }
      })

      console.log('Scrivening response:', response)

      // Update state
      scriveningMode.value = true
      scriveningSelections.value = selections
      scriveningItems.value = response.items || []
      scriveningMetadata.value = response.metadata || null

      // Build separators map
      buildSeparators(response.items || [])

      console.log(`Scrivening enabled with ${scriveningItems.value.length} items`)
    } catch (err: any) {
      console.error('Failed to enable scrivening:', err)
      error.value = err.message || 'Failed to load scrivening contents'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Disable scrivening mode and return to normal folder view
   */
  function disableScrivening() {
    scriveningMode.value = false
    scriveningSelections.value = []
    scriveningItems.value = []
    scriveningMetadata.value = null
    scriveningSeparators.value.clear()

    console.log('Scrivening mode disabled')

    // Reload current folder if one is loaded
    if (currentFolderId.value) {
      loadFolder(currentFolderId.value, currentViewMode.value)
    }
  }

  /**
   * Toggle scrivening mode on/off
   */
  function toggleScrivening(selections?: ScriveningSelection[]) {
    if (scriveningMode.value) {
      disableScrivening()
    } else if (selections && selections.length > 0) {
      enableScrivening(selections)
    }
  }

  /**
   * Build separators map from items array
   */
  function buildSeparators(items: FolderItem[]) {
    scriveningSeparators.value.clear()

    if (items.length === 0) return

    let lastFolderId: number | undefined = undefined

    items.forEach((item, index) => {
      if (
        item.source_folder_id !== undefined &&
        item.source_folder_id !== lastFolderId &&
        index > 0
      ) {
        // Add separator after previous item
        const prevItem = items[index - 1]
        scriveningSeparators.value.set(prevItem.id, {
          afterItemId: prevItem.id,
          sourceFolder: item.source_folder_title || 'Unknown',
          type: 'dashed' // Default separator type
        })
      }
      lastFolderId = item.source_folder_id
    })

    console.log(`Built ${scriveningSeparators.value.size} separators`)
  }

  /**
   * Reload scrivening contents with current view mode
   */
  async function reloadScrivening() {
    if (!scriveningMode.value || scriveningSelections.value.length === 0) {
      return
    }

    await enableScrivening(scriveningSelections.value)
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
    isViewLocked,

    // Scrivening state
    scriveningMode,
    scriveningSelections,
    scriveningItems,
    scriveningMetadata,
    scriveningSeparators,
    scriveningSeparatorsArray,  // Array version for components

    // Getters
    hasFolder,
    currentViewPreference,
    currentViewSettings,
    itemCount,
    currentSplitLayout,
    displayItems,
    displayItemCount,
    scriveningItemCount,

    // Actions
    setViewMode,
    toggleViewLock,
    setViewLock,
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

    // Scrivening actions
    enableScrivening,
    disableScrivening,
    toggleScrivening,
    reloadScrivening,

    $reset
  }
})
