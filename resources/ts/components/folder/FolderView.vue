<template>
  <div class="folder-view">
    <!-- Loading State -->
    <VProgressLinear
      v-if="isLoading"
      indeterminate
      color="primary"
    />

    <!-- Error State -->
    <VAlert
      v-if="error"
      type="error"
      closable
      @click:close="error = null"
    >
      {{ error }}
    </VAlert>

    <!-- Toolbar with View Mode Switcher -->
    <VToolbar
      v-if="currentFolder"
      density="compact"
      color="surface"
      class="folder-view-toolbar"
    >
      <!-- Folder Title -->
      <VToolbarTitle>
        <VIcon :icon="getFolderIcon()" class="me-2" />
        {{ currentFolder.title }}
        <VChip
          v-if="itemCount > 0"
          size="small"
          class="ms-2"
        >
          {{ itemCount }} {{ itemCount === 1 ? 'item' : 'items' }}
        </VChip>
      </VToolbarTitle>

      <VSpacer />

      <!-- View Mode Switcher -->
      <VBtnToggle
        v-model="currentViewMode"
        mandatory
        density="compact"
        color="primary"
        class="me-2"
      >
        <VBtn
          value="manuscript"
          size="small"
          :title="'Manuscript View (Cmd+1)'"
        >
          <VIcon icon="bx-file-doc" />
          <span class="d-none d-md-inline ms-1">Manuscript</span>
        </VBtn>

        <VBtn
          value="corkboard"
          size="small"
          :title="'Corkboard View (Cmd+2)'"
        >
          <VIcon icon="bx-grid-alt" />
          <span class="d-none d-md-inline ms-1">Corkboard</span>
        </VBtn>

        <VBtn
          value="outline"
          size="small"
          :title="'Outline View (Cmd+3)'"
        >
          <VIcon icon="bx-list-ul" />
          <span class="d-none d-md-inline ms-1">Outline</span>
        </VBtn>
      </VBtnToggle>

      <!-- Additional Actions Menu -->
      <VMenu>
        <template #activator="{ props }">
          <VBtn
            icon="bx-dots-vertical-rounded"
            size="small"
            v-bind="props"
          />
        </template>

        <VList>
          <VListItem @click="handleRefresh">
            <template #prepend>
              <VIcon icon="bx-refresh" />
            </template>
            <VListItemTitle>Refresh</VListItemTitle>
          </VListItem>

          <VListItem @click="handleExport">
            <template #prepend>
              <VIcon icon="bx-export" />
            </template>
            <VListItemTitle>Export...</VListItemTitle>
          </VListItem>

          <VDivider />

          <VListItem @click="handleSetDefaultView">
            <template #prepend>
              <VIcon icon="bx-cog" />
            </template>
            <VListItemTitle>Set Default View...</VListItemTitle>
          </VListItem>
        </VList>
      </VMenu>
    </VToolbar>

    <!-- View Router: Displays the appropriate view based on current mode -->
    <div class="folder-view-content">
      <!-- Empty State -->
      <VAlert
        v-if="!isLoading && itemCount === 0"
        type="info"
        variant="tonal"
        class="ma-4"
      >
        <VAlertTitle>No items in this folder</VAlertTitle>
        <p>This folder is empty. Add items to view them here.</p>
        <template #append>
          <VBtn
            color="primary"
            @click="handleAddItem"
          >
            Add Item
          </VBtn>
        </template>
      </VAlert>

      <!-- Manuscript View -->
      <ManuscriptView
        v-else-if="currentViewMode === 'manuscript'"
        :folder-id="folderId"
        :folder="currentFolder"
        :items="folderItems"
      />

      <!-- Corkboard View -->
      <CorkboardView
        v-else-if="currentViewMode === 'corkboard'"
        :folder-id="folderId"
        :folder="currentFolder"
        :items="folderItems"
      />

      <!-- Outline View -->
      <OutlineView
        v-else-if="currentViewMode === 'outline'"
        :folder-id="folderId"
        :folder="currentFolder"
        :items="folderItems"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { storeToRefs } from 'pinia'
import { useFolderViewStore } from '@/stores/folderView'
import ManuscriptView from '@/components/manuscript/ManuscriptView.vue'
import CorkboardView from '@/components/corkboard/CorkboardView.vue'
import OutlineView from '@/components/outline/OutlineView.vue'

const props = defineProps<{
  folderId: number
}>()

const emit = defineEmits<{
  viewModeChange: [mode: string]
  refresh: []
  export: []
  addItem: []
}>()

// Store
const folderViewStore = useFolderViewStore()
const {
  currentViewMode,
  currentFolder,
  folderItems,
  isLoading,
  error,
  itemCount
} = storeToRefs(folderViewStore)

// Local state
const keyboardListener = ref<((e: KeyboardEvent) => void) | null>(null)

// Methods
function getFolderIcon(): string {
  return 'bx-folder'
}

async function handleRefresh() {
  emit('refresh')
  await folderViewStore.reloadFolder()
}

function handleExport() {
  emit('export')
  // Export functionality will be implemented per view
}

function handleSetDefaultView() {
  // Open dialog to set default view preference
  // TODO: Implement default view dialog
  console.log('Set default view for folder', props.folderId)
}

function handleAddItem() {
  emit('addItem')
  // TODO: Implement add item dialog/action
}

// Keyboard shortcuts
function setupKeyboardShortcuts() {
  keyboardListener.value = (e: KeyboardEvent) => {
    // Check if Cmd (Mac) or Ctrl (Windows/Linux) is pressed
    if (!(e.metaKey || e.ctrlKey)) return

    switch (e.key) {
      case '1':
        e.preventDefault()
        currentViewMode.value = 'manuscript'
        break
      case '2':
        e.preventDefault()
        currentViewMode.value = 'corkboard'
        break
      case '3':
        e.preventDefault()
        currentViewMode.value = 'outline'
        break
    }
  }

  window.addEventListener('keydown', keyboardListener.value)
}

function removeKeyboardShortcuts() {
  if (keyboardListener.value) {
    window.removeEventListener('keydown', keyboardListener.value)
  }
}

// Watch for view mode changes
watch(currentViewMode, (newMode) => {
  emit('viewModeChange', newMode)
  console.log('View mode changed to:', newMode)
})

// Load folder on mount
onMounted(async () => {
  console.log('FolderView mounted for folder:', props.folderId)

  // Setup keyboard shortcuts
  setupKeyboardShortcuts()

  // Load folder contents
  try {
    await folderViewStore.loadFolder(props.folderId)
  } catch (err) {
    console.error('Failed to load folder:', err)
  }
})

// Cleanup
onBeforeUnmount(() => {
  removeKeyboardShortcuts()
  folderViewStore.clearFolder()
})

// Watch for folder ID changes (if navigating between folders)
watch(() => props.folderId, async (newFolderId) => {
  if (newFolderId) {
    await folderViewStore.loadFolder(newFolderId)
  }
})
</script>

<style scoped>
.folder-view {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  overflow: hidden;
}

.folder-view-toolbar {
  flex-shrink: 0;
  border-bottom: 1px solid rgb(var(--v-theme-surface-variant));
}

.folder-view-content {
  flex: 1;
  overflow: auto;
  position: relative;
}

/* Ensure view mode switcher buttons are visible */
:deep(.v-btn-toggle) {
  box-shadow: none;
}

/* Responsive adjustments */
@media (max-width: 600px) {
  .folder-view-toolbar :deep(.v-toolbar-title) {
    font-size: 0.875rem;
  }
}
</style>
