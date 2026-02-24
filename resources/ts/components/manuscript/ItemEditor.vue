<template>
  <div class="item-editor" :data-item-id="props.itemId" :data-manuscript-id="props.manuscriptId">
    <!-- Header with title and save status -->
    <div class="editor-header">
      <EditableTitle
        v-model="localTitle"
        :manuscript-id="props.manuscriptId"
        :item-id="props.itemId"
        :show-metadata="true"
        :word-count="localItem?.word_count"
        :character-count="localItem?.character_count"
        @contextmenu="handleContextMenu"
        @touchstart="handleTouchStart"
        @touchend="handleTouchEnd"
        @touchmove="handleTouchMove"
        @title-saved="handleTitleSaved"
      />

      <div class="editor-actions">
        <!-- Save Status Indicator -->
        <div class="save-status" :class="`status-${saveStatus}`">
          <VIcon
            v-if="saveStatus === 'saving'"
            icon="bx-loader-alt"
            size="16"
            class="rotating"
          />
          <VIcon
            v-else-if="saveStatus === 'saved'"
            icon="bx-check"
            size="16"
            color="success"
          />
          <VIcon
            v-else-if="saveStatus === 'error'"
            icon="bx-error"
            size="16"
            color="error"
          />
          <span class="save-text">{{ saveStatusText }}</span>
        </div>

        <!-- Auto-save Toggle -->
        <VTooltip text="Toggle auto-save">
          <template #activator="{ props: tooltipProps }">
            <VBtn
              v-bind="tooltipProps"
              icon
              size="small"
              variant="text"
              :color="autoSaveEnabled ? 'primary' : 'default'"
              @click="autoSaveEnabled = !autoSaveEnabled"
            >
              <VIcon :icon="autoSaveEnabled ? 'bx-save' : 'bx-save'" />
            </VBtn>
          </template>
        </VTooltip>

        <!-- Manual Save Button -->
        <VBtn
          v-if="hasUnsavedChanges"
          size="small"
          color="primary"
          :loading="saveStatus === 'saving'"
          @click="saveManually"
        >
          Save
        </VBtn>
      </div>
    </div>

    <!-- Error Alert -->
    <VAlert
      v-if="error"
      type="error"
      variant="tonal"
      closable
      class="mb-4"
      @click:close="error = null"
    >
      {{ error }}
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
import { itemsApi, type Item, type ItemUpdatePayload } from '@/api/items'
import { dataSync } from '@/services/dataSync'
import { useContextMenu } from '@/composables/useContextMenu'
import { getEditorMenuItems, type EditorMenuContext } from '@/config/contextMenus/editorMenus'
import { ContextDetectionService } from '@/services/contextDetection'
import TiptapEditor from '@/@core/components/TiptapEditor.vue'
import EditableTitle from '@/components/item/EditableTitle.vue'

interface Props {
  manuscriptId: number
  itemId: number
  showSynopsis?: boolean
  paneId?: string
}

const props = withDefaults(defineProps<Props>(), {
  showSynopsis: false,
  paneId: undefined
})

const contextMenu = useContextMenu()

// ===== LOCAL STATE (per-instance, not shared) =====
const localItem = ref<Item | null>(null)
const localTitle = ref('')
const localContent = ref<string | null>(null)
const localSynopsis = ref('')
const originalContent = ref('')
const hasUnsavedChanges = ref(false)
const saveStatus = ref<'idle' | 'saving' | 'saved' | 'error'>('idle')
const autoSaveEnabled = ref(true)
const error = ref<string | null>(null)

// Computed
const saveStatusText = computed(() => {
  switch (saveStatus.value) {
    case 'saving':
      return 'Saving...'
    case 'saved':
      return 'Saved'
    case 'error':
      return 'Save failed'
    default:
      return autoSaveEnabled.value ? 'Auto-save on' : 'Auto-save off'
  }
})

// Debounced auto-save
const debouncedAutoSave = itemsApi.createDebouncedUpdate(2000)

// ===== ITEM LOADING (local, not via shared store) =====
const loadItem = async (manuscriptId: number, itemId: number) => {
  try {
    error.value = null
    saveStatus.value = 'saving' // Using 'saving' as loading indicator
    localContent.value = null // Show loading state

    const item = await itemsApi.getItem(manuscriptId, itemId)

    // Check that props haven't changed during the async call
    if (props.manuscriptId !== manuscriptId || props.itemId !== itemId) {
      console.log(`[ItemEditor${props.paneId ? ` pane:${props.paneId}` : ''}] Props changed during load, discarding result`)
      return
    }

    localItem.value = item
    localTitle.value = item.title
    localContent.value = item.content || ''
    localSynopsis.value = item.synopsis || ''
    originalContent.value = item.content || ''
    hasUnsavedChanges.value = false
    saveStatus.value = 'idle'

    console.log(`[ItemEditor${props.paneId ? ` pane:${props.paneId}` : ''}] Item loaded: ${item.title}`)
  } catch (err) {
    console.error(`[ItemEditor${props.paneId ? ` pane:${props.paneId}` : ''}] Failed to load item:`, err)
    error.value = err instanceof Error ? err.message : 'Failed to load item'
    saveStatus.value = 'error'
  }
}

// ===== CONTENT & SAVE HANDLERS =====
let contentTimeout: NodeJS.Timeout | null = null
let synopsisTimeout: NodeJS.Timeout | null = null

const handleTitleSaved = (newTitle: string) => {
  console.log(`[ItemEditor${props.paneId ? ` pane:${props.paneId}` : ''}] Title saved: ${newTitle}`)
}

