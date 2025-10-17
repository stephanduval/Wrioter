import { ref, computed, onMounted, onUnmounted, type Ref } from 'vue'
import { useDragDropStore } from '@/stores/dragDrop'

// Types
export enum DragType {
  CARD = 'card',
  TREE_NODE = 'tree-node',
  MENU_ITEM = 'menu-item',
  TEXT_SELECTION = 'text-selection',
  FILE = 'file'
}

export interface Position {
  x: number
  y: number
  clientX?: number
  clientY?: number
  pageX?: number
  pageY?: number
}

export interface DragConstraints {
  axis?: 'x' | 'y' | 'both'
  bounds?: DOMRect | 'parent' | 'window'
  grid?: [number, number]
  distance?: number // Minimum distance before drag starts
}

export interface DragPreview {
  type: 'element' | 'image' | 'html'
  element?: HTMLElement
  src?: string
  html?: string
  offset?: Position
}

export interface DragSource {
  id: string
  type: DragType
  element: HTMLElement
  data: any
  handle?: HTMLElement
  preview?: DragPreview
  constraints?: DragConstraints
  effects?: string[]
}

export interface DragEvent {
  type: 'start' | 'move' | 'end' | 'cancel'
  source: DragSource
  position: Position
  offset: Position
  data: any
  originalEvent: MouseEvent | TouchEvent
}

export interface UseDragDropOptions {
  type: DragType
  data: () => any
  handle?: Ref<HTMLElement | undefined>
  preview?: DragPreview
  constraints?: DragConstraints
  disabled?: Ref<boolean>
  onDragStart?: (event: DragEvent) => void
  onDragMove?: (event: DragEvent) => void
  onDragEnd?: (event: DragEvent) => void
}

// Utility functions
const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9)
}

const getEventPosition = (event: MouseEvent | Touch): Position => {
  return {
    x: event.clientX,
    y: event.clientY,
    clientX: event.clientX,
    clientY: event.clientY,
    pageX: event.pageX,
    pageY: event.pageY
  }
}

const getDistance = (pos1: Position, pos2: Position): number => {
  return Math.sqrt(
    Math.pow(pos2.x - pos1.x, 2) + Math.pow(pos2.y - pos1.y, 2)
  )
}

const applyConstraints = (position: Position, constraints?: DragConstraints): Position => {
  if (!constraints) return position

  let constrainedPos = { ...position }

  // Apply axis constraints
  if (constraints.axis === 'x') {
    constrainedPos.y = position.y
  } else if (constraints.axis === 'y') {
    constrainedPos.x = position.x
  }

  // Apply bounds constraints
  if (constraints.bounds) {
    let bounds: DOMRect

    if (constraints.bounds === 'parent') {
      // Would need parent element reference
      bounds = new DOMRect(0, 0, window.innerWidth, window.innerHeight)
    } else if (constraints.bounds === 'window') {
      bounds = new DOMRect(0, 0, window.innerWidth, window.innerHeight)
    } else {
      bounds = constraints.bounds
    }

    constrainedPos.x = Math.max(bounds.left, Math.min(bounds.right, constrainedPos.x))
    constrainedPos.y = Math.max(bounds.top, Math.min(bounds.bottom, constrainedPos.y))
  }

  // Apply grid constraints
  if (constraints.grid) {
    const [gridX, gridY] = constraints.grid
    constrainedPos.x = Math.round(constrainedPos.x / gridX) * gridX
    constrainedPos.y = Math.round(constrainedPos.y / gridY) * gridY
  }

  return constrainedPos
}

