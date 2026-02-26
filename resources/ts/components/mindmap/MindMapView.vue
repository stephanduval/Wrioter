<template>
  <div class="mindmap-view-container">
    <!-- Mindmap Toolbar -->
    <VToolbar density="compact" color="surface" class="mindmap-toolbar">
      <VBtn
        icon
        size="small"
        @click="handleZoomIn"
        title="Zoom In"
      >
        <VIcon>mdi-magnify-plus</VIcon>
      </VBtn>
      <VBtn
        icon
        size="small"
        @click="handleZoomOut"
        title="Zoom Out"
      >
        <VIcon>mdi-magnify-minus</VIcon>
      </VBtn>
      <VBtn
        icon
        size="small"
        @click="handleFitView"
        title="Fit to View"
      >
        <VIcon>mdi-fit-to-screen-outline</VIcon>
      </VBtn>

      <VDivider vertical class="mx-2" />

      <VBtn
        color="primary"
        variant="tonal"
        size="small"
        @click="handleAddNode"
      >
        <VIcon start>mdi-plus</VIcon>
        Add Node
      </VBtn>

      <VBtn
        v-if="selectedNodeId"
        color="primary"
        variant="tonal"
        size="small"
        @click="handleConnectNode"
      >
        <VIcon start>mdi-link</VIcon>
        Connect
      </VBtn>

      <VSpacer />

      <VChip
        v-if="hasUnsavedChanges"
        size="small"
        color="warning"
        variant="tonal"
        class="me-2"
      >
        Unsaved Changes
      </VChip>

      <VBtn
        v-if="hasUnsavedChanges"
        color="success"
        size="small"
        @click="handleSave"
        :loading="isSaving"
      >
        Save
      </VBtn>
    </VToolbar>

    <!-- Mindmap Canvas -->
    <div class="mindmap-canvas" @contextmenu="handleEmptySpaceContextMenu">
      <MindMapCanvas
        ref="mindmapCanvasRef"
        v-if="currentMindmap && mindmapNodes.length > 0"
        :nodes="mindmapNodes"
        :edges="mindmapEdges"
        @node-click="handleNodeClick"
        @node-double-click="handleNodeDoubleClick"
        @title-updated="handleTitleUpdated"
        @nodes-change="handleNodesChange"
        @edges-change="handleEdgesChange"
        @connect="handleConnectNode"
        @toggle-collapse="handleToggleCollapse"
      />

      <!-- Empty State -->
      <div v-else class="empty-state">
        <VIcon size="64" color="grey-lighten-2">mdi-graph-outline</VIcon>
        <h3 class="text-h6 mt-4">No Mind Map Yet</h3>
        <p class="text-body-2 text-grey mt-2">
          Create a mind map to visualize the structure and connections of your items
        </p>
        <VBtn
          color="primary"
          class="mt-4"
          @click="handleCreateMindmap"
        >
          <VIcon start>mdi-plus</VIcon>
          Create Mind Map
        </VBtn>
      </div>
    </div>

    <!-- Node Edit Dialog -->
    <VDialog
      v-model="nodeEditDialog"
      max-width="500"
    >
      <VCard>
        <VCardTitle>
          {{ editingNode ? 'Edit Node' : 'Add Node' }}
        </VCardTitle>
        <VCardText>
          <VTextField
            v-model="nodeForm.label"
            label="Node Label"
            placeholder="Enter node label..."
            class="mb-3"
          />
          <VTextarea
            v-model="nodeForm.content"
            label="Content"
            placeholder="Add optional content..."
            rows="3"
            class="mb-3"
          />
          <VSelect
            v-if="items.length > 0"
            v-model="nodeForm.itemId"
            label="Link to Item"
            :items="items"
            item-title="title"
            item-value="id"
            clearable
            placeholder="Select an item to link..."
          />
        </VCardText>
        <VCardActions>
          <VSpacer />
          <VBtn
            variant="text"
            @click="closeNodeDialog"
          >
            Cancel
          </VBtn>
          <VBtn
            color="primary"
            @click="saveNode"
          >
            {{ editingNode ? 'Update' : 'Add' }}
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useMindmapStore } from '@/stores/mindmap'
import { useManuscriptStore } from '@/stores/manuscript'
import { useFolderViewStore } from '@/stores/folderView'
import { usePaneStore } from '@/stores/pane'
import { useContextMenu } from '@/composables/useContextMenu'
import { getEmptySpaceMenuItems } from '@/config/contextMenus'
import MindMapCanvas from './MindMapCanvas.vue'
import type { FolderItem } from '@/stores/folderView'

