<template>
  <div
    ref="elementRef"
    class="drop-zone"
    :class="{
      'is-over': isOver,
      'can-drop': canDrop,
      'is-disabled': disabled,
      'is-sortable': sortable
    }"
    :data-drop-accepts="accepts.join(',')"
  >
    <!-- Drop indicator for sortable lists -->
    <div
      v-if="isOver && sortable && showIndicator"
      class="drop-indicator"
      :style="indicatorStyle"
    />

    <!-- Content slot -->
    <slot
      :is-over="isOver"
      :can-drop="canDrop"
      :drop-zone-props="dropZoneProps"
    />

    <!-- Visual feedback overlay -->
    <div
      v-if="isOver && canDrop && showOverlay"
      class="drop-overlay"
    >
      <div class="drop-overlay-content">
        <Icon
          name="bx-plus-circle"
          size="24"
        />
        <span>{{ dropMessage || 'Drop here' }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, toRefs } from 'vue'
import { useDropZone, type DragType, type DragSource } from '@/composables/useDragDrop'
import { useDragDropStore } from '@/stores/dragDrop'

interface Props {
  accepts: DragType[]
  validateDrop?: (source: DragSource) => boolean
  sortable?: boolean
  disabled?: boolean
  showIndicator?: boolean
  showOverlay?: boolean
  hoverClass?: string
  dropMessage?: string
  itemHeight?: number
}

interface Emits {
  (e: 'drop', payload: { data: any; position?: any }): void
  (e: 'drag-enter', event: any): void
  (e: 'drag-over', event: any): void
  (e: 'drag-leave', event: any): void
}

const props = withDefaults(defineProps<Props>(), {
  sortable: false,
  disabled: false,
  showIndicator: true,
  showOverlay: false,
  itemHeight: 60
})

const emit = defineEmits<Emits>()

const elementRef = ref<HTMLElement>()
const indicatorStyle = ref({})

const { disabled } = toRefs(props)
const store = useDragDropStore()

// Use drop zone composable
const { isOver, canDrop } = useDropZone(elementRef, {
  accepts: props.accepts,
  validateDrop: props.validateDrop,
  sortable: props.sortable,
  disabled,
  hoverClass: props.hoverClass,
  onDrop: (data, position) => {
    emit('drop', { data, position })
    console.log('Drop received:', data)
  },
  onDragEnter: (e) => {
    emit('drag-enter', e)
    console.log('Drag entered drop zone')
  },
  onDragOver: (e) => {
    emit('drag-over', e)
    if (props.sortable) {
      updateIndicatorPosition(e.position)
    }
  },
  onDragLeave: (e) => {
    emit('drag-leave', e)
    console.log('Drag left drop zone')
  }
})

// Computed properties
const dropZoneProps = computed(() => ({
  'data-drop-zone': true,
  'aria-dropeffect': canDrop.value ? 'move' : 'none',
  'role': 'region',
  'aria-label': `Drop zone accepting ${props.accepts.join(', ')}`
}))

// Sortable indicator positioning
const updateIndicatorPosition = (position: { x: number; y: number }) => {
  if (!elementRef.value || !props.sortable) return

  const rect = elementRef.value.getBoundingClientRect()
  const relativeY = position.y - rect.top
  const items = elementRef.value.children

  let insertIndex = 0
  let indicatorTop = 0

  // Find insertion point
  for (let i = 0; i < items.length; i++) {
    const item = items[i] as HTMLElement
    if (item.classList.contains('drop-indicator')) continue

    const itemRect = item.getBoundingClientRect()
    const itemMiddle = itemRect.top + itemRect.height / 2 - rect.top

    if (relativeY > itemMiddle) {
      insertIndex = i + 1
      indicatorTop = itemRect.bottom - rect.top
    } else {
      break
    }
  }

  // If dropping at the end
  if (insertIndex >= items.length - 1) {
    const lastItem = items[items.length - 1] as HTMLElement
    if (lastItem && !lastItem.classList.contains('drop-indicator')) {
      const lastRect = lastItem.getBoundingClientRect()
      indicatorTop = lastRect.bottom - rect.top
    }
  }

  indicatorStyle.value = {
    top: `${indicatorTop}px`,
    display: 'block'
  }
}

// Expose methods for parent components
defineExpose({
  isOver,
  canDrop
})
</script>

<style scoped lang="scss">
.drop-zone {
  position: relative;
  min-height: 40px;
  transition: all 0.2s ease;

  &.is-disabled {
    opacity: 0.5;
    pointer-events: none;
  }

  &.is-over {
    &.can-drop {
      background-color: rgba(var(--v-theme-primary), 0.04);
      border-color: rgb(var(--v-theme-primary));
    }

    &:not(.can-drop) {
      background-color: rgba(var(--v-theme-error), 0.04);
      border-color: rgb(var(--v-theme-error));
    }
  }

  // Default hover styles if no custom class provided
  &:not(.is-disabled).is-over.can-drop:not(.custom-hover) {
    border: 2px dashed rgb(var(--v-theme-primary));
    border-radius: 8px;
  }
}

.drop-indicator {
  position: absolute;
  left: 0;
  right: 0;
  height: 2px;
  background-color: rgb(var(--v-theme-primary));
  border-radius: 1px;
  z-index: 100;
  transition: top 0.15s ease;
  display: none;

  &::before {
    content: '';
    position: absolute;
    left: -4px;
    top: -3px;
    width: 8px;
    height: 8px;
    background-color: rgb(var(--v-theme-primary));
    border-radius: 50%;
  }

  &::after {
    content: '';
    position: absolute;
    right: -4px;
    top: -3px;
    width: 8px;
    height: 8px;
    background-color: rgb(var(--v-theme-primary));
    border-radius: 50%;
  }
}

.drop-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(var(--v-theme-primary), 0.1);
  border: 2px dashed rgb(var(--v-theme-primary));
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  pointer-events: none;
}

.drop-overlay-content {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: rgb(var(--v-theme-surface));
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  color: rgb(var(--v-theme-primary));
  font-weight: 500;
  font-size: 14px;
}

// Sortable-specific styles
.drop-zone.is-sortable {
  &.is-over {
    .drop-indicator {
      display: block;
    }
  }

  // Style for sortable items
  :deep([data-sortable-item]) {
    transition: transform 0.2s ease;

    &.drag-over {
      transform: translateY(2px);
    }
  }
}

// Animation for drop feedback
@keyframes drop-success {
  0% {
    transform: scale(1);
    background-color: rgba(var(--v-theme-success), 0.1);
  }
  50% {
    transform: scale(1.02);
    background-color: rgba(var(--v-theme-success), 0.2);
  }
  100% {
    transform: scale(1);
    background-color: transparent;
  }
}

.drop-zone.drop-success {
  animation: drop-success 0.3s ease;
}
</style>