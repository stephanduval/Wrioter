<template>
  <div class="item-view-container">
    <!-- Item Selector Bar -->
    <VToolbar
      density="compact"
      color="surface"
      class="item-selector-bar"
    >
      <!-- Previous Item -->
      <VBtn
        icon
        size="small"
        :disabled="!hasPreviousItem"
        @click="navigateToPrevious"
        title="Previous Item (Alt+Up)"
      >
        <VIcon>mdi-chevron-left</VIcon>
      </VBtn>

      <!-- Item Selector -->
      <VSelect
        v-model="selectedItemId"
        :items="items"
        item-title="title"
        item-value="id"
        density="compact"
        variant="solo"
        hide-details
        class="item-selector mx-2"
        placeholder="Select an item to edit..."
      >
        <template #item="{ props: itemProps, item }">
          <VListItem v-bind="itemProps">
            <template #prepend>
              <VIcon
                :icon="getItemIcon(item.raw.type)"
                size="small"
              />
            </template>
            <VListItemTitle>{{ item.raw.title }}</VListItemTitle>
            <template #append>
              <VChip
                v-if="item.raw.word_count"
                size="x-small"
                variant="tonal"
              >
                {{ item.raw.word_count }} words
              </VChip>
            </template>
          </VListItem>
        </template>
      </VSelect>

      <!-- Next Item -->
      <VBtn
        icon
        size="small"
        :disabled="!hasNextItem"
        @click="navigateToNext"
        title="Next Item (Alt+Down)"
      >
        <VIcon>mdi-chevron-right</VIcon>
      </VBtn>

      <VSpacer />

      <!-- View Options -->
      <VBtn
        icon
        size="small"
        @click="showViewOptions = true"
        title="View Options"
      >
        <VIcon>mdi-cog-outline</VIcon>
      </VBtn>

      <!-- Focus Mode -->
      <VBtn
        icon
        size="small"
        :color="focusMode ? 'primary' : undefined"
        @click="toggleFocusMode"
        title="Focus Mode (F11)"
      >
        <VIcon>mdi-fullscreen</VIcon>
      </VBtn>
    </VToolbar>

    <!-- Item Editor -->
    <div class="item-editor-wrapper" :class="{ 'focus-mode': focusMode }">
      <ItemEditor
        v-if="selectedItemId && currentItem"
        :key="`item-${selectedItemId}-${paneId}`"
        :manuscript-id="manuscriptId"
        :item-id="selectedItemId"
        :show-synopsis="showSynopsis"
      />

      <!-- Empty State -->
      <div v-else class="empty-state">
        <VIcon size="64" color="grey-lighten-2">mdi-file-document-edit-outline</VIcon>
        <h3 class="text-h6 mt-4">No Item Selected</h3>
        <p class="text-body-2 text-grey mt-2">
          Select an item from the list above to start editing
        </p>
        <VBtn
          v-if="items.length === 0"
          color="primary"
          class="mt-4"
          @click="$emit('add-item')"
        >
          <VIcon start>mdi-plus</VIcon>
          Add First Item
        </VBtn>
      </div>
    </div>

    <!-- View Options Dialog -->
    <VDialog
      v-model="showViewOptions"
      max-width="400"
    >
      <VCard>
        <VCardTitle>Item View Options</VCardTitle>
        <VCardText>
          <VSwitch
            v-model="showSynopsis"
            label="Show Synopsis Section"
            class="mb-3"
          />
          <VSwitch
            v-model="autoSave"
            label="Auto-save Changes"
            class="mb-3"
          />
          <VSwitch
            v-model="showWordCount"
            label="Show Word Count"
            class="mb-3"
          />

          <VDivider class="my-4" />

          <p class="text-subtitle-2 mb-2">Font Size</p>
          <VRadioGroup
            v-model="fontSize"
            inline
            hide-details
          >
            <VRadio label="Small" value="small" />
            <VRadio label="Medium" value="medium" />
            <VRadio label="Large" value="large" />
          </VRadioGroup>
        </VCardText>
        <VCardActions>
          <VSpacer />
          <VBtn
            variant="text"
            @click="showViewOptions = false"
          >
            Close
          </VBtn>
          <VBtn
            color="primary"
            @click="saveViewOptions"
          >
            Apply
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useItemStore } from '@/stores/item'
import { usePaneStore } from '@/stores/pane'
import ItemEditor from '@/components/manuscript/ItemEditor.vue'
import type { FolderItem } from '@/stores/folderView'

interface Props {
  folderId: number
  folder?: any
  items: FolderItem[]
  paneId?: string
  itemId?: number // Allow pre-selection of an item
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'add-item': []
  'update:loading': [boolean]
  'update:error': [string | null]
}>()

// Stores
const itemStore = useItemStore()
const paneStore = usePaneStore()

