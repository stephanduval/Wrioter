<template>
  <div
    id="corkboard-container"
    class="corkboard-view"
    :class="{
      'is-loading': isLoading,
      'is-empty': !hasCards,
      'selection-mode': selectionStore.isSelectionMode
    }"
  >
    <!-- Toolbar -->
    <CorkboardToolbar
      v-model:zoom="corkboardStore.viewConfig.zoom"
      v-model:layout="corkboardStore.viewConfig.layout"
      v-model:display-mode="corkboardStore.viewConfig.displayMode"
      v-model:columns="corkboardStore.viewConfig.columns"
      :selected-count="selectionStore.selectedCount"
      :total-count="corkboardStore.cardCount"
      :filters="corkboardStore.filters"
      :is-loading="isLoading"
      @search="handleSearch"
      @filter="handleFilter"
      @sort="handleSort"
      @create-card="handleCreateCard"
      @bulk-action="handleBulkAction"
      @toggle-selection-mode="toggleSelectionMode"
    />

    <!-- Main content area -->
    <div class="corkboard-content" @contextmenu="handleEmptySpaceContextMenu">
      <!-- Loading state -->
      <div
        v-if="isLoading"
        class="loading-container"
      >
        <VProgressCircular
          indeterminate
          color="primary"
          size="48"
        />
        <p class="text-body-1 mt-4">Loading corkboard...</p>
      </div>

      <!-- Empty state -->
      <div
        v-else-if="!hasCards"
        class="empty-state"
      >
        <VIcon
          icon="bx-grid-alt"
          size="64"
          color="disabled"
        />
        <h3 class="text-h6 mt-4 mb-2">No cards yet</h3>
        <p class="text-body-2 text-disabled mb-4">
          Create your first card to start organizing your manuscript
        </p>
        <VBtn
          color="primary"
          prepend-icon="bx-plus"
          @click="handleCreateCard"
        >
          Create Card
        </VBtn>
      </div>

      <!-- Error state -->
      <VAlert
        v-else-if="error"
        type="error"
        class="ma-4"
        :text="error"
        closable
        @click:close="clearError"
      />

      <!-- Corkboard grid -->
      <CorkboardGrid
        v-else
        :cards="filteredCards"
        :view-config="corkboardStore.viewConfig"
        :selected-ids="selectionStore.selectedArray"
        :card-positions="corkboardStore.cardPositions"
        :scrivening-mode="scriveningMode"
        :scrivening-separators="scriveningSeparators"
        @card-select="handleCardSelect"
        @card-reorder="handleCardReorder"
        @card-drop="handleCardDrop"
        @context-menu="handleContextMenu"
      />
    </div>

    <!-- Selection mode toolbar (mobile) -->
    <VBottomSheet
      v-model="selectionStore.isSelectionMode"
      class="selection-sheet"
    >
      <VCard>
        <VCardTitle class="d-flex align-center">
          <span>{{ selectionStore.selectedCount }} selected</span>
          <VSpacer />
          <VBtn
            icon="bx-x"
            variant="text"
            @click="toggleSelectionMode"
          />
        </VCardTitle>
        <VCardText>
          <div class="d-flex gap-2 flex-wrap">
            <VBtn
              prepend-icon="bx-edit"
              @click="handleBulkAction('edit')"
            >
              Edit
            </VBtn>
            <VBtn
              prepend-icon="bx-move"
              @click="handleBulkAction('move')"
            >
              Move
            </VBtn>
            <VBtn
              prepend-icon="bx-copy"
              @click="handleBulkAction('duplicate')"
            >
              Duplicate
            </VBtn>
            <VBtn
              prepend-icon="bx-trash"
              color="error"
              @click="handleBulkAction('delete')"
            >
              Delete
            </VBtn>
          </div>
        </VCardText>
      </VCard>
    </VBottomSheet>

    <!-- Context menu -->
    <VMenu
      v-model="showContextMenu"
      absolute
      :style="{
        position: 'fixed',
        left: `${contextMenuPosition[0]}px`,
        top: `${contextMenuPosition[1]}px`
      }"
    >
      <VList>
        <VListItem
          v-for="item in contextMenuItems"
          :key="item.id"
          :disabled="item.disabled"
          @click="item.action"
        >
          <template #prepend>
            <VIcon :icon="item.icon" />
          </template>
          <VListItemTitle>{{ item.label }}</VListItemTitle>
        </VListItem>
      </VList>
    </VMenu>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  VProgressCircular,
  VIcon,
  VBtn,
  VAlert,
  VBottomSheet,
  VCard,
  VCardTitle,
  VCardText,
  VSpacer,
  VMenu,
  VList,
  VListItem,
  VListItemTitle
} from 'vuetify/components'

