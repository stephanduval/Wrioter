<template>
  <SelectableItem
    :item-id="card.id"
    :item-data="card"
    :disabled="disabled"
    class="corkboard-card-wrapper"
    @select="handleSelect"
    @context-menu="handleContextMenu"
  >
    <DraggableItem
      :type="DragType.CARD"
      :data="{ cardId: card.id, card }"
      :disabled="disabled || isSelectionMode"
      :preview="dragPreview"
      @drag-start="handleDragStart"
      @drag-end="handleDragEnd"
    >
      <VCard
        ref="cardRef"
        class="corkboard-card"
        :class="{
          'is-selected': isSelected,
          'is-dragging': isDragging,
          'is-disabled': disabled,
          [`size-${size}`]: true,
          [`status-${card.status}`]: true,
          'has-custom-color': card.metadata?.color
        }"
        :style="cardStyle"
        :data-card-id="card.id"
        :elevation="elevation"
        @click="handleClick"
        @dblclick="handleDoubleClick"
      >
        <!-- Status indicator -->
        <div
          class="status-indicator"
          :class="`status-${card.status}`"
        />

        <!-- Card header -->
        <VCardTitle class="card-title">
          <div class="title-content">
            <h3 class="text-subtitle-1 font-weight-medium">
              {{ card.title }}
            </h3>

            <!-- Compile indicator -->
            <VIcon
              v-if="card.includeInCompile"
              icon="bx-check-circle"
              size="small"
              color="success"
              class="compile-indicator"
            />
          </div>
        </VCardTitle>

        <!-- Card content -->
        <VCardText class="card-content">
          <!-- Synopsis -->
          <div
            v-if="showSynopsis && card.synopsis"
            class="synopsis"
          >
            {{ truncatedSynopsis }}
          </div>

          <!-- Content excerpt -->
          <div
            v-else-if="showExcerpt && card.content"
            class="excerpt"
          >
            {{ truncatedContent }}
          </div>

          <!-- Metadata view -->
          <div
            v-else-if="showMetadata"
            class="metadata-content"
          >
            <div class="metadata-row">
              <VIcon icon="bx-text" size="small" />
              <span>{{ card.wordCount }} words</span>
            </div>
            <div class="metadata-row">
              <VIcon icon="bx-calendar" size="small" />
              <span>{{ formatDate(card.updatedAt) }}</span>
            </div>
            <div
              v-if="card.labels?.length"
              class="metadata-row"
            >
              <VIcon icon="bx-tag" size="small" />
              <span>{{ card.labels.join(', ') }}</span>
            </div>
          </div>
        </VCardText>

        <!-- Card footer -->
        <div
          v-if="showFooter"
          class="card-footer"
        >
          <!-- Word count -->
          <div
            v-if="showWordCount"
            class="word-count"
          >
            <VIcon icon="bx-text" size="x-small" />
            <span class="text-caption">{{ card.wordCount }}</span>
          </div>

          <!-- Labels -->
          <div
            v-if="showLabels && card.labels?.length"
            class="labels"
          >
            <VChip
              v-for="label in visibleLabels"
              :key="label"
              size="x-small"
              variant="outlined"
              class="label-chip"
            >
              {{ label }}
            </VChip>
          </div>

          <!-- Status badge -->
          <VChip
            v-if="showStatus"
            :color="statusColor"
            size="x-small"
            variant="flat"
            class="status-chip"
          >
            {{ statusLabel }}
          </VChip>
        </div>

        <!-- Drag handle -->
        <div
          v-if="!isSelectionMode"
          v-bind="dragHandleProps"
          class="drag-handle"
        >
          <VIcon icon="bx-grid-vertical" size="small" />
        </div>

        <!-- Selection overlay -->
        <div
          v-if="isSelected"
          class="selection-overlay"
        />
      </VCard>
    </DraggableItem>
  </SelectableItem>
</template>

<script setup lang="ts">
import { ref, computed, toRefs } from 'vue'
import {
  VCard,
  VCardTitle,
  VCardText,
  VIcon,
  VChip
} from 'vuetify/components'

import DraggableItem from '../drag-drop/DraggableItem.vue'
import SelectableItem from '../selection/SelectableItem.vue'

import { DragType } from '@/composables/useDragDrop'
import { useSelectionStore } from '@/stores/selection'
import { useCorkboardStore } from '@/stores/corkboard'
import type { CorkboardCard } from '@/api/corkboard'

