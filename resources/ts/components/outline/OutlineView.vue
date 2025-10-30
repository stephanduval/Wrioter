<template>
  <div class="outline-view">
    <!-- Toolbar -->
    <VToolbar
      density="compact"
      color="surface-variant"
      class="outline-toolbar"
    >
      <!-- Search -->
      <VTextField
        v-model="searchQuery"
        prepend-inner-icon="bx-search"
        placeholder="Search items..."
        hide-details
        density="compact"
        clearable
        style="max-width: 300px"
        class="me-2"
      />

      <VDivider vertical class="mx-2" />

      <!-- Column Picker -->
      <VBtn
        size="small"
        prepend-icon="bx-columns"
        @click="toggleColumnPicker"
      >
        Columns
      </VBtn>

      <VSpacer />

      <!-- Active Filters Indicator -->
      <VChip
        v-if="hasActiveFilters"
        size="small"
        color="primary"
        variant="tonal"
        closable
        @click:close="clearFilters"
      >
        {{ filters.length + (searchQuery ? 1 : 0) }} filter(s) active
      </VChip>

      <!-- Actions Menu -->
      <VMenu>
        <template #activator="{ props }">
          <VBtn
            icon="bx-dots-vertical-rounded"
            size="small"
            v-bind="props"
          />
        </template>

        <VList>
          <VListItem @click="handleExportCSV">
            <template #prepend>
              <VIcon icon="bx-export" />
            </template>
            <VListItemTitle>Export to CSV</VListItemTitle>
          </VListItem>

          <VListItem @click="clearSort">
            <template #prepend>
              <VIcon icon="bx-sort" />
            </template>
            <VListItemTitle>Clear Sorting</VListItemTitle>
          </VListItem>

          <VListItem @click="resetToDefaults">
            <template #prepend>
              <VIcon icon="bx-reset" />
            </template>
            <VListItemTitle>Reset to Defaults</VListItemTitle>
          </VListItem>
        </VList>
      </VMenu>
    </VToolbar>

    <!-- Table Container -->
    <div class="outline-table-container">
      <VTable
        fixed-header
        class="outline-table"
      >
        <thead>
          <tr>
            <!-- Drag Handle Column -->
            <th class="drag-handle-column"></th>

            <!-- Selection Column -->
            <th class="selection-column">
              <VCheckbox
                :model-value="allSelected"
                :indeterminate="someSelected"
                hide-details
                density="compact"
                @update:model-value="toggleSelectAll"
              />
            </th>

            <!-- Dynamic Columns -->
            <th
              v-for="column in visibleColumnConfigs"
              :key="column.id"
              :style="{ width: getColumnWidth(column) }"
              class="sortable-column"
              @click="column.sortable && toggleSort(column.field)"
            >
              <div class="column-header">
                <span>{{ column.label }}</span>
                <VIcon
                  v-if="column.sortable && sortConfig.column === column.field"
                  :icon="sortConfig.direction === 'asc' ? 'bx-up-arrow-alt' : 'bx-down-arrow-alt'"
                  size="small"
                  class="sort-icon"
                />
              </div>
            </th>
          </tr>
        </thead>

        <tbody>
          <template v-for="(item, index) in processedItems" :key="item.id">
            <!-- Render separator row if one exists before this index -->
            <tr
              v-if="getSeparatorBeforeIndex(index)"
              :key="`separator-${index}`"
              class="scrivening-separator-row"
            >
              <td :colspan="visibleColumnConfigs.length + 2" class="separator-cell">
                <div
                  v-if="getSeparatorBeforeIndex(index)?.type === 'dashed'"
                  class="separator-dashed"
                />
                <div
                  v-else-if="getSeparatorBeforeIndex(index)?.type === 'header'"
                  class="separator-header"
                >
                  {{ getSeparatorBeforeIndex(index)?.title }}
                </div>
                <div
                  v-else-if="getSeparatorBeforeIndex(index)?.type === 'dots'"
                  class="separator-dots"
                >
                  • • •
                </div>
              </td>
            </tr>

            <!-- Render the outline row -->
            <OutlineRow
              :item="item"
              :index="index"
              :columns="visibleColumnConfigs"
              :selected="selectedIds.has(item.id)"
              @select="handleRowSelect"
              @edit="handleCellEdit"
              @click="handleRowClick"
              @drag-start="handleDragStart"
              @drag-end="handleDragEnd"
              @drag-over="handleDragOver"
              @drag-leave="handleDragLeave"
              @drop="handleDrop"
            />
          </template>
        </tbody>
      </VTable>

      <!-- Empty State -->
      <div
        v-if="processedItems.length === 0 && items.length > 0"
        class="empty-state"
      >
        <VIcon icon="bx-filter" size="48" class="mb-2" />
        <p>No items match your filters</p>
        <VBtn
          color="primary"
          @click="clearFilters"
        >
          Clear Filters
        </VBtn>
      </div>
    </div>

    <!-- Column Picker Dialog -->
    <VDialog
      v-model="showColumnPicker"
      max-width="500"
    >
      <VCard>
        <VCardTitle>
          <span class="text-h6">Configure Columns</span>
        </VCardTitle>

        <VCardText>
          <VList>
            <VListItem
              v-for="column in availableColumns"
              :key="column.id"
            >
              <template #prepend>
                <VCheckbox
                  :model-value="visibleColumns.includes(column.id)"
                  hide-details
                  @update:model-value="toggleColumn(column.id)"
                />
              </template>

              <VListItemTitle>{{ column.label }}</VListItemTitle>
              <VListItemSubtitle>{{ column.type }}</VListItemSubtitle>
            </VListItem>
          </VList>
        </VCardText>

        <VCardActions>
          <VBtn
            text="Reset to Defaults"
            @click="resetColumnDefaults"
          />
          <VSpacer />
          <VBtn
            text="Close"
            @click="showColumnPicker = false"
          />
        </VCardActions>
      </VCard>
    </VDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useOutlineStore } from '@/stores/outline'
