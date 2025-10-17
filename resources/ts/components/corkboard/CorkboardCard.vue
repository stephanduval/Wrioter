<template>
  <VCard
    :data-card-id="card.id"
    class="corkboard-card"
    :class="{
      'is-selected': isSelected,
      'is-dragging': isDragging,
      [`status-${card.status}`]: card.status,
      [`type-${card.type}`]: card.type
    }"
    :elevation="isSelected ? 8 : 2"
    :style="cardStyle"
    draggable="true"
    @click="handleClick"
    @contextmenu="handleContextMenu"
    @dragstart="handleDragStart"
    @dragend="handleDragEnd"
  >
    <!-- Status indicator -->
    <div
      v-if="card.status"
      class="status-indicator"
      :class="`status-${card.status}`"
    />

    <!-- Card header -->
    <VCardTitle class="card-title">
      <VIcon
        v-if="card.type"
        :icon="getTypeIcon(card.type)"
        size="small"
        class="me-2"
      />
      {{ card.title || 'Untitled' }}
    </VCardTitle>

    <!-- Card content based on display mode -->
    <VCardText class="card-content">
      <!-- Synopsis mode -->
      <div v-if="viewConfig.displayMode === 'synopsis' && card.synopsis" class="synopsis">
        {{ card.synopsis }}
      </div>

      <!-- Excerpt mode -->
      <div v-else-if="viewConfig.displayMode === 'excerpt' && card.excerpt" class="excerpt">
        {{ card.excerpt }}
      </div>

      <!-- Metadata mode -->
      <div v-else-if="viewConfig.displayMode === 'metadata'" class="metadata">
        <div v-if="card.word_count" class="metadata-item">
          <VIcon icon="bx-text" size="x-small" />
          <span>{{ card.word_count }} words</span>
        </div>
        <div v-if="card.status" class="metadata-item">
          <VIcon icon="bx-flag" size="x-small" />
          <span>{{ formatStatus(card.status) }}</span>
        </div>
        <div v-if="card.updated_at" class="metadata-item">
          <VIcon icon="bx-time" size="x-small" />
          <span>{{ formatDate(card.updated_at) }}</span>
        </div>
      </div>
    </VCardText>

    <!-- Card footer with actions -->
    <VCardActions v-if="isSelected" class="card-actions">
      <VBtn
        icon="bx-edit"
        size="x-small"
        variant="text"
        @click.stop="$emit('edit', card.id)"
      />
      <VSpacer />
      <VChip
        v-if="card.label"
        :color="card.color"
        size="x-small"
        variant="flat"
      >
        {{ card.label }}
      </VChip>
    </VCardActions>

    <!-- Selection indicator -->
    <div v-if="isSelected" class="selection-indicator">
      <VIcon icon="bx-check-circle" size="small" color="primary" />
    </div>
  </VCard>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { VCard, VCardTitle, VCardText, VCardActions, VIcon, VBtn, VChip, VSpacer } from 'vuetify/components'
import type { CorkboardCard, ViewConfig } from '@/api/corkboard'

interface Props {
  card: CorkboardCard
  viewConfig: ViewConfig
  isSelected: boolean
  position?: { x: number; y: number }
}

interface Emits {
  (e: 'select', cardId: string, event?: MouseEvent): void
  (e: 'context-menu', cardId: string, event: MouseEvent): void
  (e: 'drag-start', cardId: string, event: DragEvent): void
  (e: 'drag-end', cardId: string, event: DragEvent): void
  (e: 'edit', cardId: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const isDragging = ref(false)

// Card style (for freeform positioning)
const cardStyle = computed(() => {
  if (props.position && props.viewConfig.layout === 'freeform') {
    return {
      position: 'absolute',
      left: `${props.position.x}px`,
      top: `${props.position.y}px`
    }
  }
  return {}
})

// Get icon for item type
const getTypeIcon = (type: string): string => {
  const typeIcons: Record<string, string> = {
    folder: 'bx-folder',
    document: 'bx-file',
    scene: 'bx-file-doc',
    chapter: 'bx-book',
    character: 'bx-user',
    location: 'bx-map',
    note: 'bx-note'
  }
  return typeIcons[type] || 'bx-file'
}

// Format status
const formatStatus = (status: string): string => {
  return status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')
}

// Format date
const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - date.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  return date.toLocaleDateString()
}

// Event handlers
const handleClick = (event: MouseEvent) => {
  emit('select', props.card.id, event)
}

const handleContextMenu = (event: MouseEvent) => {
  emit('context-menu', props.card.id, event)
}

const handleDragStart = (event: DragEvent) => {
  isDragging.value = true
  emit('drag-start', props.card.id, event)
}

const handleDragEnd = (event: DragEvent) => {
  isDragging.value = false
  emit('drag-end', props.card.id, event)
}
</script>

<style scoped lang="scss">
.corkboard-card {
  position: relative;
  cursor: pointer;
  transition: all 0.2s ease;
  height: 100%;
  min-height: 180px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  &.is-selected {
    border: 2px solid rgb(var(--v-theme-primary));
  }

  &.is-dragging {
    opacity: 0.5;
  }

  // Status indicator
  .status-indicator {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;

    &.status-todo {
      background-color: rgb(var(--v-theme-info));
    }

    &.status-draft,
    &.status-in_progress {
      background-color: rgb(var(--v-theme-warning));
    }

    &.status-review {
      background-color: rgb(var(--v-theme-secondary));
    }

    &.status-done,
    &.status-completed {
      background-color: rgb(var(--v-theme-success));
    }

    &.status-archived {
      background-color: rgb(var(--v-theme-surface-variant));
    }
  }

  // Card title
  .card-title {
    padding-top: 12px;
    font-size: 1rem;
    font-weight: 500;
    line-height: 1.3;
    word-break: break-word;
  }

  // Card content
  .card-content {
    flex: 1;
    overflow: hidden;

    .synopsis,
    .excerpt {
      font-size: 0.875rem;
      line-height: 1.5;
      color: rgb(var(--v-theme-on-surface-variant));
      display: -webkit-box;
      -webkit-line-clamp: 4;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .metadata {
      display: flex;
      flex-direction: column;
      gap: 8px;

      .metadata-item {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 0.75rem;
        color: rgb(var(--v-theme-on-surface-variant));
      }
    }
  }

  // Card actions
  .card-actions {
    padding: 8px 12px;
    border-top: 1px solid rgb(var(--v-theme-surface-variant));
  }

  // Selection indicator
  .selection-indicator {
    position: absolute;
    top: 8px;
    right: 8px;
    background-color: rgb(var(--v-theme-surface));
    border-radius: 50%;
    padding: 2px;
  }
}

// Type-specific styling
.type-folder {
  background-color: rgba(var(--v-theme-primary), 0.05);
}

.type-character {
  background-color: rgba(var(--v-theme-secondary), 0.05);
}

// Reduced motion
@media (prefers-reduced-motion: reduce) {
  .corkboard-card {
    transition: none !important;

    &:hover {
      transform: none;
    }
  }
}
</style>
