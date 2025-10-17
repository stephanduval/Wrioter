<template>
  <div class="mindmap-view">
    <!-- Toolbar -->
    <MindMapToolbar
      @add-node="handleAddNode"
      @toggle-layout="handleLayoutChange"
      @export="handleExport"
      @save="handleSave"
      @zoom-in="zoomIn"
      @zoom-out="zoomOut"
      @fit-view="fitView"
    />

    <div class="mindmap-container">
      <!-- Sidebar -->
      <MindMapSidebar
        v-model:visible="sidebarVisible"
        :items="availableItems"
        @drag-item="handleDragItem"
        @filter-tags="handleFilterTags"
      />

      <!-- Canvas -->
      <div class="mindmap-canvas-wrapper">
        <MindMapCanvas
          ref="canvasRef"
          :nodes="nodes"
          :edges="edges"
          @nodes-change="handleNodesChange"
          @edges-change="handleEdgesChange"
          @node-click="handleNodeClick"
          @edge-click="handleEdgeClick"
          @connect="handleConnect"
          @node-context-menu="handleNodeContextMenu"
          @pane-context-menu="handlePaneContextMenu"
        />
      </div>

      <!-- Properties Panel -->
      <ConnectionPanel
        v-if="selectedEdge"
        :edge="selectedEdge"
        @update="handleEdgeUpdate"
        @close="selectedEdge = null"
      />
    </div>

    <!-- Node Properties Dialog -->
    <VDialog v-model="nodeDialog.visible" max-width="500">
      <VCard>
        <VCardTitle>
          {{ nodeDialog.isNew ? 'Add Node' : 'Edit Node' }}
        </VCardTitle>
        <VCardText>
          <VTextField
            v-model="nodeDialog.data.label"
            label="Label"
            variant="outlined"
            class="mb-4"
          />
          <VTextarea
            v-model="nodeDialog.data.content"
            label="Content"
            variant="outlined"
            rows="3"
            class="mb-4"
          />
          <VSelect
            v-model="nodeDialog.data.type"
            label="Type"
            :items="nodeTypes"
            variant="outlined"
          />
        </VCardText>
        <VCardActions>
          <VSpacer />
          <VBtn variant="text" @click="nodeDialog.visible = false">Cancel</VBtn>
          <VBtn color="primary" variant="flat" @click="saveNode">Save</VBtn>
        </VCardActions>
      </VCard>
    </VDialog>

    <!-- Context Menu -->
    <VMenu
      v-model="contextMenu.visible"
      :location="contextMenu.location"
      :style="{
        position: 'fixed',
        left: `${contextMenu.x}px`,
        top: `${contextMenu.y}px`,
      }"
    >
      <VList density="compact">
        <VListItem @click="handleContextAction('edit')">
          <template #prepend>
            <VIcon size="20">bx-edit</VIcon>
          </template>
          <VListItemTitle>Edit</VListItemTitle>
        </VListItem>
        <VListItem @click="handleContextAction('delete')">
          <template #prepend>
            <VIcon size="20" color="error">bx-trash</VIcon>
          </template>
          <VListItemTitle>Delete</VListItemTitle>
        </VListItem>
        <VDivider />
        <VListItem @click="handleContextAction('add-child')">
          <template #prepend>
            <VIcon size="20">bx-git-branch</VIcon>
          </template>
          <VListItemTitle>Add Child</VListItemTitle>
        </VListItem>
        <VListItem @click="handleContextAction('add-sibling')">
          <template #prepend>
            <VIcon size="20">bx-git-merge</VIcon>
          </template>
          <VListItemTitle>Add Sibling</VListItemTitle>
        </VListItem>
      </VList>
    </VMenu>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useMindMapStore } from '@/stores/mindmap'
import { useToast } from 'vue-toastification'
import MindMapCanvas from '@/components/mindmap/MindMapCanvas.vue'
import MindMapToolbar from '@/components/mindmap/MindMapToolbar.vue'
import MindMapSidebar from '@/components/mindmap/MindMapSidebar.vue'
import ConnectionPanel from '@/components/mindmap/ConnectionPanel.vue'