// Main composable
export function useDragDrop(
  elementRef: Ref<HTMLElement | undefined>,
  options: UseDragDropOptions
) {
  const store = useDragDropStore()
  const isDragging = ref(false)
  const dragOffset = ref<Position>({ x: 0, y: 0 })

  // Track drag state
  let startPosition: Position | null = null
  let currentDragId: string | null = null

  // Mouse event handlers
  const handleMouseDown = (e: MouseEvent) => {
    if (options.disabled?.value || e.button !== 0) return
    if (!elementRef.value) return

    e.preventDefault()

    const startPos = getEventPosition(e)
    startPosition = startPos
    let hasMoved = false

    const handleMouseMove = (e: MouseEvent) => {
      if (!startPosition) return

      const currentPos = getEventPosition(e)
      const distance = getDistance(startPosition, currentPos)

      if (!hasMoved && distance < (options.constraints?.distance || 5)) {
        return
      }

      if (!hasMoved) {
        hasMoved = true
        startDrag(e, startPosition)
      }

      moveDrag(e)
    }

    const handleMouseUp = (e: MouseEvent) => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)

      if (hasMoved) {
        endDrag(e)
      }

      startPosition = null
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  // Touch event handlers
  const handleTouchStart = (e: TouchEvent) => {
    if (options.disabled?.value || e.touches.length !== 1) return
    if (!elementRef.value) return

    const touch = e.touches[0]
    const startPos = getEventPosition(touch)
    startPosition = startPos
    let hasMoved = false

    const handleTouchMove = (e: TouchEvent) => {
      if (!startPosition || e.touches.length !== 1) return

      // Prevent scrolling during drag
      e.preventDefault()

      const touch = e.touches[0]
      const currentPos = getEventPosition(touch)
      const distance = getDistance(startPosition, currentPos)

      if (!hasMoved && distance < (options.constraints?.distance || 5)) {
        return
      }

      if (!hasMoved) {
        hasMoved = true
        startDrag(touch, startPosition)
      }

      moveDrag(touch)
    }

    const handleTouchEnd = (e: TouchEvent) => {
      if (!elementRef.value) return

      elementRef.value.removeEventListener('touchmove', handleTouchMove)
      elementRef.value.removeEventListener('touchend', handleTouchEnd)
      elementRef.value.removeEventListener('touchcancel', handleTouchEnd)

      if (hasMoved && e.changedTouches.length > 0) {
        endDrag(e.changedTouches[0])
      }

      startPosition = null
    }

    elementRef.value.addEventListener('touchmove', handleTouchMove, { passive: false })
    elementRef.value.addEventListener('touchend', handleTouchEnd)
    elementRef.value.addEventListener('touchcancel', handleTouchEnd)
  }

  // Drag lifecycle methods
  const startDrag = (event: MouseEvent | Touch, startPos: Position) => {
    if (!elementRef.value) return

    isDragging.value = true
    currentDragId = generateId()

    const source: DragSource = {
      id: currentDragId,
      type: options.type,
      element: elementRef.value,
      data: options.data(),
      preview: options.preview,
      constraints: options.constraints
    }

    const currentPos = getEventPosition(event)
    const elementRect = elementRef.value.getBoundingClientRect()

    dragOffset.value = {
      x: startPos.x - elementRect.left,
      y: startPos.y - elementRect.top
    }

    store.startDrag(source, currentPos)

    options.onDragStart?.({
      type: 'start',
      source,
      position: startPos,
      offset: dragOffset.value,
      data: source.data,
      originalEvent: event as any
    })

    // Add drag styling
    elementRef.value.classList.add('dragging')
    document.body.classList.add('drag-active')

    // Disable text selection during drag
    document.body.style.userSelect = 'none'
  }

  const moveDrag = (event: MouseEvent | Touch) => {
    if (!isDragging.value || !store.dragSource) return

    const position = getEventPosition(event)
    const constrainedPos = applyConstraints(position, options.constraints)

    store.updateDragPosition(constrainedPos)

    options.onDragMove?.({
      type: 'move',
      source: store.dragSource,
      position: constrainedPos,
      offset: dragOffset.value,
      data: store.dragSource.data,
      originalEvent: event as any
    })
  }

  const endDrag = (event: MouseEvent | Touch) => {
    if (!isDragging.value || !store.dragSource) return

    isDragging.value = false

    const finalPosition = getEventPosition(event)
    const dropTarget = store.currentDropTarget

    // Handle drop
    if (dropTarget) {
      dropTarget.onDrop(store.dragSource.data, finalPosition)
    }

    options.onDragEnd?.({
      type: 'end',
      source: store.dragSource,
      position: finalPosition,
      offset: dragOffset.value,
      data: store.dragSource.data,
      originalEvent: event as any
    })

    // Clean up
    cleanup()
  }

  const cancelDrag = () => {
    if (!isDragging.value) return

    isDragging.value = false

    options.onDragEnd?.({
      type: 'cancel',
      source: store.dragSource!,
      position: store.dragPosition,
      offset: dragOffset.value,
      data: store.dragSource!.data,
      originalEvent: new MouseEvent('mouseup') // Dummy event
    })

    cleanup()
  }

  const cleanup = () => {
    if (elementRef.value) {
      elementRef.value.classList.remove('dragging')
    }

    document.body.classList.remove('drag-active')
    document.body.style.userSelect = ''

    store.endDrag()
    currentDragId = null
  }

  // Setup and teardown
  onMounted(() => {
    if (!elementRef.value) return

    const handle = options.handle?.value || elementRef.value

    handle.addEventListener('mousedown', handleMouseDown)
    handle.addEventListener('touchstart', handleTouchStart, { passive: false })

    // Disable native HTML5 drag
    elementRef.value.draggable = false
  })

  onUnmounted(() => {
    if (!elementRef.value) return

    const handle = options.handle?.value || elementRef.value

    handle.removeEventListener('mousedown', handleMouseDown)
    handle.removeEventListener('touchstart', handleTouchStart)

    // Cancel any active drag
    if (isDragging.value) {
      cancelDrag()
    }
  })

  // Computed properties
  const dragState = computed(() => ({
    isDragging: isDragging.value,
    dragOffset: dragOffset.value,
    dragId: currentDragId
  }))

  // Public API
  return {
    isDragging: readonly(isDragging),
    dragOffset: readonly(dragOffset),
    dragState,
    cancelDrag
  }
}

