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
      density="compact"
      color="surface"
      class="folder-view-toolbar"
    >
      <!-- Folder Title -->
      <VToolbarTitle>
        <VIcon :icon="getFolderIcon()" class="me-2" />
        {{ scriveningMode ? 'Multiple Selection' : (currentFolder?.title || 'Folder View') }}
        <VChip
          v-if="scriveningMode && scriveningItemCount > 0"
          size="small"
          color="primary"
          class="ms-2"
        >
          <VIcon icon="mdi-file-multiple" size="small" class="me-1" />
          {{ scriveningItemCount }} {{ scriveningItemCount === 1 ? 'item' : 'items' }}
        </VChip>
        <VChip
          v-else-if="!scriveningMode && itemCount > 0"
          size="small"
          class="ms-2"
        >
          {{ itemCount }} {{ itemCount === 1 ? 'item' : 'items' }}
        </VChip>
      </VToolbarTitle>

      <VSpacer />

      <!-- View Mode Switcher -->
      <ViewModeSwitcher
        v-model="currentViewMode"
        :disabled="isViewLocked"
        class="me-2"
      />

      <VDivider vertical class="mx-2" />

      <!-- View Lock Toggle -->
      <VTooltip :text="isViewLocked ? 'Unlock view (Cmd/Ctrl+L)' : 'Lock current view (Cmd/Ctrl+L)'">
        <template #activator="{ props: tooltipProps }">
          <VBtn
            :icon="isViewLocked ? 'mdi-lock' : 'mdi-lock-open'"
            :color="isViewLocked ? 'warning' : undefined"
            size="small"
            v-bind="tooltipProps"
            @click="handleToggleViewLock"
          />
        </template>
      </VTooltip>

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

      <!-- Scrivening Mode Toggle -->
      <VBtn
        icon="mdi-file-multiple"
        :color="scriveningMode ? 'primary' : undefined"
        size="small"
        @click="handleToggleScrivening"
        title="Scrivening Mode (TEST)"
      >
        <VIcon icon="mdi-file-multiple" />
      </VBtn>

      <!-- Exit Scrivening Mode Button -->
      <VTooltip v-if="scriveningMode" text="Exit Scrivening Mode">
        <template #activator="{ props: tooltipProps }">
          <VBtn
            icon="mdi-close"
            size="small"
            v-bind="tooltipProps"
            @click="handleExitScrivening"
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
        v-if="!isLoading && !splitEnabled && displayItemCount === 0"
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
          :items="displayItems"
          :scrivening-mode="scriveningMode"
          :scrivening-separators="scriveningSeparatorsArray"
        />

        <CorkboardView
          v-else-if="currentViewMode === 'corkboard'"
          :folder-id="folderId"
          :folder="currentFolder"
          :items="displayItems"
          :scrivening-mode="scriveningMode"
          :scrivening-separators="scriveningSeparatorsArray"
        />

        <OutlineView
          v-else-if="currentViewMode === 'outline'"
          :folder-id="folderId"
          :folder="currentFolder"
          :items="displayItems"
          :scrivening-mode="scriveningMode"
          :scrivening-separators="scriveningSeparatorsArray"
        />

        <MindMapView
          v-else-if="currentViewMode === 'mindmap'"
          :folder-id="folderId"
          :folder="currentFolder"
          :items="displayItems"
          :scrivening-mode="scriveningMode"
        />

        <ItemView
          v-else-if="currentViewMode === 'item'"
          :folder-id="folderId"
          :folder="currentFolder"
          :items="displayItems"
          :manuscript-id="currentFolder?.manuscript_id"
          :initial-item-id="initialItemId"
          :scrivening-mode="scriveningMode"
          @add-item="handleAddItem"
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
            <!-- Show placeholder if pane has duplicate content -->
            <PanePlaceholder
              v-if="isPanePlaceholder(paneId)"
              :pane-id="paneId"
              :duplicate-pane-id="getPaneDuplicateId(paneId)"
              :message="getPlaceholderMessage(paneId)"
            />
            <!-- Render view based on pane's specific view mode -->
            <component
              v-else
              :is="getPaneComponent(paneId)"
              :folder-id="folderId"
              :folder="currentFolder"
              :items="getPaneItems(paneId)"
              :pane-id="paneId"
              :item-id="getPaneEditingItemId(paneId)"
              :manuscript-id="currentFolder?.manuscript_id"
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
import MindMapView from '@/components/mindmap/MindMapView.vue'
import ItemView from '@/components/item/ItemView.vue'
import ItemEditor from '@/components/manuscript/ItemEditor.vue'
import SimpleSplitWrapper from '@/components/splitView/SimpleSplitWrapper.vue'
import PaneWrapper from '@/components/splitView/PaneWrapper.vue'
import PanePlaceholder from '@/components/splitView/PanePlaceholder.vue'
import ViewModeSwitcher from '@/components/shared/ViewModeSwitcher.vue'

const props = defineProps<{
  folderId: number
  initialItemId?: number
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
  displayItemCount,
  splitEnabled,
  currentSplitLayout,
  scriveningMode,
  scriveningItemCount,
  displayItems,
  scriveningSeparatorsArray,  // Use array version instead of Map
  isViewLocked
} = storeToRefs(folderViewStore)

