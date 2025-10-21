<template>
  <div
    ref="gridRef"
    class="corkboard-grid"
    :class="[
      `zoom-${viewConfig.zoom}`,
      `layout-${viewConfig.layout}`,
      { 'has-selection': selectedIds.length > 0 }
    ]"
  >
    <TransitionGroup name="card-list">
      <CorkboardCard
        v-for="card in cards"
        :key="card.id"
        :card="card"
        :view-config="viewConfig"
        :is-selected="selectedIds.includes(card.id)"
        :position="cardPositions[card.id]"
        @select="handleCardSelect"
        @context-menu="handleContextMenu"
        @drag-start="handleDragStart"
        @drag-end="handleDragEnd"
      />
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { CorkboardCard as CardType, ViewConfig } from '@/api/corkboard'
import CorkboardCard from './CorkboardCard.vue'

interface Props {
  cards: CardType[]
  viewConfig: ViewConfig
  selectedIds: string[]
  cardPositions?: Record<string, { x: number; y: number }>
}

interface Emits {
  (e: 'card-select', cardId: string, options?: { additive?: boolean; range?: boolean }): void
  (e: 'card-reorder', operations: any[]): void
  (e: 'card-drop', draggedCardIds: string[], targetIndex: number, targetPosition?: any): void
  (e: 'context-menu', cardIds: string[], event: MouseEvent): void
}

const props = withDefaults(defineProps<Props>(), {
  cardPositions: () => ({})
})

const emit = defineEmits<Emits>()

const gridRef = ref<HTMLElement>()
const draggedCards = ref<string[]>([])

// Handle card selection
const handleCardSelect = (cardId: string, event?: MouseEvent) => {
  const options = {
    additive: event?.ctrlKey || event?.metaKey,
    range: event?.shiftKey
  }
  emit('card-select', cardId, options)
}

// Handle context menu
const handleContextMenu = (cardId: string, event: MouseEvent) => {
  event.preventDefault()

  let targetCards = [cardId]

  // If right-clicking on a selected card, use all selected cards
  if (props.selectedIds.includes(cardId)) {
    targetCards = props.selectedIds
  }

  emit('context-menu', targetCards, event)
}

// Handle drag start
const handleDragStart = (cardId: string, event: DragEvent) => {
  // If dragging a selected card, drag all selected cards
  if (props.selectedIds.includes(cardId)) {
    draggedCards.value = props.selectedIds
  } else {
    draggedCards.value = [cardId]
  }

  // Set drag data
  event.dataTransfer!.effectAllowed = 'move'
  event.dataTransfer!.setData('text/plain', JSON.stringify(draggedCards.value))
}

// Handle drag end
const handleDragEnd = (cardId: string, event: DragEvent) => {
  draggedCards.value = []
}

// Watch for view config changes
watch(() => props.viewConfig, (newConfig) => {
  // Could trigger animations or layout recalculations here
}, { deep: true })
</script>

<style scoped lang="scss">
.corkboard-grid {
  display: grid;
  gap: 16px;
  padding: 16px;
  width: 100%;
  height: 100%;
  overflow: auto;

  // Grid layout
  &.layout-grid {
    &.zoom-small {
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    }

    &.zoom-medium {
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    }

    &.zoom-large {
      grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
    }
  }

  // Freeform layout (for future implementation)
  &.layout-freeform {
    position: relative;
    grid-template-columns: 1fr;
  }
}

// Card animations
.card-list-move,
.card-list-enter-active,
.card-list-leave-active {
  transition: all 0.3s ease;
}

.card-list-enter-from {
  opacity: 0;
  transform: scale(0.9) translateY(10px);
}

.card-list-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

.card-list-leave-active {
  position: absolute;
}

// Responsive
@media (max-width: 768px) {
  .corkboard-grid {
    gap: 12px;
    padding: 12px;

    &.layout-grid {
      &.zoom-small {
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      }

      &.zoom-medium {
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      }

      &.zoom-large {
        grid-template-columns: 1fr;
      }
    }
  }
}

// Reduced motion
@media (prefers-reduced-motion: reduce) {
  .corkboard-grid {
    * {
      transition: none !important;
      animation: none !important;
    }
  }
}
</style>
