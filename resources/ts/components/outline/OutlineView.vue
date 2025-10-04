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
          <OutlineRow
            v-for="item in processedItems"
            :key="item.id"
            :item="item"
            :columns="visibleColumnConfigs"
            :selected="selectedIds.has(item.id)"
            @select="handleRowSelect"
            @edit="handleCellEdit"
            @click="handleRowClick"
          />
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
import OutlineRow from './OutlineRow.vue'

const props = defineProps<{
  folderId: number
  folder: FolderData | null
  items: FolderItem[]
}>()

const emit = defineEmits<{
  exportCSV: []
  rowClick: [item: FolderItem]
  cellEdit: [itemId: number, columnId: string, value: any]
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
</style>