import { useFolderViewStore, type FolderItem, type FolderData } from '@/stores/folderView'
import { useSelectionStore } from '@/stores/selection'
import { reorderFolderItems } from '@/api/folders'
import OutlineRow from './OutlineRow.vue'

interface ScriveningSeparator {
  type: 'dashed' | 'header' | 'dots'
  title?: string
  beforeIndex: number
}

const props = withDefaults(defineProps<{
  folderId: number
  folder: FolderData | null
  items: FolderItem[]
  scriveningMode?: boolean
  scriveningSeparators?: ScriveningSeparator[]
}>(), {
  scriveningMode: false,
  scriveningSeparators: () => []
})

const emit = defineEmits<{
  exportCSV: []
  rowClick: [item: FolderItem]
  cellEdit: [itemId: number, columnId: string, value: any]
  itemsReordered: []
}>()

// Stores
const outlineStore = useOutlineStore()
const folderViewStore = useFolderViewStore()
const selectionStore = useSelectionStore()

const {
  availableColumns,
  visibleColumns,
  visibleColumnConfigs,
  sortConfig,
  filters,
  searchQuery,
  hasActiveFilters,
  showColumnPicker
} = storeToRefs(outlineStore)

const { selectedIds } = storeToRefs(selectionStore)

// Computed
const processedItems = computed(() => {
  let result = [...props.items]

  // Apply filters
  result = outlineStore.filterItems(result)

  // Apply sorting
  result = outlineStore.sortItems(result)

  return result
})

const allSelected = computed(() => {
  if (processedItems.value.length === 0) return false
  return processedItems.value.every(item => selectedIds.value.has(item.id))
})

const someSelected = computed(() => {
  if (processedItems.value.length === 0) return false
  const selected = processedItems.value.filter(item => selectedIds.value.has(item.id))
  return selected.length > 0 && selected.length < processedItems.value.length
})

// Methods
function getColumnWidth(column: any): string {
  return `${column.width}px`
}

// Get separator before a given index
function getSeparatorBeforeIndex(index: number): ScriveningSeparator | undefined {
  if (!props.scriveningMode || !props.scriveningSeparators) return undefined
  return props.scriveningSeparators.find(sep => sep.beforeIndex === index)
}

function toggleSort(field: string) {
  outlineStore.toggleSort(field)
  saveSettings()
}

function clearSort() {
  outlineStore.clearSort()
  saveSettings()
}

function toggleColumn(columnId: string) {
  outlineStore.toggleColumn(columnId)
  saveSettings()
}

function toggleColumnPicker() {
  outlineStore.toggleColumnPicker()
}

function clearFilters() {
  outlineStore.clearFilters()
}

function resetToDefaults() {
  outlineStore.resetToDefaults()
  saveSettings()
}

function resetColumnDefaults() {
  outlineStore.resetToDefaults()
  saveSettings()
}

function toggleSelectAll() {
  if (allSelected.value) {
    selectionStore.clearSelection()
  } else {
    processedItems.value.forEach(item => {
      selectionStore.addToSelection(item.id)
    })
  }
}

function handleRowSelect(itemId: number, selected: boolean) {
  if (selected) {
    selectionStore.addToSelection(itemId)
  } else {
    selectionStore.removeFromSelection(itemId)
  }
}

function handleRowClick(item: FolderItem) {
  emit('rowClick', item)
}