// Additional utility composable for drop zones
export interface DropTarget {
  id: string
  element: HTMLElement
  accepts: DragType[]
  validateDrop?: (source: DragSource) => boolean
  hoverClass?: string
  dropEffect?: 'move' | 'copy' | 'link' | 'none'
  sortable?: boolean
  onDrop: (data: any, position?: Position) => void
}

export interface DropEvent {
  type: 'enter' | 'over' | 'leave' | 'drop'
  target: DropTarget
  position: Position
  data: any
  accepted: boolean
}

export interface UseDropZoneOptions {
  accepts: DragType[]
  validateDrop?: (source: DragSource) => boolean
  onDrop: (data: any, position?: Position) => void
  onDragEnter?: (event: DropEvent) => void
  onDragOver?: (event: DropEvent) => void
  onDragLeave?: (event: DropEvent) => void
  sortable?: boolean
  disabled?: Ref<boolean>
  hoverClass?: string
}

export function useDropZone(
  elementRef: Ref<HTMLElement | undefined>,
  options: UseDropZoneOptions
) {
  const store = useDragDropStore()
  const isOver = ref(false)
  const canDrop = ref(false)
  const dropTargetId = ref<string | null>(null)

  const checkCanDrop = (source: DragSource): boolean => {
    if (options.disabled?.value) return false
    if (!options.accepts.includes(source.type)) return false
    if (options.validateDrop && !options.validateDrop(source)) return false
    return true
  }

  // Watch for drag events from the store
  const unwatchDrag = store.$subscribe((mutation, state) => {
    if (!elementRef.value || !state.isDragging || !state.dragSource) {
      if (isOver.value) {
        handleDragLeave()
      }
      return
    }

    // Check if mouse is over this element
    const rect = elementRef.value.getBoundingClientRect()
    const pos = state.dragPosition

    const isMouseOver =
      pos.x >= rect.left &&
      pos.x <= rect.right &&
      pos.y >= rect.top &&
      pos.y <= rect.bottom

    if (isMouseOver && !isOver.value) {
      handleDragEnter()
    } else if (!isMouseOver && isOver.value) {
      handleDragLeave()
    } else if (isMouseOver && isOver.value) {
      handleDragOver()
    }
  })

  const handleDragEnter = () => {
    if (!store.dragSource || isOver.value) return

    const source = store.dragSource
    if (!checkCanDrop(source)) return

    isOver.value = true
    canDrop.value = true
    dropTargetId.value = generateId()

    const target: DropTarget = {
      id: dropTargetId.value,
      element: elementRef.value!,
      accepts: options.accepts,
      validateDrop: options.validateDrop,
      sortable: options.sortable,
      onDrop: options.onDrop,
      hoverClass: options.hoverClass
    }

    store.setDropTarget(target)

    if (options.hoverClass) {
      elementRef.value!.classList.add(options.hoverClass)
    }

    options.onDragEnter?.({
      type: 'enter',
      target,
      position: store.dragPosition,
      data: source.data,
      accepted: true
    })
  }

  const handleDragOver = () => {
    if (!isOver.value || !store.dragSource) return

    const target = store.currentDropTarget
    if (!target) return

    options.onDragOver?.({
      type: 'over',
      target,
      position: store.dragPosition,
      data: store.dragSource.data,
      accepted: true
    })
  }

  const handleDragLeave = () => {
    if (!isOver.value) return

    isOver.value = false
    canDrop.value = false

    if (options.hoverClass && elementRef.value) {
      elementRef.value.classList.remove(options.hoverClass)
    }

    if (store.currentDropTarget?.id === dropTargetId.value) {
      store.clearDropTarget()
    }

    options.onDragLeave?.({
      type: 'leave',
      target: store.currentDropTarget!,
      position: store.dragPosition,
      data: store.dragSource?.data,
      accepted: false
    })

    dropTargetId.value = null
  }

  onUnmounted(() => {
    unwatchDrag()
    if (isOver.value) {
      handleDragLeave()
    }
  })

  return {
    isOver: readonly(isOver),
    canDrop: readonly(canDrop)
  }
}