interface Props {
  folderId: number
  folder?: any
  items: FolderItem[]
  paneId?: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:loading': [boolean]
  'update:error': [string | null]
}>()

// Store
const mindmapStore = useMindmapStore()
const manuscriptStore = useManuscriptStore()
const folderViewStore = useFolderViewStore()
const contextMenu = useContextMenu()
const router = useRouter()

// Computed: Get manuscript ID from folder or store
const manuscriptId = computed(() =>
  props.folder?.manuscript_id || manuscriptStore.currentManuscript?.id
)

// Empty space context menu handler
function handleEmptySpaceContextMenu(event: MouseEvent) {
  const target = event.target as HTMLElement

  // If clicking on a node, don't show empty space menu
  // VueFlow uses .vue-flow__node class for nodes
  if (target.closest('.vue-flow__node') || target.closest('[data-node-id]')) {
    return
  }

  // Only show menu if we have the required context
  if (!manuscriptId.value) {
    console.warn('Cannot show context menu: no manuscript ID available')
    return
  }

  const menuItems = getEmptySpaceMenuItems({
    folderId: props.folderId,
    manuscriptId: manuscriptId.value,
    onAutoLayout: handleAutoLayout,
  })

  contextMenu.show(event, { items: menuItems })
}

// Refs
const mindmapCanvasRef = ref<InstanceType<typeof MindMapCanvas> | null>(null)

// Local state
const nodeEditDialog = ref(false)
const editingNode = ref<any>(null)
const selectedNodeId = ref<string | null>(null)
const isSaving = ref(false)

const nodeForm = ref({
  label: '',
  content: '',
  itemId: null as number | null
})

// Computed
const currentMindmap = computed(() => {
  // Get the mindmap for this folder
  return mindmapStore.getMindmapByFolderId(props.folderId)
})

const hasUnsavedChanges = computed(() => {
  return mindmapStore.hasUnsavedChanges
})

const mindmapNodes = computed(() => {
  return mindmapStore.nodes
})

const mindmapEdges = computed(() => {
  return mindmapStore.edges
})

// Methods
async function loadOrCreateMindmap() {
  try {
    emit('update:loading', true)

    // Try to load existing mindmap for this folder
    await mindmapStore.loadFolderMindmap(props.folderId)

    // Debug logging
    console.log('[MindMapView] Loaded mindmap:', {
      currentMindmap: currentMindmap.value,
      nodes: mindmapNodes.value,
      edges: mindmapEdges.value,
      folderId: props.folderId
    })

    // If no mindmap exists, we'll show the empty state
    if (!currentMindmap.value) {
      console.log('No mindmap found for folder', props.folderId)
    }
  } catch (error) {
    console.error('Failed to load mindmap:', error)
    emit('update:error', 'Failed to load mind map')
  } finally {
    emit('update:loading', false)
  }
}

async function handleCreateMindmap() {
  try {
    isSaving.value = true

    // Create a new mindmap for this folder
    await mindmapStore.createMindmap({
      title: `${props.folder?.title || 'Folder'} Mind Map`,
      folder_id: props.folderId,
      nodes: [],
      edges: []
    })

    // Reload to get the new mindmap
    await loadOrCreateMindmap()
  } catch (error) {
    console.error('Failed to create mindmap:', error)
    emit('update:error', 'Failed to create mind map')
  } finally {
    isSaving.value = false
  }
}