interface Props {
  card: CorkboardCard
  size?: 'small' | 'medium' | 'large'
  displayMode?: 'synopsis' | 'excerpt' | 'metadata'
  disabled?: boolean
  showWordCount?: boolean
  showStatus?: boolean
  showLabels?: boolean
  maxLabels?: number
}

interface Emits {
  (e: 'select', cardId: string): void
  (e: 'edit', cardId: string): void
  (e: 'context-menu', payload: { cardIds: string[]; event: MouseEvent }): void
}

const props = withDefaults(defineProps<Props>(), {
  size: 'medium',
  displayMode: 'synopsis',
  disabled: false,
  showWordCount: true,
  showStatus: true,
  showLabels: true,
  maxLabels: 2
})

const emit = defineEmits<Emits>()

const cardRef = ref<HTMLElement>()
const isDragging = ref(false)

const selectionStore = useSelectionStore()
const corkboardStore = useCorkboardStore()

// Computed properties
const isSelected = computed(() => selectionStore.isSelected(props.card.id))
const isSelectionMode = computed(() => selectionStore.isSelectionMode)

const showSynopsis = computed(() => props.displayMode === 'synopsis')
const showExcerpt = computed(() => props.displayMode === 'excerpt')
const showMetadata = computed(() => props.displayMode === 'metadata')

const showFooter = computed(() =>
  props.showWordCount || props.showLabels || props.showStatus
)

const truncatedSynopsis = computed(() => {
  if (!props.card.synopsis) return ''

  const maxLength = props.size === 'small' ? 80 : props.size === 'large' ? 200 : 120
  return props.card.synopsis.length > maxLength
    ? props.card.synopsis.substring(0, maxLength) + '...'
    : props.card.synopsis
})

const truncatedContent = computed(() => {
  if (!props.card.content) return ''

  // Strip HTML tags and get plain text
  const plainText = props.card.content.replace(/<[^>]*>/g, '')
  const maxLength = props.size === 'small' ? 100 : props.size === 'large' ? 300 : 150

  return plainText.length > maxLength
    ? plainText.substring(0, maxLength) + '...'
    : plainText
})

const visibleLabels = computed(() => {
  if (!props.card.labels) return []
  return props.card.labels.slice(0, props.maxLabels)
})

const statusColor = computed(() => {
  switch (props.card.status) {
    case 'todo': return 'grey'
    case 'draft': return 'orange'
    case 'review': return 'blue'
    case 'done': return 'green'
    default: return 'grey'
  }
})

const statusLabel = computed(() => {
  switch (props.card.status) {
    case 'todo': return 'To Do'
    case 'draft': return 'Draft'
    case 'review': return 'Review'
    case 'done': return 'Done'
    default: return 'Unknown'
  }
})

const elevation = computed(() => {
  if (isDragging.value) return 8
  if (isSelected.value) return 4
  return 2
})

const cardStyle = computed(() => {
  const style: any = {}

  // Custom color from metadata
  if (props.card.metadata?.color) {
    style.borderLeft = `4px solid ${props.card.metadata.color}`
  }

  // Size-based dimensions
  switch (props.size) {
    case 'small':
      style.minHeight = '120px'
      style.maxHeight = '160px'
      break
    case 'large':
      style.minHeight = '200px'
      style.maxHeight = '300px'
      break
    default:
      style.minHeight = '160px'
      style.maxHeight = '220px'
  }

  return style
})

const dragPreview = computed(() => ({
  type: 'element' as const,
  element: cardRef.value,
  offset: { x: 10, y: 10 }
}))

const dragHandleProps = computed(() => ({
  class: 'drag-handle',
  'data-drag-handle': true
}))

// Event handlers
const handleClick = (event: MouseEvent) => {
  if (event.detail === 1) {
    // Single click - selection handled by SelectableItem
    emit('select', props.card.id)
  }
}

const handleDoubleClick = () => {
  emit('edit', props.card.id)
}

const handleSelect = () => {
  emit('select', props.card.id)
}

const handleContextMenu = (payload: { itemIds: string[]; event: MouseEvent }) => {
  emit('context-menu', payload)
}

const handleDragStart = () => {
  isDragging.value = true
}

const handleDragEnd = () => {
  isDragging.value = false
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric'
  }).format(date)
}
</script>

<style scoped lang="scss">
.corkboard-card-wrapper {
  width: 100%;
  height: 100%;
}

