import type { MenuItem } from '@/composables/useContextMenu'
import { router } from '@/plugins/1.router'
import { useManuscriptStore } from '@/stores/manuscript'
import { getI18n } from '@/plugins/i18n'

interface Manuscript {
  id: number
  title: string
  manuscript_type: 'standard' | 'scrivener'
  created_at: string
  updated_at: string
  description?: string
  scrivener_uuid?: string
}

export interface ManuscriptMenuOptions {
  onDeleteRequest?: (manuscript: Manuscript) => void
}

export const getManuscriptMenuItems = (manuscript: Manuscript, options?: ManuscriptMenuOptions): MenuItem[] => {
  const manuscriptStore = useManuscriptStore()
  const i18n = getI18n()
  const { t } = i18n.global

  return [
    {
      id: 'view',
      label: t('contextMenu.manuscript.view'),
      icon: 'bx-show',
      action: () => {
        router.push(`/manuscripts/${manuscript.id}`)
      }
    },
    {
      id: 'edit',
      label: t('contextMenu.manuscript.edit'),
      icon: 'bx-edit',
      action: () => {
        router.push(`/manuscripts/${manuscript.id}/edit`)
      }
    },
    {
      id: 'duplicate',
      label: t('contextMenu.manuscript.duplicate'),
      icon: 'bx-copy',
      action: async () => {
        console.log('Duplicate manuscript:', manuscript.id)
        // TODO: Implement duplicate functionality
      }
    },
    {
      id: 'export',
      label: t('contextMenu.manuscript.export'),
      icon: 'bx-download',
      action: () => {
        console.log('Export manuscript:', manuscript.id)
        // TODO: Implement export functionality
      }
    },
    { id: 'sep-actions', separator: true },
    {
      id: 'delete',
      label: t('contextMenu.manuscript.delete'),
      icon: 'bx-trash',
      danger: true,
      action: async () => {
        console.log('Delete action called for manuscript:', manuscript.id, manuscript.title)
        if (options?.onDeleteRequest) {
          options.onDeleteRequest(manuscript)
        } else {
          // Fallback to browser confirm if no callback provided
          const confirmMessage = t('contextMenu.manuscript.deleteConfirm', { title: manuscript.title })
          if (confirm(confirmMessage || `Delete "${manuscript.title}"?`)) {
            try {
              console.log('User confirmed deletion of manuscript:', manuscript.id)
              await manuscriptStore.deleteManuscript(manuscript.id)
              console.log('Manuscript deleted successfully')
              router.push('/manuscripts')
            } catch (error) {
              console.error('Failed to delete manuscript:', error)
              alert(t('contextMenu.manuscript.deleteError') || 'Failed to delete manuscript')
            }
          }
        }
      },
      disabled: () => {
        // Can add permission checks here
        return false
      }
    }
  ]
}