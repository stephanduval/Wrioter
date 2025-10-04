<template>
  <tr
    class="outline-row"
    :class="{ 'is-selected': selected }"
    @click="handleClick"
  >
    <!-- Selection Checkbox -->
    <td class="selection-cell">
      <VCheckbox
        :model-value="selected"
        hide-details
        density="compact"
        @update:model-value="handleSelect"
        @click.stop
      />
    </td>

    <!-- Dynamic Columns -->
    <td
      v-for="column in columns"
      :key="column.id"
      :class="`cell-${column.type}`"
      @dblclick="column.editable && startEditing(column)"
    >
      <!-- Editing Mode -->
      <template v-if="isEditingColumn(column.id)">
        <VTextField
          v-if="column.type === 'text'"
          :model-value="getCellValue(column)"
          autofocus
          density="compact"
          hide-details
          @blur="stopEditing"
          @keydown.enter="stopEditing"
          @keydown.esc="cancelEditing"
          @update:model-value="handleValueChange(column, $event)"
        />

        <VTextField
          v-else-if="column.type === 'number'"
          :model-value="getCellValue(column)"
          type="number"
          autofocus
          density="compact"
          hide-details
          @blur="stopEditing"
          @keydown.enter="stopEditing"
          @keydown.esc="cancelEditing"
          @update:model-value="handleValueChange(column, $event)"
        />

        <VSelect
          v-else-if="column.type === 'status'"
          :model-value="getCellValue(column)"
          :items="statusOptions"
          autofocus
          density="compact"
          hide-details
          @blur="stopEditing"
          @update:model-value="handleValueChange(column, $event)"
        />

        <VCheckbox
          v-else-if="column.type === 'boolean'"
          :model-value="getCellValue(column)"
          density="compact"
          hide-details
          @update:model-value="handleValueChange(column, $event)"
        />
      </template>

      <!-- Display Mode -->
      <template v-else>
        <!-- Title Column (with icon) -->
        <div
          v-if="column.field === 'title'"
          class="title-cell"
        >
          <VIcon
            :icon="getItemIcon(item.type)"
            size="small"
            class="me-2"
          />
          <span>{{ getCellValue(column) }}</span>
        </div>

        <!-- Status Column (with chip) -->
        <VChip
          v-else-if="column.type === 'status'"
          size="small"
          :color="getStatusColor(getCellValue(column))"
          variant="tonal"
        >
          {{ getCellValue(column) || 'draft' }}
        </VChip>

        <!-- Boolean Column (with checkbox) -->
        <VCheckbox
          v-else-if="column.type === 'boolean'"
          :model-value="getCellValue(column)"
          disabled
          density="compact"
          hide-details
        />

        <!-- Number Column (formatted) -->
        <span v-else-if="column.type === 'number'">
          {{ formatNumber(getCellValue(column)) }}
        </span>

        <!-- Date Column (formatted) -->
        <span v-else-if="column.type === 'date'">
          {{ formatDate(getCellValue(column)) }}
        </span>

        <!-- Text Column (truncated) -->
        <span
          v-else
          :title="getCellValue(column)"
          class="text-cell"
        >
          {{ truncateText(getCellValue(column), 100) }}
        </span>
      </template>
    </td>
  </tr>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useOutlineStore, type OutlineColumn } from '@/stores/outline'
import type { FolderItem } from '@/stores/folderView'

const props = defineProps<{
  item: FolderItem
  columns: OutlineColumn[]
  selected: boolean
}>()

const emit = defineEmits<{
  select: [itemId: number, selected: boolean]
  edit: [itemId: number, columnId: string, value: any]
  click: [item: FolderItem]
}>()

// Store
const outlineStore = useOutlineStore()

// Local state
const editingColumnId = ref<string | null>(null)
const editingValue = ref<any>(null)

// Options
const statusOptions = [
  'draft',
  'in_progress',
  'review',
  'complete',
  'done'
]

// Methods
function getCellValue(column: OutlineColumn): any {
  return outlineStore.getNestedValue(props.item, column.field)
}

function isEditingColumn(columnId: string): boolean {
  return outlineStore.isCellEditing(props.item.id, columnId)
}

function startEditing(column: OutlineColumn) {
  if (!column.editable) return

  editingColumnId.value = column.id
  editingValue.value = getCellValue(column)
  outlineStore.startEditing(props.item.id, column.id)
}

function stopEditing() {
  if (editingColumnId.value && editingValue.value !== getCellValue({ field: editingColumnId.value } as OutlineColumn)) {
    emit('edit', props.item.id, editingColumnId.value, editingValue.value)
  }

  outlineStore.stopEditing()
  editingColumnId.value = null
  editingValue.value = null
}

function cancelEditing() {
  outlineStore.stopEditing()
  editingColumnId.value = null
  editingValue.value = null
}

function handleValueChange(column: OutlineColumn, value: any) {
  editingValue.value = value

  // For boolean and select, save immediately
  if (column.type === 'boolean' || column.type === 'status') {
    emit('edit', props.item.id, column.id, value)
    outlineStore.stopEditing()
  }
}

function handleSelect(selected: boolean) {
  emit('select', props.item.id, selected)
}

function handleClick() {
  emit('click', props.item)
}

function getItemIcon(type: string): string {
  const iconMap: Record<string, string> = {
    folder: 'bx-folder',
    text: 'bx-file-doc',
    research: 'bx-search',
    character: 'bx-user',
    mindmap: 'bx-network-chart',
    image: 'bx-image',
    file: 'bx-file',
    link: 'bx-link'
  }
  return iconMap[type] || 'bx-file'
}

function getStatusColor(status: string): string {
  const colorMap: Record<string, string> = {
    draft: 'grey',
    in_progress: 'blue',
    review: 'orange',
    complete: 'green',
    done: 'green'
  }
  return colorMap[status] || 'grey'
}

function formatNumber(value: any): string {
  if (value === null || value === undefined) return ''
  return Number(value).toLocaleString()
}

function formatDate(value: any): string {
  if (!value) return ''
  return new Date(value).toLocaleDateString()
}

function truncateText(text: any, maxLength: number): string {
  if (!text) return ''
  const str = String(text)
  return str.length > maxLength ? str.substring(0, maxLength) + '...' : str
}
</script>

<style scoped>
.outline-row {
  cursor: pointer;
  transition: background-color 0.2s;
}

.outline-row:hover {
  background-color: rgba(var(--v-theme-primary), 0.05);
}

.outline-row.is-selected {
  background-color: rgba(var(--v-theme-primary), 0.1);
}

.outline-row td {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid rgb(var(--v-theme-surface-variant));
  vertical-align: middle;
}

.selection-cell {
  width: 48px;
  padding: 0.5rem !important;
}

.title-cell {
  display: flex;
  align-items: center;
  font-weight: 500;
}

.text-cell {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cell-number {
  text-align: right;
  font-variant-numeric: tabular-nums;
}

.cell-date {
  white-space: nowrap;
}

/* Responsive */
@media (max-width: 960px) {
  .outline-row td {
    padding: 0.5rem 0.75rem;
    font-size: 0.875rem;
  }
}
</style>