function handleAddNode() {
  editingNode.value = null
  nodeForm.value = {
    label: '',
    content: '',
    itemId: null
  }
  nodeEditDialog.value = true
}

function handleNodeClick(_event: MouseEvent, node: any) {
  if (!node) return
  selectedNodeId.value = node.id
  mindmapStore.selectNode(node.id)
}

function handleNodeDoubleClick(_event: MouseEvent, node: any) {
  if (!node) return
  const itemId = node.data?.itemId
  if (!itemId) {
    console.error('Node has no itemId:', node)
    return
  }

  const paneStore = usePaneStore()

  // Check if we're in split view mode
  if (folderViewStore.splitEnabled && paneStore.activePaneId) {
    // Split view: Open item in edit mode in the active pane
    paneStore.setEditingItem(paneStore.activePaneId, itemId)
  } else {
    // Single view: Navigate to folder with item view selected
    router.push({
      path: `/manuscripts/${manuscriptId.value}/folders/${props.folderId}`,
      query: {
        view: 'item',
        itemId: String(itemId)
      }
    })
  }
}

function handleTitleUpdated(nodeId: string, newTitle: string) {
  // Find the node and update its title via the store
  const node = mindmapNodes.value.find(n => n.id === nodeId)
  if (!node) return

  mindmapStore.updateNode({
    ...node,
    data: {
      ...node.data,
      label: newTitle
    }
  })
}

function handleNodesChange(changes: any[]) {
  // Handle node changes (position, etc)
  console.log('Nodes changed:', changes)
}

function handleEdgesChange(changes: any[]) {
  // Handle edge changes, but prevent deletion of hierarchy edges
  const filteredChanges = changes.filter(change => {
    if (change.type === 'remove') {
      // Find the edge being removed
      const edge = mindmapEdges.value.find(e => e.id === change.id)

      // Prevent deletion of hierarchy edges
      if (edge?.data?.is_hierarchy === true || edge?.type === 'hierarchy') {
        console.log('Cannot delete hierarchy edge:', edge)
        emit('update:error', 'Hierarchy edges cannot be deleted')
        return false
      }

      // Allow deletion of custom edges
      if (edge?.data?.dbId) {
        // Delete from backend
        mindmapStore.deleteConnection(change.id).catch(err => {
          console.error('Failed to delete connection:', err)
          emit('update:error', 'Failed to delete connection')
        })
      }
    }
    return true
  })

  console.log('Edges changed:', filteredChanges)
}

async function handleToggleCollapse(nodeId: string) {
  try {
    // Check if node is root folder
    const node = mindmapStore.nodes.find(n => n.id === nodeId)
    if (node?.data?.isRootFolder) {
      console.warn('Cannot collapse root folder')
      return
    }

    await mindmapStore.toggleNodeCollapse(nodeId)
  } catch (error: any) {
    console.error('Failed to toggle collapse:', error)
    emit('update:error', error.message || 'Failed to toggle folder collapse')
  }
}

