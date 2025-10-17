import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { DragSource, DropTarget, Position, DragPreview } from '@/composables/useDragDrop'

// Auto-scroll configuration
interface AutoScrollConfig {
  threshold: number // pixels from edge to start scrolling
  maxSpeed: number  // maximum scroll speed
  acceleration: number // speed increase factor
}

// Drag preview types
interface PreviewOptions {
  offset?: Position
  opacity?: number
  scale?: number
  className?: string
}

export const useDragDropStore = defineStore('dragDrop', () => {
  // Core drag state
  const isDragging = ref(false)
  const dragSource = ref<DragSource | null>(null)
  const dragPosition = ref<Position>({ x: 0, y: 0 })
  const currentDropTarget = ref<DropTarget | null>(null)
  const draggedElements = ref<HTMLElement[]>([])

  // Drag preview state
  const previewElement = ref<HTMLElement | null>(null)
  const previewOffset = ref<Position>({ x: 0, y: 0 })

  // Auto-scroll state
  const autoScrollActive = ref(false)
  const autoScrollDirection = ref<'up' | 'down' | 'left' | 'right' | null>(null)
  const autoScrollSpeed = ref(0)
  const autoScrollInterval = ref<number | null>(null)

  // Multi-drag state (for future use)
  const multipleDragSources = ref<DragSource[]>([])
  const isMultiDrag = ref(false)

  // Configuration
  const autoScrollConfig: AutoScrollConfig = {
    threshold: 50,
    maxSpeed: 20,
    acceleration: 1.5
  }

  // Computed properties
  const canDrop = computed(() => {
    return currentDropTarget.value !== null && isDragging.value
  })

  const dragData = computed(() => {
    return dragSource.value?.data || null
  })

  const isValidDropTarget = computed(() => {
    if (!dragSource.value || !currentDropTarget.value) return false

    const target = currentDropTarget.value
    const source = dragSource.value

    // Check if target accepts this drag type
    if (!target.accepts.includes(source.type)) return false

    // Run custom validation if provided
    if (target.validateDrop && !target.validateDrop(source)) return false

    return true
  })

  // Actions
  const startDrag = (source: DragSource, position: Position) => {
    isDragging.value = true
    dragSource.value = source
    dragPosition.value = position
    draggedElements.value = [source.element]

    // Create drag preview if specified
    if (source.preview) {
      createDragPreview(source.preview, position)
    }

    // Add global styles
    document.body.classList.add('dragging')

    console.log('Drag started:', source.type, source.data)
  }

  const startMultiDrag = (sources: DragSource[], position: Position) => {
    if (sources.length === 0) return

    isDragging.value = true
    isMultiDrag.value = true
    dragSource.value = sources[0] // Primary source
    multipleDragSources.value = sources
    dragPosition.value = position
    draggedElements.value = sources.map(s => s.element)

    // Create preview for multiple items
    createMultiDragPreview(sources, position)

    document.body.classList.add('dragging', 'multi-dragging')

    console.log('Multi-drag started:', sources.length, 'items')
  }

  const updateDragPosition = (position: Position) => {
    dragPosition.value = position
    updateDragPreview(position)
    checkAutoScroll(position)
  }

  const setDropTarget = (target: DropTarget) => {
    if (currentDropTarget.value?.id !== target.id) {
      // Clear previous target
      if (currentDropTarget.value) {
        clearDropTargetStyles(currentDropTarget.value)
      }

      currentDropTarget.value = target
      applyDropTargetStyles(target)

      console.log('Drop target set:', target.id)
    }
  }

  const clearDropTarget = () => {
    if (currentDropTarget.value) {
      clearDropTargetStyles(currentDropTarget.value)
      currentDropTarget.value = null
      console.log('Drop target cleared')
    }
  }

  const endDrag = () => {
    console.log('Drag ended')

    // Perform drop if there's a valid target
    const dropResult = performDrop()

    // Clean up state
    isDragging.value = false
    isMultiDrag.value = false
    dragSource.value = null
    multipleDragSources.value = []
    draggedElements.value = []
    clearDropTarget()
    removeDragPreview()
    stopAutoScroll()

    // Remove global styles
    document.body.classList.remove('dragging', 'multi-dragging')

    return dropResult
  }

  const cancelDrag = () => {
    console.log('Drag cancelled')

    // Clean up without performing drop
    isDragging.value = false
    isMultiDrag.value = false
    dragSource.value = null
    multipleDragSources.value = []
    draggedElements.value = []
    clearDropTarget()
    removeDragPreview()
    stopAutoScroll()

    document.body.classList.remove('dragging', 'multi-dragging')
  }

  // Drop handling
  const performDrop = (): boolean => {
    if (!currentDropTarget.value || !dragSource.value) return false

    if (!isValidDropTarget.value) {
      console.warn('Invalid drop target')
      return false
    }

    try {
      if (isMultiDrag.value) {
        // Handle multi-item drop
        const allData = multipleDragSources.value.map(s => s.data)
        currentDropTarget.value.onDrop(allData, dragPosition.value)
      } else {
        // Handle single item drop
        currentDropTarget.value.onDrop(dragSource.value.data, dragPosition.value)
      }

      console.log('Drop successful')
      return true
    } catch (error) {
      console.error('Drop failed:', error)
      return false
    }
  }

  // Preview management
  const createDragPreview = (preview: DragPreview, position: Position) => {
    removeDragPreview() // Clean up existing preview

    previewElement.value = document.createElement('div')
    previewElement.value.className = 'drag-preview'

    // Base styles
    Object.assign(previewElement.value.style, {
      position: 'fixed',
      pointerEvents: 'none',
      zIndex: '10000',
      opacity: '0.8',
      transform: 'scale(0.95)',
      borderRadius: '4px',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
      transition: 'none'
    })

    // Set content based on preview type
    switch (preview.type) {
      case 'element':
        if (preview.element) {
          const clone = preview.element.cloneNode(true) as HTMLElement
          clone.style.margin = '0'
          clone.style.maxWidth = '300px'
          clone.style.maxHeight = '200px'
          previewElement.value.appendChild(clone)
        }
        break

      case 'image':
        if (preview.src) {
          const img = document.createElement('img')
          img.src = preview.src
          img.style.maxWidth = '200px'
          img.style.maxHeight = '200px'
          img.style.objectFit = 'cover'
          previewElement.value.appendChild(img)
        }
        break

      case 'html':
        if (preview.html) {
          previewElement.value.innerHTML = preview.html
        }
        break
    }

    // Set initial position
    previewOffset.value = preview.offset || { x: 10, y: 10 }
    updateDragPreview(position)

    document.body.appendChild(previewElement.value)
  }

  const createMultiDragPreview = (sources: DragSource[], position: Position) => {
    removeDragPreview()

    previewElement.value = document.createElement('div')
    previewElement.value.className = 'drag-preview multi-drag-preview'

    Object.assign(previewElement.value.style, {
      position: 'fixed',
      pointerEvents: 'none',
      zIndex: '10000',
      opacity: '0.9',
      background: 'white',
      border: '2px solid #1976d2',
      borderRadius: '8px',
      padding: '12px 16px',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
      fontSize: '14px',
      fontWeight: 'bold',
      color: '#1976d2'
    })

    previewElement.value.textContent = `${sources.length} items`

    previewOffset.value = { x: 10, y: 10 }
    updateDragPreview(position)

    document.body.appendChild(previewElement.value)
  }

  const updateDragPreview = (position: Position) => {
    if (!previewElement.value) return

    const x = position.x + previewOffset.value.x
    const y = position.y + previewOffset.value.y

    // Keep preview within viewport bounds
    const rect = previewElement.value.getBoundingClientRect()
    const maxX = window.innerWidth - rect.width - 10
    const maxY = window.innerHeight - rect.height - 10

    const constrainedX = Math.max(10, Math.min(x, maxX))
    const constrainedY = Math.max(10, Math.min(y, maxY))

    previewElement.value.style.left = `${constrainedX}px`
    previewElement.value.style.top = `${constrainedY}px`
  }

  const removeDragPreview = () => {
    if (previewElement.value) {
      document.body.removeChild(previewElement.value)
      previewElement.value = null
    }
  }

  // Auto-scroll functionality
  const checkAutoScroll = (position: Position) => {
    const { threshold } = autoScrollConfig
    const viewport = {
      left: 0,
      top: 0,
      right: window.innerWidth,
      bottom: window.innerHeight
    }

    let direction: typeof autoScrollDirection.value = null
    let speed = 0

    // Check which edge is closest
    if (position.y < threshold) {
      direction = 'up'
      speed = (threshold - position.y) / threshold
    } else if (position.y > viewport.bottom - threshold) {
      direction = 'down'
      speed = (position.y - (viewport.bottom - threshold)) / threshold
    } else if (position.x < threshold) {
      direction = 'left'
      speed = (threshold - position.x) / threshold
    } else if (position.x > viewport.right - threshold) {
      direction = 'right'
      speed = (position.x - (viewport.right - threshold)) / threshold
    }

    if (direction && speed > 0) {
      startAutoScroll(direction, speed)
    } else {
      stopAutoScroll()
    }
  }

  const startAutoScroll = (direction: NonNullable<typeof autoScrollDirection.value>, speed: number) => {
    if (autoScrollInterval.value && autoScrollDirection.value === direction) {
      // Update speed for existing scroll
      autoScrollSpeed.value = Math.min(speed * autoScrollConfig.maxSpeed, autoScrollConfig.maxSpeed)
      return
    }

    stopAutoScroll()

    autoScrollActive.value = true
    autoScrollDirection.value = direction
    autoScrollSpeed.value = Math.min(speed * autoScrollConfig.maxSpeed, autoScrollConfig.maxSpeed)

    autoScrollInterval.value = window.setInterval(() => {
      const scrollableElement = findScrollableParent() || window

      switch (autoScrollDirection.value) {
        case 'up':
          if (scrollableElement === window) {
            window.scrollBy(0, -autoScrollSpeed.value)
          } else {
            (scrollableElement as HTMLElement).scrollTop -= autoScrollSpeed.value
          }
          break
        case 'down':
          if (scrollableElement === window) {
            window.scrollBy(0, autoScrollSpeed.value)
          } else {
            (scrollableElement as HTMLElement).scrollTop += autoScrollSpeed.value
          }
          break
        case 'left':
          if (scrollableElement === window) {
            window.scrollBy(-autoScrollSpeed.value, 0)
          } else {
            (scrollableElement as HTMLElement).scrollLeft -= autoScrollSpeed.value
          }
          break
        case 'right':
          if (scrollableElement === window) {
            window.scrollBy(autoScrollSpeed.value, 0)
          } else {
            (scrollableElement as HTMLElement).scrollLeft += autoScrollSpeed.value
          }
          break
      }

      // Gradually increase speed
      autoScrollSpeed.value = Math.min(
        autoScrollSpeed.value * autoScrollConfig.acceleration,
        autoScrollConfig.maxSpeed
      )
    }, 16) // 60fps
  }

  const stopAutoScroll = () => {
    if (autoScrollInterval.value) {
      clearInterval(autoScrollInterval.value)
      autoScrollInterval.value = null
    }

    autoScrollActive.value = false
    autoScrollDirection.value = null
    autoScrollSpeed.value = 0
  }

  const findScrollableParent = (): HTMLElement | null => {
    if (!dragSource.value) return null

    let element = dragSource.value.element.parentElement

    while (element) {
      const style = window.getComputedStyle(element)
      const overflow = style.overflow + style.overflowY + style.overflowX

      if (overflow.includes('scroll') || overflow.includes('auto')) {
        return element
      }

      element = element.parentElement
    }

    return null
  }

  // Drop target styling
  const applyDropTargetStyles = (target: DropTarget) => {
    if (target.hoverClass) {
      target.element.classList.add(target.hoverClass)
    } else {
      target.element.classList.add('drop-target-hover')
    }
  }

  const clearDropTargetStyles = (target: DropTarget) => {
    if (target.hoverClass) {
      target.element.classList.remove(target.hoverClass)
    } else {
      target.element.classList.remove('drop-target-hover')
    }
  }

  // Utility methods
  const getDraggedData = () => {
    if (isMultiDrag.value) {
      return multipleDragSources.value.map(s => s.data)
    }
    return dragSource.value?.data || null
  }

  const getDraggedElements = () => {
    return [...draggedElements.value]
  }

  const isDraggedElement = (element: HTMLElement) => {
    return draggedElements.value.includes(element)
  }

  // Cleanup method for store reset
  const reset = () => {
    cancelDrag()
    // Additional cleanup if needed
  }

  return {
    // State
    isDragging: readonly(isDragging),
    dragSource: readonly(dragSource),
    dragPosition: readonly(dragPosition),
    currentDropTarget: readonly(currentDropTarget),
    draggedElements: readonly(draggedElements),
    isMultiDrag: readonly(isMultiDrag),
    autoScrollActive: readonly(autoScrollActive),

    // Computed
    canDrop,
    dragData,
    isValidDropTarget,

    // Actions
    startDrag,
    startMultiDrag,
    updateDragPosition,
    setDropTarget,
    clearDropTarget,
    endDrag,
    cancelDrag,

    // Utilities
    getDraggedData,
    getDraggedElements,
    isDraggedElement,
    reset
  }
})

// Export types for external use
export type { DragSource, DropTarget, Position, DragPreview }