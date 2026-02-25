import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useApi } from '@/composables/useApi'
import { dataSync } from '@/services/dataSync'

interface Manuscript {
  id: number
  title: string
  manuscript_type: 'standard' | 'scrivener'
  created_at: string
  updated_at: string
  description?: string
  scrivener_uuid?: string
  items?: Item[]
}

interface SnippetRefData {
  id: number
  source_item_id: number | null
  source_item_title: string | null
  reference_text: string
  status: 'active' | 'ghost'
  order_index: number
}

interface Item {
  id: number
  manuscript_id?: number
  parent_id: number | null
  title: string
  content?: string
  type: 'folder' | 'text' | 'research' | 'character' | 'mindmap' | 'image' | 'file' | 'link' | 'snippet_collection'
  item_order?: number
  order_index?: number // For backward compatibility
  scrivener_uuid?: string
  children?: Item[]
  word_count?: number
  character_count?: number
  synopsis?: string
  metadata?: any
  include_in_compile?: boolean
  updated_at: string
  snippet_references?: SnippetRefData[]
}

interface TreeNode {
  id: string
  itemId: number
  title: string
  type: NodeType
  icon: string
  path: string
  children: TreeNode[]
  parent?: TreeNode
  metadata: NodeMetadata
  state: NodeState
}

interface NodeMetadata {
  wordCount: number
  characterCount: number
  status: 'draft' | 'in_progress' | 'completed' | 'archived'
  lastModified: string
  hasComments: boolean
  isCompilable: boolean
  synopsis?: string
  sourceItemId?: number
  snippetStatus?: 'active' | 'ghost'
}

interface NodeState {
  isExpanded: boolean
  isSelected: boolean
  isLoading: boolean
  isDragging: boolean
}

type NodeType = 'folder' | 'text' | 'research' | 'character' | 'mindmap' | 'image' | 'file' | 'link' | 'snippet_collection' | 'snippet_reference'

