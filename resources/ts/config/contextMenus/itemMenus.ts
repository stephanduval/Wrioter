import type { MenuItem } from '@/composables/useContextMenu'
import { useRouter } from 'vue-router'
import { useManuscriptStore } from '@/stores/manuscript'
import { useItemStore } from '@/stores/item'

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
  const router = useRouter()
  const itemStore = useItemStore()
  const manuscriptStore = useManuscriptStore()

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
    {
      id: 'edit',
      label: 'Edit Item',
      icon: 'bx-edit',
      action: () => {
        router.push(`/manuscripts/${manuscriptId}/items/${item.id}/edit`)
      },
      hidden: () => isFolder()
    },
    {
      id: 'view',
      label: 'View Item',
      icon: 'bx-show',
      action: () => {
        router.push(`/manuscripts/${manuscriptId}/items/${item.id}`)
      }
    },
    { separator: true },
    {
      id: 'move-up',
      label: 'Move Up',
      icon: 'bx-up-arrow-alt',
      action: async () => {
        console.log('Move item up:', item.id)
        // TODO: Implement move up functionality
      },
      disabled: () => !canMoveUp()
    },
    {
      id: 'move-down',
      label: 'Move Down',
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
      label: 'Change Status',
      icon: 'bx-flag',
      action: () => {
        console.log('Change status for item:', item.id)
        // TODO: Implement status change dialog
      }
    },
    {
      id: 'compile',
      label: item.metadata?.isCompilable ? 'Exclude from Compile' : 'Include in Compile',
      icon: item.metadata?.isCompilable ? 'bx-x-circle' : 'bx-check-circle',
      action: async () => {
        console.log('Toggle compile for item:', item.id)
        // TODO: Implement toggle compile functionality
      }
    },
    { separator: true },
    {
      id: 'duplicate',
      label: 'Duplicate',
      icon: 'bx-copy',
      action: async () => {
        console.log('Duplicate item:', item.id)
        // TODO: Implement duplicate functionality
      }
    },
    {
      id: 'delete',
      label: 'Delete',
      icon: 'bx-trash',
      danger: true,
      action: async () => {
        if (confirm(`Are you sure you want to delete "${item.title}"?`)) {
          console.log('Delete item:', item.id)
          // TODO: Implement delete functionality when API method is available
          alert('Delete functionality not yet implemented')
        }
      }
    }
  ]
}