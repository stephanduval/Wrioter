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

      <VDivider vertical class="mx-2" />

      <!-- Split View Toggle -->
      <VTooltip :text="`Toggle Split View (${isMac ? 'Cmd' : 'Ctrl'}+\\)`">
        <template #activator="{ props: tooltipProps }">
          <VBtn
            :icon="splitEnabled ? 'mdi-view-split-vertical' : 'mdi-view-agenda-outline'"
            :color="splitEnabled ? 'primary' : undefined"
            size="small"
            v-bind="tooltipProps"
            @click="toggleSplitView"
          />
        </template>
      </VTooltip>

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

      <!-- Regular View Mode (no split) -->
      <template v-else-if="!splitEnabled">
        <ManuscriptView
          v-if="currentViewMode === 'manuscript'"
          :folder-id="folderId"
          :folder="currentFolder"
          :items="folderItems"
        />

        <CorkboardView
          v-else-if="currentViewMode === 'corkboard'"
          :folder-id="folderId"
          :folder="currentFolder"
          :items="folderItems"
        />

        <OutlineView
          v-else-if="currentViewMode === 'outline'"
          :folder-id="folderId"
          :folder="currentFolder"
          :items="folderItems"
        />
      </template>

      <!-- Split View Mode -->
      <SimpleSplitWrapper
        v-else-if="splitEnabled && currentSplitLayout"
        :layout="currentSplitLayout"
        class="split-view-container"
      >
        <template #pane="{ paneId, index }">
          <!-- Wrap each pane with PaneWrapper for independent controls -->
          <PaneWrapper
            :pane-id="paneId"
            @view-mode-change="handlePaneViewModeChange(paneId, $event)"
            @sync-selection="handlePaneSyncSelection(paneId)"
            @export="handlePaneExport(paneId)"
          >
            <!-- Render view based on pane's specific view mode -->
            <component
              :is="getPaneComponent(paneId)"
              :folder-id="folderId"
              :folder="currentFolder"
              :items="getPaneItems(paneId)"
              :pane-id="paneId"
              :item-id="getPaneEditingItemId(paneId)"
            />
          </PaneWrapper>
        </template>
      </SimpleSplitWrapper>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount, markRaw, nextTick } from 'vue'
import { storeToRefs } from 'pinia'
import { useFolderViewStore } from '@/stores/folderView'
import { usePaneStore, type PaneViewMode } from '@/stores/pane'
import ManuscriptView from '@/components/manuscript/ManuscriptView.vue'
import CorkboardView from '@/components/corkboard/CorkboardView.vue'
import OutlineView from '@/components/outline/OutlineView.vue'
import ItemEditor from '@/components/manuscript/ItemEditor.vue'
import SimpleSplitWrapper from '@/components/splitView/SimpleSplitWrapper.vue'
import PaneWrapper from '@/components/splitView/PaneWrapper.vue'

const props = defineProps<{
  folderId: number
}>()

const emit = defineEmits<{
  viewModeChange: [mode: string]
  refresh: []
  export: []
  addItem: []
}>()

// Stores
const folderViewStore = useFolderViewStore()
const paneStore = usePaneStore()

const {
  currentViewMode,
  currentFolder,
  folderItems,
  isLoading,
  error,
  itemCount,
  splitEnabled,
  currentSplitLayout
} = storeToRefs(folderViewStore)

// Local state
const keyboardListener = ref<((e: KeyboardEvent) => void) | null>(null)

// Component mapping for dynamic rendering
const viewComponents = {
  manuscript: markRaw(ManuscriptView),
  corkboard: markRaw(CorkboardView),
  outline: markRaw(OutlineView),
  edit: markRaw(ItemEditor)
}

// Computed
const isMac = computed(() => navigator.platform.toUpperCase().indexOf('MAC') >= 0)

// Pane-specific methods
function getPaneComponent(paneId: string) {
  const pane = paneStore.getPane(paneId)
  if (!pane) return viewComponents.manuscript

  return viewComponents[pane.viewMode] || viewComponents.manuscript
}

function getPaneItems(paneId: string) {
  const pane = paneStore.getPane(paneId)

  // Use the pane's own folderItems if available (for independent pane content)
  // Otherwise fall back to global folderItems (for initial load or single view)
  const items = pane?.folderItems || folderItems.value

  // For edit mode, we might want to filter to just the editing item
  if (pane?.viewMode === 'edit' && pane.editingItemId) {
    return items.filter(item => item.id === pane.editingItemId)
  }

  // For other modes, return all items (they'll handle their own filtering based on selection)
  return items
}

function getPaneEditingItemId(paneId: string): number | undefined {
  const pane = paneStore.getPane(paneId)
  return pane?.editingItemId
}

function handlePaneViewModeChange(paneId: string, mode: PaneViewMode) {
  console.log(`[FolderView] Pane ${paneId} changed to mode: ${mode}`)

  // If switching to edit mode, ensure folder is set
  const pane = paneStore.getPane(paneId)
  if (pane && !pane.folderId) {
    paneStore.setPaneFolder(paneId, props.folderId)
  }
}

function handlePaneSyncSelection(paneId: string) {
  console.log(`[FolderView] Syncing selection for pane ${paneId}`)
  // Additional logic if needed
}

function handlePaneExport(paneId: string) {
  console.log(`[FolderView] Exporting content from pane ${paneId}`)
  // Implement export functionality
  emit('export')
}

// Methods
function getFolderIcon(): string {
  return 'bx-folder'
}

function toggleSplitView() {
  folderViewStore.toggleSplitView()

  // When enabling split view, set the folder for all panes
  if (!splitEnabled.value && props.folderId) {
    // Wait for next tick to ensure panes are created
    nextTick(() => {
      paneStore.allPanes.forEach(pane => {
        paneStore.setPaneFolder(pane.id, props.folderId)
      })
    })
  }
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
      case '\\':
      case '|':
        e.preventDefault()
        toggleSplitView()
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
    if (!splitEnabled.value) {
      // In single view mode, load folder globally
      await folderViewStore.loadFolder(props.folderId)
    }
    // In split view mode, folder loading is handled per pane
    // by DynamicManuscriptNavigation when items are clicked
  } catch (err) {
    console.error('Failed to load folder:', err)
  }
})

// Cleanup
onBeforeUnmount(() => {
  removeKeyboardShortcuts()
  folderViewStore.clearFolder()
})

// Watch for folder ID changes (if navigating between folders in single view)
watch(() => props.folderId, async (newFolderId) => {
  if (newFolderId && !splitEnabled.value) {
    // In single view mode, load the folder globally
    await folderViewStore.loadFolder(newFolderId)
  }
  // In split view mode, folder loading is handled per pane by DynamicManuscriptNavigation
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

/* Split view container */
.split-view-container {
  height: 100%;
  width: 100%;
}

/* Responsive adjustments */
@media (max-width: 600px) {
  .folder-view-toolbar :deep(.v-toolbar-title) {
    font-size: 0.875rem;
  }
}
</style>