export const useManuscriptStore = defineStore('manuscript', () => {
  const { api } = useApi()

  // === DATA SYNC EVENT LISTENERS ===
  // Listen for item updates from other stores (e.g., itemStore editing title)
  dataSync.on('item:updated', ({ manuscriptId, itemId, changes }) => {
    // Only process if this is the currently selected manuscript
    if (manuscriptId !== selectedManuscriptId.value) return

    // Update in flatItemsIndex (O(1) lookup)
    const nodeId = `item-${itemId}`
    const node = flatItemsIndex.value.get(nodeId)
    if (node) {
      if (changes.title) {
        node.title = changes.title
        console.log(`[ManuscriptStore] Updated title for item ${itemId} to "${changes.title}"`)
      }
    }
  })

  // Listen for item deletions from other stores
  dataSync.on('item:deleted', ({ manuscriptId, itemId }) => {
    if (manuscriptId !== selectedManuscriptId.value) return

    const nodeId = `item-${itemId}`
    const node = flatItemsIndex.value.get(nodeId)
    if (node) {
      // Remove from flat index
      flatItemsIndex.value.delete(nodeId)

      // Remove from parent's children or root nodes
      if (node.parent) {
        const index = node.parent.children.indexOf(node)
        if (index !== -1) {
          node.parent.children.splice(index, 1)
        }
      } else {
        const index = manuscriptTree.value.indexOf(node)
        if (index !== -1) {
          manuscriptTree.value.splice(index, 1)
        }
      }
      console.log(`[ManuscriptStore] Removed item ${itemId} from tree`)
    }
  })

  // State - Pure Pinia reactivity, no localStorage persistence
  const manuscripts = ref<Manuscript[]>([])
  const currentManuscript = ref<Manuscript | null>(null)
  const selectedManuscriptId = ref<number | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Navigation state
  const manuscriptTree = ref<TreeNode[]>([])
  const flatItemsIndex = ref<Map<string, TreeNode>>(new Map())
  const treeMetadata = ref({
    totalItems: 0,
    totalWords: 0,
    lastModified: null as string | null,
    maxDepth: 0
  })

  // Getters
  const selectedManuscript = computed(() => 
    manuscripts.value.find(m => m.id === selectedManuscriptId.value) || null
  )

  const hasSelectedManuscript = computed(() =>
    selectedManuscriptId.value !== null
  )

  const hasNavigationTree = computed(() =>
    manuscriptTree.value.length > 0
  )

  const treeNodeCount = computed(() =>
    flatItemsIndex.value.size
  )

  // Helper function to get icon for item type
  const getIconForItemType = (type: string): string => {
    const iconMap: Record<string, string> = {
      folder: 'bx-folder',
      text: 'bx-file-doc',
      research: 'bx-search',
      character: 'bx-user',
      mindmap: 'bx-network-chart',
      image: 'bx-image',
      file: 'bx-file',
      link: 'bx-link',
      snippet_collection: 'bx-collection',
      snippet_reference: 'bx-text'
    }
    return iconMap[type] || 'bx-file'
  }

  // Core tree building function
  const buildNavigationTree = (items: Item[]): TreeNode[] => {
    console.log('Building navigation tree for', items.length, 'items')
    console.log('Items received:', items)

    const nodeMap = new Map<number, TreeNode>()
    const rootNodes: TreeNode[] = []

    // Clear existing index
    flatItemsIndex.value.clear()

    // Phase 1: Create all nodes
    items.forEach(item => {
      const node: TreeNode = {
        id: `item-${item.id}`,
        itemId: item.id,
        title: item.title || 'Untitled',
        type: (item.type as NodeType) || 'text',
        icon: getIconForItemType(item.type),
        path: '/dashboards/analytics', // Temporary redirect until item view is implemented
        children: [],
        metadata: {
          wordCount: item.word_count || 0,
          characterCount: item.character_count || 0,
          status: (item.metadata?.status as any) || 'draft',
          lastModified: item.updated_at,
          hasComments: false, // Will be populated later
          isCompilable: item.include_in_compile !== false,
          synopsis: item.synopsis
        },
        state: {
          isExpanded: false,
          isSelected: false,
          isLoading: false,
          isDragging: false
        }
      }

      nodeMap.set(item.id, node)
      flatItemsIndex.value.set(node.id, node)
    })

    // Phase 2: Build hierarchy
    items.forEach(item => {
      const node = nodeMap.get(item.id)!
      console.log(`Processing item ${item.id} (${item.title}) with parent_id: ${item.parent_id}`)

      if (item.parent_id && nodeMap.has(item.parent_id)) {
        const parent = nodeMap.get(item.parent_id)!
        parent.children.push(node)
        node.parent = parent
        console.log(`  -> Added as child to parent ${item.parent_id}`)
      } else {
        rootNodes.push(node)
        console.log(`  -> Added as root node (parent_id: ${item.parent_id})`)
      }
    })

    // Phase 2.5: Add virtual snippet reference children to snippet_collection nodes
    // Build a lookup of item positions for sorting snippets by manuscript order
    const itemOrderMap = new Map<number, { parentOrder: number; itemOrder: number }>()
    items.forEach(item => {
      const parentItem = item.parent_id ? items.find(i => i.id === item.parent_id) : null
      itemOrderMap.set(item.id, {
        parentOrder: parentItem ? (parentItem.item_order || parentItem.order_index || 0) : 0,
        itemOrder: item.item_order || item.order_index || 0
      })
    })

    items.forEach(item => {
      if (item.type === 'snippet_collection' && item.snippet_references?.length) {
        const collectionNode = nodeMap.get(item.id)!

        // Sort snippets by source item's manuscript position
        const sortedRefs = [...item.snippet_references].sort((a, b) => {
          const aPos = a.source_item_id ? itemOrderMap.get(a.source_item_id) : null
          const bPos = b.source_item_id ? itemOrderMap.get(b.source_item_id) : null
          if (!aPos && !bPos) return a.order_index - b.order_index
          if (!aPos) return 1
          if (!bPos) return -1
          // Sort by parent folder order first, then item order
          if (aPos.parentOrder !== bPos.parentOrder) return aPos.parentOrder - bPos.parentOrder
          return aPos.itemOrder - bPos.itemOrder
        })

        sortedRefs.forEach(ref => {
          const truncatedText = ref.reference_text.length > 40
            ? ref.reference_text.substring(0, 40) + '...'
            : ref.reference_text
          const snippetNode: TreeNode = {
            id: `snippet-${ref.id}`,
            itemId: ref.id,
            title: truncatedText,
            type: 'snippet_reference' as NodeType,
            icon: getIconForItemType('snippet_reference'),
            path: '',
            children: [],
            parent: collectionNode,
            metadata: {
              wordCount: 0,
              characterCount: 0,
              status: 'draft',
              lastModified: '',
              hasComments: false,
              isCompilable: false,
              sourceItemId: ref.source_item_id ?? undefined,
              snippetStatus: ref.status
            },
            state: {
              isExpanded: false,
              isSelected: false,
              isLoading: false,
              isDragging: false
            }
          }
          collectionNode.children.push(snippetNode)
          flatItemsIndex.value.set(snippetNode.id, snippetNode)
        })
      }
    })

    // Phase 3: Sort by order (skip virtual snippet_reference nodes - already sorted)
    const sortNodes = (nodes: TreeNode[]) => {
      nodes.sort((a, b) => {
        // Virtual snippet nodes keep their insertion order
        if (a.type === 'snippet_reference' || b.type === 'snippet_reference') return 0
        const aItem = items.find(item => item.id === a.itemId)
        const bItem = items.find(item => item.id === b.itemId)
        if (!aItem || !bItem) return 0
        const aOrder = aItem.item_order || aItem.order_index || 0
        const bOrder = bItem.item_order || bItem.order_index || 0
        return aOrder - bOrder
      })
      nodes.forEach(node => {
        if (node.children.length > 0) {
          sortNodes(node.children)
        }
      })
    }

    sortNodes(rootNodes)

    // Update metadata
    treeMetadata.value = {
      totalItems: items.length,
      totalWords: items.reduce((sum, item) => sum + (item.word_count || 0), 0),
      lastModified: items.reduce((latest, item) =>
        !latest || item.updated_at > latest ? item.updated_at : latest, null as string | null),
      maxDepth: calculateMaxDepth(rootNodes)
    }

    console.log('Built tree with', rootNodes.length, 'root nodes')
    return rootNodes
  }

  // Calculate maximum tree depth
  const calculateMaxDepth = (nodes: TreeNode[], currentDepth = 0): number => {
    if (nodes.length === 0) return currentDepth
    return Math.max(...nodes.map(node =>
      calculateMaxDepth(node.children, currentDepth + 1)
    ))
  }

  // Tree query methods
  const findNodeById = (nodeId: string): TreeNode | null => {
    return flatItemsIndex.value.get(nodeId) || null
  }

  const findParentOfNode = (nodeId: string): TreeNode | null => {
    const node = findNodeById(nodeId)
    return node?.parent || null
  }

  const getNodePath = (nodeId: string): TreeNode[] => {
    const node = findNodeById(nodeId)
    if (!node) return []

    const path: TreeNode[] = []
    let current: TreeNode | undefined = node
    while (current) {
      path.unshift(current)
      current = current.parent
    }
    return path
  }

  // API method to fetch manuscript items for navigation
  const fetchManuscriptItems = async (manuscriptId: number, searchTerm?: string) => {
    try {
      loading.value = true
      error.value = null

      console.log('Fetching items for manuscript:', manuscriptId, searchTerm ? `with search: "${searchTerm}"` : '')

      const url = searchTerm
        ? `/manuscripts/${manuscriptId}/items?search=${encodeURIComponent(searchTerm)}`
        : `/manuscripts/${manuscriptId}/items`
      const response = await api.get(url)

      console.log('Raw API response:', response)
      console.log('Response data:', response.data)

      if (response.data?.data) {
        const items = response.data.data
        console.log('Items from API:', items)
        console.log('Items array length:', items.length)

        if (items.length === 0) {
          console.log('No items found for this manuscript - creating empty tree')
          manuscriptTree.value = []
        } else {
          manuscriptTree.value = buildNavigationTree(items)
        }
        console.log('Navigation tree built successfully')
      } else {
        console.warn('No items data in response:', response.data)
        console.log('Response structure does not match expected format')
        manuscriptTree.value = []
      }
    } catch (err: any) {
      console.error('Failed to fetch manuscript items:', err)
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      })
      error.value = err.response?.data?.message || 'Failed to load manuscript structure'
      manuscriptTree.value = []
    } finally {
      loading.value = false
    }
  }

  // Actions
  async function fetchManuscripts() {
    loading.value = true
    error.value = null
    
    try {
      const response = await api.get('/manuscripts')
      manuscripts.value = response.data?.data || []
      return manuscripts.value
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch manuscripts'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchManuscript(id: number, withItems = false) {
    loading.value = true
    error.value = null
    
    try {
      const url = withItems ? `/manuscripts/${id}?with=items` : `/manuscripts/${id}`
      const response = await api.get(url)
      const manuscript = response.data?.data

      if (!manuscript || !manuscript.id) {
        throw new Error('Invalid manuscript data received from server')
      }

      // Update the manuscript in the list
      const index = manuscripts.value.findIndex(m => m && m.id === id)
      if (index !== -1) {
        manuscripts.value[index] = manuscript
      } else {
        manuscripts.value.push(manuscript)
      }
      
      if (currentManuscript.value?.id === id || selectedManuscriptId.value === id) {
        setCurrentManuscript(manuscript)
      }
      
      return manuscript
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch manuscript'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function selectManuscript(manuscript: Manuscript | null) {
    selectedManuscriptId.value = manuscript?.id || null

    if (manuscript && manuscript.id) {
      // Ensure the manuscript is in our list
      const exists = manuscripts.value.find(m => m && m.id === manuscript.id)
      if (!exists) {
        manuscripts.value.push(manuscript)
      }

      // Load navigation tree
      await fetchManuscriptItems(manuscript.id)
    } else {
      // Clear navigation when no manuscript selected
      manuscriptTree.value = []
      flatItemsIndex.value.clear()
    }
  }

  function setCurrentManuscript(manuscript: Manuscript | null) {
    currentManuscript.value = manuscript
  }

  function clearSelection() {
    selectedManuscriptId.value = null
  }

  // Search items with content
  async function searchItems(searchTerm: string) {
    if (!selectedManuscriptId.value) {
      throw new Error('No manuscript selected')
    }

    console.log(`Searching items for term: "${searchTerm}"`)
    await fetchManuscriptItems(selectedManuscriptId.value, searchTerm)
  }

  // Clear search and reload all items
  async function clearSearch() {
    if (!selectedManuscriptId.value) return

    console.log('Clearing search, reloading all items')
    await fetchManuscriptItems(selectedManuscriptId.value)
  }

  // Reorder items within a manuscript
  async function reorderItem(data: {
    sourceItemId: number
    targetItemId: number
    position: 'above' | 'below' | 'inside'
    manuscriptId: number
  }) {
    try {
      loading.value = true
      error.value = null

      const response = await api.post(`/manuscripts/${data.manuscriptId}/items/reorder`, {
        source_item_id: data.sourceItemId,
        target_item_id: data.targetItemId,
        position: data.position
      })

      console.log('Item reordered successfully:', response)
      return response.data
    } catch (err: any) {
      error.value = err.message || 'Failed to reorder item'
      console.error('Error reordering item:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Batch reorder multiple items within a manuscript
  async function batchReorderItems(data: {
    sourceItemIds: number[]
    targetItemId: number
    position: 'above' | 'below' | 'inside'
    manuscriptId: number
  }) {
    try {
      loading.value = true
      error.value = null

      const response = await api.post(`/manuscripts/${data.manuscriptId}/items/batch-reorder`, {
        source_item_ids: data.sourceItemIds,
        target_item_id: data.targetItemId,
        position: data.position
      })

      console.log('Items batch reordered successfully:', response)
      return response.data
    } catch (err: any) {
      error.value = err.message || 'Failed to batch reorder items'
      console.error('Error batch reordering items:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Delete an item from the manuscript
  async function deleteItem(manuscriptId: number, itemId: number) {
    try {
      loading.value = true
      error.value = null

      console.log(`Deleting item ${itemId} from manuscript ${manuscriptId}`)

      await api.delete(`/manuscripts/${manuscriptId}/items/${itemId}`)

      console.log('Item deleted successfully')

      // Remove from local tree immediately (no refetch needed)
      const nodeId = `item-${itemId}`
      const node = flatItemsIndex.value.get(nodeId)
      if (node) {
        // Remove from flat index
        flatItemsIndex.value.delete(nodeId)

        // Remove from parent's children or root nodes
        if (node.parent) {
          const index = node.parent.children.indexOf(node)
          if (index !== -1) {
            node.parent.children.splice(index, 1)
          }
        } else {
          const index = manuscriptTree.value.indexOf(node)
          if (index !== -1) {
            manuscriptTree.value.splice(index, 1)
          }
        }
      }

      // Emit sync event so other stores can update
      dataSync.emit('item:deleted', {
        manuscriptId,
        itemId
      })

      return true
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to delete item'
      console.error('Error deleting item:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Rename an item
  async function renameItem(manuscriptId: number, itemId: number, newTitle: string) {
    try {
      loading.value = true
      error.value = null

      console.log(`Renaming item ${itemId} in manuscript ${manuscriptId} to "${newTitle}"`)

      const response = await api.patch(`/manuscripts/${manuscriptId}/items/${itemId}/rename`, {
        title: newTitle
      })

      console.log('Item renamed successfully:', response.data)

      // Update local tree immediately (no refetch needed)
      const nodeId = `item-${itemId}`
      const node = flatItemsIndex.value.get(nodeId)
      if (node) {
        node.title = newTitle
      }

      // Emit sync event so other stores can update
      dataSync.emit('item:updated', {
        manuscriptId,
        itemId,
        changes: { title: newTitle }
      })

      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to rename item'
      console.error('Error renaming item:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Convert a folder to a regular item (remove folder status)
  async function convertFolderToItem(manuscriptId: number, itemId: number) {
    try {
      loading.value = true
      error.value = null

      console.log(`Converting folder ${itemId} to item in manuscript ${manuscriptId}`)

      const response = await api.patch(`/manuscripts/${manuscriptId}/items/${itemId}/convert-to-item`)

      console.log('Folder converted to item successfully:', response.data)

      // Refresh the manuscript items to reflect the change
      await fetchManuscriptItems(manuscriptId)

      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to convert folder to item'
      console.error('Error converting folder to item:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Ungroup a folder: move children to parent, delete the folder
  async function ungroupFolder(manuscriptId: number, itemId: number) {
    try {
      loading.value = true
      error.value = null

      const response = await api.post(`/manuscripts/${manuscriptId}/items/${itemId}/ungroup`)

      console.log('Folder ungrouped successfully:', response.data)

      // Refresh the tree
      await fetchManuscriptItems(manuscriptId)

      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to ungroup folder'
      console.error('Error ungrouping folder:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Sort children of a folder
  async function sortChildren(manuscriptId: number, itemId: number, sortBy: 'title' | 'updated_at', direction: 'asc' | 'desc' = 'asc') {
    try {
      loading.value = true
      error.value = null

      const response = await api.post(`/manuscripts/${manuscriptId}/items/${itemId}/sort-children`, {
        sort_by: sortBy,
        direction
      })

      console.log('Children sorted successfully:', response.data)

      // Refresh the tree
      await fetchManuscriptItems(manuscriptId)

      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to sort children'
      console.error('Error sorting children:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Batch update status for multiple items
  async function batchUpdateStatus(manuscriptId: number, itemIds: number[], status: 'draft' | 'in_progress' | 'completed' | 'archived') {
    try {
      loading.value = true
      error.value = null

      const response = await api.post(`/manuscripts/${manuscriptId}/items/batch-status`, {
        item_ids: itemIds,
        status
      })

      console.log('Batch status update successful:', response.data)

      // Refresh the tree
      await fetchManuscriptItems(manuscriptId)

      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to update status'
      console.error('Error batch updating status:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Batch delete multiple items
  async function batchDeleteItems(manuscriptId: number, itemIds: number[]) {
    try {
      loading.value = true
      error.value = null

      const response = await api.post(`/manuscripts/${manuscriptId}/items/batch-delete`, {
        item_ids: itemIds
      })

      console.log('Batch delete successful:', response.data)

      // Refresh the tree
      await fetchManuscriptItems(manuscriptId)

      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to delete items'
      console.error('Error batch deleting items:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Batch move items to a folder
  async function batchMoveToFolder(manuscriptId: number, itemIds: number[], targetFolderId: number) {
    try {
      loading.value = true
      error.value = null

      const response = await api.post(`/manuscripts/${manuscriptId}/items/batch-move`, {
        item_ids: itemIds,
        target_folder_id: targetFolderId
      })

      console.log('Batch move successful:', response.data)

      // Refresh the tree
      await fetchManuscriptItems(manuscriptId)

      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to move items'
      console.error('Error batch moving items:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Get all folders in the tree (for "Move to folder" picker)
  const getAllFolders = (): Array<{ id: number; title: string; depth: number }> => {
    const folders: Array<{ id: number; title: string; depth: number }> = []
    const collectFolders = (nodes: TreeNode[], depth = 0) => {
      for (const node of nodes) {
        if (node.type === 'folder') {
          folders.push({ id: node.itemId, title: node.title, depth })
          collectFolders(node.children, depth + 1)
        }
      }
    }
    collectFolders(manuscriptTree.value)
    return folders
  }

  function $reset() {
    manuscripts.value = []
    currentManuscript.value = null
    selectedManuscriptId.value = null
    loading.value = false
    error.value = null

    // Clear navigation state
    manuscriptTree.value = []
    flatItemsIndex.value.clear()
  }

  return {
    // State
    manuscripts,
    currentManuscript,
    selectedManuscriptId,
    loading,
    error,

    // Navigation state
    manuscriptTree,
    flatItemsIndex,
    treeMetadata,

    // Getters
    selectedManuscript,
    hasSelectedManuscript,
    hasNavigationTree,
    treeNodeCount,

    // Actions
    fetchManuscripts,
    fetchManuscript,
    selectManuscript,
    setCurrentManuscript,
    clearSelection,
    searchItems,
    clearSearch,
    reorderItem,
    batchReorderItems,
    deleteItem,
    renameItem,
    convertFolderToItem,
    ungroupFolder,
    sortChildren,
    batchUpdateStatus,
    batchDeleteItems,
    batchMoveToFolder,
    getAllFolders,
    $reset,

    // Navigation methods
    buildNavigationTree,
    fetchManuscriptItems,
    findNodeById,
    findParentOfNode,
    getNodePath,
  }
})