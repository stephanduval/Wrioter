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
        v-if="currentMindmap && mindmapNodes.length > 0"
        :nodes="mindmapNodes"
        :edges="mindmapEdges"
        @node-click="handleNodeClick"
        @nodes-change="handleNodesChange"
        @edges-change="handleEdgesChange"
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
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useMindmapStore } from '@/stores/mindmap'
import { useManuscriptStore } from '@/stores/manuscript'
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
const contextMenu = useContextMenu()

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
    manuscriptId: manuscriptId.value
  })

  contextMenu.show(event, { items: menuItems })
}

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

function handleNodeClick(event: MouseEvent, node: any) {
  selectedNodeId.value = node.id
  mindmapStore.selectNode(node.id)
}

function handleNodesChange(changes: any[]) {
  // Handle node changes (position, etc)
  console.log('Nodes changed:', changes)
}

function handleEdgesChange(changes: any[]) {
  // Handle edge changes
  console.log('Edges changed:', changes)
}

function handleConnectNode() {
  // Implement node connection logic
  console.log('Connect node:', selectedNodeId.value)
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