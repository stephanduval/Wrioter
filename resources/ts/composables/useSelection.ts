import { ref, computed, watch, onMounted, onUnmounted, type Ref } from 'vue'
import { useSelectionStore } from '@/stores/selection'

// Types
export interface Point {
  x: number
  y: number
}

export interface SelectionContext {
  containerId: string
  itemType: string
  selectableSelector: string
}

export interface SelectionBox {
  startX: number
  startY: number
  endX: number
  endY: number
  element?: HTMLElement
}

export interface UseSelectionOptions {
  itemId: string
  itemData?: any
  multiple?: boolean
  disabled?: Ref<boolean>
  context?: Partial<SelectionContext>
}

// Main selection composable
export function useSelection(options: UseSelectionOptions) {
  const store = useSelectionStore()

  const isSelected = computed(() =>
    store.selectedIds.has(options.itemId)
  )

  const isLastSelected = computed(() =>
    store.lastSelectedId === options.itemId
  )

  const isAnchor = computed(() =>
    store.anchorId === options.itemId
  )

  // Handle click events
  const handleClick = (event: MouseEvent) => {
    if (options.disabled?.value) return

    if (event.shiftKey && options.multiple) {
      // Range selection
      store.extendSelection(options.itemId)
    } else if (event.ctrlKey || event.metaKey) {
      // Additive selection
      store.toggleItem(options.itemId)
    } else {
      // Single selection
      store.selectItem(options.itemId)
    }
  }

  // Handle touch events (mobile)
  let longPressTimer: number | null = null

  const handleTouchStart = (event: TouchEvent) => {
    if (options.disabled?.value) return

    longPressTimer = window.setTimeout(() => {
      if (!store.isSelectionMode) {
        store.enterSelectionMode()
        store.selectItem(options.itemId)

        // Haptic feedback
        if ('vibrate' in navigator) {
          navigator.vibrate(50)
        }
      }
    }, 500)
  }

  const handleTouchEnd = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer)
      longPressTimer = null
    }
  }

  const handleTouchMove = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer)
      longPressTimer = null
    }
  }

  // Handle tap in selection mode
  const handleSelectionTap = () => {
    if (store.isSelectionMode) {
      store.toggleItem(options.itemId)
    }
  }

  return {
    isSelected,
    isLastSelected,
    isAnchor,
    handleClick,
    handleTouchStart,
    handleTouchEnd,
    handleTouchMove,
    handleSelectionTap
  }
}

// Box selection composable
export interface UseBoxSelectionOptions {
  container: Ref<HTMLElement | undefined>
  itemSelector: string
  onSelect?: (items: HTMLElement[]) => void
  disabled?: Ref<boolean>
  modifierKey?: 'ctrl' | 'shift' | 'none'
}

