import type { MenuItem } from '@/composables/useContextMenu'

export const getEditorMenuItems = (selection?: string): MenuItem[] => {
  const hasSelection = !!selection && selection.length > 0

  return [
    {
      id: 'cut',
      label: 'Cut',
      icon: 'bx-cut',
      action: () => {
        document.execCommand('cut')
      },
      disabled: () => !hasSelection
    },
    {
      id: 'copy',
      label: 'Copy',
      icon: 'bx-copy',
      action: () => {
        document.execCommand('copy')
      },
      disabled: () => !hasSelection
    },
    {
      id: 'paste',
      label: 'Paste',
      icon: 'bx-paste',
      action: () => {
        document.execCommand('paste')
      }
    },
    { separator: true },
    {
      id: 'select-all',
      label: 'Select All',
      icon: 'bx-select-multiple',
      action: () => {
        document.execCommand('selectAll')
      }
    },
    { separator: true },
    {
      id: 'bold',
      label: 'Bold',
      icon: 'bx-bold',
      action: () => {
        document.execCommand('bold')
      },
      disabled: () => !hasSelection
    },
    {
      id: 'italic',
      label: 'Italic',
      icon: 'bx-italic',
      action: () => {
        document.execCommand('italic')
      },
      disabled: () => !hasSelection
    },
    {
      id: 'underline',
      label: 'Underline',
      icon: 'bx-underline',
      action: () => {
        document.execCommand('underline')
      },
      disabled: () => !hasSelection
    }
  ]
}

export const getDefaultMenuItems = (): MenuItem[] => {
  return [
    {
      id: 'reload',
      label: 'Reload',
      icon: 'bx-refresh',
      action: () => {
        window.location.reload()
      }
    },
    {
      id: 'back',
      label: 'Go Back',
      icon: 'bx-arrow-back',
      action: () => {
        window.history.back()
      },
      disabled: () => window.history.length <= 1
    }
  ]
}