<template>
  <div
    class="tab"
    :class="{
      'is-active': isActive,
      'is-dirty': tab.isDirty,
      'is-pinned': tab.isPinned,
      'is-dragging': isDragging
    }"
    :draggable="!tab.isPinned"
    @click="$emit('select')"
    @dragstart="handleDragStart"
    @dragend="$emit('drag-end')"
    @mouseenter="showCloseButton = true"
    @mouseleave="showCloseButton = false"
  >
    <VIcon
      v-if="tab.isPinned"
      size="x-small"
      class="tab-pin-icon"
    >
      mdi-pin
    </VIcon>

    <VIcon
      v-else-if="tab.type === 'editor' || tab.type === 'edit'"
      size="small"
      class="tab-icon"
    >
      mdi-file-document-outline
    </VIcon>

    <VIcon
      v-else-if="tab.type === 'corkboard'"
      size="small"
      class="tab-icon"
    >
      mdi-view-grid
    </VIcon>

    <VIcon
      v-else-if="tab.type === 'manuscript'"
      size="small"
      class="tab-icon"
    >
      mdi-script-text-outline
    </VIcon>

    <VIcon
      v-else-if="tab.type === 'outline'"
      size="small"
      class="tab-icon"
    >
      mdi-format-list-text
    </VIcon>

    <VIcon
      v-else-if="tab.type === 'mindmap'"
      size="small"
      class="tab-icon"
    >
      mdi-graph-outline
    </VIcon>

    <VIcon
      v-else-if="tab.type === 'item'"
      size="small"
      class="tab-icon"
    >
      mdi-file-edit-outline
    </VIcon>

    <span class="tab-title">
      {{ tab.title }}
    </span>

    <div
      v-if="tab.isDirty"
      class="tab-dirty-indicator"
    />

    <VBtn
      v-if="showCloseButton && !tab.isPinned"
      icon
      size="x-small"
      variant="text"
      class="tab-close-button"
      @click.stop="$emit('close')"
    >
      <VIcon size="x-small">mdi-close</VIcon>
    </VBtn>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Tab } from '@/types/splitView'

const props = defineProps<{
  tab: Tab
  isActive: boolean
  isDragging: boolean
}>()

const emit = defineEmits<{
  select: []
  close: []
  'drag-start': [event: DragEvent]
  'drag-end': []
}>()

const showCloseButton = ref(false)

function handleDragStart(event: DragEvent) {
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('tab-id', props.tab.id)
  }
  emit('drag-start', event)
}
</script>

<style lang="scss" scoped>
.tab {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  height: 28px;
  min-width: 120px;
  max-width: 200px;
  background: rgba(var(--v-theme-surface-variant), 0.4);
  border: 1px solid transparent;
  border-radius: 4px 4px 0 0;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;

  &:hover {
    background: rgba(var(--v-theme-surface-variant), 0.8);
  }

  &.is-active {
    background: rgb(var(--v-theme-surface));
    border-color: rgba(var(--v-border-color), 0.12);
    border-bottom-color: transparent;
  }

  &.is-dragging {
    opacity: 0.5;
  }

  &.is-pinned {
    min-width: 40px;
    max-width: 40px;
    justify-content: center;

    .tab-title {
      display: none;
    }
  }
}

.tab-icon,
.tab-pin-icon {
  flex-shrink: 0;
  color: rgba(var(--v-theme-on-surface), 0.6);
}

.tab-title {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 13px;
}

.tab-dirty-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgb(var(--v-theme-warning));
  flex-shrink: 0;
}

.tab-close-button {
  flex-shrink: 0;
  margin-left: auto;
  opacity: 0.7;

  &:hover {
    opacity: 1;
  }
}
</style>