.corkboard-card {
  position: relative;
  width: 100%;
  height: 100%;
  transition: all 0.2s ease;
  cursor: pointer;
  overflow: hidden;

  &:hover {
    transform: translateY(-2px);
  }

  &.is-selected {
    border: 2px solid rgb(var(--v-theme-primary));
    background-color: rgba(var(--v-theme-primary), 0.04);
  }

  &.is-dragging {
    transform: rotate(2deg) scale(1.05);
    opacity: 0.8;
    z-index: 1000;
  }

  &.is-disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  // Size variants
  &.size-small {
    .card-title {
      padding: 8px 12px 4px;

      .text-subtitle-1 {
        font-size: 0.875rem;
        line-height: 1.2;
      }
    }

    .card-content {
      padding: 4px 12px 8px;
      font-size: 0.75rem;
    }

    .card-footer {
      padding: 4px 12px 8px;
    }
  }

  &.size-large {
    .card-title {
      padding: 20px 20px 8px;
    }

    .card-content {
      padding: 8px 20px 16px;
      font-size: 0.875rem;
    }

    .card-footer {
      padding: 8px 20px 16px;
    }
  }

  // Status-based styling
  &.status-todo {
    .status-indicator {
      background-color: rgb(var(--v-theme-grey));
    }
  }

  &.status-draft {
    .status-indicator {
      background-color: rgb(var(--v-theme-orange));
    }
  }

  &.status-review {
    .status-indicator {
      background-color: rgb(var(--v-theme-blue));
    }
  }

  &.status-done {
    .status-indicator {
      background-color: rgb(var(--v-theme-green));
    }
  }
}

.status-indicator {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  z-index: 1;
}

.card-title {
  padding: 16px 16px 8px;

  .title-content {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 8px;
    width: 100%;

    h3 {
      flex: 1;
      line-height: 1.3;
      overflow: hidden;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }

    .compile-indicator {
      flex-shrink: 0;
      margin-top: 2px;
    }
  }
}

.card-content {
  padding: 8px 16px 16px;
  flex: 1;
  overflow: hidden;

  .synopsis,
  .excerpt {
    color: rgb(var(--v-theme-on-surface-variant));
    font-size: 0.8125rem;
    line-height: 1.4;
    overflow: hidden;
    display: -webkit-box;
    -webkit-box-orient: vertical;
  }

  .synopsis {
    -webkit-line-clamp: 4;
  }

  .excerpt {
    -webkit-line-clamp: 5;
  }

  .metadata-content {
    display: flex;
    flex-direction: column;
    gap: 6px;

    .metadata-row {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.75rem;
      color: rgb(var(--v-theme-on-surface-variant));
    }
  }
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px 16px;
  gap: 8px;
  flex-wrap: wrap;

  .word-count {
    display: flex;
    align-items: center;
    gap: 4px;
    color: rgb(var(--v-theme-on-surface-variant));
  }

  .labels {
    display: flex;
    gap: 4px;
    flex-wrap: wrap;
    flex: 1;
    min-width: 0;

    .label-chip {
      font-size: 0.625rem;
      height: 20px;
    }
  }

  .status-chip {
    font-size: 0.625rem;
    height: 20px;
    flex-shrink: 0;
  }
}

.drag-handle {
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 4px;
  background-color: rgba(var(--v-theme-on-surface), 0.04);
  opacity: 0;
  transition: opacity 0.2s ease;
  cursor: grab;

  &:hover {
    background-color: rgba(var(--v-theme-on-surface), 0.08);
  }

  &:active {
    cursor: grabbing;
  }
}

.corkboard-card:hover .drag-handle {
  opacity: 1;
}

.selection-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(var(--v-theme-primary), 0.1);
  border: 2px solid rgb(var(--v-theme-primary));
  border-radius: inherit;
  pointer-events: none;
  z-index: 2;
}

// Animation for status changes
.corkboard-card {
  &.status-changing {
    animation: status-pulse 0.3s ease;
  }
}

@keyframes status-pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.02);
  }
}

// Mobile responsive
@media (max-width: 768px) {
  .corkboard-card {
    &:hover {
      transform: none;
    }

    .drag-handle {
      opacity: 1;
    }
  }
}

// High contrast mode
@media (prefers-contrast: high) {
  .corkboard-card {
    border: 1px solid rgb(var(--v-theme-outline));

    &.is-selected {
      border-width: 3px;
    }
  }
}

// Reduced motion
@media (prefers-reduced-motion: reduce) {
  .corkboard-card {
    transition: none;

    &:hover {
      transform: none;
    }

    &.is-dragging {
      transform: scale(1.02);
    }
  }

  .drag-handle {
    transition: none;
  }
}
</style>