export function useBoxSelection(options: UseBoxSelectionOptions) {
  const store = useSelectionStore()
  const isDrawing = ref(false)
  const startPoint = ref<Point | null>(null)
  const boxElement = ref<HTMLElement | null>(null)

  const handleMouseDown = (event: MouseEvent) => {
    if (options.disabled?.value) return
    if (event.button !== 0) return // Only left click
    if (!options.container.value) return

    // Don't start box selection if clicking on an item
    const target = event.target as HTMLElement
    if (target.closest(options.itemSelector)) return

    // Check modifier keys if specified
    if (options.modifierKey === 'ctrl' && !event.ctrlKey) return
    if (options.modifierKey === 'shift' && !event.shiftKey) return

    event.preventDefault()

    isDrawing.value = true
    startPoint.value = {
      x: event.clientX,
      y: event.clientY
    }

    store.startBoxSelection(startPoint.value)
    createSelectionBox(startPoint.value)

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    // Prevent text selection
    document.body.style.userSelect = 'none'
  }

  const handleMouseMove = (event: MouseEvent) => {
    if (!isDrawing.value || !startPoint.value) return

    const endPoint = {
      x: event.clientX,
      y: event.clientY
    }

    store.updateBoxSelection(endPoint)
    updateSelectionBox(startPoint.value, endPoint)
    updateSelection(startPoint.value, endPoint)
  }

  const handleMouseUp = () => {
    if (!isDrawing.value) return

    isDrawing.value = false
    startPoint.value = null

    store.endBoxSelection()
    removeSelectionBox()

    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)

    // Restore text selection
    document.body.style.userSelect = ''
  }

  const createSelectionBox = (start: Point) => {
    boxElement.value = document.createElement('div')
    boxElement.value.className = 'selection-box'
    boxElement.value.style.cssText = `
      position: fixed;
      border: 2px dashed var(--primary-color, #1976d2);
      background: rgba(25, 118, 210, 0.1);
      pointer-events: none;
      z-index: 10000;
      border-radius: 4px;
    `

    document.body.appendChild(boxElement.value)
    updateSelectionBox(start, start)
  }

  const updateSelectionBox = (start: Point, end: Point) => {
    if (!boxElement.value) return

    const left = Math.min(start.x, end.x)
    const top = Math.min(start.y, end.y)
    const width = Math.abs(end.x - start.x)
    const height = Math.abs(end.y - start.y)

    boxElement.value.style.left = `${left}px`
    boxElement.value.style.top = `${top}px`
    boxElement.value.style.width = `${width}px`
    boxElement.value.style.height = `${height}px`
  }

  const removeSelectionBox = () => {
    if (boxElement.value) {
      document.body.removeChild(boxElement.value)
      boxElement.value = null
    }
  }

  const updateSelection = (start: Point, end: Point) => {
    if (!options.container.value) return

    const selectionRect = {
      left: Math.min(start.x, end.x),
      top: Math.min(start.y, end.y),
      right: Math.max(start.x, end.x),
      bottom: Math.max(start.y, end.y)
    }

    const items = options.container.value.querySelectorAll(options.itemSelector) as NodeListOf<HTMLElement>
    const selectedItems: HTMLElement[] = []

    items.forEach((item: HTMLElement) => {
      const rect = item.getBoundingClientRect()

      if (isRectangleIntersecting(rect, selectionRect)) {
        selectedItems.push(item)

        // Add to selection if item has data-item-id
        const itemId = item.getAttribute('data-item-id')
        if (itemId) {
          store.addToSelection(itemId)
        }
      }
    })

    options.onSelect?.(selectedItems)
  }

  const isRectangleIntersecting = (rect: DOMRect, selection: any) => {
    return !(
      rect.right < selection.left ||
      rect.left > selection.right ||
      rect.bottom < selection.top ||
      rect.top > selection.bottom
    )
  }

  onMounted(() => {
    if (options.container.value) {
      options.container.value.addEventListener('mousedown', handleMouseDown)
    }
  })

  onUnmounted(() => {
    if (options.container.value) {
      options.container.value.removeEventListener('mousedown', handleMouseDown)
    }

    // Clean up event listeners
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)

    // Remove selection box if it exists
    removeSelectionBox()

    // Restore text selection
    document.body.style.userSelect = ''
  })

  return {
    isDrawing: readonly(isDrawing)
  }
}

// Keyboard selection composable
export interface UseKeyboardSelectionOptions {
  container: Ref<HTMLElement | undefined>
  itemSelector: string
  focusedItemId: Ref<string | null>
  getItemsInOrder: () => string[]
  onFocusChange?: (itemId: string) => void
  disabled?: Ref<boolean>
}

