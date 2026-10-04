<template>
  <VCard
    :data-snippet-id="snippet.id"
    class="snippet-card"
    :class="{
      'is-ghost': snippet.status === 'ghost',
      'is-selected': isSelected,
    }"
    :elevation="isSelected ? 4 : 1"
    @click="handleClick"
  >
    <!-- Source reference header -->
    <VCardTitle class="snippet-header">
      <div class="source-info">
        <VIcon icon="bx-file" size="small" class="me-2" />
        <span class="source-title">
          {{ snippet.source_item_title || 'Unknown Source' }}
        </span>
      </div>
      <SnippetStatusBadge :status="snippet.status" />
    </VCardTitle>

    <!-- Snippet text content -->
    <VCardText class="snippet-content">
      <blockquote class="snippet-text" :class="{ 'text-ghost': snippet.status === 'ghost' }">
        {{ displayText }}
      </blockquote>
    </VCardText>

    <!-- Actions footer -->
    <VCardActions class="snippet-actions">
      <VBtn
        v-if="snippet.source_item_id"
        variant="text"
        size="small"
        color="primary"
        prepend-icon="bx-link-external"
        @click.stop="handleNavigate"
      >
        Go to Source
      </VBtn>
      <VSpacer />
      <VBtn
        icon
        variant="text"
        size="small"
        color="error"
        @click.stop="handleDelete"
      >
        <VIcon icon="bx-trash" />
        <VTooltip activator="parent" location="top">Delete snippet</VTooltip>
      </VBtn>
    </VCardActions>
  </VCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  VCard,
  VCardTitle,
  VCardText,
  VCardActions,
  VIcon,
  VBtn,
  VSpacer,
  VTooltip,
} from 'vuetify/components'
import SnippetStatusBadge from './SnippetStatusBadge.vue'
import type { SnippetReference } from '@/api/snippets'

interface Props {
  snippet: SnippetReference
  manuscriptId: number
  isSelected?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isSelected: false,
})

const emit = defineEmits<{
  (e: 'click', snippet: SnippetReference): void
  (e: 'delete', snippetId: number): void
  (e: 'navigate', sourceItemId: number): void
}>()

const router = useRouter()

// Display the current text (auto-updated) or reference text for ghosts
const displayText = computed(() => {
  if (props.snippet.status === 'ghost') {
    return props.snippet.current_text || props.snippet.reference_text
  }
  return props.snippet.reference_text
})

const handleClick = () => {
  emit('click', props.snippet)
}

const handleNavigate = () => {
  if (props.snippet.source_item_id) {
    emit('navigate', props.snippet.source_item_id)
    // Navigate to the source item
    router.push({
      name: 'manuscripts-manuscriptId-items-itemId-edit',
      params: {
        manuscriptId: props.manuscriptId,
        itemId: props.snippet.source_item_id,
      },
    })
  }
}

const handleDelete = () => {
  emit('delete', props.snippet.id)
}
</script>

<style scoped lang="scss">
.snippet-card {
  transition: all 0.2s ease;
  border-left: 3px solid rgb(var(--v-theme-primary));

  &.is-ghost {
    border-left-color: rgb(var(--v-theme-grey));
    opacity: 0.75;
  }

  &.is-selected {
    border-left-width: 4px;
    border-left-color: rgb(var(--v-theme-primary));
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
}

.snippet-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-block: 12px;
  padding-inline: 16px;
  font-size: 0.875rem;

  .source-info {
    display: flex;
    align-items: center;
    overflow: hidden;
  }

  .source-title {
    overflow: hidden;
    font-weight: 500;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.snippet-content {
  padding-block: 8px;
  padding-inline: 16px;
}

.snippet-text {
  padding: 12px 16px;
  margin: 0;
  font-style: italic;
  line-height: 1.6;
  background-color: rgba(var(--v-theme-surface-variant), 0.5);
  border-inline-start: 3px solid rgb(var(--v-theme-primary));
  border-radius: 4px;

  &.text-ghost {
    text-decoration: line-through;
    opacity: 0.7;
    border-inline-start-color: rgb(var(--v-theme-grey));
  }
}

.snippet-actions {
  padding-block: 8px;
  padding-inline: 8px;
}
</style>
