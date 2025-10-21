<template>
  <div
    class="pane-wrapper"
    :class="{
      'pane-active': paneState?.isActive,
      'pane-loading': paneState?.isLoading
    }"
    @click="handlePaneClick"
  >
    <!-- Pane Header -->
    <div class="pane-header">
      <!-- View Mode Selector -->
      <VBtnToggle
        :model-value="paneState?.viewMode"
        mandatory
        density="compact"
        color="primary"
        @update:model-value="handleViewModeChange"
      >
        <VTooltip text="Manuscript View" location="bottom">
          <template #activator="{ props }">
            <VBtn
              value="manuscript"
              size="small"
              icon
              v-bind="props"
            >
              <VIcon icon="mdi-file-document-outline" size="20" />
            </VBtn>
          </template>
        </VTooltip>

        <VTooltip text="Corkboard View" location="bottom">
          <template #activator="{ props }">
            <VBtn
              value="corkboard"
              size="small"
              icon
              v-bind="props"
            >
              <VIcon icon="mdi-view-grid-outline" size="20" />
            </VBtn>
          </template>
        </VTooltip>

        <VTooltip text="Outline View" location="bottom">
          <template #activator="{ props }">
            <VBtn
              value="outline"
              size="small"
              icon
              v-bind="props"
            >
              <VIcon icon="mdi-format-list-text" size="20" />
            </VBtn>
          </template>
        </VTooltip>

        <VTooltip text="Edit View" location="bottom">
          <template #activator="{ props }">
            <VBtn
              value="edit"
              size="small"
              icon
              v-bind="props"
              :disabled="!canEnableEditMode"
            >
              <VIcon icon="mdi-pencil-outline" size="20" />
            </VBtn>
          </template>
        </VTooltip>
      </VBtnToggle>

      <VSpacer />

      <!-- Selection Indicator -->
      <VChip
        v-if="selectionCount > 0"
        size="small"
        variant="tonal"
        class="me-2"
      >
        {{ selectionCount }} {{ selectionCount === 1 ? 'item' : 'items' }}
      </VChip>

      <!-- Pane Actions Menu -->
      <VMenu>
        <template #activator="{ props }">
          <VBtn
            icon
            size="small"
            variant="text"
            v-bind="props"
          >
            <VIcon icon="mdi-dots-vertical" size="20" />
          </VBtn>
        </template>

        <VList>
          <VListItem @click="handleSyncSelection">
            <template #prepend>
              <VIcon icon="mdi-sync" />
            </template>
            <VListItemTitle>Sync Selection</VListItemTitle>
            <VListItemSubtitle>Copy selection from other pane</VListItemSubtitle>
          </VListItem>

          <VDivider />

          <!-- View-specific settings -->
          <VListSubheader v-if="paneState?.viewMode === 'manuscript'">
            Manuscript Settings
          </VListSubheader>

          <VListItem
            v-if="paneState?.viewMode === 'manuscript'"
            @click="showFontSizeMenu = true"
          >
            <template #prepend>
              <VIcon icon="mdi-format-size" />
            </template>
            <VListItemTitle>Font Size</VListItemTitle>
          </VListItem>

          <VListItem
            v-if="paneState?.viewMode === 'manuscript'"
            @click="showLineSpacingMenu = true"
          >
            <template #prepend>
              <VIcon icon="mdi-format-line-spacing" />
            </template>
            <VListItemTitle>Line Spacing</VListItemTitle>
          </VListItem>

          <VListSubheader v-if="paneState?.viewMode === 'corkboard'">
            Corkboard Settings
          </VListSubheader>

          <VListItem
            v-if="paneState?.viewMode === 'corkboard'"
            @click="showZoomMenu = true"
          >
            <template #prepend>
              <VIcon icon="mdi-magnify" />
            </template>
            <VListItemTitle>Card Size</VListItemTitle>
          </VListItem>

          <VDivider />

          <VListItem @click="handleExportPane">
            <template #prepend>
              <VIcon icon="mdi-export" />
            </template>
            <VListItemTitle>Export Pane Content</VListItemTitle>
          </VListItem>
        </VList>
      </VMenu>
    </div>

    <!-- Loading Overlay -->
    <VProgressLinear
      v-if="paneState?.isLoading"
      indeterminate
      color="primary"
      height="2"
      class="pane-loading-bar"
    />

    <!-- Error Alert -->
    <VAlert
      v-if="paneState?.error"
      type="error"
      density="compact"
      closable
      class="ma-2"
      @click:close="clearError"
    >
      {{ paneState.error }}
    </VAlert>

    <!-- Pane Content -->
    <div class="pane-content">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { usePaneStore, type PaneViewMode } from '@/stores/pane'

