<template>
  <div
    class="manuscript-item"
    :class="{ 'is-folder': item.type === 'folder' }"
    @click="handleClick"
  >
    <!-- Item Header -->
    <div class="item-header">
      <VIcon
        :icon="getItemIcon(item.type)"
        size="small"
        class="me-2"
      />
      <h2 class="item-title">{{ item.title }}</h2>

      <!-- Metadata Chips -->
      <div class="item-metadata">
        <VChip
          v-if="item.word_count"
          size="x-small"
          variant="tonal"
          class="ms-2"
        >
          {{ item.word_count.toLocaleString() }} words
        </VChip>

        <VChip
          v-if="item.metadata?.status"
          size="x-small"
          :color="getStatusColor(item.metadata.status)"
          variant="tonal"
          class="ms-2"
        >
          {{ item.metadata.status }}
        </VChip>
      </div>
    </div>

    <!-- Synopsis (if exists and no content) -->
    <div
      v-if="item.synopsis && !hasContent"
      class="item-synopsis"
    >
      <em>{{ item.synopsis }}</em>
    </div>

    <!-- Content -->
    <div
      v-if="hasContent"
      class="item-content"
      v-html="formattedContent"
    />

    <!-- Empty state for folders or empty items -->
    <div
      v-if="!hasContent && !item.synopsis"
      class="item-empty"
    >
      <em class="text-medium-emphasis">No content</em>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { FolderItem } from '@/stores/folderView'

const props = defineProps<{
  item: FolderItem
  fontSize?: 'small' | 'medium' | 'large'
  lineSpacing?: 'single' | '1.5' | 'double'
}>()

const emit = defineEmits<{
  click: []
}>()

// Computed
const hasContent = computed(() => {
  return props.item.content && props.item.content.trim().length > 0
})

const formattedContent = computed(() => {
  if (!props.item.content) return ''

  // Convert line breaks to paragraphs
  return props.item.content
    .split('\n\n')
    .map(para => `<p>${para.replace(/\n/g, '<br>')}</p>`)
    .join('')
})

// Methods
function getItemIcon(type: string): string {
  const iconMap: Record<string, string> = {
    folder: 'bx-folder',
    text: 'bx-file-doc',
    research: 'bx-search',
    character: 'bx-user',
    mindmap: 'bx-network-chart',
    image: 'bx-image',
    file: 'bx-file',
    link: 'bx-link'
  }
  return iconMap[type] || 'bx-file'
}

function getStatusColor(status: string): string {
  const colorMap: Record<string, string> = {
    draft: 'grey',
    in_progress: 'blue',
    review: 'orange',
    complete: 'green',
    done: 'green'
  }
  return colorMap[status] || 'grey'
}

function handleClick() {
  emit('click')
}
</script>

<style scoped>
.manuscript-item {
  margin-bottom: 2rem;
  cursor: pointer;
  transition: background-color 0.2s;
  padding: 1rem;
  margin-left: -1rem;
  margin-right: -1rem;
  border-radius: 4px;
}

.manuscript-item:hover {
  background-color: rgba(var(--v-theme-primary), 0.05);
}

.manuscript-item.is-folder {
  background-color: rgba(var(--v-theme-surface-variant), 0.3);
  border-left: 4px solid rgb(var(--v-theme-primary));
  padding-left: calc(1rem - 4px);
}

.item-header {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.item-title {
  font-size: 1.5em;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
  margin: 0;
  flex-shrink: 0;
}

.item-metadata {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.item-synopsis {
  margin-bottom: 1rem;
  padding: 0.75rem;
  background-color: rgba(var(--v-theme-surface-variant), 0.3);
  border-left: 3px solid rgb(var(--v-theme-secondary));
  border-radius: 4px;
  color: rgb(var(--v-theme-on-surface-variant));
}

.item-content {
  color: rgb(var(--v-theme-on-surface));
  text-align: justify;
}

.item-content :deep(p) {
  margin-bottom: 1em;
}

.item-content :deep(p:last-child) {
  margin-bottom: 0;
}

.item-empty {
  padding: 1rem;
  text-align: center;
  color: rgb(var(--v-theme-on-surface-variant));
}

/* Responsive */
@media (max-width: 600px) {
  .item-title {
    font-size: 1.25em;
  }

  .manuscript-item {
    padding: 0.75rem;
    margin-left: -0.75rem;
    margin-right: -0.75rem;
  }
}
</style>
