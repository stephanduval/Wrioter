import type { MenuItem } from '@/composables/useContextMenu'
import { router } from '@/plugins/1.router'
import { getI18n } from '@/plugins/i18n'
import { useItemStore } from '@/stores/item'
import { useManuscriptStore } from '@/stores/manuscript'
import { useSnippetCollectionStore } from '@/stores/snippetCollection'
import { navigateTo } from '@/utils/navigation'
import { eventBus } from '@/services/eventBus'
import { itemsApi } from '@/api/items'

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
  const i18n = getI18n()
  const { t } = i18n.global

  const canMoveUp = () => {
    // TODO: Check if item can move up based on siblings
    return item.order_index !== undefined && item.order_index > 0
  }

  const canMoveDown = () => {
    // TODO: Check if item can move down based on siblings
    return true
  }

  const isFolder = () => {
    return item.type === 'folder'
  }

  const isSnippetCollection = () => {
    return item.type === 'snippet_collection'
  }

  const isSnippetReference = () => {
    return item.type === 'snippet_reference'
  }

  const isEmptyFolder = () => {
    // Check if it's a folder with no children
    if (item.type !== 'folder') return false

    // If childCount is provided, use it
    if (item.childCount !== undefined) {
      return item.childCount === 0
    }

    // Otherwise, check via the manuscript tree
    const node = manuscriptStore.findNodeById(`item-${item.itemId}`)
    return node ? node.children.length === 0 : false
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
      hidden: () => !isFolder()
    },
    {
      id: 'view-corkboard',
      label: 'View as Corkboard',
      icon: 'bx-grid-alt',
      action: () => {
        navigateTo(`/folders/${item.id}?view=corkboard`)
      },
      hidden: () => !isFolder()
    },
    {
      id: 'view-outline',
      label: 'View as Outline',
      icon: 'bx-list-ul',
      action: () => {
        navigateTo(`/folders/${item.id}?view=outline`)
      },
      hidden: () => !isFolder()
    },
    { id: 'sep-folder-views', separator: true, hidden: () => !isFolder() },

    // Snippet Collection View Option
    {
      id: 'view-collection',
      label: 'View Collection',
      icon: 'bx-collection',
      action: () => {
        navigateTo(`/manuscripts/${manuscriptId}/snippet-collections/${item.itemId}/view`)
      },
      hidden: () => !isSnippetCollection()
    },
    { id: 'sep-collection-views', separator: true, hidden: () => !isSnippetCollection() },

    // Convert empty folder to item
    {
      id: 'convert-to-item',
      label: t('contextMenu.item.convertToItem') || 'Convert to Item',
      icon: 'bx-file',
      action: async () => {
        try {
          console.log('Converting folder to item:', item.itemId)
          await manuscriptStore.convertFolderToItem(manuscriptId, item.itemId)
          console.log('Folder converted to item successfully')
        } catch (error) {
          console.error('Failed to convert folder to item:', error)
          alert(t('contextMenu.item.convertToItemError') || 'Failed to convert folder to item')
        }
      },
      hidden: () => !isEmptyFolder()
    },
    { id: 'sep-convert', separator: true, hidden: () => !isEmptyFolder() },

    // Regular item options
    {
      id: 'new-page',
      label: t('contextMenu.item.newPage'),
      icon: 'bx-plus',
      hidden: () => isSnippetCollection(),
      action: async () => {
        try {
          console.log('Create new page as child of:', item.id)

          const newItem = await itemStore.createItem(manuscriptId, {
            title: t('contextMenu.item.newPage'),
            parent_id: item.id,
            type: 'text',
            content: '',
            content_format: 'html'
          })

          console.log('New item created:', newItem)

          // Refresh the manuscript store to show the new item
          // Note: item:created event is emitted but adding to tree in-place is complex,
          // so we still do a full refresh for creates
          await manuscriptStore.fetchManuscriptItems(manuscriptId)

          // Navigate to the new item
          router.push(`/manuscripts/${manuscriptId}/items/${newItem.id}/edit`)
        } catch (error) {
          console.error('Failed to create new page:', error)
          alert(t('contextMenu.item.createPageError') || 'Failed to create new page')
        }
      }
    },
    { id: 'sep-new-page', separator: true, hidden: () => isSnippetCollection() },
    {
      id: 'edit',
      label: t('contextMenu.item.edit'),
      icon: 'bx-edit',
      action: () => {
        navigateTo(`/manuscripts/${manuscriptId}/items/${item.id}/edit`)
      },
      hidden: () => isFolder() || isSnippetCollection()
    },
    {
      id: 'view',
      label: t('contextMenu.item.view'),
      icon: 'bx-show',
      action: () => {
        navigateTo(`/manuscripts/${manuscriptId}/items/${item.id}`)
      }
    },
    { id: 'sep-view', separator: true },
    {
      id: 'move-up',
      label: t('contextMenu.item.moveUp'),
      icon: 'bx-up-arrow-alt',
      hidden: () => isSnippetCollection(),
      action: async () => {
        console.log('Move item up:', item.id)
        // TODO: Implement move up functionality
      },
      disabled: () => !canMoveUp()
    },
    {
      id: 'move-down',
      label: t('contextMenu.item.moveDown'),
      icon: 'bx-down-arrow-alt',
      hidden: () => isSnippetCollection(),
      action: async () => {
        console.log('Move item down:', item.id)
        // TODO: Implement move down functionality
      },
      disabled: () => !canMoveDown()
    },
    { id: 'sep-move', separator: true, hidden: () => isSnippetCollection() },
    {
      id: 'status',
      label: t('contextMenu.item.changeStatus'),
      icon: 'bx-flag',
      hidden: () => isSnippetCollection(),
      action: () => {
        console.log('Change status for item:', item.id)
        // TODO: Implement status change dialog
      }
    },
    {
      id: 'compile',
      label: item.metadata?.isCompilable ? t('contextMenu.item.excludeFromCompile') : t('contextMenu.item.includeInCompile'),
      icon: item.metadata?.isCompilable ? 'bx-x-circle' : 'bx-check-circle',
      hidden: () => isSnippetCollection(),
      action: async () => {
        console.log('Toggle compile for item:', item.id)
        // TODO: Implement toggle compile functionality
      }
    },
    { id: 'sep-status', separator: true, hidden: () => isSnippetCollection() },
    {
      id: 'duplicate',
      label: t('contextMenu.item.duplicate'),
      icon: 'bx-copy',
      hidden: () => isSnippetReference(),
      action: async () => {
        try {
          if (isSnippetCollection()) {
            const snippetCollectionStore = useSnippetCollectionStore()
            const newCollection = await snippetCollectionStore.duplicateCollection(manuscriptId, item.itemId)
            if (newCollection) {
              await manuscriptStore.fetchManuscriptItems(manuscriptId)
              console.log('Snippet collection duplicated:', newCollection.id)
            }
          } else {
            console.log('Duplicate item:', item.id)
            // TODO: Implement generic item duplicate functionality
          }
        } catch (error) {
          console.error('Failed to duplicate:', error)
          alert(t('contextMenu.item.duplicateError') || 'Failed to duplicate')
        }
      }
    },
    {
      id: 'add-to-collection',
      label: 'Add to Collection',
      icon: 'bx-collection',
      hidden: () => isSnippetCollection() || isSnippetReference(),
      action: async () => {
        try {
          // Fetch the full item content
          const fullItem = await itemsApi.getItem(manuscriptId, item.id)
          const content = fullItem.content || `[${item.title}]`

          // Emit event to trigger AddToCollectionDialog
          eventBus.emit('snippet:add-to-collection', {
            selectedText: content,
            sourceItemId: item.itemId,
            manuscriptId,
            positionData: { from: 0, to: content.length }
          })

          console.log('Add to collection triggered for item:', item.id)
        } catch (error) {
          console.error('Failed to add item to collection:', error)
          alert('Failed to add item to collection. Please try again.')
        }
      }
    },
    { id: 'sep-rename', separator: true },
    {
      id: 'delete',
      label: t('contextMenu.item.delete'),
      icon: 'bx-trash',
      danger: true,
      action: async () => {
        if (confirm(t('contextMenu.item.deleteConfirm', { title: item.title }))) {
          try {
            console.log('Delete item:', item.id)
            await manuscriptStore.deleteItem(manuscriptId, item.itemId)
            console.log('Item deleted successfully')
          } catch (error) {
            console.error('Failed to delete item:', error)
            alert(t('contextMenu.item.deleteError') || 'Failed to delete item')
          }
        }
      }
    }
  ]
}