const handleContentChange = (newContent: string) => {
  if (contentTimeout) clearTimeout(contentTimeout)

  const hasChanged = newContent !== originalContent.value
  hasUnsavedChanges.value = hasChanged

  if (localItem.value) {
    localItem.value.content = newContent
  }

  if (autoSaveEnabled.value && hasChanged && localItem.value) {
    contentTimeout = setTimeout(() => {
      triggerAutoSave({ content: newContent })
    }, 800)
  }
}

const handleSynopsisChange = (newSynopsis: string) => {
  if (synopsisTimeout) clearTimeout(synopsisTimeout)

  synopsisTimeout = setTimeout(() => {
    console.log(`[ItemEditor${props.paneId ? ` pane:${props.paneId}` : ''}] Synopsis updated`)
  }, 1000)
}

const triggerAutoSave = async (payload: ItemUpdatePayload) => {
  if (!localItem.value) return

  try {
    saveStatus.value = 'saving'

    const updatedItem = await debouncedAutoSave(
      props.manuscriptId,
      localItem.value.id,
      payload
    )

    // Only update if we're still editing the same item
    if (localItem.value && localItem.value.id === updatedItem.id) {
      localItem.value = updatedItem
      originalContent.value = updatedItem.content || ''
      hasUnsavedChanges.value = false
      saveStatus.value = 'saved'
      error.value = null

      // Emit sync event so other stores (nav tree, etc.) can update
      dataSync.emit('item:updated', {
        manuscriptId: props.manuscriptId,
        itemId: updatedItem.id,
        changes: payload
      })

      // Clear saved status after 2 seconds
      setTimeout(() => {
        if (saveStatus.value === 'saved') {
          saveStatus.value = 'idle'
        }
      }, 2000)
    }
  } catch (err) {
    console.error(`[ItemEditor${props.paneId ? ` pane:${props.paneId}` : ''}] Auto-save failed:`, err)
    saveStatus.value = 'error'
    error.value = err instanceof Error ? err.message : 'Save failed'
  }
}

const saveManually = async () => {
  if (!hasUnsavedChanges.value || !localItem.value) return

  try {
    saveStatus.value = 'saving'

    const payload: ItemUpdatePayload = {
      title: localItem.value.title,
      content: localItem.value.content,
      content_format: localItem.value.content_format
    }

    const updatedItem = await itemsApi.updateItem(
      props.manuscriptId,
      localItem.value.id,
      payload
    )

    if (localItem.value && localItem.value.id === updatedItem.id) {
      localItem.value = updatedItem
      originalContent.value = updatedItem.content || ''
      hasUnsavedChanges.value = false
      saveStatus.value = 'saved'
      error.value = null

      dataSync.emit('item:updated', {
        manuscriptId: props.manuscriptId,
        itemId: updatedItem.id,
        changes: payload
      })
    }

    console.log(`[ItemEditor${props.paneId ? ` pane:${props.paneId}` : ''}] Manual save successful`)
  } catch (err) {
    console.error(`[ItemEditor${props.paneId ? ` pane:${props.paneId}` : ''}] Manual save failed:`, err)
    saveStatus.value = 'error'
    error.value = err instanceof Error ? err.message : 'Save failed'
  }
}

// ===== EXTERNAL SYNC (listen for renames from nav tree, etc.) =====
const handleExternalUpdate = ({ itemId, changes }: { itemId: number, changes: any }) => {
  if (localItem.value?.id === itemId) {
    if (changes.title && changes.title !== localItem.value.title) {
      localItem.value.title = changes.title
      localTitle.value = changes.title
    }
  }
}

const handleExternalDelete = ({ itemId }: { itemId: number }) => {
  if (localItem.value?.id === itemId) {
    localItem.value = null
    localContent.value = null
    hasUnsavedChanges.value = false
    saveStatus.value = 'idle'
  }
}

// ===== LIFECYCLE =====
onMounted(async () => {
  console.log(`[ItemEditor${props.paneId ? ` pane:${props.paneId}` : ''}] Mounted, loading item: ${props.itemId}`)
  await loadItem(props.manuscriptId, props.itemId)

  // Listen for external updates
  dataSync.on('item:updated', handleExternalUpdate)
  dataSync.on('item:deleted', handleExternalDelete)
})

// Watch for prop changes to reload item
watch([() => props.manuscriptId, () => props.itemId], async ([newManuscriptId, newItemId], [oldManuscriptId, oldItemId]) => {
  if (newManuscriptId !== oldManuscriptId || newItemId !== oldItemId) {
    console.log(`[ItemEditor${props.paneId ? ` pane:${props.paneId}` : ''}] Props changed, loading new item: ${newItemId}`)
    await loadItem(newManuscriptId, newItemId)
  }
}, { immediate: false })

onUnmounted(() => {
  if (contentTimeout) clearTimeout(contentTimeout)
  if (synopsisTimeout) clearTimeout(synopsisTimeout)

  // Remove external sync listeners
  dataSync.off('item:updated', handleExternalUpdate)
  dataSync.off('item:deleted', handleExternalDelete)
})

// Expose state for parent components (e.g., the standalone edit page)
defineExpose({
  localItem,
  hasUnsavedChanges,
  saveStatus,
  saveManually,
  error
})

// Context menu handler
const handleContextMenu = (event: MouseEvent) => {
  event.preventDefault()
  event.stopPropagation()

  const selection = window.getSelection()?.toString()

  // Build editor context with item and manuscript IDs
  const editorContext: EditorMenuContext = {
    itemId: props.itemId,
    manuscriptId: props.manuscriptId,
    selectionPosition: ContextDetectionService.getSelectionPosition()
  }

  const menuItems = getEditorMenuItems(selection, editorContext)

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
  if ((event.ctrlKey || event.metaKey) && event.key === 's') {
    event.preventDefault()
    if (hasUnsavedChanges.value) {
      saveManually()
    }
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)

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
