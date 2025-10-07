import { ref, Ref } from 'vue'

export type DropPosition = 'above' | 'below' | 'inside' | null

export interface DragData {
  id: string | number
  itemId: number
  type?: string
  title?: string
}

export interface DropResult {
  sourceId: string | number
  sourceItemId: number
  targetId: string | number
  targetItemId: number
  position: 'above' | 'below' | 'inside'
}

/**
 * Shared drag-and-drop composable
 * Used by both TreeNode (vertical nav) and Corkboard components
 */
export function useDragAndDrop() {
  const isDragging = ref(false)
  const draggingId = ref<string | number | null>(null)
  const dropPosition = ref<DropPosition>(null)

  /**
   * Start dragging
   */
  const handleDragStart = (
    event: DragEvent,
    data: DragData
  ) => {
    isDragging.value = true
    draggingId.value = data.id

    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move'
      event.dataTransfer.setData('application/json', JSON.stringify(data))
    }
  }

  /**
   * End dragging
   */
  const handleDragEnd = () => {
    isDragging.value = false
    draggingId.value = null
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
    // Don't allow dropping on itself
    if (options?.preventSelf && draggingId.value === targetId) {
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
   * Handle drag leave
   */
  const handleDragLeave = (currentPosition: DropPosition) => {
    if (dropPosition.value === currentPosition) {
      dropPosition.value = null
    }
  }

  /**
   * Handle drop
   */
  const handleDrop = (
    event: DragEvent,
    targetId: string | number,
    targetItemId: number,
    position: 'above' | 'below' | 'inside'
  ): DropResult | null => {
    event.preventDefault()
    event.stopPropagation()

    try {
      const dataStr = event.dataTransfer?.getData('application/json')
      if (!dataStr) {
        console.error('No drag data found')
        return null
      }

      const dragData: DragData = JSON.parse(dataStr)

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
    dropPosition.value = null
  }

  return {
    // State
    isDragging,
    draggingId,
    dropPosition,

    // Methods
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    resetDragState
  }
}
