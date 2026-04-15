import type { MenuItem } from '@/composables/useContextMenu'
import { router } from '@/plugins/1.router'
import { getI18n } from '@/plugins/i18n'
import { useItemStore } from '@/stores/item'
import { useManuscriptStore } from '@/stores/manuscript'

interface SavedView {
  id: number
  name: string
}

interface ViewMenuContext {
  folderId: number
  manuscriptId: number
  onAutoLayout?: () => void
  onSaveLayout?: () => void
  onSaveLayoutAs?: () => void
  onLoadSavedView?: (viewId: number) => void
  onRenameSavedView?: (viewId: number, currentName: string) => void
  onDeleteSavedView?: (viewId: number) => void
  savedViews?: SavedView[]
  activeSavedViewName?: string | null
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

  // Layout save section
  items.push({ id: 'sep-layout', separator: true } as MenuItem)

  if (context.onSaveLayout && context.activeSavedViewName) {
    items.push({
      id: 'save-layout',
      label: `Save Layout - ${context.activeSavedViewName}`,
      icon: 'bx-save',
      action: () => context.onSaveLayout!(),
    })
  }

  if (context.onSaveLayoutAs) {
    items.push({
      id: 'save-layout-as',
      label: 'Save Layout As...',
      icon: 'bx-copy',
      action: () => context.onSaveLayoutAs!(),
    })
  }

  // Flyout submenus for saved views
  const views = context.savedViews || []
  if (views.length > 0) {
    items.push({ id: 'sep-views', separator: true } as MenuItem)

    if (context.onLoadSavedView) {
      items.push({
        id: 'load-views',
        label: 'Load',
        icon: 'bx-upload',
        action: () => {},
        children: views.map(view => ({
          id: `load-view-${view.id}`,
          label: view.name,
          icon: 'bx-layout',
          action: () => context.onLoadSavedView!(view.id),
        })),
      })
    }

    if (context.onRenameSavedView) {
      items.push({
        id: 'rename-views',
        label: 'Rename',
        icon: 'bx-edit',
        action: () => {},
        children: views.map(view => ({
          id: `rename-view-${view.id}`,
          label: view.name,
          icon: 'bx-edit-alt',
          action: () => context.onRenameSavedView!(view.id, view.name),
        })),
      })
    }

    if (context.onDeleteSavedView) {
      items.push({
        id: 'delete-views',
        label: 'Delete',
        icon: 'bx-trash',
        danger: true,
        action: () => {},
        children: views.map(view => ({
          id: `delete-view-${view.id}`,
          label: view.name,
          icon: 'bx-trash',
          danger: true,
          action: () => context.onDeleteSavedView!(view.id),
        })),
      })
    }
  }

  return items
}