async function handleConnectNode(params: any) {
  // Handle drag-and-drop connection creation from Vue Flow
  console.log('MindMapView handleConnectNode called with params:', params)
  try {
    // Extract item IDs from node IDs (format: "item-{id}")
    const sourceId = params.source?.replace('item-', '')
    const targetId = params.target?.replace('item-', '')

    console.log('Extracted IDs:', { sourceId, targetId })

    const fromItemId = parseInt(sourceId, 10)
    const toItemId = parseInt(targetId, 10)

    console.log('Parsed IDs:', { fromItemId, toItemId, fromIsNaN: isNaN(fromItemId), toIsNaN: isNaN(toItemId) })

    // Validate IDs
    if (!fromItemId || !toItemId || isNaN(fromItemId) || isNaN(toItemId)) {
      console.error('Invalid connection - ID validation failed:', params)
      emit('update:error', 'Invalid connection - could not parse node IDs')
      return
    }

    // Prevent self-connections
    if (fromItemId === toItemId) {
      console.error('Invalid connection - self connection')
      emit('update:error', 'Cannot connect a node to itself')
      return
    }

    // Check if connection already exists
    console.log('Checking for existing connection, current edges:', mindmapEdges.value)
    const existingConnection = mindmapEdges.value.find(
      edge =>
        (edge.source === params.source && edge.target === params.target) ||
        (edge.source === params.target && edge.target === params.source && edge.type === 'two-way')
    )

    if (existingConnection) {
      console.error('Connection already exists:', existingConnection)
      emit('update:error', 'Connection already exists between these nodes')
      return
    }

    console.log('All validations passed!')

    // Determine connection type based on modifier keys
    // Default: one-way, Shift key: two-way
    const connectionType = params.shiftKey ? 'two-way' : 'one-way'

    console.log('Creating connection:', {
      from: fromItemId,
      to: toItemId,
      type: connectionType
    })

    // Create connection via store
    await mindmapStore.createConnection({
      from_item_id: fromItemId,
      to_item_id: toItemId,
      connection_type: connectionType,
    })

    console.log('Connection created successfully')

  } catch (error: any) {
    console.error('Failed to create connection:', error)
    emit('update:error', error.message || 'Failed to create connection')
  }
}

function closeNodeDialog() {
  nodeEditDialog.value = false
  editingNode.value = null
  nodeForm.value = {
    label: '',
    content: '',
    itemId: null
  }
}

async function saveNode() {
  try {
    isSaving.value = true

    if (editingNode.value) {
      // Update existing node
      await mindmapStore.updateNode({
        ...editingNode.value,
        data: {
          ...editingNode.value.data,
          label: nodeForm.value.label,
          content: nodeForm.value.content,
          itemId: nodeForm.value.itemId,
        }
      })
    } else {
      // Add new node - will create item in DB with folder as parent
      await mindmapStore.addNode({
        id: `node-${Date.now()}`,
        type: 'default',
        position: { x: 200, y: 200 }, // Default position, should be calculated
        data: {
          label: nodeForm.value.label,
          content: nodeForm.value.content,
          itemId: nodeForm.value.itemId,
        }
      }, props.folderId) // Pass folder ID so new items become children
    }

    closeNodeDialog()
  } catch (error: any) {
    console.error('Failed to save node:', error)
    // You might want to show an error notification here
    emit('update:error', error.message || 'Failed to save node')
  } finally {
    isSaving.value = false
  }
}

async function handleSave() {
  try {
    isSaving.value = true
    await mindmapStore.saveMindmap()
  } catch (error) {
    console.error('Failed to save mindmap:', error)
    emit('update:error', 'Failed to save mind map')
  } finally {
    isSaving.value = false
  }
}

async function handleAutoLayout() {
  try {
    await mindmapStore.autoLayoutFolderMindmap(props.folderId)
    // Fit view after layout with animation
    nextTick(() => {
      mindmapCanvasRef.value?.fitView({ duration: 800, padding: 0.2 })
    })
  } catch (error: any) {
    console.error('Failed to auto-layout:', error)
    emit('update:error', error.message || 'Failed to auto-layout mindmap')
  }
}

function handleZoomIn() {
  // Implement zoom in
  console.log('Zoom in')
}

function handleZoomOut() {
  // Implement zoom out
  console.log('Zoom out')
}

function handleFitView() {
  // Implement fit to view
  console.log('Fit view')
}

// Lifecycle
onMounted(() => {
  loadOrCreateMindmap()
})

// Watch for folder changes
watch(() => props.folderId, (newFolderId) => {
  if (newFolderId) {
    loadOrCreateMindmap()
  }
})

// Cleanup
onUnmounted(() => {
  // Clean up if needed
})
</script>

<style scoped>
.mindmap-view-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: rgb(var(--v-theme-background));
}

.mindmap-toolbar {
  flex-shrink: 0;
  border-bottom: 1px solid rgb(var(--v-theme-surface-variant));
}

.mindmap-canvas {
  flex: 1;
  position: relative;
  overflow: hidden;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 24px;
  text-align: center;
}
</style>