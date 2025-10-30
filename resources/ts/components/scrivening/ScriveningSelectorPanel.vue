<template>
  <div v-if="hasSelections" class="scrivening-selector-panel">
    <div class="panel-header">
      <div class="header-content">
        <VIcon icon="bx-selection" size="18" color="primary" />
        <span class="header-title">Scrivening Selection</span>
        <VBadge
          :content="selectionCount"
          color="primary"
          inline
        />
      </div>
      <VBtn
        icon
        size="x-small"
        variant="text"
        @click="handleClearAll"
        title="Clear all selections"
      >
        <VIcon icon="bx-x" size="16" />
      </VBtn>
    </div>

    <div class="selection-list">
      <div
        v-for="(selection, index) in selections"
        :key="selection.nodeId"
        class="selection-item"
      >
        <div class="item-index">{{ index + 1 }}</div>
        <VIcon :icon="getItemIcon(selection)" size="14" class="item-icon" />
        <div class="item-title">{{ getItemTitle(selection) }}</div>
        <VBtn
          icon
          size="x-small"
          variant="text"
          @click="handleRemoveItem(selection.nodeId)"
        >
          <VIcon icon="bx-trash" size="14" />
        </VBtn>
      </div>
    </div>

    <div class="panel-actions">
      <VBtn
        size="small"
        variant="outlined"
        @click="handleClearAll"
      >
        Clear All
      </VBtn>
      <VBtn
        size="small"
        color="primary"
        variant="elevated"
        @click="handleCreateScrivening"
        :disabled="selectionCount === 0"
      >
        Create Scrivening
      </VBtn>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useSelectionStore } from '@/stores/selection'
import { useFolderViewStore } from '@/stores/folderView'
import { useManuscriptStore } from '@/stores/manuscript'

// Stores
const selectionStore = useSelectionStore()
const folderViewStore = useFolderViewStore()
const manuscriptStore = useManuscriptStore()

// Computed
const hasSelections = computed(() => selectionStore.scriveningFolderMap.size > 0)
const selectionCount = computed(() => selectionStore.scriveningFolderMap.size)

const selections = computed(() => {
  const items: Array<{ nodeId: string; itemId: number }> = []
  for (const [nodeId, itemId] of selectionStore.scriveningFolderMap) {
    items.push({ nodeId, itemId })
  }
  return items
})

// Methods
const getItemTitle = (selection: { nodeId: string; itemId: number }) => {
  const node = manuscriptStore.findNodeById(selection.nodeId)
  return node?.title || `Item ${selection.itemId}`
}

const getItemIcon = (selection: { nodeId: string; itemId: number }) => {
  const node = manuscriptStore.findNodeById(selection.nodeId)
  return node?.icon || 'bx-file'
}

const handleRemoveItem = (nodeId: string) => {
  selectionStore.removeFromScriveningSelection(nodeId)
}

const handleClearAll = () => {
  // Clear all selections from the store
  for (const [nodeId] of selectionStore.scriveningFolderMap) {
    selectionStore.removeFromScriveningSelection(nodeId)
  }
}

const handleCreateScrivening = async () => {
  if (selectionCount.value === 0) return

  // Build the scrivening selections
  const scriveningSelections = selectionStore.buildScriveningSelections()

  if (scriveningSelections.length === 0) {
    console.warn('No valid selections to create scrivening')
    return
  }

  // Enable scrivening mode with the selections
  await folderViewStore.enableScrivening(scriveningSelections)
}
</script>

<style scoped lang="scss">
.scrivening-selector-panel {
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgb(var(--v-theme-surface-variant));
  border-radius: 8px;
  padding: 12px;
  margin: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  .panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    padding-bottom: 8px;
    border-bottom: 1px solid rgb(var(--v-theme-surface-variant));

    .header-content {
      display: flex;
      align-items: center;
      gap: 8px;

      .header-title {
        font-size: 13px;
        font-weight: 600;
        color: rgb(var(--v-theme-on-surface));
      }
    }
  }

  .selection-list {
    max-height: 200px;
    overflow-y: auto;
    margin-bottom: 12px;

    .selection-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 8px;
      border-radius: 4px;
      margin-bottom: 4px;
      background: rgba(59, 130, 246, 0.05);
      border-left: 2px solid #3b82f6;

      &:hover {
        background: rgba(59, 130, 246, 0.1);
      }

      .item-index {
        font-size: 11px;
        font-weight: 600;
        color: #3b82f6;
        min-width: 20px;
        text-align: center;
      }

      .item-icon {
        flex-shrink: 0;
      }

      .item-title {
        flex: 1;
        font-size: 12px;
        color: rgb(var(--v-theme-on-surface));
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  }

  .panel-actions {
    display: flex;
    gap: 8px;
    justify-content: flex-end;
  }
}
</style>
