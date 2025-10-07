<template>
  <div class="manuscript-view">
    <!-- Toolbar -->
    <VToolbar
      density="compact"
      color="surface-variant"
      class="manuscript-toolbar"
    >
      <!-- View Settings -->
      <VBtnGroup density="compact">
        <VBtn
          v-for="size in fontSizes"
          :key="size.value"
          :variant="fontSize === size.value ? 'flat' : 'text'"
          size="small"
          @click="setFontSize(size.value)"
        >
          {{ size.label }}
        </VBtn>
      </VBtnGroup>

      <VDivider vertical class="mx-2" />

      <!-- Line Spacing -->
      <VBtnGroup density="compact">
        <VBtn
          v-for="spacing in lineSpacings"
          :key="spacing.value"
          :variant="lineSpacing === spacing.value ? 'flat' : 'text'"
          size="small"
          @click="setLineSpacing(spacing.value)"
        >
          {{ spacing.label }}
        </VBtn>
      </VBtnGroup>

      <VSpacer />

      <!-- Word Count -->
      <VChip
        size="small"
        color="primary"
        variant="tonal"
      >
        <VIcon icon="bx-bar-chart" size="small" class="me-1" />
        {{ totalWords.toLocaleString() }} words
      </VChip>

      <VDivider vertical class="mx-2" />

      <!-- Actions -->
      <VBtn
        icon="bx-printer"
        size="small"
        title="Print"
        @click="handlePrint"
      />

      <VBtn
        icon="bx-export"
        size="small"
        title="Export"
        @click="handleExport"
      />

      <VMenu>
        <template #activator="{ props }">
          <VBtn
            icon="bx-dots-vertical-rounded"
            size="small"
            v-bind="props"
          />
        </template>

        <VList>
          <VListItem @click="togglePageBreaks">
            <template #prepend>
              <VIcon
                :icon="showPageBreaks ? 'bx-check-square' : 'bx-square'"
              />
            </template>
            <VListItemTitle>Show Page Breaks</VListItemTitle>
          </VListItem>

          <VListItem @click="handleCopyAll">
            <template #prepend>
              <VIcon icon="bx-copy" />
            </template>
            <VListItemTitle>Copy All Text</VListItemTitle>
          </VListItem>
        </VList>
      </VMenu>
    </VToolbar>

    <!-- Content -->
    <div
      ref="contentRef"
      class="manuscript-content"
      :class="{
        [`font-size-${fontSize}`]: true,
        [`line-spacing-${lineSpacing}`]: true
      }"
    >
      <div class="manuscript-container">
        <!-- Render each item -->
        <template
          v-for="(item, index) in items"
          :key="item.id"
        >
          <div
            class="manuscript-item-wrapper"
            :class="{ 'drag-over': dragOverIndex === index }"
            :draggable="true"
            @dragstart="handleDragStart(item, index, $event)"
            @dragend="handleDragEnd"
            @dragover="handleDragOver(index, $event)"
            @dragleave="handleDragLeave"
            @drop="handleDrop(index, $event)"
          >
            <!-- Drag handle -->
            <div class="drag-handle" title="Drag to reorder">
              <VIcon icon="bx-menu" size="small" />
            </div>

            <ManuscriptItem
              :item="item"
              :font-size="fontSize"
              :line-spacing="lineSpacing"
              @click="handleItemClick(item)"
            />
          </div>

          <!-- Page Break -->
          <div
            v-if="showPageBreaks && index < items.length - 1"
            class="page-break"
          >
            <div class="page-break-line" />
            <VChip
              size="x-small"
              variant="tonal"
              class="page-break-label"
            >
              {{ item.title }}
            </VChip>
          </div>
        </template>

        <!-- Empty state handled by parent FolderView -->
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useFolderViewStore, type FolderItem, type FolderData } from '@/stores/folderView'
import { reorderFolderItems } from '@/api/folders'
import ManuscriptItem from './ManuscriptItem.vue'

const props = defineProps<{
  folderId: number
  folder: FolderData | null
  items: FolderItem[]
}>()

const emit = defineEmits<{
  print: []
  export: []
  itemClick: [item: FolderItem]
  itemsReordered: []
}>()

// Store
const folderViewStore = useFolderViewStore()

// Local state
const contentRef = ref<HTMLElement>()

// Drag and drop state
const draggedItem = ref<FolderItem | null>(null)
const draggedIndex = ref<number>(-1)
const dragOverIndex = ref<number>(-1)

// View settings
const fontSize = ref<'small' | 'medium' | 'large'>('medium')
const lineSpacing = ref<'single' | '1.5' | 'double'>('1.5')
const showPageBreaks = ref(true)

const fontSizes = [
  { label: 'Small', value: 'small' as const },
  { label: 'Medium', value: 'medium' as const },
  { label: 'Large', value: 'large' as const }
]

const lineSpacings = [
  { label: 'Single', value: 'single' as const },
  { label: '1.5', value: '1.5' as const },
  { label: 'Double', value: 'double' as const }
]

// Computed
const totalWords = computed(() => {
  return props.items.reduce((sum, item) => sum + (item.word_count || 0), 0)
})

// Methods
function setFontSize(size: 'small' | 'medium' | 'large') {
  fontSize.value = size
  saveSettings()
}

function setLineSpacing(spacing: 'single' | '1.5' | 'double') {
  lineSpacing.value = spacing
  saveSettings()
}

function togglePageBreaks() {
  showPageBreaks.value = !showPageBreaks.value
  saveSettings()
}

async function saveSettings() {
  try {
    await folderViewStore.saveManuscriptSettings({
      font_size: fontSize.value,
      line_spacing: lineSpacing.value,
      show_page_breaks: showPageBreaks.value
    })
  } catch (err) {
    console.error('Failed to save manuscript settings:', err)
  }
}

