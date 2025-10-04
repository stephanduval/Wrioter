import type { MenuItem } from '@/composables/useContextMenu'
import { getManuscriptMenuItems } from '@/config/contextMenus/manuscriptMenus'
import { getItemMenuItems } from '@/config/contextMenus/itemMenus'
import { getEditorMenuItems, getDefaultMenuItems } from '@/config/contextMenus/editorMenus'
import { useManuscriptStore } from '@/stores/manuscript'

export interface ContextData {
  type: 'manuscript' | 'item' | 'editor' | 'default'
  manuscriptId?: string | number
  itemId?: string | number
  nodeId?: string
  selection?: string
  element: HTMLElement
}

export class ContextDetectionService {
  static getContextFromElement(element: HTMLElement): ContextData['type'] {
    if (element.closest('[data-manuscript-id]')) return 'manuscript'
    if (element.closest('[data-item-id]')) return 'item'
    if (element.closest('[data-node-id]')) return 'item'
    if (element.closest('.editor-content, .v-field__input, textarea')) return 'editor'
    if (element.closest('.tree-node')) return 'item'
    return 'default'
  }

  static getContextData(element: HTMLElement): ContextData {
    const manuscriptEl = element.closest('[data-manuscript-id]')
    const itemEl = element.closest('[data-item-id]')
    const nodeEl = element.closest('[data-node-id]')
    const treeNodeEl = element.closest('.tree-node')

    let nodeId: string | undefined
    if (nodeEl) {
      nodeId = nodeEl.getAttribute('data-node-id') || undefined
    } else if (treeNodeEl) {
      // Try to extract node ID from tree node element
      const nodeIdFromClass = treeNodeEl.getAttribute('data-node-id')
      nodeId = nodeIdFromClass || undefined
    }

    return {
      type: this.getContextFromElement(element),
      manuscriptId: manuscriptEl?.getAttribute('data-manuscript-id') || undefined,
      itemId: itemEl?.getAttribute('data-item-id') || nodeId || undefined,
      nodeId: nodeId,
      selection: window.getSelection()?.toString() || undefined,
      element
    }
  }

  static async getMenuItemsForContext(context: ContextData): Promise<MenuItem[]> {
    const manuscriptStore = useManuscriptStore()

    switch (context.type) {
      case 'manuscript':
        if (context.manuscriptId) {
          const manuscript = await manuscriptStore.fetchManuscript(Number(context.manuscriptId))
          if (manuscript) {
            return getManuscriptMenuItems(manuscript)
          }
        }
        break

      case 'item':
        if (context.nodeId || context.itemId) {
          const nodeId = context.nodeId || String(context.itemId)
          const node = manuscriptStore.findNodeById(nodeId)

          if (node) {
            const manuscriptId = manuscriptStore.selectedManuscript?.id
            if (manuscriptId) {
              const itemData = {
                id: node.itemId,
                itemId: node.itemId,
                manuscript_id: manuscriptId,
                parent_id: node.parent?.itemId || null,
                title: node.title,
                type: node.type,
                order_index: 0, // TODO: Get actual order index
                metadata: {
                  status: node.metadata.status,
                  isCompilable: node.metadata.isCompilable,
                  wordCount: node.metadata.wordCount
                }
              }
              return getItemMenuItems(itemData, manuscriptId)
            }
          }
        }
        break

      case 'editor':
        return getEditorMenuItems(context.selection)

      default:
        return getDefaultMenuItems()
    }

    return []
  }

  static getMenuItemsForNode(nodeId: string): MenuItem[] {
    const manuscriptStore = useManuscriptStore()

    const node = manuscriptStore.findNodeById(nodeId)
    if (!node) {
      return []
    }

    const manuscriptId = manuscriptStore.selectedManuscript?.id
    if (!manuscriptId) {
      return []
    }

    const itemData = {
      id: node.itemId,
      itemId: node.itemId,
      manuscript_id: manuscriptId,
      parent_id: node.parent?.itemId || null,
      title: node.title,
      type: node.type,
      order_index: 0,
      metadata: {
        status: node.metadata.status,
        isCompilable: node.metadata.isCompilable,
        wordCount: node.metadata.wordCount
      }
    }

    return getItemMenuItems(itemData, manuscriptId)
  }
}