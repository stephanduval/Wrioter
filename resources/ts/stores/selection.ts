import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import type { SelectionBox, SelectionContext, Point } from '@/composables/useSelection'

// Selection history for undo/redo
interface SelectionSnapshot {
  selectedIds: Set<string>
  lastSelectedId: string | null
  anchorId: string | null
  timestamp: number
}

// Selection change event
interface SelectionChangeEvent {
  type: 'add' | 'remove' | 'clear' | 'replace'
  itemIds: string[]
  previousSelection: Set<string>
  newSelection: Set<string>
}

export const useSelectionStore = defineStore('selection', () => {
  // Core selection state
  const selectedIds = ref<Set<string>>(new Set())
  const lastSelectedId = ref<string | null>(null)
  const anchorId = ref<string | null>(null) // For range selection

  // Selection mode state
  const isSelectionMode = ref(false)
  const multiSelectEnabled = ref(true)

  // Box selection state
  const selectionBox = ref<SelectionBox | null>(null)
  const isBoxSelecting = ref(false)

  // Context and focus state
  const hoveredId = ref<string | null>(null)
  const focusedId = ref<string | null>(null)
  const context = ref<SelectionContext>({
    containerId: '',
    itemType: '',
    selectableSelector: '[data-item-id]'
  })

  // History for undo/redo
  const selectionHistory = ref<SelectionSnapshot[]>([])
  const historyIndex = ref(-1)
  const maxHistorySize = 50

  // Computed properties
  const selectedCount = computed(() => selectedIds.value.size)

  const hasSelection = computed(() => selectedIds.value.size > 0)

  const isMultiSelection = computed(() => selectedIds.value.size > 1)

  const selectedArray = computed(() => Array.from(selectedIds.value))

  const canUndo = computed(() => historyIndex.value > 0)

  const canRedo = computed(() => historyIndex.value < selectionHistory.value.length - 1)

  // Selection state helpers
  const isSelected = (itemId: string): boolean => {
    return selectedIds.value.has(itemId)
  }

  const isLastSelected = (itemId: string): boolean => {
    return lastSelectedId.value === itemId
  }

  const isAnchor = (itemId: string): boolean => {
    return anchorId.value === itemId
  }

  // History management
  const saveToHistory = () => {
    const snapshot: SelectionSnapshot = {
      selectedIds: new Set(selectedIds.value),
      lastSelectedId: lastSelectedId.value,
      anchorId: anchorId.value,
      timestamp: Date.now()
    }

    // Remove any history items after current index
    selectionHistory.value = selectionHistory.value.slice(0, historyIndex.value + 1)

    // Add new snapshot
    selectionHistory.value.push(snapshot)
    historyIndex.value = selectionHistory.value.length - 1

    // Limit history size
    if (selectionHistory.value.length > maxHistorySize) {
      selectionHistory.value.shift()
      historyIndex.value--
    }
  }

  const restoreFromHistory = (snapshot: SelectionSnapshot) => {
    selectedIds.value = new Set(snapshot.selectedIds)
    lastSelectedId.value = snapshot.lastSelectedId
    anchorId.value = snapshot.anchorId
  }

  // Basic selection actions
  const selectItem = (itemId: string) => {
    const previousSelection = new Set(selectedIds.value)

    saveToHistory()

    selectedIds.value.clear()
    selectedIds.value.add(itemId)
    lastSelectedId.value = itemId
    anchorId.value = itemId

    emitSelectionChange({
      type: 'replace',
      itemIds: [itemId],
      previousSelection,
      newSelection: new Set(selectedIds.value)
    })

    console.log('Selected item:', itemId)
  }

  const addToSelection = (itemId: string) => {
    if (selectedIds.value.has(itemId)) return

    const previousSelection = new Set(selectedIds.value)

    saveToHistory()

    selectedIds.value.add(itemId)
    lastSelectedId.value = itemId

    // Set anchor if this is the first selection
    if (selectedIds.value.size === 1) {
      anchorId.value = itemId
    }

    emitSelectionChange({
      type: 'add',
      itemIds: [itemId],
      previousSelection,
      newSelection: new Set(selectedIds.value)
    })

    console.log('Added to selection:', itemId)
  }

  const removeFromSelection = (itemId: string) => {
    if (!selectedIds.value.has(itemId)) return

    const previousSelection = new Set(selectedIds.value)

    saveToHistory()

    selectedIds.value.delete(itemId)

    // Update last selected if it was removed
    if (lastSelectedId.value === itemId) {
      lastSelectedId.value = selectedIds.value.size > 0
        ? Array.from(selectedIds.value)[selectedIds.value.size - 1]
        : null
    }

    // Update anchor if it was removed
    if (anchorId.value === itemId) {
      anchorId.value = lastSelectedId.value
    }

    emitSelectionChange({
      type: 'remove',
      itemIds: [itemId],
      previousSelection,
      newSelection: new Set(selectedIds.value)
    })

    console.log('Removed from selection:', itemId)
  }

  const toggleItem = (itemId: string) => {
    if (selectedIds.value.has(itemId)) {
      removeFromSelection(itemId)
    } else {
      if (multiSelectEnabled.value) {
        addToSelection(itemId)
      } else {
        selectItem(itemId)
      }
    }
  }

  const clearSelection = () => {
    if (selectedIds.value.size === 0) return

    const previousSelection = new Set(selectedIds.value)

    saveToHistory()

    selectedIds.value.clear()
    lastSelectedId.value = null
    anchorId.value = null

    emitSelectionChange({
      type: 'clear',
      itemIds: [],
      previousSelection,
      newSelection: new Set()
    })

    console.log('Selection cleared')
  }

  const selectAll = (itemIds?: string[]) => {
    // If no item IDs provided, we need to get them from the context
    if (!itemIds) {
      const container = document.getElementById(context.value.containerId)
      if (!container) return

      const elements = container.querySelectorAll(context.value.selectableSelector)
      itemIds = Array.from(elements)
        .map(el => el.getAttribute('data-item-id'))
        .filter((id): id is string => id !== null)
    }

    if (itemIds.length === 0) return

    const previousSelection = new Set(selectedIds.value)

    saveToHistory()

    selectedIds.value = new Set(itemIds)
    lastSelectedId.value = itemIds[itemIds.length - 1]
    anchorId.value = itemIds[0]

    emitSelectionChange({
      type: 'replace',
      itemIds,
      previousSelection,
      newSelection: new Set(selectedIds.value)
    })

    console.log('Selected all items:', itemIds.length)
  }

  const replaceSelection = (itemIds: string[]) => {
    const previousSelection = new Set(selectedIds.value)

    saveToHistory()

    selectedIds.value = new Set(itemIds)
    lastSelectedId.value = itemIds.length > 0 ? itemIds[itemIds.length - 1] : null
    anchorId.value = itemIds.length > 0 ? itemIds[0] : null

    emitSelectionChange({
      type: 'replace',
      itemIds,
      previousSelection,
      newSelection: new Set(selectedIds.value)
    })

    console.log('Replaced selection with:', itemIds.length, 'items')
  }

  // Range selection
  const extendSelection = (toItemId: string) => {
    if (!anchorId.value) {
      selectItem(toItemId)
      return
    }

    const container = document.getElementById(context.value.containerId)
    if (!container) return

    const elements = Array.from(container.querySelectorAll(context.value.selectableSelector))
    const itemIds = elements
      .map(el => el.getAttribute('data-item-id'))
      .filter((id): id is string => id !== null)

    const anchorIndex = itemIds.indexOf(anchorId.value)
    const toIndex = itemIds.indexOf(toItemId)

    if (anchorIndex === -1 || toIndex === -1) return

    const start = Math.min(anchorIndex, toIndex)
    const end = Math.max(anchorIndex, toIndex)
    const rangeIds = itemIds.slice(start, end + 1)

    const previousSelection = new Set(selectedIds.value)

    saveToHistory()

    selectedIds.value = new Set(rangeIds)
    lastSelectedId.value = toItemId

    emitSelectionChange({
      type: 'replace',
      itemIds: rangeIds,
      previousSelection,
      newSelection: new Set(selectedIds.value)
    })

    console.log('Extended selection from', anchorId.value, 'to', toItemId)
  }

  // Selection mode management
  const enterSelectionMode = () => {
    isSelectionMode.value = true
    console.log('Entered selection mode')
  }

  const exitSelectionMode = () => {
    isSelectionMode.value = false
    clearSelection()
    console.log('Exited selection mode')
  }

  // Box selection
  const startBoxSelection = (startPoint: Point) => {
    selectionBox.value = {
      startX: startPoint.x,
      startY: startPoint.y,
      endX: startPoint.x,
      endY: startPoint.y
    }
    isBoxSelecting.value = true
    console.log('Started box selection')
  }

  const updateBoxSelection = (endPoint: Point) => {
    if (!selectionBox.value) return

    selectionBox.value.endX = endPoint.x
    selectionBox.value.endY = endPoint.y
  }

  const endBoxSelection = () => {
    selectionBox.value = null
    isBoxSelecting.value = false
    console.log('Ended box selection')
  }

  // History actions
  const undo = () => {
    if (!canUndo.value) return

    historyIndex.value--
    const snapshot = selectionHistory.value[historyIndex.value]
    restoreFromHistory(snapshot)

    console.log('Undid selection change')
  }

  const redo = () => {
    if (!canRedo.value) return

    historyIndex.value++
    const snapshot = selectionHistory.value[historyIndex.value]
    restoreFromHistory(snapshot)

    console.log('Redid selection change')
  }

  // Context management
  const setContext = (newContext: Partial<SelectionContext>) => {
    context.value = { ...context.value, ...newContext }
  }

  // Focus management
  const setFocused = (itemId: string | null) => {
    focusedId.value = itemId
  }

  const setHovered = (itemId: string | null) => {
    hoveredId.value = itemId
  }

  // Bulk operations
  const selectMultiple = (itemIds: string[]) => {
    const previousSelection = new Set(selectedIds.value)

    saveToHistory()

    itemIds.forEach(id => selectedIds.value.add(id))
    lastSelectedId.value = itemIds[itemIds.length - 1] || lastSelectedId.value

    emitSelectionChange({
      type: 'add',
      itemIds,
      previousSelection,
      newSelection: new Set(selectedIds.value)
    })

    console.log('Selected multiple items:', itemIds.length)
  }

  const deselectMultiple = (itemIds: string[]) => {
    const previousSelection = new Set(selectedIds.value)

    saveToHistory()

    itemIds.forEach(id => selectedIds.value.delete(id))

    // Update last selected if it was removed
    if (lastSelectedId.value && itemIds.includes(lastSelectedId.value)) {
      lastSelectedId.value = selectedIds.value.size > 0
        ? Array.from(selectedIds.value)[selectedIds.value.size - 1]
        : null
    }

    emitSelectionChange({
      type: 'remove',
      itemIds,
      previousSelection,
      newSelection: new Set(selectedIds.value)
    })

    console.log('Deselected multiple items:', itemIds.length)
  }

  // Event emission
  const selectionChangeCallbacks = ref<((event: SelectionChangeEvent) => void)[]>([])

  const onSelectionChange = (callback: (event: SelectionChangeEvent) => void) => {
    selectionChangeCallbacks.value.push(callback)

    // Return unsubscribe function
    return () => {
      const index = selectionChangeCallbacks.value.indexOf(callback)
      if (index > -1) {
        selectionChangeCallbacks.value.splice(index, 1)
      }
    }
  }

  const emitSelectionChange = (event: SelectionChangeEvent) => {
    selectionChangeCallbacks.value.forEach(callback => {
      try {
        callback(event)
      } catch (error) {
        console.error('Error in selection change callback:', error)
      }
    })
  }

  // Scrivening support - cross-folder selection tracking
  const scriveningFolderMap = ref<Map<number, Set<number>>>(new Map()) // folderId -> Set of itemIds

  const addToScriveningSelection = (folderId: number, itemId: number) => {
    if (!scriveningFolderMap.value.has(folderId)) {
      scriveningFolderMap.value.set(folderId, new Set())
    }
    scriveningFolderMap.value.get(folderId)!.add(itemId)
    console.log(`Added item ${itemId} from folder ${folderId} to scrivening selection`)
  }

  const removeFromScriveningSelection = (folderId: number, itemId: number) => {
    const folderItems = scriveningFolderMap.value.get(folderId)
    if (folderItems) {
      folderItems.delete(itemId)
      if (folderItems.size === 0) {
        scriveningFolderMap.value.delete(folderId)
      }
      console.log(`Removed item ${itemId} from folder ${folderId} from scrivening selection`)
    }
  }

  const clearScriveningSelection = () => {
    scriveningFolderMap.value.clear()
    console.log('Cleared scrivening selection')
  }

  const buildScriveningSelections = (): Array<{ type: 'folder' | 'item'; id: number }> => {
    const selections: Array<{ type: 'folder' | 'item'; id: number }> = []

    scriveningFolderMap.value.forEach((itemIds, folderId) => {
      // If entire folder is selected (would need folder item count to determine)
      // For now, add individual items
      itemIds.forEach(itemId => {
        selections.push({ type: 'item', id: itemId })
      })
    })

    console.log('Built scrivening selections:', selections.length)
    return selections
  }

  const getScriveningSelectionCount = (): number => {
    let count = 0
    scriveningFolderMap.value.forEach(itemIds => {
      count += itemIds.size
    })
    return count
  }

  const hasScriveningSelection = computed(() => scriveningFolderMap.value.size > 0)

  // Utilities
  const getSelectionSummary = () => {
    return {
      count: selectedIds.value.size,
      items: Array.from(selectedIds.value),
      lastSelected: lastSelectedId.value,
      anchor: anchorId.value,
      isMulti: isMultiSelection.value,
      mode: isSelectionMode.value ? 'selection' : 'normal',
      scriveningCount: getScriveningSelectionCount()
    }
  }

  const reset = () => {
    clearSelection()
    clearScriveningSelection()
    exitSelectionMode()
    endBoxSelection()
    setFocused(null)
    setHovered(null)
    selectionHistory.value = []
    historyIndex.value = -1
    selectionChangeCallbacks.value = []
    console.log('Selection store reset')
  }

  // Initialize with empty history
  saveToHistory()

  return {
    // State
    selectedIds: readonly(selectedIds),
    lastSelectedId: readonly(lastSelectedId),
    anchorId: readonly(anchorId),
    isSelectionMode: readonly(isSelectionMode),
    multiSelectEnabled,
    selectionBox: readonly(selectionBox),
    isBoxSelecting: readonly(isBoxSelecting),
    hoveredId: readonly(hoveredId),
    focusedId: readonly(focusedId),
    context: readonly(context),

    // Computed
    selectedCount,
    hasSelection,
    isMultiSelection,
    selectedArray,
    canUndo,
    canRedo,

    // Checkers
    isSelected,
    isLastSelected,
    isAnchor,

    // Basic actions
    selectItem,
    addToSelection,
    removeFromSelection,
    toggleItem,
    clearSelection,
    selectAll,
    replaceSelection,

    // Range selection
    extendSelection,

    // Selection mode
    enterSelectionMode,
    exitSelectionMode,

    // Box selection
    startBoxSelection,
    updateBoxSelection,
    endBoxSelection,

    // History
    undo,
    redo,

    // Context and focus
    setContext,
    setFocused,
    setHovered,

    // Bulk operations
    selectMultiple,
    deselectMultiple,

    // Events
    onSelectionChange,

    // Scrivening support
    scriveningFolderMap: readonly(scriveningFolderMap),
    addToScriveningSelection,
    removeFromScriveningSelection,
    clearScriveningSelection,
    buildScriveningSelections,
    getScriveningSelectionCount,
    hasScriveningSelection,

    // Utilities
    getSelectionSummary,
    reset
  }
})

// Export types
export type { SelectionChangeEvent, SelectionSnapshot }