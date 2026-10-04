import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { itemsApi, type Item, type ItemUpdatePayload, type ItemCreatePayload } from '@/api/items'
import { dataSync } from '@/services/dataSync'

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

export interface EditorState {
  manuscriptId: number | null
  currentItem: Item | null
  originalContent: string
  hasUnsavedChanges: boolean
  saveStatus: SaveStatus
  lastSaved: Date | null
  autoSaveEnabled: boolean
  error: string | null
}

export const useItemStore = defineStore('item', () => {
  // State
  const state = ref<EditorState>({
    manuscriptId: null,
    currentItem: null,
    originalContent: '',
    hasUnsavedChanges: false,
    saveStatus: 'idle',
    lastSaved: null,
    autoSaveEnabled: true,
    error: null
  })

  // === DATA SYNC EVENT LISTENERS ===
  // Listen for external updates (e.g., rename from tree or context menu)
  dataSync.on('item:updated', ({ itemId, changes }) => {
    // Only update if this is the currently loaded item
    if (state.value.currentItem?.id === itemId) {
      if (changes.title && changes.title !== state.value.currentItem.title) {
        state.value.currentItem.title = changes.title
        console.log(`[ItemStore] Updated title from external source: "${changes.title}"`)
      }
    }
  })

  // Listen for item deletion
  dataSync.on('item:deleted', ({ itemId }) => {
    if (state.value.currentItem?.id === itemId) {
      // Clear current item if it was deleted
      state.value.currentItem = null
      state.value.hasUnsavedChanges = false
      state.value.saveStatus = 'idle'
      console.log(`[ItemStore] Current item ${itemId} was deleted, clearing state`)
    }
  })

  // Computed
  const isLoading = computed(() => state.value.saveStatus === 'saving')
  const canSave = computed(() =>
    state.value.hasUnsavedChanges &&
    state.value.currentItem &&
    state.value.manuscriptId
  )

  // Debounced auto-save function
  let autoSaveTimeout: NodeJS.Timeout | null = null
  const debouncedAutoSave = itemsApi.createDebouncedUpdate(2000)

  // Actions
  const loadItem = async (manuscriptId: number, itemId: number) => {
    try {
      state.value.error = null
      state.value.saveStatus = 'saving' // Using 'saving' as loading indicator

      const item = await itemsApi.getItem(manuscriptId, itemId)

      state.value.manuscriptId = manuscriptId
      state.value.currentItem = item
      state.value.originalContent = item.content || ''
      state.value.hasUnsavedChanges = false
      state.value.saveStatus = 'idle'

      console.log('Item loaded successfully:', item.title)
    } catch (error) {
      console.error('Failed to load item:', error)
      state.value.error = error instanceof Error ? error.message : 'Failed to load item'
      state.value.saveStatus = 'error'
    }
  }

  const updateContent = (content: string) => {
    if (!state.value.currentItem) return

    const hasChanged = content !== state.value.originalContent
    state.value.hasUnsavedChanges = hasChanged

    // Update the current item's content
    state.value.currentItem.content = content

    // Trigger auto-save if enabled and content has changed
    if (state.value.autoSaveEnabled && hasChanged && state.value.manuscriptId) {
      triggerAutoSave({ content })
    }
  }

  const updateTitle = (title: string) => {
    if (!state.value.currentItem) return

    const hasChanged = title !== state.value.currentItem.title
    state.value.hasUnsavedChanges = hasChanged

    // Update the current item's title
    state.value.currentItem.title = title

    // Trigger auto-save if enabled and title has changed
    if (state.value.autoSaveEnabled && hasChanged && state.value.manuscriptId) {
      triggerAutoSave({ title })
    }
  }

  const triggerAutoSave = async (payload: ItemUpdatePayload) => {
    if (!state.value.currentItem || !state.value.manuscriptId) return

    try {
      state.value.saveStatus = 'saving'

      const updatedItem = await debouncedAutoSave(
        state.value.manuscriptId,
        state.value.currentItem.id,
        payload
      )

      state.value.currentItem = updatedItem
      state.value.originalContent = updatedItem.content || ''
      state.value.hasUnsavedChanges = false
      state.value.saveStatus = 'saved'
      state.value.lastSaved = new Date()
      state.value.error = null

      // Emit sync event so other stores can update
      dataSync.emit('item:updated', {
        manuscriptId: state.value.manuscriptId,
        itemId: updatedItem.id,
        changes: payload
      })

      // Clear saved status after 2 seconds
      setTimeout(() => {
        if (state.value.saveStatus === 'saved') {
          state.value.saveStatus = 'idle'
        }
      }, 2000)

      console.log('Auto-save successful')
    } catch (error) {
      console.error('Auto-save failed:', error)
      state.value.saveStatus = 'error'
      state.value.error = error instanceof Error ? error.message : 'Save failed'
    }
  }

  const saveManually = async () => {
    if (!canSave.value || !state.value.currentItem || !state.value.manuscriptId) return

    try {
      state.value.saveStatus = 'saving'

      const payload: ItemUpdatePayload = {
        title: state.value.currentItem.title,
        content: state.value.currentItem.content,
        content_format: state.value.currentItem.content_format
      }

      const updatedItem = await itemsApi.updateItem(
        state.value.manuscriptId,
        state.value.currentItem.id,
        payload
      )

      state.value.currentItem = updatedItem
      state.value.originalContent = updatedItem.content || ''
      state.value.hasUnsavedChanges = false
      state.value.saveStatus = 'saved'
      state.value.lastSaved = new Date()
      state.value.error = null

      // Emit sync event so other stores can update
      dataSync.emit('item:updated', {
        manuscriptId: state.value.manuscriptId,
        itemId: updatedItem.id,
        changes: payload
      })

      console.log('Manual save successful')
    } catch (error) {
      console.error('Manual save failed:', error)
      state.value.saveStatus = 'error'
      state.value.error = error instanceof Error ? error.message : 'Save failed'
    }
  }

  const toggleAutoSave = () => {
    state.value.autoSaveEnabled = !state.value.autoSaveEnabled
    console.log('Auto-save', state.value.autoSaveEnabled ? 'enabled' : 'disabled')
  }

  const clearError = () => {
    state.value.error = null
    if (state.value.saveStatus === 'error') {
      state.value.saveStatus = 'idle'
    }
  }

  const resetState = () => {
    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout)
      autoSaveTimeout = null
    }

    state.value.manuscriptId = null
    state.value.currentItem = null
    state.value.originalContent = ''
    state.value.hasUnsavedChanges = false
    state.value.saveStatus = 'idle'
    state.value.lastSaved = null
    state.value.error = null
  }

  const createItem = async (manuscriptId: number, payload: ItemCreatePayload): Promise<Item> => {
    try {
      state.value.error = null
      state.value.saveStatus = 'saving'

      const newItem = await itemsApi.createItem(manuscriptId, payload)

      console.log('Item created successfully:', newItem.title)
      state.value.saveStatus = 'saved'

      // Emit sync event so other stores can update
      dataSync.emit('item:created', {
        manuscriptId,
        item: {
          id: newItem.id,
          itemId: newItem.id,
          title: newItem.title,
          parentId: newItem.parent_id || null,
          order: newItem.item_order || 0,
          type: newItem.type
        }
      })

      // Clear saved status after 2 seconds
      setTimeout(() => {
        if (state.value.saveStatus === 'saved') {
          state.value.saveStatus = 'idle'
        }
      }, 2000)

      return newItem
    } catch (error) {
      console.error('Failed to create item:', error)
      state.value.error = error instanceof Error ? error.message : 'Failed to create item'
      state.value.saveStatus = 'error'
      throw error
    }
  }

  return {
    // State
    state: computed(() => state.value),

    // Computed
    isLoading,
    canSave,

    // Actions
    loadItem,
    createItem,
    updateContent,
    updateTitle,
    saveManually,
    toggleAutoSave,
    clearError,
    resetState
  }
})