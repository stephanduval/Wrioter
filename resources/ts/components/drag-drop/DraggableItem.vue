<template>
  <div
    ref="elementRef"
    class="draggable-item"
    :class="{
      'is-dragging': isDragging,
      'is-disabled': disabled,
      'has-handle': hasHandle
    }"
    :data-drag-type="type"
    :data-drag-id="dragId"
  >
    <slot
      :is-dragging="isDragging"
      :drag-handle-props="dragHandleProps"
      :drag-state="dragState"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, toRefs } from 'vue'
import { useDragDrop, type DragType, type DragPreview, type DragConstraints } from '@/composables/useDragDrop'

interface Props {
  type: DragType
  data: any
  disabled?: boolean
  handle?: boolean
  preview?: DragPreview
  constraints?: DragConstraints
  dragId?: string
}

interface Emits {
  (e: 'drag-start', event: any): void
  (e: 'drag-move', event: any): void
  (e: 'drag-end', event: any): void
  (e: 'drag-cancel', event: any): void
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  handle: false
})

const emit = defineEmits<Emits>()

const elementRef = ref<HTMLElement>()
const handleRef = ref<HTMLElement>()

const { disabled } = toRefs(props)

// Use drag-drop composable
const { isDragging, dragOffset, dragState, cancelDrag } = useDragDrop(elementRef, {
  type: props.type,
  data: () => props.data,
  handle: props.handle ? handleRef : undefined,
  preview: props.preview,
  constraints: props.constraints,
  disabled,
  onDragStart: (e) => {
    emit('drag-start', e)
    console.log('Drag started:', props.type, props.data)
  },
  onDragMove: (e) => {
    emit('drag-move', e)
  },
  onDragEnd: (e) => {
    emit('drag-end', e)
    console.log('Drag ended:', e.type)
  }
})

// Computed properties
const hasHandle = computed(() => props.handle)

const dragHandleProps = computed(() => ({
  ref: handleRef,
  class: 'drag-handle',
  'data-drag-handle': true,
  style: {
    cursor: props.disabled ? 'not-allowed' : 'grab'
  }
}))

// Expose methods for parent components
defineExpose({
  cancelDrag,
  isDragging,
  dragState
})
</script>

<style scoped lang="scss">
.draggable-item {
  position: relative;
  transition: transform 0.2s ease, opacity 0.2s ease;

  &:not(.is-disabled) {
    cursor: grab;

    &:active {
      cursor: grabbing;
    }
  }

  &.is-disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &.is-dragging {
    opacity: 0.6;
    transform: scale(0.98);
    z-index: 1000;
  }

  &.has-handle {
    cursor: default;
  }

  // Drag handle styling
  :deep(.drag-handle) {
    cursor: grab;
    user-select: none;

    &:active {
      cursor: grabbing;
    }

    // Common handle icon styles
    &::before {
      content: '';
      display: inline-block;
      width: 16px;
      height: 16px;
      background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M9 3h2v2H9V3zm4 0h2v2h-2V3zM9 7h2v2H9V7zm4 0h2v2h-2V7zm-4 4h2v2H9v-2zm4 0h2v2h-2v-2zm-4 4h2v2H9v-2zm4 0h2v2h-2v-2zm-4 4h2v2H9v-2zm4 0h2v2h-2v-2z"/></svg>');
      background-size: contain;
      opacity: 0.6;
      transition: opacity 0.2s ease;
    }

    &:hover::before {
      opacity: 1;
    }
  }
}

// Global drag styles (applied to body during drag)
:global(.drag-active) {
  user-select: none;

  * {
    cursor: grabbing !important;
  }
}

// Prevent text selection during drag
:global(.dragging) {
  pointer-events: none;
}
</style>