function handleCellEdit(itemId: number, columnId: string, value: any) {
  emit('cellEdit', itemId, columnId, value)
}

function handleExportCSV() {
  emit('exportCSV')

  // Simple CSV export
  const headers = visibleColumnConfigs.value.map(col => col.label)
  const rows = processedItems.value.map(item => {
    return visibleColumnConfigs.value.map(col => {
      const value = outlineStore.getNestedValue(item, col.field)
      return `"${String(value || '').replace(/"/g, '""')}"`
    })
  })

  const csv = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n')

  // Download
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${props.folder?.title || 'outline'}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

async function saveSettings() {
  const config = outlineStore.getConfiguration()
  await folderViewStore.saveOutlineSettings(config)
}

// Drag and drop state
const draggedItem = ref<FolderItem | null>(null)
const draggedIndex = ref<number>(-1)

// Drag and drop handlers
function handleDragStart(item: FolderItem, index: number, event: DragEvent) {
  draggedItem.value = item
  draggedIndex.value = index
}

function handleDragEnd() {
  draggedItem.value = null
  draggedIndex.value = -1
}

function handleDragOver(index: number, event: DragEvent) {
  // Nothing needed here, handled by row component
}

function handleDragLeave() {
  // Nothing needed here, handled by row component
}

async function handleDrop(targetIndex: number, event: DragEvent) {
  if (!draggedItem.value || draggedIndex.value === -1 || draggedIndex.value === targetIndex) {
    handleDragEnd()
    return
  }

  try {
    // Create new order for all items
    const reorderedItems = [...processedItems.value]
    const [movedItem] = reorderedItems.splice(draggedIndex.value, 1)
    reorderedItems.splice(targetIndex, 0, movedItem)

    // Create reorder operations with new order indices
    const operations = reorderedItems.map((item, index) => ({
      item_id: item.id,
      order: index
    }))

    // Call API to persist the reorder
    await reorderFolderItems(props.folderId, operations)

    // Notify parent to refresh data
    emit('itemsReordered')

    console.log('Items reordered successfully in outline')
  } catch (error) {
    console.error('Failed to reorder items:', error)
    // TODO: Show error toast
  } finally {
    handleDragEnd()
  }
}

// Load saved settings
onMounted(() => {
  const settings = folderViewStore.currentViewSettings as any
  if (settings) {
    outlineStore.loadConfiguration(settings)
  }
})

// Watch for settings changes
watch(
  () => folderViewStore.currentViewSettings,
  (settings: any) => {
    if (settings) {
      outlineStore.loadConfiguration(settings)
    }
  }
)
</script>

<style scoped>
.outline-view {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: rgb(var(--v-theme-surface));
}

.outline-toolbar {
  flex-shrink: 0;
  border-bottom: 1px solid rgb(var(--v-theme-surface-variant));
}

.outline-table-container {
  flex: 1;
  overflow: auto;
  position: relative;
}

.outline-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}

.outline-table thead th {
  background-color: rgb(var(--v-theme-surface-variant));
  position: sticky;
  top: 0;
  z-index: 2;
  border-bottom: 2px solid rgb(var(--v-theme-primary));
  padding: 0.75rem 1rem;
  font-weight: 600;
  text-align: left;
  white-space: nowrap;
}

.drag-handle-column {
  width: 40px;
  padding: 0.5rem !important;
}

.selection-column {
  width: 48px;
  padding: 0.5rem !important;
}

.sortable-column {
  cursor: pointer;
  user-select: none;
}

.sortable-column:hover {
  background-color: rgba(var(--v-theme-primary), 0.1);
}

.column-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.sort-icon {
  opacity: 0.7;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  color: rgb(var(--v-theme-on-surface-variant));
}

/* Responsive */
@media (max-width: 960px) {
  .outline-table thead th {
    padding: 0.5rem 0.75rem;
    font-size: 0.875rem;
  }
}

/* Scrivening Separators */
.scrivening-separator-row {
  background: transparent;
}

.separator-cell {
  padding: 12px 16px !important;
  text-align: center;
}

.separator-dashed {
  width: 100%;
  border-top: 2px dashed rgba(0, 0, 0, 0.2);
}

.separator-header {
  font-size: 14px;
  font-weight: 600;
  color: rgb(var(--v-theme-primary));
  text-align: center;
  padding: 8px 16px;
  background: rgba(59, 130, 246, 0.1);
  border-radius: 4px;
  border: 1px solid rgba(59, 130, 246, 0.3);
  display: inline-block;
}

.separator-dots {
  font-size: 18px;
  color: rgba(0, 0, 0, 0.3);
  letter-spacing: 8px;
}
</style>