// Local state
const keyboardListener = ref<((e: KeyboardEvent) => void) | null>(null)

// Component mapping for dynamic rendering
const viewComponents = {
  manuscript: markRaw(ManuscriptView),
  corkboard: markRaw(CorkboardView),
  outline: markRaw(OutlineView),
  mindmap: markRaw(MindMapView),
  item: markRaw(ItemView),
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

  // Each pane should only show its own loaded content
  // Don't fall back to global folderItems - that causes both panes to show the same content
  const items = pane?.folderItems || []

  // For edit mode, filter to just the editing item
  if (pane?.viewMode === 'edit' && pane.editingItemId) {
    return items.filter(item => item.id === pane.editingItemId)
  }

  return items
}

function getPaneEditingItemId(paneId: string): number | undefined {
  const pane = paneStore.getPane(paneId)
  return pane?.editingItemId
}

function isPanePlaceholder(paneId: string): boolean {
  const pane = paneStore.getPane(paneId)
  return pane?.isPlaceholder || false
}

function getPaneDuplicateId(paneId: string): string | undefined {
  const pane = paneStore.getPane(paneId)
  return pane?.duplicatePaneId
}

function getPlaceholderMessage(paneId: string): string | undefined {
  const pane = paneStore.getPane(paneId)
  return pane?.placeholderMessage
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

function handleToggleViewLock() {
  const newLockState = folderViewStore.toggleViewLock()

  // Show toast notification
  const message = newLockState
    ? 'View locked - current view mode will be preserved'
    : 'View unlocked - you can now switch between views'

  // TODO: Add toast notification when toast system is available
  console.log(message)
}

function toggleSplitView() {
  folderViewStore.toggleSplitView()

  // When enabling split view, initialize panes and load folder in first pane only
  if (splitEnabled.value && props.folderId) {
    // Initialize panes immediately (before SimpleSplitWrapper mounts)
    // so that loadFolderForPane has valid pane references
    paneStore.initializeDefaultPanes()

    // Load folder in first pane after panes are created
    nextTick(() => {
      paneStore.loadFolderForPane('pane-1', props.folderId)
      paneStore.setActivePane('pane-1')
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

// Scrivening methods
async function handleToggleScrivening() {
  if (scriveningMode.value) {
    // If already in scrivening mode, exit it
    handleExitScrivening()
  } else {
    // For testing: Enable scrivening with current folder
    // To really demonstrate scrivening with multiple sources, we can add individual items
    // In production, this would open a selection dialog for the user to pick items/folders
    try {
      console.log('Enabling scrivening mode with current folder:', props.folderId)

      // Start with current folder
      const selections = [{ type: 'folder' as const, id: props.folderId }]

      // For demo: If we have items, also add a few individual items to show separators
      // (In real usage, user would select these from other folders)
      if (folderItems.value.length > 0) {
        // Add first item individually to demonstrate item-level selection
        selections.push({ type: 'item' as const, id: folderItems.value[0].id })
      }

      await folderViewStore.enableScrivening(selections)
      console.log('Scrivening mode enabled successfully with', selections.length, 'selections')
    } catch (err) {
      console.error('Failed to enable scrivening mode:', err)
      error.value = 'Failed to enable scrivening mode'
    }
  }
}

function handleExitScrivening() {
  console.log('Exiting scrivening mode')
  folderViewStore.disableScrivening()
}

// Keyboard shortcuts
function setupKeyboardShortcuts() {
  keyboardListener.value = (e: KeyboardEvent) => {
    // Check if Cmd (Mac) or Ctrl (Windows/Linux) is pressed
    const cmdOrCtrl = e.metaKey || e.ctrlKey

    if (!cmdOrCtrl) return

    switch (e.key) {
      case '1':
        e.preventDefault()
        if (!isViewLocked.value) {
          currentViewMode.value = 'manuscript'
        } else {
          console.log('View switching blocked - view is locked')
        }
        break
      case '2':
        e.preventDefault()
        if (!isViewLocked.value) {
          currentViewMode.value = 'corkboard'
        } else {
          console.log('View switching blocked - view is locked')
        }
        break
      case '3':
        e.preventDefault()
        if (!isViewLocked.value) {
          currentViewMode.value = 'outline'
        } else {
          console.log('View switching blocked - view is locked')
        }
        break
      case '4':
        e.preventDefault()
        if (!isViewLocked.value) {
          currentViewMode.value = 'mindmap'
        } else {
          console.log('View switching blocked - view is locked')
        }
        break
      case '5':
        e.preventDefault()
        if (!isViewLocked.value) {
          currentViewMode.value = 'item'
        } else {
          console.log('View switching blocked - view is locked')
        }
        break
      case 'l':
      case 'L':
        e.preventDefault()
        handleToggleViewLock()
        break
      case '\\':
      case '|':
        e.preventDefault()
        toggleSplitView()
        break
      case 's':
      case 'S':
        // Cmd+Option+S (Mac) or Ctrl+Alt+S (Windows/Linux) for scrivening
        if (e.altKey) {
          e.preventDefault()
          handleToggleScrivening()
        }
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
