import type { MenuItem } from '@/composables/useContextMenu'
import { getI18n } from '@/plugins/i18n'
import { eventBus } from '@/services/eventBus'

export interface EditorMenuContext {
  itemId?: number
  manuscriptId?: number
  selectionPosition?: {
    from: number
    to: number
  }
}

export const getEditorMenuItems = (selection?: string, context?: EditorMenuContext): MenuItem[] => {
  const i18n = getI18n()
  const { t } = i18n.global
  const hasSelection = !!selection && selection.length > 0

  return [
    {
      id: 'cut',
      label: t('contextMenu.editor.cut'),
      icon: 'bx-cut',
      action: () => {
        document.execCommand('cut')
      },
      disabled: () => !hasSelection
    },
    {
      id: 'copy',
      label: t('contextMenu.editor.copy'),
      icon: 'bx-copy',
      action: () => {
        document.execCommand('copy')
      },
      disabled: () => !hasSelection
    },
    {
      id: 'paste',
      label: t('contextMenu.editor.paste'),
      icon: 'bx-paste',
      action: () => {
        document.execCommand('paste')
      }
    },
    { id: 'sep-clipboard', separator: true },
    {
      id: 'select-all',
      label: t('contextMenu.editor.selectAll'),
      icon: 'bx-select-multiple',
      action: () => {
        document.execCommand('selectAll')
      }
    },
    { id: 'sep-select', separator: true },
    {
      id: 'bold',
      label: t('contextMenu.editor.bold'),
      icon: 'bx-bold',
      action: () => {
        document.execCommand('bold')
      },
      disabled: () => !hasSelection
    },
    {
      id: 'italic',
      label: t('contextMenu.editor.italic'),
      icon: 'bx-italic',
      action: () => {
        document.execCommand('italic')
      },
      disabled: () => !hasSelection
    },
    {
      id: 'underline',
      label: t('contextMenu.editor.underline'),
      icon: 'bx-underline',
      action: () => {
        document.execCommand('underline')
      },
      disabled: () => !hasSelection
    },
    { id: 'sep-snippets', separator: true },
    {
      id: 'add-to-collection',
      label: t('contextMenu.editor.addToCollection', 'Add to Collection'),
      icon: 'bx-collection',
      action: () => {
        if (selection && context?.itemId && context?.manuscriptId) {
          eventBus.emit('snippet:add-to-collection', {
            selectedText: selection,
            sourceItemId: context.itemId,
            manuscriptId: context.manuscriptId,
            positionData: context.selectionPosition || { from: 0, to: 0 }
          })
        }
      },
      disabled: () => !hasSelection || !context?.itemId
    }
  ]
}

export const getDefaultMenuItems = (): MenuItem[] => {
  const i18n = getI18n()
  const { t } = i18n.global

  return [
    {
      id: 'reload',
      label: t('contextMenu.default.reload'),
      icon: 'bx-refresh',
      action: () => {
        window.location.reload()
      }
    },
    {
      id: 'back',
      label: t('contextMenu.default.goBack'),
      icon: 'bx-arrow-back',
      action: () => {
        window.history.back()
      },
      disabled: () => window.history.length <= 1
    }
  ]
}