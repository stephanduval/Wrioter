import type { MenuItem } from '@/composables/useContextMenu'
import { useRouter } from 'vue-router'
import { useManuscriptStore } from '@/stores/manuscript'

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

  return [
    {
      id: 'view',
      label: 'View Manuscript',
      icon: 'bx-show',
      action: () => {
        router.push(`/manuscripts/${manuscript.id}`)
      }
    },
    {
      id: 'edit',
      label: 'Edit Details',
      icon: 'bx-edit',
      action: () => {
        router.push(`/manuscripts/${manuscript.id}/edit`)
      }
    },
    {
      id: 'duplicate',
      label: 'Duplicate',
      icon: 'bx-copy',
      action: async () => {
        console.log('Duplicate manuscript:', manuscript.id)
        // TODO: Implement duplicate functionality
      }
    },
    {
      id: 'export',
      label: 'Export',
      icon: 'bx-download',
      action: () => {
        console.log('Export manuscript:', manuscript.id)
        // TODO: Implement export functionality
      }
    },
    { separator: true },
    {
      id: 'delete',
      label: 'Delete',
      icon: 'bx-trash',
      danger: true,
      action: async () => {
        if (confirm(`Are you sure you want to delete "${manuscript.title}"?`)) {
          console.log('Delete manuscript:', manuscript.id)
          // TODO: Implement delete functionality when API method is available
          alert('Delete functionality not yet implemented')
        }
      },
      disabled: () => {
        // Can add permission checks here
        return false
      }
    }
  ]
}