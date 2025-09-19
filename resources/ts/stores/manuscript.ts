import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useApi } from '@/composables/useApi'

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

interface Item {
  id: number
  manuscript_id?: number
  parent_id: number | null
  title: string
  content?: string
  type: 'folder' | 'text' | 'research' | 'character' | 'mindmap' | 'image' | 'file' | 'link'
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
}

interface NodeState {
  isExpanded: boolean
  isSelected: boolean
  isLoading: boolean
  isDragging: boolean
}

type NodeType = 'folder' | 'text' | 'research' | 'character' | 'mindmap' | 'image' | 'file' | 'link'

export const useManuscriptStore = defineStore('manuscript', () => {
  const { api } = useApi()

  // localStorage keys
  const SELECTED_MANUSCRIPT_KEY = 'selectedManuscriptId'
  const CURRENT_MANUSCRIPT_KEY = 'currentManuscript'

  // Initialize from localStorage
  const getFromStorage = (key: string) => {
    try {
      const value = localStorage.getItem(key)
      return value ? JSON.parse(value) : null
    } catch (error) {
      console.warn(`Failed to parse ${key} from localStorage:`, error)
      return null
    }
  }

  const saveToStorage = (key: string, value: any) => {
    try {
      if (value === null || value === undefined) {
        localStorage.removeItem(key)
      } else {
        localStorage.setItem(key, JSON.stringify(value))
      }
    } catch (error) {
      console.warn(`Failed to save ${key} to localStorage:`, error)
    }
  }

  // State
  const manuscripts = ref<Manuscript[]>([])
  const currentManuscript = ref<Manuscript | null>(getFromStorage(CURRENT_MANUSCRIPT_KEY))
  const selectedManuscriptId = ref<number | null>(getFromStorage(SELECTED_MANUSCRIPT_KEY))
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
      link: 'bx-link'
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

    // Phase 3: Sort by order
    const sortNodes = (nodes: TreeNode[]) => {
      nodes.sort((a, b) => {
        const aItem = items.find(item => item.id === a.itemId)!
        const bItem = items.find(item => item.id === b.itemId)!
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
  const fetchManuscriptItems = async (manuscriptId: number) => {
    try {
      loading.value = true
      error.value = null

      console.log('Fetching items for manuscript:', manuscriptId)
      const response = await api.get(`/manuscripts/${manuscriptId}/items`)

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
    saveToStorage(SELECTED_MANUSCRIPT_KEY, selectedManuscriptId.value)

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
    saveToStorage(CURRENT_MANUSCRIPT_KEY, manuscript)
  }

  function clearSelection() {
    selectedManuscriptId.value = null
    saveToStorage(SELECTED_MANUSCRIPT_KEY, null)
  }

  function $reset() {
    manuscripts.value = []
    currentManuscript.value = null
    selectedManuscriptId.value = null
    loading.value = false
    error.value = null

    // Clear localStorage
    saveToStorage(SELECTED_MANUSCRIPT_KEY, null)
    saveToStorage(CURRENT_MANUSCRIPT_KEY, null)
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
    $reset,

    // Navigation methods
    buildNavigationTree,
    fetchManuscriptItems,
    findNodeById,
    getNodePath,
  }
})