const props = defineProps<{
  paneId: string
}>()

const emit = defineEmits<{
  viewModeChange: [mode: PaneViewMode]
  syncSelection: []
  export: []
}>()

// Store
const paneStore = usePaneStore()

// Get pane state
const paneState = computed(() => paneStore.getPane(props.paneId))

// Local state for menus
const showFontSizeMenu = ref(false)
const showLineSpacingMenu = ref(false)
const showZoomMenu = ref(false)

// Computed
const selectionCount = computed(() => {
  return paneState.value?.selectedItemIds?.size || 0
})

const canEnableEditMode = computed(() => {
  // Edit mode requires at least one selected item
  return selectionCount.value === 1
})

// Methods
function handlePaneClick() {
  // Set this pane as active when clicked
  paneStore.setActivePane(props.paneId)
}

function handleViewModeChange(mode: PaneViewMode) {
  console.log(`[PaneWrapper] Changing pane ${props.paneId} to mode: ${mode}`)

  // Check if switching to edit mode
  if (mode === 'edit') {
    const selectedIds = Array.from(paneState.value?.selectedItemIds || [])
    if (selectedIds.length === 1) {
      // Set the editing item
      paneStore.setEditingItem(props.paneId, selectedIds[0])
    } else {
      console.warn('[PaneWrapper] Cannot enter edit mode without exactly one item selected')
      return
    }
  }

  paneStore.updatePaneMode(props.paneId, mode)
  emit('viewModeChange', mode)
}

function handleSyncSelection() {
  // Find other pane to sync from
  const allPanes = paneStore.allPanes
  const otherPane = allPanes.find(p => p.id !== props.paneId)

  if (otherPane) {
    paneStore.syncPaneSelections(otherPane.id, props.paneId)
    console.log(`[PaneWrapper] Synced selection from ${otherPane.id} to ${props.paneId}`)
  }

  emit('syncSelection')
}

function handleExportPane() {
  console.log(`[PaneWrapper] Exporting pane ${props.paneId} content`)
  emit('export')
}

function clearError() {
  paneStore.setPaneError(props.paneId, undefined)
}

// Font size handler
function updateFontSize(size: 'small' | 'medium' | 'large') {
  paneStore.updateViewSettings(props.paneId, { fontSize: size })
  showFontSizeMenu.value = false
}

// Line spacing handler
function updateLineSpacing(spacing: 'single' | '1.5' | 'double') {
  paneStore.updateViewSettings(props.paneId, { lineSpacing: spacing })
  showLineSpacingMenu.value = false
}

// Zoom handler
function updateZoom(zoom: 'small' | 'medium' | 'large') {
  paneStore.updateViewSettings(props.paneId, { zoom: zoom })
  showZoomMenu.value = false
}
</script>

<style scoped>
.pane-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  position: relative;
  border: 1px solid transparent;
  transition: border-color 0.2s;
}

.pane-active {
  border-color: rgb(var(--v-theme-primary));
}

.pane-header {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  background: rgb(var(--v-theme-surface));
  border-bottom: 1px solid rgb(var(--v-theme-surface-variant));
  flex-shrink: 0;
}

.pane-loading-bar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10;
}

.pane-content {
  flex: 1;
  overflow: auto;
  position: relative;
}

/* Button group styling */
:deep(.v-btn-toggle) {
  height: 32px;
}

:deep(.v-btn-toggle .v-btn) {
  min-width: 32px;
  padding: 0;
}

/* Active pane highlight */
.pane-active .pane-header {
  background: rgba(var(--v-theme-primary), 0.05);
}

/* Loading state */
.pane-loading .pane-content {
  opacity: 0.7;
  pointer-events: none;
}
</style>