import CorkboardToolbar from './CorkboardToolbar.vue'
import CorkboardGrid from './CorkboardGrid.vue'

import { useCorkboardStore } from '@/stores/corkboard'
import { useFolderViewStore, type FolderItem, type FolderData } from '@/stores/folderView'
import { useSelectionStore } from '@/stores/selection'
import { useManuscriptStore } from '@/stores/manuscript'
import { useBoxSelection } from '@/composables/useSelection'
import { useContextMenu } from '@/composables/useContextMenu'
import { reorderFolderItems } from '@/api/folders'
import { getEmptySpaceMenuItems } from '@/config/contextMenus'
import type { CorkboardCard } from '@/api/corkboard'

/**
 * CorkboardView - Refactored to work as a view mode
 *
 * Now receives folder and items as props from parent FolderView component.
 * Focuses only on corkboard-specific UI and interactions.
 */
interface ScriveningSeparator {
  type: 'dashed' | 'header' | 'dots'
  title?: string
  beforeIndex: number
}

interface Props {
  folderId: number
  folder: FolderData | null
  items: FolderItem[]
  scriveningMode?: boolean
  scriveningSeparators?: ScriveningSeparator[]
}

const props = withDefaults(defineProps<Props>(), {
  scriveningMode: false,
  scriveningSeparators: () => []
})

const router = useRouter()
const route = useRoute()

// Stores
const corkboardStore = useCorkboardStore()
const selectionStore = useSelectionStore()
const manuscriptStore = useManuscriptStore()
const contextMenu = useContextMenu()

// Computed: Get manuscript ID from folder or store
const manuscriptId = computed(() =>
  props.folder?.manuscript_id || manuscriptStore.currentManuscript?.id
)

// Reactive state
const showContextMenu = ref(false)
const contextMenuPosition = ref<[number, number]>([0, 0])
const contextMenuItems = ref<any[]>([])

// Computed properties (now based on props instead of store)
const isLoading = computed(() => folderViewStore.isLoading)
const hasCards = computed(() => adaptedCards.value.length > 0)
const filteredCards = computed(() => {
  // Apply corkboard store filters to adapted cards
  // For now, return all adapted cards - filtering will be added later
  return adaptedCards.value
})
const error = computed(() => folderViewStore.error)

// Box selection setup
const containerRef = ref<HTMLElement>()
useBoxSelection({
  container: containerRef,
  itemSelector: '[data-card-id]',
  onSelect: (elements) => {
    const cardIds = elements
      .map(el => el.getAttribute('data-card-id'))
      .filter((id): id is string => id !== null)

    if (cardIds.length > 0) {
      selectionStore.replaceSelection(cardIds)
    }
  }
})

// Event handlers
const handleSearch = (query: string) => {
  corkboardStore.setFilters({ searchQuery: query })
}

const handleFilter = (filters: any) => {
  corkboardStore.setFilters(filters)
}

const handleSort = (sort: any) => {
  corkboardStore.setSort(sort)
}

const handleCreateCard = async () => {
  try {
    const newCard = await corkboardStore.createCard({
      title: 'New Card',
      synopsis: 'Enter your synopsis here...',
      status: 'todo'
    })

    if (newCard) {
      // Select the new card
      selectionStore.selectItem(newCard.id)

      // Navigate to edit if needed
      // router.push(`/manuscripts/${props.manuscriptId}/items/${newCard.itemId}/edit`)
    }
  } catch (error) {
    console.error('Failed to create card:', error)
  }
}

const handleCardSelect = (cardId: string, options: { additive?: boolean; range?: boolean } = {}) => {
  if (options.range) {
    selectionStore.extendSelection(cardId)
  } else if (options.additive) {
    selectionStore.toggleItem(cardId)
  } else {
    selectionStore.selectItem(cardId)
  }
}

