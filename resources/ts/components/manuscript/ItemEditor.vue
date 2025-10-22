<template>
  <div class="item-editor">
    <!-- Header with title and save status -->
    <div class="editor-header">
      <EditableTitle
        v-model="localTitle"
        :manuscript-id="props.manuscriptId"
        :item-id="props.itemId"
        :show-metadata="true"
        :word-count="itemStore.state.currentItem?.word_count"
        :character-count="itemStore.state.currentItem?.character_count"
        @contextmenu="handleContextMenu"
        @touchstart="handleTouchStart"
        @touchend="handleTouchEnd"
        @touchmove="handleTouchMove"
        @title-saved="handleTitleSaved"
      />

      <div class="editor-actions">
        <!-- Save Status Indicator -->
        <div class="save-status" :class="`status-${itemStore.state.saveStatus}`">
          <VIcon
            v-if="itemStore.state.saveStatus === 'saving'"
            icon="bx-loader-alt"
            size="16"
            class="rotating"
          />
          <VIcon
            v-else-if="itemStore.state.saveStatus === 'saved'"
            icon="bx-check"
            size="16"
            color="success"
          />
          <VIcon
            v-else-if="itemStore.state.saveStatus === 'error'"
            icon="bx-error"
            size="16"
            color="error"
          />
          <span class="save-text">{{ saveStatusText }}</span>
        </div>

        <!-- Auto-save Toggle -->
        <VTooltip text="Toggle auto-save">
          <template #activator="{ props }">
            <VBtn
              v-bind="props"
              icon
              size="small"
              variant="text"
              :color="itemStore.state.autoSaveEnabled ? 'primary' : 'default'"
              @click="itemStore.toggleAutoSave"
            >
              <VIcon :icon="itemStore.state.autoSaveEnabled ? 'bx-save' : 'bx-save'" />
            </VBtn>
          </template>
        </VTooltip>

        <!-- Manual Save Button -->
        <VBtn
          v-if="itemStore.canSave"
          size="small"
          color="primary"
          :loading="itemStore.isLoading"
          @click="itemStore.saveManually"
        >
          Save
        </VBtn>
      </div>
    </div>

    <!-- Error Alert -->
    <VAlert
      v-if="itemStore.state.error"
      type="error"
      variant="tonal"
      closable
      class="mb-4"
      @click:close="itemStore.clearError"
    >
      {{ itemStore.state.error }}
    </VAlert>

    <!-- Editor Content -->
    <div class="editor-content">
      <TiptapEditor
        v-if="localContent !== null"
        v-model="localContent"
        placeholder="Start writing your content..."
        :is-divider="false"
        @update:model-value="handleContentChange"
      />

      <!-- Loading State -->
      <div v-else class="editor-loading">
        <VProgressCircular
          indeterminate
          size="32"
          color="primary"
        />
        <span>Loading content...</span>
      </div>
    </div>


    <!-- Synopsis/Notes Section -->
    <div v-if="showSynopsis" class="synopsis-section">
      <VDivider class="my-4" />
      <VTextarea
        v-model="localSynopsis"
        label="Synopsis / Notes"
        variant="outlined"
        placeholder="Add notes or synopsis for this item..."
        rows="3"
        hide-details
        class="editor-field"
        @update:model-value="handleSynopsisChange"
        @contextmenu="handleContextMenu"
        @touchstart="handleTouchStart"
        @touchend="handleTouchEnd"
        @touchmove="handleTouchMove"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useItemStore } from '@/stores/item'
import { useContextMenu } from '@/composables/useContextMenu'
import { getEditorMenuItems } from '@/config/contextMenus/editorMenus'
import TiptapEditor from '@/@core/components/TiptapEditor.vue'
import EditableTitle from '@/components/item/EditableTitle.vue'

interface Props {
  manuscriptId: number
  itemId: number
  showSynopsis?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showSynopsis: false
})

const route = useRoute()
const itemStore = useItemStore()
const contextMenu = useContextMenu()

// Local reactive state for the editor
const localTitle = ref('')
const localContent = ref<string | null>(null)
const localSynopsis = ref('')

// Computed
const saveStatusText = computed(() => {
  switch (itemStore.state.saveStatus) {
    case 'saving':
      return 'Saving...'
    case 'saved':
      return 'Saved'
    case 'error':
      return 'Save failed'
    default:
      return itemStore.state.autoSaveEnabled ? 'Auto-save on' : 'Auto-save off'
  }
})

// Debounced handlers to prevent excessive API calls
let contentTimeout: NodeJS.Timeout | null = null
let synopsisTimeout: NodeJS.Timeout | null = null

const handleTitleSaved = (newTitle: string) => {
  console.log('Title saved:', newTitle)
}

