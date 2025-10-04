<template>
  <div
    ref="elementRef"
    class="selectable-item"
    :class="{
      'is-selected': isSelected,
      'is-last-selected': isLastSelected,
      'is-anchor': isAnchor,
      'is-selection-mode': store.isSelectionMode,
      'is-disabled': disabled,
      'is-hovered': isHovered
    }"
    :data-item-id="itemId"
    :data-selectable="!disabled"
    :tabindex="disabled ? -1 : 0"
    @click="handleClick"
    @touchstart="handleTouchStart"
    @touchend="handleTouchEnd"
    @touchmove="handleTouchMove"
    @contextmenu="handleContextMenu"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
    @focus="handleFocus"
    @blur="handleBlur"
    @keydown="handleKeyDown"
  >
    <!-- Selection checkbox (mobile/selection mode) -->
    <div
      v-if="store.isSelectionMode && showCheckbox"
      class="selection-checkbox"
      @click.stop="handleSelectionTap"
    >
      <VCheckbox
        :model-value="isSelected"
        hide-details
        density="compact"
        readonly
        tabindex="-1"
        :color="checkboxColor"
      />
    </div>

    <!-- Selection indicator (desktop) -->
    <div
      v-else-if="isSelected && !store.isSelectionMode"
      class="selection-indicator"
    />

    <!-- Item content -->
    <slot
      :is-selected="isSelected"
      :is-selection-mode="store.isSelectionMode"
      :is-hovered="isHovered"
      :is-focused="isFocused"
      :selection-props="selectionProps"
      :handle-select="handleSelectionTap"
    />

    <!-- Keyboard focus ring -->
    <div
      v-if="isFocused && !disabled"
      class="focus-ring"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, toRefs } from 'vue'
import { VCheckbox } from 'vuetify/components'
import { useSelection, useContextSelection } from '@/composables/useSelection'
import { useSelectionStore } from '@/stores/selection'

interface Props {
  itemId: string
  itemData?: any
  multiple?: boolean
  disabled?: boolean
  showCheckbox?: boolean
  checkboxColor?: string
  contextMenuItems?: any[]
}

interface Emits {
  (e: 'select', data: any): void
  (e: 'deselect', data: any): void
  (e: 'context-menu', payload: { itemIds: string[]; event: MouseEvent }): void
  (e: 'focus', itemId: string): void
  (e: 'blur', itemId: string): void
  (e: 'hover', itemId: string | null): void
}

const props = withDefaults(defineProps<Props>(), {
  multiple: true,
  disabled: false,
  showCheckbox: true,
  checkboxColor: 'primary'
})

const emit = defineEmits<Emits>()

const elementRef = ref<HTMLElement>()
const isHovered = ref(false)
const isFocused = ref(false)

const { disabled } = toRefs(props)
const store = useSelectionStore()

// Use selection composable
const {
  isSelected,
  isLastSelected,
  isAnchor,
  handleClick,
  handleTouchStart,
  handleTouchEnd,
  handleTouchMove,
  handleSelectionTap
} = useSelection({
  itemId: props.itemId,
  itemData: props.itemData,
  multiple: props.multiple,
  disabled
})

// Use context menu composable
const { handleContextMenu: handleContextMenuAction } = useContextSelection({
  itemId: props.itemId,
  onContextMenu: (itemIds, event) => {
    emit('context-menu', { itemIds, event })
  },
  disabled
})

// Computed properties
const selectionProps = computed(() => ({
  'aria-selected': isSelected.value,
  'data-selected': isSelected.value,
  'role': 'option',
  'aria-setsize': store.selectedCount,
  'aria-posinset': store.selectedArray.indexOf(props.itemId) + 1
}))

// Event handlers
const handleMouseEnter = () => {
  if (props.disabled) return
  isHovered.value = true
  store.setHovered(props.itemId)
  emit('hover', props.itemId)
}

const handleMouseLeave = () => {
  isHovered.value = false
  store.setHovered(null)
  emit('hover', null)
}

const handleFocus = () => {
  if (props.disabled) return
  isFocused.value = true
  store.setFocused(props.itemId)
  emit('focus', props.itemId)
}

const handleBlur = () => {
  isFocused.value = false
  if (store.focusedId === props.itemId) {
    store.setFocused(null)
  }
  emit('blur', props.itemId)
}

const handleContextMenu = (event: MouseEvent) => {
  if (props.disabled) return
  handleContextMenuAction(event)
}

