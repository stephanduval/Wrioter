import type { MenuItem } from '@/composables/useContextMenu'
import { router } from '@/plugins/1.router'
import { getI18n } from '@/plugins/i18n'
import { useItemStore } from '@/stores/item'
import { useManuscriptStore } from '@/stores/manuscript'
import { useSelectionStore } from '@/stores/selection'
import { navigateTo } from '@/utils/navigation'

interface ManuscriptItem {
  id: number
  itemId: number
  manuscript_id?: number
  parent_id: number | null
  title: string
  type: string
  item_order?: number
  order_index?: number
  childCount?: number
  metadata?: {
    status?: 'draft' | 'in_progress' | 'completed' | 'archived'
    isCompilable?: boolean
    wordCount?: number
  }
}

export const getItemMenuItems = (item: ManuscriptItem, manuscriptId: number): MenuItem[] => {
  const itemStore = useItemStore()
  const manuscriptStore = useManuscriptStore()
  const selectionStore = useSelectionStore()
  const i18n = getI18n()
  const { t } = i18n.global

  const canMoveUp = () => {
    return item.order_index !== undefined && item.order_index > 0
  }

  const canMoveDown = () => {
    return true
  }

  const isFolder = () => {
    return item.type === 'folder'
  }

  const isEmptyFolder = () => {
    if (item.type !== 'folder') return false

    if (item.childCount !== undefined) {
      return item.childCount === 0
    }

    const node = manuscriptStore.findNodeById(`item-${item.itemId}`)
    return node ? node.children.length === 0 : false
  }

  const hasMultiSelection = () => {
    return selectionStore.selectedCount > 1
  }

  const getSelectedItemIds = (): number[] => {
    return selectionStore.selectedArray.map(id => {
      const node = manuscriptStore.findNodeById(id)
      return node ? node.itemId : parseInt(id.replace('item-', ''))
    })
  }

  return [
    // Folder View Mode Options (only for folders)
    {
      id: 'view-manuscript',
      label: 'View as Manuscript',
      icon: 'bx-file-doc',
      action: () => {
        navigateTo(`/folders/${item.id}?view=manuscript`)
      },
      hidden: () => !isFolder() || hasMultiSelection()
    },
    {
      id: 'view-corkboard',
      label: 'View as Corkboard',
      icon: 'bx-grid-alt',
      action: () => {
        navigateTo(`/folders/${item.id}?view=corkboard`)
      },
      hidden: () => !isFolder() || hasMultiSelection()
    },
    {
      id: 'view-outline',
      label: 'View as Outline',
      icon: 'bx-list-ul',
      action: () => {
        navigateTo(`/folders/${item.id}?view=outline`)
      },
      hidden: () => !isFolder() || hasMultiSelection()
    },
    { id: 'sep-folder-views', separator: true, hidden: () => !isFolder() || hasMultiSelection() },

    // Sort children (only for folders with children)
    {
      id: 'sort-alpha',
      label: t('contextMenu.item.sortAlphabetically') || 'Sort Alphabetically',
      icon: 'bx-sort-a-z',
      action: async () => {
        try {
          await manuscriptStore.sortChildren(manuscriptId, item.itemId, 'title', 'asc')
        } catch (error) {
          console.error('Failed to sort children:', error)
        }
      },
      hidden: () => !isFolder() || isEmptyFolder() || hasMultiSelection()
    },
    {
      id: 'sort-modified',
      label: t('contextMenu.item.sortByModified') || 'Sort by Last Modified',
      icon: 'bx-sort-down',
      action: async () => {
        try {
          await manuscriptStore.sortChildren(manuscriptId, item.itemId, 'updated_at', 'desc')
        } catch (error) {
          console.error('Failed to sort children:', error)
        }
      },
      hidden: () => !isFolder() || isEmptyFolder() || hasMultiSelection()
    },
    { id: 'sep-sort', separator: true, hidden: () => !isFolder() || isEmptyFolder() || hasMultiSelection() },

    // Convert empty folder to item
    {
      id: 'convert-to-item',
      label: t('contextMenu.item.convertToItem') || 'Convert to Item',
      icon: 'bx-file',
      action: async () => {
        try {
          await manuscriptStore.convertFolderToItem(manuscriptId, item.itemId)
        } catch (error) {
          console.error('Failed to convert folder to item:', error)
          alert(t('contextMenu.item.convertToItemError') || 'Failed to convert folder to item')
        }
      },
      hidden: () => !isEmptyFolder() || hasMultiSelection()
    },

    // Ungroup folder (move children out, delete folder)
    {
      id: 'ungroup-folder',
      label: t('contextMenu.item.ungroupFolder') || 'Ungroup Folder',
      icon: 'bx-layer-minus',
      action: async () => {
        const node = manuscriptStore.findNodeById(`item-${item.itemId}`)
        const childCount = node ? node.children.length : 0
        if (confirm(t('contextMenu.item.ungroupConfirm', { title: item.title, count: childCount }) || `Ungroup "${item.title}"? Its ${childCount} children will be moved to the parent level.`)) {
          try {
            await manuscriptStore.ungroupFolder(manuscriptId, item.itemId)
          } catch (error) {
            console.error('Failed to ungroup folder:', error)
            alert(t('contextMenu.item.ungroupError') || 'Failed to ungroup folder')
          }
        }
      },
      hidden: () => !isFolder() || isEmptyFolder() || hasMultiSelection()
    },
    { id: 'sep-convert', separator: true, hidden: () => !isFolder() || hasMultiSelection() },

    // Create options
    {
      id: 'new-folder',
      label: t('contextMenu.item.newFolder') || 'New Folder',
      icon: 'bx-folder-plus',
      action: async () => {
        try {
          const newItem = await itemStore.createItem(manuscriptId, {
            title: t('contextMenu.item.untitledFolder') || 'Untitled Folder',
            parent_id: isFolder() ? item.id : item.parent_id,
            type: 'folder',
            content: '',
            content_format: 'html'
          })

          await manuscriptStore.fetchManuscriptItems(manuscriptId)
        } catch (error) {
          console.error('Failed to create new folder:', error)
          alert(t('contextMenu.item.createFolderError') || 'Failed to create folder')
        }
      },
      hidden: () => hasMultiSelection()
    },
    {
      id: 'new-page',
      label: t('contextMenu.item.newPage'),
      icon: 'bx-plus',
      action: async () => {
        try {
          const newItem = await itemStore.createItem(manuscriptId, {
            title: t('contextMenu.item.newPage'),
            parent_id: isFolder() ? item.id : item.parent_id,
            type: 'text',
            content: '',
            content_format: 'html'
          })

          await manuscriptStore.fetchManuscriptItems(manuscriptId)
          router.push(`/manuscripts/${manuscriptId}/items/${newItem.id}/edit`)
        } catch (error) {
          console.error('Failed to create new page:', error)
          alert(t('contextMenu.item.createPageError') || 'Failed to create new page')
        }
      },
      hidden: () => hasMultiSelection()
    },
    { id: 'sep-new-page', separator: true, hidden: () => hasMultiSelection() },

    // === Batch Operations (shown when multiple items selected) ===
    {
      id: 'batch-move',
      label: t('contextMenu.item.batchMove') || `Move ${selectionStore.selectedCount} Items to Folder...`,
      icon: 'bx-folder-open',
      action: async () => {
        const folders = manuscriptStore.getAllFolders()
        if (folders.length === 0) {
          alert('No folders available. Create a folder first.')
          return
        }

        const folderOptions = folders.map(f => `${'  '.repeat(f.depth)}${f.title} (ID: ${f.id})`).join('\n')
        const input = prompt(`Select a target folder:\n\n${folderOptions}\n\nEnter the folder ID:`)
        if (input) {
          const targetId = parseInt(input)
          if (!isNaN(targetId)) {
            try {
              await manuscriptStore.batchMoveToFolder(manuscriptId, getSelectedItemIds(), targetId)
              selectionStore.clearSelection()
            } catch (error) {
              console.error('Failed to move items:', error)
              alert('Failed to move items to folder')
            }
          }
        }
      },
      hidden: () => !hasMultiSelection()
    },
    {
      id: 'batch-status',
      label: t('contextMenu.item.batchStatus') || `Change Status (${selectionStore.selectedCount} items)`,
      icon: 'bx-flag',
      children: [
        {
          id: 'batch-status-draft',
          label: t('contextMenu.item.statusDraft') || 'Draft',
          icon: 'bx-circle',
          action: async () => {
            try {
              await manuscriptStore.batchUpdateStatus(manuscriptId, getSelectedItemIds(), 'draft')
              selectionStore.clearSelection()
            } catch (error) {
              console.error('Failed to update status:', error)
            }
          }
        },
        {
          id: 'batch-status-in-progress',
          label: t('contextMenu.item.statusInProgress') || 'In Progress',
          icon: 'bx-loader-circle',
          action: async () => {
            try {
              await manuscriptStore.batchUpdateStatus(manuscriptId, getSelectedItemIds(), 'in_progress')
              selectionStore.clearSelection()
            } catch (error) {
              console.error('Failed to update status:', error)
            }
          }
        },
        {
          id: 'batch-status-completed',
          label: t('contextMenu.item.statusCompleted') || 'Completed',
          icon: 'bx-check-circle',
          action: async () => {
            try {
              await manuscriptStore.batchUpdateStatus(manuscriptId, getSelectedItemIds(), 'completed')
              selectionStore.clearSelection()
            } catch (error) {
              console.error('Failed to update status:', error)
            }
          }
        },
        {
          id: 'batch-status-archived',
          label: t('contextMenu.item.statusArchived') || 'Archived',
          icon: 'bx-archive',
          action: async () => {
            try {
              await manuscriptStore.batchUpdateStatus(manuscriptId, getSelectedItemIds(), 'archived')
              selectionStore.clearSelection()
            } catch (error) {
              console.error('Failed to update status:', error)
            }
          }
        }
      ],
      hidden: () => !hasMultiSelection()
    },
    {
      id: 'batch-delete',
      label: t('contextMenu.item.batchDelete') || `Delete ${selectionStore.selectedCount} Items`,
      icon: 'bx-trash',
      danger: true,
      action: async () => {
        const count = selectionStore.selectedCount
        if (confirm(t('contextMenu.item.batchDeleteConfirm', { count }) || `Are you sure you want to delete ${count} items?`)) {
          try {
            await manuscriptStore.batchDeleteItems(manuscriptId, getSelectedItemIds())
            selectionStore.clearSelection()
          } catch (error) {
            console.error('Failed to delete items:', error)
            alert('Failed to delete items')
          }
        }
      },
      hidden: () => !hasMultiSelection()
    },
    { id: 'sep-batch', separator: true, hidden: () => !hasMultiSelection() },

    // === Single Item Operations (hidden when multi-selected) ===
    {
      id: 'edit',
      label: t('contextMenu.item.edit'),
      icon: 'bx-edit',
      action: () => {
        navigateTo(`/manuscripts/${manuscriptId}/items/${item.id}/edit`)
      },
      hidden: () => isFolder() || hasMultiSelection()
    },
    {
      id: 'view',
      label: t('contextMenu.item.view'),
      icon: 'bx-show',
      action: () => {
        navigateTo(`/manuscripts/${manuscriptId}/items/${item.id}`)
      },
      hidden: () => hasMultiSelection()
    },
    { id: 'sep-view', separator: true, hidden: () => hasMultiSelection() },
    {
      id: 'move-up',
      label: t('contextMenu.item.moveUp'),
      icon: 'bx-up-arrow-alt',
      action: async () => {
        console.log('Move item up:', item.id)
      },
      disabled: () => !canMoveUp(),
      hidden: () => hasMultiSelection()
    },
    {
      id: 'move-down',
      label: t('contextMenu.item.moveDown'),
      icon: 'bx-down-arrow-alt',
      action: async () => {
        console.log('Move item down:', item.id)
      },
      disabled: () => !canMoveDown(),
      hidden: () => hasMultiSelection()
    },
    { id: 'sep-move', separator: true, hidden: () => hasMultiSelection() },
    {
      id: 'status',
      label: t('contextMenu.item.changeStatus'),
      icon: 'bx-flag',
      action: () => {
        console.log('Change status for item:', item.id)
      },
      hidden: () => hasMultiSelection()
    },
    {
      id: 'compile',
      label: item.metadata?.isCompilable ? t('contextMenu.item.excludeFromCompile') : t('contextMenu.item.includeInCompile'),
      icon: item.metadata?.isCompilable ? 'bx-x-circle' : 'bx-check-circle',
      action: async () => {
        console.log('Toggle compile for item:', item.id)
      },
      hidden: () => hasMultiSelection()
    },
    { id: 'sep-status', separator: true, hidden: () => hasMultiSelection() },
    {
      id: 'rename',
      label: t('contextMenu.item.rename'),
      icon: 'bx-rename',
      action: async () => {
        const newTitle = prompt(t('contextMenu.item.renamePrompt', { title: item.title }), item.title)
        if (newTitle && newTitle.trim() !== '' && newTitle !== item.title) {
          try {
            await manuscriptStore.renameItem(manuscriptId, item.itemId, newTitle.trim())
          } catch (error) {
            console.error('Failed to rename item:', error)
            alert(t('contextMenu.item.renameError') || 'Failed to rename item')
          }
        }
      },
      hidden: () => hasMultiSelection()
    },
    {
      id: 'duplicate',
      label: t('contextMenu.item.duplicate'),
      icon: 'bx-copy',
      action: async () => {
        console.log('Duplicate item:', item.id)
      },
      hidden: () => hasMultiSelection()
    },
    { id: 'sep-rename', separator: true, hidden: () => hasMultiSelection() },
    {
      id: 'delete',
      label: t('contextMenu.item.delete'),
      icon: 'bx-trash',
      danger: true,
      action: async () => {
        if (confirm(t('contextMenu.item.deleteConfirm', { title: item.title }))) {
          try {
            await manuscriptStore.deleteItem(manuscriptId, item.itemId)
          } catch (error) {
            console.error('Failed to delete item:', error)
            alert(t('contextMenu.item.deleteError') || 'Failed to delete item')
          }
        }
      },
      hidden: () => hasMultiSelection()
    }
  ]
}