const route = useRoute()
const mindmapStore = useMindMapStore()
const toast = useToast()

// Refs
const canvasRef = ref(null)
const sidebarVisible = ref(true)
const selectedEdge = ref(null)
const selectedNode = ref(null)

// Data
const nodes = ref([])
const edges = ref([])
const availableItems = ref([])

const nodeDialog = ref({
  visible: false,
  isNew: true,
  data: {
    label: '',
    content: '',
    type: 'default',
  },
})

const contextMenu = ref({
  visible: false,
  x: 0,
  y: 0,
  location: 'bottom',
  target: null,
})

const nodeTypes = [
  { title: 'Default', value: 'default' },
  { title: 'Text', value: 'text' },
  { title: 'Folder', value: 'folder' },
  { title: 'Character', value: 'character' },
  { title: 'Research', value: 'research' },
  { title: 'Image', value: 'image' },
]

// Methods
const loadMindmap = async () => {
  const mindmapId = route.params.id
  if (!mindmapId) return

  try {
    const data = await mindmapStore.loadMindmap(mindmapId)

    // Transform backend data to Vue Flow format
    nodes.value = data.nodes.map(node => ({
      id: `node-${node.id}`,
      type: node.node_type || 'default',
      position: node.position || { x: 0, y: 0 },
      data: {
        label: node.content,
        content: node.content,
        metadata: node.metadata,
      },
    }))

    edges.value = data.connections.map(conn => ({
      id: `edge-${conn.id}`,
      source: `node-${conn.from_node_id}`,
      target: `node-${conn.to_node_id}`,
      type: conn.connection_type === 'two-way' ? 'bidirectional' : 'default',
      data: {
        label: conn.label,
        relationship_type: conn.relationship_type,
        strength: conn.strength,
        style: conn.style,
      },
      animated: conn.strength === 'strong',
    }))
  } catch (error) {
    console.error('Error loading mindmap:', error)
    snackbar.show({
      message: 'Failed to load mind map',
      color: 'error',
    })
  }
}

const handleAddNode = () => {
  nodeDialog.value = {
    visible: true,
    isNew: true,
    data: {
      label: '',
      content: '',
      type: 'default',
    },
  }
}

const handleNodesChange = (changes: any[]) => {
  // Handle node position/data changes
  nodes.value = changes
  // Debounce save to backend
  debouncedSave()
}

const handleEdgesChange = (changes: any[]) => {
  // Handle edge changes
  edges.value = changes
  // Debounce save to backend
  debouncedSave()
}

const handleNodeClick = (event: any, node: any) => {
  selectedNode.value = node
  selectedEdge.value = null
}

const handleEdgeClick = (event: any, edge: any) => {
  selectedEdge.value = edge
  selectedNode.value = null
}

const handleConnect = async (params: any) => {
  // Create new connection
  const newEdge = {
    id: `edge-${Date.now()}`,
    source: params.source,
    target: params.target,
    type: 'default',
    data: {
      label: '',
      relationship_type: 'relates-to',
      strength: 'medium',
    },
  }

  edges.value = [...edges.value, newEdge]

  // Save to backend
  try {
    await mindmapStore.createConnection({
      from_node_id: params.source.replace('node-', ''),
      to_node_id: params.target.replace('node-', ''),
      connection_type: 'one-way',
      relationship_type: 'relates-to',
      strength: 'medium',
    })
  } catch (error) {
    console.error('Error creating connection:', error)
    snackbar.show({
      message: 'Failed to create connection',
      color: 'error',
    })
  }
}

const handleNodeContextMenu = (event: MouseEvent, node: any) => {
  event.preventDefault()
  contextMenu.value = {
    visible: true,
    x: event.clientX,
    y: event.clientY,
    location: 'bottom',
    target: node,
  }
}

