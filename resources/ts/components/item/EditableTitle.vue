<template>
  <div class="editor-header-main">
    <VTextField
      v-model="localTitle"
      variant="plain"
      :placeholder="placeholder"
      class="editor-title editor-field"
      hide-details
      @update:model-value="handleTitleChange"
      @contextmenu="$emit('contextmenu', $event)"
      @touchstart="$emit('touchstart', $event)"
      @touchend="$emit('touchend', $event)"
      @touchmove="$emit('touchmove', $event)"
    />

    <div v-if="showMetadata" class="editor-metadata">
      <span v-if="wordCount" class="word-count">
        {{ wordCount }} words
      </span>
      <span v-if="characterCount" class="char-count">
        {{ characterCount }} characters
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useItemStore } from '@/stores/item'
import { useManuscriptStore } from '@/stores/manuscript'

interface Props {
  modelValue: string
  manuscriptId: number
  itemId: number
  placeholder?: string
  showMetadata?: boolean
  wordCount?: number
  characterCount?: number
  debounceMs?: number
  autoRefreshNav?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Enter title...',
  showMetadata: false,
  debounceMs: 500,
  autoRefreshNav: true
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'titleSaved', value: string): void
  (e: 'contextmenu', event: MouseEvent): void
  (e: 'touchstart', event: TouchEvent): void
  (e: 'touchend', event: TouchEvent): void
  (e: 'touchmove', event: TouchEvent): void
}>()

const itemStore = useItemStore()
const manuscriptStore = useManuscriptStore()

const localTitle = ref(props.modelValue)

// Watch for external changes to modelValue
watch(() => props.modelValue, (newValue) => {
  localTitle.value = newValue
})

// Debounced handler to prevent excessive API calls
let titleTimeout: NodeJS.Timeout | null = null

const handleTitleChange = async (newTitle: string) => {
  // Emit the change immediately for v-model binding
  emit('update:modelValue', newTitle)

  if (titleTimeout) clearTimeout(titleTimeout)

  titleTimeout = setTimeout(async () => {
    // Update title in the item store
    await itemStore.updateTitle(newTitle)

    // Refresh the navigation tree if auto-refresh is enabled
    if (props.autoRefreshNav && manuscriptStore.selectedManuscriptId) {
      await manuscriptStore.fetchManuscriptItems(manuscriptStore.selectedManuscriptId)
    }

    // Emit save event
    emit('titleSaved', newTitle)
  }, props.debounceMs)
}

// Cleanup timeout on unmount
import { onUnmounted } from 'vue'
onUnmounted(() => {
  if (titleTimeout) clearTimeout(titleTimeout)
})
</script>

<style scoped lang="scss">
.editor-header-main {
  flex: 1;
  min-width: 0;
}

.editor-title {
  :deep(.v-field__input) {
    font-size: 24px;
    font-weight: 600;
    line-height: 1.3;
    padding: 0;
  }

  :deep(.v-field__field) {
    padding: 0;
  }
}

.editor-metadata {
  display: flex;
  gap: 16px;
  margin-top: 4px;
  font-size: 13px;
  color: rgb(var(--v-theme-on-surface-variant));

  .word-count,
  .char-count {
    font-weight: 500;
  }
}
</style>
