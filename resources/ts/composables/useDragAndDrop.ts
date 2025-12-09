import { ref, Ref } from 'vue'

export type DropPosition = 'above' | 'below' | 'inside' | null

// Single item drag data (backward compatible)
export interface DragData {
  id: string | number
  itemId: number
  type?: string
  title?: string
}

// Multi-item drag data
export interface DragDataMulti {
  items: DragData[]
  primaryId: string | number  // The item user clicked to start drag
  isMulti: true  // Flag to identify multi-drag
}

// Single item drop result (backward compatible)
export interface DropResult {
  sourceId: string | number
  sourceItemId: number
  targetId: string | number
  targetItemId: number
  position: 'above' | 'below' | 'inside'
}

// Multi-item drop result
export interface DropResultMulti {
  sourceItems: Array<{ id: string | number; itemId: number }>
  targetId: string | number
  targetItemId: number
  position: 'above' | 'below' | 'inside'
  isMulti: true
}

// Type guard for multi-drag data
export function isDragDataMulti(data: DragData | DragDataMulti): data is DragDataMulti {
  return 'isMulti' in data && data.isMulti === true
}

// Type guard for multi-drop result
export function isDropResultMulti(result: DropResult | DropResultMulti): result is DropResultMulti {
  return 'isMulti' in result && result.isMulti === true
}

/**
 * Shared drag-and-drop composable
 * Used by both TreeNode (vertical nav) and Corkboard components
 * Supports both single-item and multi-item drag operations
 */
export function useDragAndDrop() {
  const isDragging = ref(false)
  const draggingId = ref<string | number | null>(null)
  const draggingIds = ref<Set<string | number>>(new Set())  // For multi-drag
  const dropPosition = ref<DropPosition>(null)

  /**
   * Start dragging a single item
   */
  const handleDragStart = (
    event: DragEvent,
    data: DragData
  ) => {
    isDragging.value = true
    draggingId.value = data.id
    draggingIds.value = new Set([data.id])

    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move'
      event.dataTransfer.setData('application/json', JSON.stringify(data))
    }
  }

  /**
   * Start dragging multiple items
   */
  const handleDragStartMulti = (
    event: DragEvent,
    items: DragData[],
    primaryId: string | number
  ) => {
    isDragging.value = true
    draggingId.value = primaryId
    draggingIds.value = new Set(items.map(item => item.id))

    const multiData: DragDataMulti = {
      items,
      primaryId,
      isMulti: true
    }

    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move'
      event.dataTransfer.setData('application/json', JSON.stringify(multiData))

      // Create custom drag image showing count
      if (items.length > 1) {
        const dragGhost = document.createElement('div')
        dragGhost.className = 'drag-ghost-multi'
        dragGhost.innerHTML = `<span class="drag-ghost-count">${items.length}</span> items`
        dragGhost.style.cssText = `
          position: absolute;
          top: -1000px;
          left: -1000px;
          padding: 8px 12px;
          background: rgba(59, 130, 246, 0.9);
          color: white;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          white-space: nowrap;
        `
        document.body.appendChild(dragGhost)
        event.dataTransfer.setDragImage(dragGhost, 0, 0)

        // Clean up after drag starts
        setTimeout(() => {
          document.body.removeChild(dragGhost)
        }, 0)
      }
    }
  }

  /**
   * End dragging
   */
  const handleDragEnd = () => {
    isDragging.value = false
    draggingId.value = null
    draggingIds.value = new Set()
    dropPosition.value = null
  }

  /**
   * Handle drag over
   */
  const handleDragOver = (
    event: DragEvent,
    targetId: string | number,
    position: 'above' | 'below' | 'inside',
    options?: {
      allowInside?: boolean
      preventSelf?: boolean
    }
  ) => {
    // Don't allow dropping on any item being dragged (supports multi-drag)
    if (options?.preventSelf && draggingIds.value.has(targetId)) {
      return
    }

    // Don't allow inside non-folders unless explicitly allowed
    if (position === 'inside' && !options?.allowInside) {
      return
    }

    event.preventDefault()
    dropPosition.value = position

    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move'
    }
  }

  /**
   * Check if a target is valid for dropping (not in the dragged items)
   */
  const isValidDropTarget = (targetId: string | number): boolean => {
    return !draggingIds.value.has(targetId)
  }

  /**
   * Handle drag leave
   */
  const handleDragLeave = (currentPosition: DropPosition) => {
    if (dropPosition.value === currentPosition) {
      dropPosition.value = null
    }
  }

  /**
   * Handle drop (supports both single and multi-item)
   * Returns DropResult for single item, DropResultMulti for multiple items
   */
  const handleDrop = (
    event: DragEvent,
    targetId: string | number,
    targetItemId: number,
    position: 'above' | 'below' | 'inside'
  ): DropResult | DropResultMulti | null => {
    event.preventDefault()
    event.stopPropagation()

    try {
      const dataStr = event.dataTransfer?.getData('application/json')
      if (!dataStr) {
        console.error('No drag data found')
        return null
      }

      const dragData = JSON.parse(dataStr) as DragData | DragDataMulti

      // Check if this is a multi-drag operation
      if (isDragDataMulti(dragData)) {
        // Don't allow dropping on any of the dragged items
        const draggedIds = new Set(dragData.items.map(item => item.id))
        if (draggedIds.has(targetId)) {
          dropPosition.value = null
          return null
        }

        const result: DropResultMulti = {
          sourceItems: dragData.items.map(item => ({
            id: item.id,
            itemId: item.itemId
          })),
          targetId,
          targetItemId,
          position,
          isMulti: true
        }

        dropPosition.value = null
        return result
      }

      // Single item drop (backward compatible)
      // Don't allow dropping on itself
      if (dragData.id === targetId) {
        dropPosition.value = null
        return null
      }

      const result: DropResult = {
        sourceId: dragData.id,
        sourceItemId: dragData.itemId,
        targetId,
        targetItemId,
        position
      }

      dropPosition.value = null
      return result

    } catch (error) {
      console.error('Error handling drop:', error)
      dropPosition.value = null
      return null
    }
  }

  /**
   * Reset drag state
   */
  const resetDragState = () => {
    isDragging.value = false
    draggingId.value = null
    draggingIds.value = new Set()
    dropPosition.value = null
  }

  /**
   * Get count of items being dragged
   */
  const getDraggingCount = (): number => {
    return draggingIds.value.size
  }

  return {
    // State
    isDragging,
    draggingId,
    draggingIds,
    dropPosition,

    // Methods - Single item (backward compatible)
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    resetDragState,

    // Methods - Multi item
    handleDragStartMulti,
    isValidDropTarget,
    getDraggingCount
  }
}