const handlePaneContextMenu = (event: MouseEvent) => {
  event.preventDefault()
  // Add node at click position
  const position = canvasRef.value?.project({ x: event.clientX, y: event.clientY })
  if (position) {
    const newNode = {
      id: `node-${Date.now()}`,
      type: 'default',
      position,
      data: {
        label: 'New Node',
        content: '',
      },
    }
    nodes.value = [...nodes.value, newNode]
  }
}

const handleContextAction = (action: string) => {
  switch (action) {
    case 'edit':
      if (contextMenu.value.target) {
        nodeDialog.value = {
          visible: true,
          isNew: false,
          data: {
            ...contextMenu.value.target.data,
          },
        }
      }
      break
    case 'delete':
      if (contextMenu.value.target) {
        nodes.value = nodes.value.filter(n => n.id !== contextMenu.value.target.id)
        edges.value = edges.value.filter(e =>
          e.source !== contextMenu.value.target.id &&
          e.target !== contextMenu.value.target.id
        )
      }
      break
    case 'add-child':
      // TODO: Implement add child
      break
    case 'add-sibling':
      // TODO: Implement add sibling
      break
  }
  contextMenu.value.visible = false
}

const saveNode = () => {
  if (nodeDialog.value.isNew) {
    const newNode = {
      id: `node-${Date.now()}`,
      type: nodeDialog.value.data.type,
      position: { x: 100, y: 100 },
      data: { ...nodeDialog.value.data },
    }
    nodes.value = [...nodes.value, newNode]
  } else if (selectedNode.value) {
    const index = nodes.value.findIndex(n => n.id === selectedNode.value.id)
    if (index >= 0) {
      nodes.value[index] = {
        ...nodes.value[index],
        data: { ...nodeDialog.value.data },
      }
    }
  }
  nodeDialog.value.visible = false
}

const handleLayoutChange = (layout: string) => {
  // TODO: Implement layout algorithms
  console.log('Layout change:', layout)
}

const handleExport = (format: string) => {
  // TODO: Implement export
  console.log('Export:', format)
}

const handleSave = async () => {
  try {
    await mindmapStore.saveMindmap({
      nodes: nodes.value,
      edges: edges.value,
    })
    snackbar.show({
      message: 'Mind map saved successfully',
      color: 'success',
    })
  } catch (error) {
    console.error('Error saving mindmap:', error)
    snackbar.show({
      message: 'Failed to save mind map',
      color: 'error',
    })
  }
}

const handleDragItem = (item: any) => {
  // TODO: Handle dragging items from sidebar
  console.log('Drag item:', item)
}

const handleFilterTags = (tags: string[]) => {
  // TODO: Filter nodes by tags
  console.log('Filter tags:', tags)
}

const handleEdgeUpdate = (updates: any) => {
  if (selectedEdge.value) {
    const index = edges.value.findIndex(e => e.id === selectedEdge.value.id)
    if (index >= 0) {
      edges.value[index] = {
        ...edges.value[index],
        data: {
          ...edges.value[index].data,
          ...updates,
        },
      }
    }
  }
}

// Canvas control methods
const zoomIn = () => {
  canvasRef.value?.zoomIn()
}

const zoomOut = () => {
  canvasRef.value?.zoomOut()
}

const fitView = () => {
  canvasRef.value?.fitView()
}

// Debounced save
let saveTimeout: any = null
const debouncedSave = () => {
  clearTimeout(saveTimeout)
  saveTimeout = setTimeout(() => {
    handleSave()
  }, 1000)
}

// Load available items for sidebar
const loadAvailableItems = async () => {
  try {
    // TODO: Load items from API
    availableItems.value = []
  } catch (error) {
    console.error('Error loading items:', error)
  }
}

// Lifecycle
onMounted(() => {
  loadMindmap()
  loadAvailableItems()
})
</script>

<style scoped>
.mindmap-view {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--v-theme-background);
}

.mindmap-container {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.mindmap-canvas-wrapper {
  flex: 1;
  position: relative;
}
</style>