const handleContentChange = (newContent: string) => {
  if (contentTimeout) clearTimeout(contentTimeout)

  contentTimeout = setTimeout(() => {
    itemStore.updateContent(newContent)
  }, 800)
}

const handleSynopsisChange = (newSynopsis: string) => {
  if (synopsisTimeout) clearTimeout(synopsisTimeout)

  synopsisTimeout = setTimeout(() => {
    // Update synopsis if item store supports it
    // For now, we'll just log it
    console.log('Synopsis updated:', newSynopsis)
  }, 1000)
}

// Watch for changes from the store to update local state
watch(() => itemStore.state.currentItem, (newItem) => {
  if (newItem) {
    localTitle.value = newItem.title
    localContent.value = newItem.content || ''
    localSynopsis.value = newItem.synopsis || ''
  }
}, { immediate: true })

// Load the item when component mounts
onMounted(async () => {
  console.log('ItemEditor mounted, loading item:', props.itemId)
  await itemStore.loadItem(props.manuscriptId, props.itemId)
})

// Watch for prop changes to reload item when navigating
watch([() => props.manuscriptId, () => props.itemId], async ([newManuscriptId, newItemId], [oldManuscriptId, oldItemId]) => {
  // Only reload if the IDs actually changed
  if (newManuscriptId !== oldManuscriptId || newItemId !== oldItemId) {
    console.log('ItemEditor props changed, loading new item:', newItemId)
    await itemStore.loadItem(newManuscriptId, newItemId)
  }
}, { immediate: false })

// Cleanup when component unmounts
onUnmounted(() => {
  if (contentTimeout) clearTimeout(contentTimeout)
  if (synopsisTimeout) clearTimeout(synopsisTimeout)
})

// Context menu handler
const handleContextMenu = (event: MouseEvent) => {
  event.preventDefault()
  event.stopPropagation()

  // Get selected text
  const selection = window.getSelection()?.toString()
  const menuItems = getEditorMenuItems(selection)

  if (menuItems.length > 0) {
    contextMenu.show(event, {
      items: menuItems,
      context: { selection }
    })
  }
}

// Touch handlers for mobile long-press
let longPressTimer: NodeJS.Timeout | null = null
const LONG_PRESS_DURATION = 500

const handleTouchStart = (event: TouchEvent) => {
  longPressTimer = setTimeout(() => {
    handleContextMenu(event as any)
  }, LONG_PRESS_DURATION)
}

const handleTouchEnd = () => {
  if (longPressTimer) {
    clearTimeout(longPressTimer)
    longPressTimer = null
  }
}

const handleTouchMove = () => {
  if (longPressTimer) {
    clearTimeout(longPressTimer)
    longPressTimer = null
  }
}

// Keyboard shortcuts
const handleKeydown = (event: KeyboardEvent) => {
  // Ctrl/Cmd + S for manual save
  if ((event.ctrlKey || event.metaKey) && event.key === 's') {
    event.preventDefault()
    if (itemStore.canSave) {
      itemStore.saveManually()
    }
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)

  // Add context menu listeners to the editor content area
  const editorContent = document.querySelector('.editor-content')
  if (editorContent) {
    editorContent.addEventListener('contextmenu', handleContextMenu)
    editorContent.addEventListener('touchstart', handleTouchStart as any)
    editorContent.addEventListener('touchend', handleTouchEnd)
    editorContent.addEventListener('touchmove', handleTouchMove)
  }
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)

  // Clean up context menu listeners
  const editorContent = document.querySelector('.editor-content')
  if (editorContent) {
    editorContent.removeEventListener('contextmenu', handleContextMenu)
    editorContent.removeEventListener('touchstart', handleTouchStart as any)
    editorContent.removeEventListener('touchend', handleTouchEnd)
    editorContent.removeEventListener('touchmove', handleTouchMove)
  }

  if (longPressTimer) {
    clearTimeout(longPressTimer)
  }
})
</script>

<style scoped lang="scss">
.item-editor {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 16px 24px;
  border-bottom: 1px solid rgb(var(--v-theme-surface-variant));
  gap: 16px;
}


.editor-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.save-status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: rgb(var(--v-theme-on-surface-variant));

  &.status-saving {
    color: rgb(var(--v-theme-primary));
  }

  &.status-saved {
    color: rgb(var(--v-theme-success));
  }

  &.status-error {
    color: rgb(var(--v-theme-error));
  }

  .save-text {
    font-weight: 500;
  }
}

.rotating {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.editor-content {
  flex: 1;
  padding: 0 24px;
  overflow-y: auto;

  :deep(.ProseMirror) {
    min-height: 50vh;
    padding: 16px 0;
    font-size: 16px;
    line-height: 1.6;
  }
}

.editor-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  gap: 16px;
  color: rgb(var(--v-theme-on-surface-variant));
}

.synopsis-section {
  padding: 0 24px 24px;
}
</style>