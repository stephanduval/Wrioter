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

interface MindMapNode {
  id: number
  mindmap_id: number
  parent_id?: number
  content: string
  position: { x: number; y: number }
  style?: any
  node_type: string
  is_collapsed: boolean
  order_index: number
  metadata?: any
}

interface NodeConnection {
  id: number
  mindmap_id: number
  from_node_id: number
  to_node_id: number
  connection_type: 'one-way' | 'two-way'
  relationship_type: string
  strength: 'weak' | 'medium' | 'strong'
  style?: any
  label?: string
  metadata?: any
}

export const useMindMapStore = defineStore('mindmap', () => {
  // State
  const currentMindmap = ref<MindMap | null>(null)
  const mindmaps = ref<MindMap[]>([])
  const nodes = ref<Node[]>([])
  const edges = ref<Edge[]>([])
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
      const response = await axios.get('/api/mindmaps')
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
      const response = await axios.get(`/api/mindmaps/${id}`)
      currentMindmap.value = response.data.mindmap

      // Transform nodes for Vue Flow
      const backendNodes = response.data.mindmap.nodes || []
      nodes.value = backendNodes.map((node: MindMapNode) => ({
        id: `node-${node.id}`,
        type: node.node_type || 'default',
        position: node.position || { x: 0, y: 0 },
        data: {
          label: node.content,
          content: node.content,
          metadata: node.metadata,
          dbId: node.id,
        },
      }))

      // Transform connections for Vue Flow
      const backendConnections = response.data.connections || []
      edges.value = backendConnections.map((conn: NodeConnection) => ({
        id: `edge-${conn.id}`,
        source: `node-${conn.from_node_id}`,
        target: `node-${conn.to_node_id}`,
        type: conn.connection_type === 'two-way' ? 'bidirectional' : 'default',
        data: {
          label: conn.label,
          relationship_type: conn.relationship_type,
          strength: conn.strength,
          style: conn.style,
          dbId: conn.id,
        },
        animated: conn.strength === 'strong',
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
      const response = await axios.post('/api/mindmaps', data)
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
      const response = await axios.put(`/api/mindmaps/${id}`, data)
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
      await axios.delete(`/api/mindmaps/${id}`)
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

  const duplicateMindmap = async (id: number | string): Promise<MindMap> => {
    loading.value = true
    error.value = null
    try {
      const response = await axios.post(`/api/mindmaps/${id}/clone`)
      const newMindmap = response.data
      mindmaps.value.push(newMindmap)
      return newMindmap
    } catch (err: any) {
      error.value = err.message || 'Failed to duplicate mindmap'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Node Operations
  const addNode = async (node: Partial<Node>): Promise<Node> => {
    if (!currentMindmap.value) throw new Error('No mindmap loaded')

    try {
      const response = await axios.post(`/api/mindmaps/${currentMindmap.value.id}/nodes`, {
        content: node.data?.label || 'New Node',
        position: node.position,
        node_type: node.type || 'default',
        metadata: node.data?.metadata,
      })

      const newNode: Node = {
        id: `node-${response.data.id}`,
        type: response.data.node_type || 'default',
        position: response.data.position,
        data: {
          label: response.data.content,
          content: response.data.content,
          metadata: response.data.metadata,
          dbId: response.data.id,
        },
      }

      nodes.value.push(newNode)
      hasUnsavedChanges.value = true
      return newNode
    } catch (err: any) {
      error.value = err.message || 'Failed to add node'
      throw err
    }
  }

  const updateNode = async (nodeId: string, updates: Partial<Node>): Promise<void> => {
    const node = nodes.value.find(n => n.id === nodeId)
    if (!node) return

    const dbId = node.data?.dbId
    if (!dbId) return

    try {
      await axios.put(`/api/mindmap-nodes/${dbId}`, {
        content: updates.data?.label,
        position: updates.position,
        metadata: updates.data?.metadata,
      })

      const index = nodes.value.findIndex(n => n.id === nodeId)
      if (index >= 0) {
        nodes.value[index] = { ...nodes.value[index], ...updates }
      }

      hasUnsavedChanges.value = true
    } catch (err: any) {
      error.value = err.message || 'Failed to update node'
      throw err
    }
  }

  const deleteNode = async (nodeId: string): Promise<void> => {
    const node = nodes.value.find(n => n.id === nodeId)
    if (!node) return

    const dbId = node.data?.dbId
    if (!dbId) return

    try {
      await axios.delete(`/api/mindmap-nodes/${dbId}`)

      nodes.value = nodes.value.filter(n => n.id !== nodeId)
      edges.value = edges.value.filter(e => e.source !== nodeId && e.target !== nodeId)

      hasUnsavedChanges.value = true
    } catch (err: any) {
      error.value = err.message || 'Failed to delete node'
      throw err
    }
  }

  // Connection Operations
  const createConnection = async (connection: {
    from_node_id: number | string
    to_node_id: number | string
    connection_type: 'one-way' | 'two-way'
    relationship_type: string
    strength: 'weak' | 'medium' | 'strong'
    label?: string
  }): Promise<Edge> => {
    if (!currentMindmap.value) throw new Error('No mindmap loaded')

    try {
      const response = await axios.post(`/api/mindmaps/${currentMindmap.value.id}/connections`, connection)

      const newEdge: Edge = {
        id: `edge-${response.data.id}`,
        source: `node-${connection.from_node_id}`,
        target: `node-${connection.to_node_id}`,
        type: connection.connection_type === 'two-way' ? 'bidirectional' : 'default',
        data: {
          label: connection.label,
          relationship_type: connection.relationship_type,
          strength: connection.strength,
          dbId: response.data.id,
        },
        animated: connection.strength === 'strong',
      }

      edges.value.push(newEdge)
      hasUnsavedChanges.value = true
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
      await axios.put(`/api/connections/${dbId}`, {
        label: updates.data?.label,
        relationship_type: updates.data?.relationship_type,
        strength: updates.data?.strength,
        style: updates.data?.style,
      })

      const index = edges.value.findIndex(e => e.id === edgeId)
      if (index >= 0) {
        edges.value[index] = { ...edges.value[index], ...updates }
      }

      hasUnsavedChanges.value = true
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
      await axios.delete(`/api/connections/${dbId}`)
      edges.value = edges.value.filter(e => e.id !== edgeId)
      hasUnsavedChanges.value = true
    } catch (err: any) {
      error.value = err.message || 'Failed to delete connection'
      throw err
    }
  }

  // Batch Operations
  const saveMindmap = async (data: { nodes: Node[]; edges: Edge[] }): Promise<void> => {
    if (!currentMindmap.value) throw new Error('No mindmap loaded')

    try {
      // Batch update nodes positions
      const nodeUpdates = data.nodes.map(node => ({
        id: node.data?.dbId,
        position: node.position,
      }))

      await axios.post(`/api/mindmaps/${currentMindmap.value.id}/nodes/batch-update`, {
        nodes: nodeUpdates,
      })

      hasUnsavedChanges.value = false
    } catch (err: any) {
      error.value = err.message || 'Failed to save mindmap'
      throw err
    }
  }

  // Export Operations
  const exportMindmap = async (format: 'json' | 'graphml' | 'markdown' = 'json'): Promise<any> => {
    if (!currentMindmap.value) throw new Error('No mindmap loaded')

    try {
      const response = await axios.get(`/api/mindmaps/${currentMindmap.value.id}/export`, {
        params: { format },
      })
      return response.data
    } catch (err: any) {
      error.value = err.message || 'Failed to export mindmap'
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
    duplicateMindmap,

    // Node Operations
    addNode,
    updateNode,
    deleteNode,

    // Connection Operations
    createConnection,
    updateConnection,
    deleteConnection,

    // Batch Operations
    saveMindmap,
    exportMindmap,

    // Selection
    selectNode,
    selectEdge,
    clearSelection,

    // Reset
    reset,
  }
})