function handlePrint() {
  emit('print')
  window.print()
}

function handleExport() {
  emit('export')
  // TODO: Implement export dialog
  console.log('Export manuscript')
}

function handleCopyAll() {
  const text = props.items
    .map(item => {
      const title = item.title
      const content = item.content || ''
      return `${title}\n\n${content}`
    })
    .join('\n\n---\n\n')

  navigator.clipboard.writeText(text)
    .then(() => {
      console.log('Copied all text to clipboard')
      // TODO: Show success toast
    })
    .catch(err => {
      console.error('Failed to copy text:', err)
    })
}

function handleItemClick(item: FolderItem) {
  emit('itemClick', item)
}

// Drag and drop handlers
function handleDragStart(item: FolderItem, index: number, event: DragEvent) {
  draggedItem.value = item
  draggedIndex.value = index

  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', String(item.id))
  }
}

function handleDragEnd() {
  draggedItem.value = null
  draggedIndex.value = -1
  dragOverIndex.value = -1
}

function handleDragOver(index: number, event: DragEvent) {
  event.preventDefault()

  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move'
  }

  // Only update if different from dragged item
  if (index !== draggedIndex.value) {
    dragOverIndex.value = index
  }
}

function handleDragLeave() {
  dragOverIndex.value = -1
}

async function handleDrop(targetIndex: number, event: DragEvent) {
  event.preventDefault()

  if (!draggedItem.value || draggedIndex.value === -1 || draggedIndex.value === targetIndex) {
    handleDragEnd()
    return
  }

  try {
    // Create new order for all items
    const reorderedItems = [...props.items]
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

    console.log('Items reordered successfully')
  } catch (error) {
    console.error('Failed to reorder items:', error)
    // TODO: Show error toast
  } finally {
    handleDragEnd()
  }
}

// Load saved settings
watch(
  () => folderViewStore.currentViewSettings,
  (settings: any) => {
    if (settings) {
      if (settings.font_size) fontSize.value = settings.font_size
      if (settings.line_spacing) lineSpacing.value = settings.line_spacing
      if (settings.show_page_breaks !== undefined) {
        showPageBreaks.value = settings.show_page_breaks
      }
    }
  },
  { immediate: true }
)
</script>

<style scoped>
.manuscript-view {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: rgb(var(--v-theme-surface));
}

.manuscript-toolbar {
  flex-shrink: 0;
  border-bottom: 1px solid rgb(var(--v-theme-surface-variant));
}

.manuscript-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  background-color: #f5f5f5;
  padding: 2rem;
}

.manuscript-container {
  max-width: 800px;
  margin: 0 auto;
  background-color: white;
  padding: 3rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border-radius: 4px;
}

/* Font Sizes */
.manuscript-content.font-size-small .manuscript-container {
  font-size: 14px;
}

.manuscript-content.font-size-medium .manuscript-container {
  font-size: 16px;
}

.manuscript-content.font-size-large .manuscript-container {
  font-size: 18px;
}

/* Line Spacing */
.manuscript-content.line-spacing-single .manuscript-container {
  line-height: 1.5;
}

.manuscript-content.line-spacing-1\.5 .manuscript-container {
  line-height: 1.8;
}

.manuscript-content.line-spacing-double .manuscript-container {
  line-height: 2;
}

/* Page Break */
.page-break {
  position: relative;
  margin: 3rem 0;
  text-align: center;
}

.page-break-line {
  height: 1px;
  background: linear-gradient(
    to right,
    transparent,
    rgb(var(--v-theme-primary)) 20%,
    rgb(var(--v-theme-primary)) 80%,
    transparent
  );
}

.page-break-label {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: white;
  padding: 0 1rem;
}

/* Print Styles */
@media print {
  .manuscript-toolbar {
    display: none !important;
  }

  .manuscript-content {
    padding: 0;
    background: white;
  }

  .manuscript-container {
    max-width: 100%;
    box-shadow: none;
    padding: 0;
  }

  .page-break {
    page-break-after: always;
    margin: 0;
  }

  .page-break-line,
  .page-break-label {
    display: none;
  }
}

/* Drag and Drop Styles */
.manuscript-item-wrapper {
  position: relative;
  transition: all 0.2s ease;
  border-left: 3px solid transparent;
  margin-left: -3px;
}

.manuscript-item-wrapper:hover .drag-handle {
  opacity: 1;
}

.manuscript-item-wrapper.drag-over {
  border-left-color: rgb(var(--v-theme-primary));
  background-color: rgba(var(--v-theme-primary), 0.05);
}

.drag-handle {
  position: absolute;
  left: -2rem;
  top: 1rem;
  opacity: 0;
  cursor: grab;
  padding: 0.5rem;
  border-radius: 4px;
  transition: opacity 0.2s ease;
  color: rgb(var(--v-theme-on-surface-variant));
}

.drag-handle:hover {
  background-color: rgba(var(--v-theme-surface-variant), 0.5);
}

.drag-handle:active {
  cursor: grabbing;
}

/* Responsive */
@media (max-width: 960px) {
  .manuscript-content {
    padding: 1rem;
  }

  .manuscript-container {
    padding: 2rem 1.5rem;
  }

  .drag-handle {
    left: -1.5rem;
  }
}

@media (max-width: 600px) {
  .manuscript-content {
    padding: 0.5rem;
  }

  .manuscript-container {
    padding: 1.5rem 1rem;
  }

  /* Always show drag handle on mobile */
  .drag-handle {
    opacity: 0.6;
    left: -1rem;
    top: 0.5rem;
  }
}
</style>