// Local state
const selectedItemId = ref<number | null>(props.itemId || null)
const focusMode = ref(false)
const showViewOptions = ref(false)

// View settings
const showSynopsis = ref(true)
const autoSave = ref(true)
const showWordCount = ref(true)
const fontSize = ref<'small' | 'medium' | 'large'>('medium')

// Computed
const manuscriptId = computed(() => {
  // Get manuscript ID from the first item or folder metadata
  // This is a simplified approach - might need adjustment based on your data structure
  return props.folder?.manuscript_id || props.items[0]?.manuscript_id || props.folderId
})

const currentItem = computed(() => {
  if (!selectedItemId.value) return null
  return props.items.find(item => item.id === selectedItemId.value)
})

const currentItemIndex = computed(() => {
  if (!selectedItemId.value) return -1
  return props.items.findIndex(item => item.id === selectedItemId.value)
})

const hasPreviousItem = computed(() => {
  return currentItemIndex.value > 0
})

const hasNextItem = computed(() => {
  return currentItemIndex.value >= 0 && currentItemIndex.value < props.items.length - 1
})

// Methods
function getItemIcon(type: string): string {
  switch (type) {
    case 'chapter':
      return 'mdi-book-open-page-variant'
    case 'scene':
      return 'mdi-script-text-outline'
    case 'note':
      return 'mdi-note-text-outline'
    case 'character':
      return 'mdi-account-outline'
    case 'location':
      return 'mdi-map-marker-outline'
    default:
      return 'mdi-file-document-outline'
  }
}

function navigateToPrevious() {
  if (hasPreviousItem.value) {
    selectedItemId.value = props.items[currentItemIndex.value - 1].id
  }
}

function navigateToNext() {
  if (hasNextItem.value) {
    selectedItemId.value = props.items[currentItemIndex.value + 1].id
  }
}

function toggleFocusMode() {
  focusMode.value = !focusMode.value

  // Update pane settings if in split view
  if (props.paneId) {
    paneStore.updatePaneViewSettings(props.paneId, {
      itemEditorFontSize: fontSize.value,
      showSynopsis: showSynopsis.value,
      autoSave: autoSave.value
    })
  }
}

function saveViewOptions() {
  // Save view settings to pane store if in split view
  if (props.paneId) {
    paneStore.updatePaneViewSettings(props.paneId, {
      itemEditorFontSize: fontSize.value,
      showSynopsis: showSynopsis.value,
      autoSave: autoSave.value
    })
  }

  // Apply settings to item store
  itemStore.setAutoSave(autoSave.value)

  showViewOptions.value = false
}

// Keyboard shortcuts
function handleKeydown(e: KeyboardEvent) {
  // Alt + Up/Down for navigation
  if (e.altKey) {
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      navigateToPrevious()
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      navigateToNext()
    }
  }

  // F11 for focus mode
  if (e.key === 'F11') {
    e.preventDefault()
    toggleFocusMode()
  }
}

// Auto-select first item if none selected
watch(() => props.items, (newItems) => {
  if (!selectedItemId.value && newItems.length > 0) {
    selectedItemId.value = newItems[0].id
  }
}, { immediate: true })

// Update pane state when item changes
watch(selectedItemId, (newItemId) => {
  if (props.paneId && newItemId) {
    paneStore.setPaneEditingItem(props.paneId, newItemId)
  }
})

// Load view settings from pane store if in split view
onMounted(() => {
  if (props.paneId) {
    const pane = paneStore.getPane(props.paneId)
    if (pane?.viewSettings) {
      fontSize.value = pane.viewSettings.itemEditorFontSize || 'medium'
      showSynopsis.value = pane.viewSettings.showSynopsis ?? true
      autoSave.value = pane.viewSettings.autoSave ?? true
    }

    // Set initial editing item if provided
    if (pane?.editingItemId) {
      selectedItemId.value = pane.editingItemId
    }
  }

  // Add keyboard listeners
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
.item-view-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: rgb(var(--v-theme-background));
}

.item-selector-bar {
  flex-shrink: 0;
  border-bottom: 1px solid rgb(var(--v-theme-surface-variant));
}

.item-selector {
  flex: 1;
  max-width: 400px;
}

:deep(.item-selector .v-field) {
  font-size: 14px;
}

.item-editor-wrapper {
  flex: 1;
  overflow: hidden;
  position: relative;
}

.item-editor-wrapper.focus-mode {
  padding: 0;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 24px;
  text-align: center;
}

/* Focus mode styles */
.focus-mode :deep(.editor-header) {
  background: rgb(var(--v-theme-surface));
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.focus-mode :deep(.editor-content) {
  max-width: 800px;
  margin: 0 auto;
  padding: 32px 48px;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .item-selector {
    max-width: 100%;
  }

  .focus-mode :deep(.editor-content) {
    padding: 16px 24px;
  }
}
</style>