export function useKeyboardSelection(options: UseKeyboardSelectionOptions) {
  const store = useSelectionStore()

  const getNextItemId = (currentId: string, direction: 'up' | 'down' | 'left' | 'right'): string | null => {
    const items = options.getItemsInOrder()
    const currentIndex = items.indexOf(currentId)

    if (currentIndex === -1) return null

    let nextIndex: number

    switch (direction) {
      case 'up':
      case 'left':
        nextIndex = currentIndex - 1
        break
      case 'down':
      case 'right':
        nextIndex = currentIndex + 1
        break
      default:
        return null
    }

    if (nextIndex < 0 || nextIndex >= items.length) return null

    return items[nextIndex]
  }

  const focusItem = (itemId: string) => {
    options.focusedItemId.value = itemId
    options.onFocusChange?.(itemId)

    // Focus the actual DOM element
    const element = options.container.value?.querySelector(`[data-item-id="${itemId}"]`) as HTMLElement
    element?.focus()
  }

  const handleKeyDown = (event: KeyboardEvent) => {
    if (options.disabled?.value) return
    if (!options.focusedItemId.value) return

    switch (event.key) {
      case 'ArrowUp':
      case 'ArrowDown':
      case 'ArrowLeft':
      case 'ArrowRight':
        handleArrowKey(event)
        break

      case ' ':
        // Toggle selection
        event.preventDefault()
        store.toggleItem(options.focusedItemId.value)
        break

      case 'a':
        if (event.ctrlKey || event.metaKey) {
          // Select all
          event.preventDefault()
          store.selectAll()
        }
        break

      case 'Escape':
        // Clear selection or exit selection mode
        if (store.isSelectionMode) {
          store.exitSelectionMode()
        } else {
          store.clearSelection()
        }
        break

      case 'Enter':
        // Activate focused item (can be customized)
        if (options.focusedItemId.value) {
          store.selectItem(options.focusedItemId.value)
        }
        break
    }
  }

  const handleArrowKey = (event: KeyboardEvent) => {
    event.preventDefault()

    const direction = event.key.replace('Arrow', '').toLowerCase() as 'up' | 'down' | 'left' | 'right'
    const nextId = getNextItemId(options.focusedItemId.value!, direction)

    if (!nextId) return

    if (event.shiftKey) {
      // Extend selection
      store.extendSelection(nextId)
      focusItem(nextId)
    } else {
      // Move focus
      focusItem(nextId)

      if (!event.ctrlKey && !event.metaKey) {
        // Select the focused item if not holding ctrl/cmd
        store.selectItem(nextId)
      }
    }
  }

  onMounted(() => {
    if (options.container.value) {
      options.container.value.addEventListener('keydown', handleKeyDown)
    }
  })

  onUnmounted(() => {
    if (options.container.value) {
      options.container.value.removeEventListener('keydown', handleKeyDown)
    }
  })

  return {
    handleKeyDown,
    focusItem
  }
}

// Context menu integration
export interface UseContextSelectionOptions {
  itemId: string
  onContextMenu?: (itemIds: string[], event: MouseEvent) => void
  disabled?: Ref<boolean>
}

export function useContextSelection(options: UseContextSelectionOptions) {
  const store = useSelectionStore()

  const handleContextMenu = (event: MouseEvent) => {
    if (options.disabled?.value) return

    event.preventDefault()

    // If the item isn't selected, select it first
    if (!store.selectedIds.has(options.itemId)) {
      store.selectItem(options.itemId)
    }

    // Get all selected items
    const selectedIds = Array.from(store.selectedIds)

    options.onContextMenu?.(selectedIds, event)
  }

  return {
    handleContextMenu
  }
}

// Bulk operations helper
export function useSelectionOperations() {
  const store = useSelectionStore()

  const performBulkOperation = async <T>(
    operation: (itemId: string) => Promise<T>,
    onProgress?: (completed: number, total: number) => void
  ): Promise<T[]> => {
    const selectedIds = Array.from(store.selectedIds)
    const results: T[] = []

    for (let i = 0; i < selectedIds.length; i++) {
      const itemId = selectedIds[i]
      try {
        const result = await operation(itemId)
        results.push(result)
      } catch (error) {
        console.error(`Operation failed for item ${itemId}:`, error)
        // Continue with other items
      }

      onProgress?.(i + 1, selectedIds.length)
    }

    return results
  }

  const getSelectedData = <T>(getData: (itemId: string) => T | undefined): T[] => {
    return Array.from(store.selectedIds)
      .map(getData)
      .filter((data): data is T => data !== undefined)
  }

  return {
    performBulkOperation,
    getSelectedData,
    selectedCount: computed(() => store.selectedIds.size),
    hasSelection: computed(() => store.selectedIds.size > 0),
    isMultiSelection: computed(() => store.selectedIds.size > 1)
  }
}