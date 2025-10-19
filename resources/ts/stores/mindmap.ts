import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from '@/../js/axios'
import type { Node, Edge } from '@vue-flow/core'

interface MindMap {
  id: number
  title: string
  description?: string
  settings?: any
  is_template: boolean
  is_archived: boolean
  created_at: string
  updated_at: string
}

interface Item {
  id: number
  user_id: number
  type: string
  title: string
  content?: string
  synopsis?: string
  parent_id?: number
  metadata?: any
}

interface MindMapNode {
  id: number // item_id
  data: Item
  position: { x: number; y: number }
  size?: { width: number; height: number }
  style?: any
  is_visible: boolean
  is_collapsed: boolean
  z_index: number
}

interface MindMapConnection {
  id: number
  mindmap_id: number
  from_item_id: number
  to_item_id: number
  connection_type: 'one-way' | 'two-way'
  relationship_type?: string
  label?: string
  style?: any
}

export const useMindMapStore = defineStore('mindmap', () => {
  // State
  const currentMindmap = ref<MindMap | null>(null)
  const mindmaps = ref<MindMap[]>([])
  const nodes = ref<Node[]>([])
  const edges = ref<Edge[]>([])
  const items = ref<Map<number, Item>>(new Map()) // Cache of items by ID
  const selectedNodes = ref<string[]>([])
  const selectedEdges = ref<string[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Computed
  const hasUnsavedChanges = ref(false)

  const selectedNode = computed(() => {
    if (selectedNodes.value.length === 1) {
      return nodes.value.find(n => n.id === selectedNodes.value[0])
    }
    return null
  })

  const selectedEdge = computed(() => {
    if (selectedEdges.value.length === 1) {
      return edges.value.find(e => e.id === selectedEdges.value[0])
    }
    return null
  })

  // Actions
  const loadMindmaps = async (): Promise<MindMap[]> => {
    loading.value = true
    error.value = null
    try {
      const response = await axios.get('/mindmaps')
      mindmaps.value = response.data.data || response.data
      return mindmaps.value
    } catch (err: any) {
      error.value = err.message || 'Failed to load mindmaps'
      throw err
    } finally {
      loading.value = false
    }
  }

  const loadMindmap = async (id: number | string): Promise<any> => {
    loading.value = true
    error.value = null
    try {
      const response = await axios.get(`/mindmaps/${id}`)
      currentMindmap.value = response.data.mindmap

      // Transform nodes for Vue Flow - now using items + positions
      const backendNodes: MindMapNode[] = response.data.nodes || []
      nodes.value = backendNodes.map((node) => {
        // Cache the item
        if (node.data) {
          items.value.set(node.data.id, node.data)
        }

        return {
          id: `item-${node.id}`,
          type: node.data?.type || 'default',
          position: node.position || { x: 0, y: 0 },
          data: {
            label: node.data?.title || 'Untitled',
            content: node.data?.content,
            synopsis: node.data?.synopsis,
            metadata: node.data?.metadata,
            itemId: node.id, // The actual item ID
            itemType: node.data?.type,
          },
        }
      })

      // Transform connections for Vue Flow
      const backendConnections: MindMapConnection[] = response.data.edges || []
      edges.value = backendConnections.map((conn) => ({
        id: `edge-${conn.id}`,
        source: `item-${conn.from_item_id}`,
        target: `item-${conn.to_item_id}`,
        type: conn.connection_type === 'two-way' ? 'bidirectional' : 'default',
        data: {
          label: conn.label,
          relationship_type: conn.relationship_type,
          style: conn.style,
          dbId: conn.id,
        },
      }))

      hasUnsavedChanges.value = false

      return {
        mindmap: currentMindmap.value,
        nodes: backendNodes,
        connections: backendConnections,
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to load mindmap'
      throw err
    } finally {
      loading.value = false
    }
  }

  const createMindmap = async (data: Partial<MindMap>): Promise<MindMap> => {
    loading.value = true
    error.value = null
    try {
      const response = await axios.post('/mindmaps', data)
      const newMindmap = response.data
      mindmaps.value.push(newMindmap)
      return newMindmap
    } catch (err: any) {
      error.value = err.message || 'Failed to create mindmap'
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateMindmap = async (id: number | string, data: Partial<MindMap>): Promise<MindMap> => {
    loading.value = true
    error.value = null
    try {
      const response = await axios.put(`/mindmaps/${id}`, data)
      const updatedMindmap = response.data

      // Update in list
      const index = mindmaps.value.findIndex(m => m.id === updatedMindmap.id)
      if (index >= 0) {
        mindmaps.value[index] = updatedMindmap
      }

      // Update current if same
      if (currentMindmap.value?.id === updatedMindmap.id) {
        currentMindmap.value = updatedMindmap
      }

      return updatedMindmap
    } catch (err: any) {
      error.value = err.message || 'Failed to update mindmap'
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteMindmap = async (id: number | string): Promise<void> => {
    loading.value = true
    error.value = null
    try {
      await axios.delete(`/mindmaps/${id}`)
      mindmaps.value = mindmaps.value.filter(m => m.id !== id)

      if (currentMindmap.value?.id === id) {
        currentMindmap.value = null
        nodes.value = []
        edges.value = []
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to delete mindmap'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Node/Item Operations - Updated for new architecture
  const addExistingItem = async (itemId: number, position: { x: number; y: number }): Promise<Node> => {
    if (!currentMindmap.value) throw new Error('No mindmap loaded')

    try {
      const response = await axios.post(`/mindmaps/${currentMindmap.value.id}/items/add`, {
        item_id: itemId,
        position,
      })

      const item = response.data.item

      // Cache the item
      items.value.set(item.id, item)

      const newNode: Node = {
        id: `item-${item.id}`,
        type: item.type || 'default',
        position,
        data: {
          label: item.title,
          content: item.content,
          synopsis: item.synopsis,
          metadata: item.metadata,
          itemId: item.id,
          itemType: item.type,
        },
      }

      nodes.value.push(newNode)
      hasUnsavedChanges.value = false // Already saved to backend
      return newNode
    } catch (err: any) {
      error.value = err.message || 'Failed to add item'
      throw err
    }
  }

  const createNewItem = async (itemData: {
    type: string
    title: string
    content?: string
    synopsis?: string
    parent_id?: number
    position: { x: number; y: number }
  }): Promise<Node> => {
    if (!currentMindmap.value) throw new Error('No mindmap loaded')

    try {
      const response = await axios.post(`/mindmaps/${currentMindmap.value.id}/items/create`, itemData)

      const item = response.data.item

      // Cache the item
      items.value.set(item.id, item)

      const newNode: Node = {
        id: `item-${item.id}`,
        type: item.type || 'default',
        position: itemData.position,
        data: {
          label: item.title,
          content: item.content,
          synopsis: item.synopsis,
          metadata: item.metadata,
          itemId: item.id,
          itemType: item.type,
        },
      }

      nodes.value.push(newNode)
      hasUnsavedChanges.value = false // Already saved to backend
      return newNode
    } catch (err: any) {
      error.value = err.message || 'Failed to create item'
      throw err
    }
  }

  const updateNodePosition = async (nodeId: string, position: { x: number; y: number }): Promise<void> => {
    const node = nodes.value.find(n => n.id === nodeId)
    if (!node || !currentMindmap.value) return

    const itemId = node.data?.itemId
    if (!itemId) return

    try {
      await axios.put(`/mindmaps/${currentMindmap.value.id}/items/${itemId}/position`, {
        position,
      })

      const index = nodes.value.findIndex(n => n.id === nodeId)
      if (index >= 0) {
        nodes.value[index].position = position
      }

      hasUnsavedChanges.value = false
    } catch (err: any) {
      error.value = err.message || 'Failed to update position'
      throw err
    }
  }

  const batchUpdatePositions = async (updates: Array<{ nodeId: string; position: { x: number; y: number } }>): Promise<void> => {
    if (!currentMindmap.value) return

    try {
      const positions = updates.map(update => {
        const node = nodes.value.find(n => n.id === update.nodeId)
        return {
          item_id: node?.data?.itemId,
          position: update.position,
        }
      }).filter(p => p.item_id)

      await axios.post(`/mindmaps/${currentMindmap.value.id}/positions/batch`, {
        positions,
      })

      // Update local state
      updates.forEach(({ nodeId, position }) => {
        const index = nodes.value.findIndex(n => n.id === nodeId)
        if (index >= 0) {
          nodes.value[index].position = position
        }
      })

      hasUnsavedChanges.value = false
    } catch (err: any) {
      error.value = err.message || 'Failed to batch update positions'
      throw err
    }
  }

  const removeItemFromMindmap = async (nodeId: string): Promise<void> => {
    const node = nodes.value.find(n => n.id === nodeId)
    if (!node || !currentMindmap.value) return

    const itemId = node.data?.itemId
    if (!itemId) return

    try {
      await axios.delete(`/mindmaps/${currentMindmap.value.id}/items/${itemId}`)

      nodes.value = nodes.value.filter(n => n.id !== nodeId)
      edges.value = edges.value.filter(e => e.source !== nodeId && e.target !== nodeId)

      hasUnsavedChanges.value = false
    } catch (err: any) {
      error.value = err.message || 'Failed to remove item'
      throw err
    }
  }

  // Connection Operations - Updated for new architecture
  const createConnection = async (connection: {
    from_item_id: number
    to_item_id: number
    connection_type: 'one-way' | 'two-way'
    relationship_type?: string
    label?: string
  }): Promise<Edge> => {
    if (!currentMindmap.value) throw new Error('No mindmap loaded')

    try {
      const response = await axios.post(`/mindmaps/${currentMindmap.value.id}/connections`, connection)

      const newEdge: Edge = {
        id: `edge-${response.data.id}`,
        source: `item-${connection.from_item_id}`,
        target: `item-${connection.to_item_id}`,
        type: connection.connection_type === 'two-way' ? 'bidirectional' : 'default',
        data: {
          label: connection.label,
          relationship_type: connection.relationship_type,
          dbId: response.data.id,
        },
      }

      edges.value.push(newEdge)
      hasUnsavedChanges.value = false
      return newEdge
    } catch (err: any) {
      error.value = err.message || 'Failed to create connection'
      throw err
    }
  }

  const updateConnection = async (edgeId: string, updates: Partial<Edge>): Promise<void> => {
    const edge = edges.value.find(e => e.id === edgeId)
    if (!edge) return

    const dbId = edge.data?.dbId
    if (!dbId) return

    try {
      await axios.put(`/connections/${dbId}`, {
        label: updates.data?.label,
        relationship_type: updates.data?.relationship_type,
        connection_type: updates.type === 'bidirectional' ? 'two-way' : 'one-way',
        style: updates.data?.style,
      })

      const index = edges.value.findIndex(e => e.id === edgeId)
      if (index >= 0) {
        edges.value[index] = { ...edges.value[index], ...updates }
      }

      hasUnsavedChanges.value = false
    } catch (err: any) {
      error.value = err.message || 'Failed to update connection'
      throw err
    }
  }

  const deleteConnection = async (edgeId: string): Promise<void> => {
    const edge = edges.value.find(e => e.id === edgeId)
    if (!edge) return

    const dbId = edge.data?.dbId
    if (!dbId) return

    try {
      await axios.delete(`/connections/${dbId}`)
      edges.value = edges.value.filter(e => e.id !== edgeId)
      hasUnsavedChanges.value = false
    } catch (err: any) {
      error.value = err.message || 'Failed to delete connection'
      throw err
    }
  }

  // Import manuscript items
  const importManuscript = async (options: {
    manuscript_id?: number
    parent_id?: number
    layout?: 'hierarchical' | 'grid' | 'force-directed'
  }): Promise<void> => {
    if (!currentMindmap.value) throw new Error('No mindmap loaded')

    try {
      const response = await axios.post(`/mindmaps/${currentMindmap.value.id}/import-manuscript`, options)

      // Reload the mindmap to get the new items
      await loadMindmap(currentMindmap.value.id)

      hasUnsavedChanges.value = false
    } catch (err: any) {
      error.value = err.message || 'Failed to import manuscript'
      throw err
    }
  }

  // Selection
  const selectNode = (nodeId: string, multi = false) => {
    if (multi) {
      if (selectedNodes.value.includes(nodeId)) {
        selectedNodes.value = selectedNodes.value.filter(id => id !== nodeId)
      } else {
        selectedNodes.value.push(nodeId)
      }
    } else {
      selectedNodes.value = [nodeId]
    }
    selectedEdges.value = []
  }

  const selectEdge = (edgeId: string, multi = false) => {
    if (multi) {
      if (selectedEdges.value.includes(edgeId)) {
        selectedEdges.value = selectedEdges.value.filter(id => id !== edgeId)
      } else {
        selectedEdges.value.push(edgeId)
      }
    } else {
      selectedEdges.value = [edgeId]
    }
    selectedNodes.value = []
  }

  const clearSelection = () => {
    selectedNodes.value = []
    selectedEdges.value = []
  }

  // Reset
  const reset = () => {
    currentMindmap.value = null
    nodes.value = []
    edges.value = []
    items.value.clear()
    selectedNodes.value = []
    selectedEdges.value = []
    hasUnsavedChanges.value = false
    error.value = null
  }

  return {
    // State
    currentMindmap,
    mindmaps,
    nodes,
    edges,
    items,
    selectedNodes,
    selectedEdges,
    loading,
    error,
    hasUnsavedChanges,

    // Computed
    selectedNode,
    selectedEdge,

    // Actions
    loadMindmaps,
    loadMindmap,
    createMindmap,
    updateMindmap,
    deleteMindmap,

    // Item Operations (renamed from node operations)
    addExistingItem,
    createNewItem,
    updateNodePosition,
    batchUpdatePositions,
    removeItemFromMindmap,

    // Connection Operations
    createConnection,
    updateConnection,
    deleteConnection,

    // Import
    importManuscript,

    // Selection
    selectNode,
    selectEdge,
    clearSelection,

    // Reset
    reset,
  }
})
