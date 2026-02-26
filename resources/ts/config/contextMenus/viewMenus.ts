import type { MenuItem } from '@/composables/useContextMenu'
import { router } from '@/plugins/1.router'
import { getI18n } from '@/plugins/i18n'
import { useItemStore } from '@/stores/item'
import { useManuscriptStore } from '@/stores/manuscript'

interface ViewMenuContext {
  folderId: number
  manuscriptId: number
  onAutoLayout?: () => void
}

/**
 * Returns menu items for right-clicking on empty space in views (Corkboard, Outline, MindMap).
 * Creates new items as children of the current folder.
 */
export const getEmptySpaceMenuItems = (context: ViewMenuContext): MenuItem[] => {
  const itemStore = useItemStore()
  const manuscriptStore = useManuscriptStore()
  const { t } = getI18n().global

  const items: MenuItem[] = [
    {
      id: 'new-page',
      label: t('contextMenu.item.newPage'),
      icon: 'bx-plus',
      action: async () => {
        try {
          const newItem = await itemStore.createItem(context.manuscriptId, {
            title: t('contextMenu.item.newPage'),
            parent_id: context.folderId,
            type: 'text',
            content: '',
            content_format: 'html'
          })

          await manuscriptStore.fetchManuscriptItems(context.manuscriptId)
          router.push(`/manuscripts/${context.manuscriptId}/items/${newItem.id}/edit`)
        } catch (error) {
          console.error('Failed to create new page:', error)
          alert(t('contextMenu.item.createPageError') || 'Failed to create new page')
        }
      }
    }
  ]

  if (context.onAutoLayout) {
    items.push({
      id: 'auto-layout',
      label: 'Auto Layout',
      icon: 'bx-git-branch',
      action: () => context.onAutoLayout!()
    })
  }

  return items
}