const handleKeyDown = (event: KeyboardEvent) => {
  if (props.disabled) return

  switch (event.key) {
    case ' ':
    case 'Enter':
      event.preventDefault()
      if (event.key === ' ') {
        // Space toggles selection
        handleSelectionTap()
      } else {
        // Enter selects single item
        store.selectItem(props.itemId)
      }
      break

    case 'Escape':
      // Clear selection
      store.clearSelection()
      break

    case 'a':
      if (event.ctrlKey || event.metaKey) {
        // Ctrl+A selects all
        event.preventDefault()
        store.selectAll()
      }
      break
  }
}

// Watch for selection changes and emit events
watch(isSelected, (selected, wasSelected) => {
  if (selected && !wasSelected) {
    emit('select', props.itemData)
  } else if (!selected && wasSelected) {
    emit('deselect', props.itemData)
  }
})

// Auto-focus if this item becomes selected and no other item is focused
watch(isSelected, (selected) => {
  if (selected && !store.focusedId && elementRef.value) {
    elementRef.value.focus()
  }
})

// Scroll into view if this item is focused
watch(() => store.focusedId, (focusedId) => {
  if (focusedId === props.itemId && elementRef.value) {
    elementRef.value.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest'
    })
  }
})

onMounted(() => {
  // Add ARIA attributes
  if (elementRef.value) {
    elementRef.value.setAttribute('role', 'option')
    elementRef.value.setAttribute('aria-multiselectable', props.multiple.toString())
  }
})

// Expose methods for parent components
defineExpose({
  focus: () => elementRef.value?.focus(),
  blur: () => elementRef.value?.blur(),
  select: () => store.selectItem(props.itemId),
  deselect: () => store.removeFromSelection(props.itemId),
  toggle: () => store.toggleItem(props.itemId),
  isSelected,
  isFocused
})
</script>

<style scoped lang="scss">
.selectable-item {
  position: relative;
  cursor: pointer;
  user-select: none;
  transition: all 0.2s ease;
  border-radius: 6px;
  outline: none;

  &:not(.is-disabled) {
    &:hover {
      background-color: rgba(var(--v-theme-on-surface), 0.04);
    }

    &:focus-visible {
      outline: 2px solid rgb(var(--v-theme-primary));
      outline-offset: 2px;
    }
  }

  &.is-disabled {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
  }

  &.is-hovered:not(.is-disabled) {
    background-color: rgba(var(--v-theme-on-surface), 0.04);
  }

  &.is-selected {
    background-color: rgba(var(--v-theme-primary), 0.12);
    border: 1px solid rgba(var(--v-theme-primary), 0.5);

    &:hover {
      background-color: rgba(var(--v-theme-primary), 0.16);
    }
  }

  &.is-last-selected {
    border-color: rgb(var(--v-theme-primary));
    box-shadow: 0 0 0 1px rgb(var(--v-theme-primary));
  }

  &.is-anchor {
    &::after {
      content: '';
      position: absolute;
      top: 4px;
      left: 4px;
      width: 6px;
      height: 6px;
      background-color: rgb(var(--v-theme-primary));
      border-radius: 50%;
      z-index: 1;
    }
  }

  &.is-selection-mode {
    padding-left: 48px;

    .selection-checkbox {
      position: absolute;
      left: 12px;
      top: 50%;
      transform: translateY(-50%);
      z-index: 2;
    }
  }
}

.selection-indicator {
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background-color: rgb(var(--v-theme-primary));
  border-radius: 0 2px 2px 0;
  z-index: 1;
}

.selection-checkbox {
  :deep(.v-input) {
    flex: none;

    .v-input__control {
      height: auto;
    }

    .v-selection-control {
      min-height: auto;

      .v-selection-control__wrapper {
        height: 20px;
        width: 20px;
      }
    }
  }
}

.focus-ring {
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  border: 2px solid rgb(var(--v-theme-primary));
  border-radius: 8px;
  pointer-events: none;
  z-index: 1;
  opacity: 0.6;
}

// Animation for selection changes
.selectable-item {
  &.is-selected {
    animation: select-flash 0.3s ease;
  }
}

@keyframes select-flash {
  0% {
    background-color: rgba(var(--v-theme-primary), 0.3);
  }
  100% {
    background-color: rgba(var(--v-theme-primary), 0.12);
  }
}

// High contrast mode support
@media (prefers-contrast: high) {
  .selectable-item {
    &.is-selected {
      border: 2px solid rgb(var(--v-theme-primary));
      background-color: rgba(var(--v-theme-primary), 0.2);
    }
  }
}

// Reduced motion support
@media (prefers-reduced-motion: reduce) {
  .selectable-item {
    transition: none;
  }

  .selectable-item.is-selected {
    animation: none;
  }
}
</style>