const handleCardReorder = async (operations: any[]) => {
  try {
    // Convert corkboard operations to folder reorder format
    const folderOperations = operations.map(op => ({
      item_id: Number(op.cardId),
      order: op.toIndex
    }))

    await reorderFolderItems(props.folderId, folderOperations)

    // Reload folder data
    await folderViewStore.loadFolderContents(props.folderId)
  } catch (error) {
    console.error('Failed to reorder cards:', error)
  }
}

const handleCardDrop = async (draggedCardIds: string[], targetIndex: number, targetPosition?: any) => {
  try {
    // Create reorder operations from drop
    const reorderedCards = [...adaptedCards.value]
    const draggedIndices = draggedCardIds.map(id => reorderedCards.findIndex(c => c.id === id))

    // Remove dragged cards
    const draggedItems = draggedIndices.map(idx => reorderedCards[idx])
    draggedIndices.sort((a, b) => b - a).forEach(idx => reorderedCards.splice(idx, 1))

    // Insert at target
    reorderedCards.splice(targetIndex, 0, ...draggedItems)

    // Create operations
    const operations = reorderedCards.map((card, index) => ({
      item_id: card.itemId,
      order: index
    }))

    await reorderFolderItems(props.folderId, operations)

    // Reload folder data
    await folderViewStore.loadFolderContents(props.folderId)
  } catch (error) {
    console.error('Failed to handle card drop:', error)
  }
}

const handleEmptySpaceContextMenu = (event: MouseEvent) => {
  const target = event.target as HTMLElement

  // If clicking on a card or inside a card, let the card's context menu handle it
  if (target.closest('[data-card-id]') || target.closest('.corkboard-card')) {
    return
  }

  // Only show menu if we have the required context
  if (!manuscriptId.value) {
    console.warn('Cannot show context menu: no manuscript ID available')
    return
  }

  const menuItems = getEmptySpaceMenuItems({
    folderId: props.folderId,
    manuscriptId: manuscriptId.value
  })

  contextMenu.show(event, { items: menuItems })
}

const handleContextMenu = (cardIds: string[], event: MouseEvent) => {
  contextMenuPosition.value = [event.clientX, event.clientY]

  const isMultiple = cardIds.length > 1
  const selectedCards = cardIds.map(id => corkboardStore.getCardById(id)).filter(Boolean)

  contextMenuItems.value = [
    {
      id: 'edit',
      label: isMultiple ? 'Edit Selected' : 'Edit Card',
      icon: 'bx-edit',
      action: () => handleBulkAction('edit'),
      disabled: false
    },
    {
      id: 'duplicate',
      label: isMultiple ? 'Duplicate Selected' : 'Duplicate Card',
      icon: 'bx-copy',
      action: () => handleBulkAction('duplicate'),
      disabled: false
    },
    {
      id: 'separator-1',
      separator: true
    },
    {
      id: 'status-todo',
      label: 'Mark as To Do',
      icon: 'bx-circle',
      action: () => handleBulkStatusChange('todo'),
      disabled: false
    },
    {
      id: 'status-draft',
      label: 'Mark as Draft',
      icon: 'bx-edit-alt',
      action: () => handleBulkStatusChange('draft'),
      disabled: false
    },
    {
      id: 'status-review',
      label: 'Mark as Review',
      icon: 'bx-search',
      action: () => handleBulkStatusChange('review'),
      disabled: false
    },
    {
      id: 'status-done',
      label: 'Mark as Done',
      icon: 'bx-check-circle',
      action: () => handleBulkStatusChange('done'),
      disabled: false
    },
    {
      id: 'separator-2',
      separator: true
    },
    {
      id: 'delete',
      label: isMultiple ? 'Delete Selected' : 'Delete Card',
      icon: 'bx-trash',
      action: () => handleBulkAction('delete'),
      disabled: false
    }
  ]

  showContextMenu.value = true
}

