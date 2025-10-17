<template>
  <div
    class="tab-drag-overlay"
    :style="{
      left: `${pointerPosition.x + 10}px`,
      top: `${pointerPosition.y + 10}px`
    }"
  >
    <div class="drag-preview">
      <VIcon
        v-if="tab.type === 'editor'"
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

      <span class="tab-title">{{ tab.title }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Tab } from '@/types/splitView'

defineProps<{
  tab: Tab
  pointerPosition: { x: number; y: number }
}>()
</script>

<style lang="scss" scoped>
.tab-drag-overlay {
  position: fixed;
  pointer-events: none;
  z-index: 10000;
}

.drag-preview {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgba(var(--v-border-color), 0.12);
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  opacity: 0.9;
}

.tab-icon {
  color: rgba(var(--v-theme-on-surface), 0.6);
}

.tab-title {
  font-size: 13px;
  white-space: nowrap;
}
</style>
