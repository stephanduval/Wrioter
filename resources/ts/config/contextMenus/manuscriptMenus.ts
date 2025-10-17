import type { MenuItem } from '@/composables/useContextMenu'
import { useRouter } from 'vue-router'
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

export const getManuscriptMenuItems = (manuscript: Manuscript): MenuItem[] => {
  const router = useRouter()
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
    { separator: true },
    {
      id: 'delete',
      label: t('contextMenu.manuscript.delete'),
      icon: 'bx-trash',
      danger: true,
      action: async () => {
        if (confirm(t('contextMenu.manuscript.deleteConfirm', { title: manuscript.title }))) {
          console.log('Delete manuscript:', manuscript.id)
          // TODO: Implement delete functionality when API method is available
          alert(t('contextMenu.manuscript.deleteNotImplemented'))
        }
      },
      disabled: () => {
        // Can add permission checks here
        return false
      }
    }
  ]
}