const handleBulkAction = async (action: string) => {
  const selectedIds = selectionStore.selectedArray

  switch (action) {
    case 'edit':
      // Open multi-edit dialog or navigate to first item
      if (selectedIds.length === 1) {
        const card = corkboardStore.getCardById(selectedIds[0])
        if (card) {
          router.push(`/manuscripts/${props.manuscriptId}/items/${card.itemId}/edit`)
        }
      } else {
        // Open bulk edit dialog
        console.log('Bulk edit:', selectedIds)
      }
      break

    case 'duplicate':
      try {
        // Duplicate selected cards
        for (const cardId of selectedIds) {
          const card = corkboardStore.getCardById(cardId)
          if (card) {
            await corkboardStore.createCard({
              ...card,
              title: `${card.title} (Copy)`,
              id: undefined // Let backend generate new ID
            })
          }
        }
      } catch (error) {
        console.error('Failed to duplicate cards:', error)
      }
      break

    case 'move':
      console.log('Move cards:', selectedIds)
      // Open move dialog
      break

    case 'delete':
      if (confirm(`Delete ${selectedIds.length} card(s)?`)) {
        try {
          for (const cardId of selectedIds) {
            await corkboardStore.deleteCard(cardId)
          }
          selectionStore.clearSelection()
        } catch (error) {
          console.error('Failed to delete cards:', error)
        }
      }
      break
  }

  showContextMenu.value = false
}

const handleBulkStatusChange = async (status: CorkboardCard['status']) => {
  const selectedIds = selectionStore.selectedArray

  try {
    await corkboardStore.bulkUpdateCards(selectedIds, { status })
  } catch (error) {
    console.error('Failed to update card status:', error)
  }

  showContextMenu.value = false
}

const toggleSelectionMode = () => {
  if (selectionStore.isSelectionMode) {
    selectionStore.exitSelectionMode()
  } else {
    selectionStore.enterSelectionMode()
  }
}

const clearError = () => {
  // Clear error in store if method exists
  if ('clearError' in corkboardStore) {
    (corkboardStore as any).clearError()
  }
}

// Store setup
const folderViewStore = useFolderViewStore()

// Convert FolderItem[] to CorkboardCard[] format
// This adapts the folder items to work with existing corkboard components
const adaptedCards = computed<CorkboardCard[]>(() => {
  return props.items.map(item => ({
    id: String(item.id),
    itemId: item.id,
    title: item.title,
    synopsis: item.synopsis,
    excerpt: item.excerpt,
    content: item.content,
    word_count: item.word_count,
    status: item.metadata?.status || 'draft',
    label: item.metadata?.label,
    color: item.metadata?.color,
    metadata: item.metadata,
    include_in_compile: item.include_in_compile !== false,
    item_order: item.item_order || 0,
    updated_at: item.updated_at,
    type: item.type
  }))
})

// Lifecycle
onMounted(() => {
  console.log('CorkboardView mounted with', props.items.length, 'items')
  // Data loading is now handled by parent FolderView
  // Just setup corkboard-specific UI state here
})

// Cleanup on unmount
onBeforeUnmount(() => {
  selectionStore.reset()
})
</script>

<style scoped lang="scss">
.corkboard-view {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: rgb(var(--v-theme-surface));

  &.is-loading {
    pointer-events: none;
  }

  &.selection-mode {
    .corkboard-content {
      padding-bottom: 80px; // Space for mobile toolbar
    }
  }
}

.corkboard-content {
  flex: 1;
  overflow: auto;
  position: relative;
  padding: 16px;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  color: rgb(var(--v-theme-on-surface-variant));
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 400px;
  text-align: center;
  color: rgb(var(--v-theme-on-surface-variant));
}

.selection-sheet {
  :deep(.v-bottom-sheet__content) {
    max-height: 200px;
  }
}

// Context menu styling
.v-menu {
  :deep(.v-list) {
    min-width: 200px;
  }

  :deep(.v-list-item) {
    min-height: 40px;

    &.v-list-item--disabled {
      opacity: 0.5;
    }
  }
}

// Mobile responsive
@media (max-width: 768px) {
  .corkboard-content {
    padding: 8px;
  }
}

// High contrast mode
@media (prefers-contrast: high) {
  .corkboard-view {
    border: 1px solid rgb(var(--v-theme-outline));
  }
}

// Reduced motion
@media (prefers-reduced-motion: reduce) {
  .corkboard-view {
    * {
      transition: none !important;
      animation: none !important;
    }
  }
}
</style>