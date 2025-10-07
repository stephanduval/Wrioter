import type { MenuItem } from '@/composables/useContextMenu'
import { router } from '@/plugins/1.router'
import { useManuscriptStore } from '@/stores/manuscript'
import { useItemStore } from '@/stores/item'
import { getI18n } from '@/plugins/i18n'
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
    { separator: true, hidden: () => !isFolder() },

    // Regular item options
    {
      id: 'new-page',
      label: t('contextMenu.item.newPage'),
      icon: 'bx-plus',
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
          await manuscriptStore.fetchManuscriptItems(manuscriptId)

          // Navigate to the new item
          router.push(`/manuscripts/${manuscriptId}/items/${newItem.id}/edit`)
        } catch (error) {
          console.error('Failed to create new page:', error)
          alert(t('contextMenu.item.createPageError') || 'Failed to create new page')
        }
      }
    },
    { separator: true },
    {
      id: 'edit',
      label: t('contextMenu.item.edit'),
      icon: 'bx-edit',
      action: () => {
        navigateTo(`/manuscripts/${manuscriptId}/items/${item.id}/edit`)
      },
      hidden: () => isFolder()
    },
    {
      id: 'view',
      label: t('contextMenu.item.view'),
      icon: 'bx-show',
      action: () => {
        navigateTo(`/manuscripts/${manuscriptId}/items/${item.id}`)
      }
    },
    { separator: true },
    {
      id: 'move-up',
      label: t('contextMenu.item.moveUp'),
      icon: 'bx-up-arrow-alt',
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
      action: async () => {
        console.log('Move item down:', item.id)
        // TODO: Implement move down functionality
      },
      disabled: () => !canMoveDown()
    },
    { separator: true },
    {
      id: 'status',
      label: t('contextMenu.item.changeStatus'),
      icon: 'bx-flag',
      action: () => {
        console.log('Change status for item:', item.id)
        // TODO: Implement status change dialog
      }
    },
    {
      id: 'compile',
      label: item.metadata?.isCompilable ? t('contextMenu.item.excludeFromCompile') : t('contextMenu.item.includeInCompile'),
      icon: item.metadata?.isCompilable ? 'bx-x-circle' : 'bx-check-circle',
      action: async () => {
        console.log('Toggle compile for item:', item.id)
        // TODO: Implement toggle compile functionality
      }
    },
    { separator: true },
    {
      id: 'rename',
      label: t('contextMenu.item.rename'),
      icon: 'bx-rename',
      action: async () => {
        const newTitle = prompt(t('contextMenu.item.renamePrompt', { title: item.title }), item.title)
        if (newTitle && newTitle.trim() !== '' && newTitle !== item.title) {
          try {
            console.log('Rename item:', item.id, 'to:', newTitle)
            await manuscriptStore.renameItem(manuscriptId, item.itemId, newTitle.trim())
            console.log('Item renamed successfully')
          } catch (error) {
            console.error('Failed to rename item:', error)
            alert(t('contextMenu.item.renameError') || 'Failed to rename item')
          }
        }
      }
    },
    {
      id: 'duplicate',
      label: t('contextMenu.item.duplicate'),
      icon: 'bx-copy',
      action: async () => {
        console.log('Duplicate item:', item.id)
        // TODO: Implement duplicate functionality
      }
    },
    { separator: true },
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