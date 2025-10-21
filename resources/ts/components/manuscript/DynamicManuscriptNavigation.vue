<template>
  <!-- Debug: Always visible test element -->
  <div v-if="!manuscriptStore.hasSelectedManuscript" class="debug-no-manuscript" style="padding: 8px; font-size: 11px; color: #666;">
    📋 DynamicManuscriptNavigation loaded - No manuscript selected
  </div>

  <div v-if="manuscriptStore.hasSelectedManuscript" class="manuscript-navigation-wrapper">
    <!-- Manuscript Header -->
    <div
      class="manuscript-navigation-header"
      :class="{
        'is-loading': manuscriptStore.loading,
        'has-error': manuscriptStore.error,
        'is-empty': !manuscriptStore.hasNavigationTree
      }"
    >
      <div class="header-content">
        <VIcon
          icon="bx-book"
          size="20"
          color="primary"
        />
        <div class="manuscript-info">
          <div class="manuscript-title">
            {{ manuscriptStore.selectedManuscript?.title || 'Unknown Manuscript' }}
          </div>
          <div class="manuscript-meta">
            {{ treeMetadata.totalItems }} items • {{ formatWordCount(treeMetadata.totalWords) }} words
          </div>
        </div>
      </div>
      <div class="header-actions">
        <VBtn
          icon
          size="x-small"
          variant="text"
          @click="handleSearchToggle"
        >
          <VIcon icon="bx-search" size="18" />
        </VBtn>
        <VBtn
          icon
          size="x-small"
          variant="text"
          @click="handleExpandAll"
        >
          <VIcon icon="bx-expand-alt" size="18" />
        </VBtn>
      </div>
    </div>

    <!-- Search Bar -->
    <div v-if="showSearch" class="search-section">
      <VTextField
        v-model="searchQuery"
        placeholder="Search items..."
        prepend-inner-icon="bx-search"
        variant="outlined"
        density="compact"
        hide-details
        clearable
        @update:model-value="handleSearch"
      />
    </div>

    <!-- Loading State -->
    <div v-if="manuscriptStore.loading" class="loading-state">
      <VProgressCircular
        indeterminate
        size="20"
        color="primary"
      />
      <span>Loading manuscript structure...</span>
    </div>

    <!-- Error State -->
    <div v-else-if="manuscriptStore.error" class="error-state">
      <VIcon
        icon="bx-error"
        color="error"
        size="20"
      />
      <span>{{ manuscriptStore.error }}</span>
      <VBtn
        size="x-small"
        variant="text"
        @click="handleRetry"
      >
        Retry
      </VBtn>
    </div>

    <!-- Empty State -->
    <div v-else-if="!manuscriptStore.hasNavigationTree" class="empty-state">
      <VIcon
        icon="bx-folder-open"
        size="32"
        color="grey"
      />
      <div class="empty-text">No content found</div>
      <div class="empty-subtext">Start by creating your first document or folder.</div>
    </div>

    <!-- Navigation Tree Items -->
    <div v-else class="navigation-tree">
      <TreeNode
        v-for="node in manuscriptStore.manuscriptTree"
        :key="node.id"
        :node="node"
        :level="0"
        :expanded-nodes="navigationStore.expandedNodes"
        :selected-node="navigationStore.selectedNode"
        :dragging-node-id="draggingNodeId"
        @node-click="handleNodeClick"
        @node-toggle="handleNodeToggle"
        @node-context="handleNodeContext"
        @node-drag-start="handleNodeDragStart"
        @node-drag-end="handleNodeDragEnd"
        @node-drop="handleNodeDrop"
      />
    </div>

    <!-- Status Bar -->
    <div class="navigation-status">
      <span v-if="navigationStore.hasActiveSearch">
        Search: "{{ searchQuery }}"
      </span>
      <span v-else-if="navigationStore.expandedNodeCount > 0">
        {{ navigationStore.expandedNodeCount }} folders expanded
      </span>
      <span v-else>
        {{ treeMetadata.totalItems }} items
      </span>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useManuscriptStore } from '@/stores/manuscript'
import { useManuscriptNavigationStore } from '@/stores/manuscript-navigation'
import { useFolderViewStore } from '@/stores/folderView'
import { usePaneStore } from '@/stores/pane'
import { useContextMenu } from '@/composables/useContextMenu'
import { ContextDetectionService } from '@/services/contextDetection'
import TreeNode from './TreeNode.vue'

// Stores and router
const manuscriptStore = useManuscriptStore()
const navigationStore = useManuscriptNavigationStore()
const router = useRouter()

// Context menu composable
const contextMenu = useContextMenu()

// Local state
const showSearch = ref(false)
const draggingNodeId = ref<string | null>(null)

// Computed
const treeMetadata = computed(() => manuscriptStore.treeMetadata)
const searchQuery = computed({
  get: () => navigationStore.searchQuery,
  set: (value: string) => navigationStore.setSearchQuery(value)
})

// Note: Search is now handled server-side instead of client-side filtering

// Methods
const handleSearchToggle = async () => {
  showSearch.value = !showSearch.value
  if (!showSearch.value) {
    navigationStore.clearSearch()
    await manuscriptStore.clearSearch()
  }
}

const handleExpandAll = () => {
  // Get all folder nodes from the tree and expand them
  const expandFolderNodes = (nodes: any[]) => {
    nodes.forEach(node => {
      if (node.children.length > 0) {
        navigationStore.expandNode(node.id)
        expandFolderNodes(node.children)
      }
    })
  }

  expandFolderNodes(manuscriptStore.manuscriptTree)
}

// Debounce search to avoid too many API calls
let searchTimeout: NodeJS.Timeout | null = null

const handleSearch = async (query: string) => {
  console.log('Search query:', query)

  // Clear previous timeout
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }

  // Debounce search by 500ms
  searchTimeout = setTimeout(async () => {
    if (!query || query.trim() === '') {
      // Clear search and reload all items
      await manuscriptStore.clearSearch()
    } else {
      // Search items on server
      await manuscriptStore.searchItems(query.trim())
    }
  }, 500)
}

const handleRetry = async () => {
  if (manuscriptStore.selectedManuscriptId) {
    await manuscriptStore.fetchManuscriptItems(manuscriptStore.selectedManuscriptId)
  }
}

const handleNodeClick = (nodeId: string) => {
  navigationStore.selectNode(nodeId)

  // Navigate to the node
  const node = manuscriptStore.findNodeById(nodeId)
  if (node) {
    // For text items (documents), handle differently based on view context
    if (node.type === 'text' && manuscriptStore.selectedManuscriptId) {
      // Check if we're in split view with an active pane
      const folderViewStore = useFolderViewStore()
      const paneStore = usePaneStore()

      if (folderViewStore.splitEnabled && paneStore.activePaneId) {
        // Split view is active - update the active pane to edit mode with this item
        console.log(`[Nav] Opening item ${node.itemId} in active pane ${paneStore.activePaneId}`)
        paneStore.setEditingItem(paneStore.activePaneId, node.itemId)
      } else {
        // Single view mode - use traditional routing
        router.push(`/manuscripts/${manuscriptStore.selectedManuscriptId}/items/${node.itemId}/edit`)
      }
    } else if (node.type === 'folder') {
      // For folders, only handle in split view context
      // (expansion/collapse now handled by the chevron button directly)
      const folderViewStore = useFolderViewStore()
      const paneStore = usePaneStore()

      if (folderViewStore.splitEnabled && paneStore.activePaneId) {
        // Split view: Load folder content in the active pane only
        console.log(`[Nav] Loading folder ${node.itemId} in active pane ${paneStore.activePaneId}`)

        // Use the new loadFolderForPane method to fetch and store folder content per pane
        paneStore.loadFolderForPane(paneStore.activePaneId, node.itemId)

        // Switch pane to a view mode (not edit) if currently in edit mode
        const currentPane = paneStore.getPane(paneStore.activePaneId)
        if (currentPane?.viewMode === 'edit') {
          paneStore.updatePaneMode(paneStore.activePaneId, 'manuscript')
        }
      }
      // In single view, clicking folder label does nothing (chevron handles expansion)
    } else if (node.path) {
      // For other types, use the existing path if available
      router.push(node.path)
    }
  }
}

const handleNodeToggle = (nodeId: string) => {
  navigationStore.toggleNode(nodeId)
}

const handleNodeContext = (data: { nodeId: string; event: MouseEvent }) => {
  console.log('handleNodeContext called with nodeId:', data.nodeId)

  const menuItems = ContextDetectionService.getMenuItemsForNode(data.nodeId)
  console.log('Menu items retrieved:', menuItems.length, menuItems)

  if (menuItems.length > 0) {
    console.log('Showing context menu at:', data.event.clientX, data.event.clientY)
    contextMenu.show(data.event, {
      items: menuItems,
      context: { nodeId: data.nodeId }
    })
  } else {
    console.warn('No menu items found for node:', data.nodeId)
  }
}

const formatWordCount = (count: number): string => {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k`
  }
  return count.toString()
}

// Drag and Drop handlers
const handleNodeDragStart = (data: { nodeId: string; itemId: number }) => {
  console.log('Drag start:', data)
  draggingNodeId.value = data.nodeId
}

const handleNodeDragEnd = () => {
  console.log('Drag end')
  draggingNodeId.value = null
}

const handleNodeDrop = async (data: {
  sourceNodeId: string
  sourceItemId: number
  targetNodeId: string
  targetItemId: number
  position: 'above' | 'below' | 'inside'
}) => {
  console.log('Drop event:', data)

  try {
    // Call the API to reorder items
    await manuscriptStore.reorderItem({
      sourceItemId: data.sourceItemId,
      targetItemId: data.targetItemId,
      position: data.position,
      manuscriptId: manuscriptStore.selectedManuscriptId!
    })

    // Reload the tree to reflect changes
    await manuscriptStore.fetchManuscriptItems(manuscriptStore.selectedManuscriptId!)
  } catch (error) {
    console.error('Error reordering item:', error)
    // TODO: Show error notification to user
  }
}

console.log('🎯 DynamicManuscriptNavigation component loaded!')

// Initialize navigation when component mounts
watch(() => manuscriptStore.selectedManuscriptId, (newId) => {
  console.log('📋 selectedManuscriptId changed:', newId)
  if (newId) {
    console.log('Dynamic navigation initialized for manuscript:', newId)
  }
}, { immediate: true })

// Debug component visibility
watch(() => manuscriptStore.hasSelectedManuscript, (hasSelected) => {
  console.log('👁️ hasSelectedManuscript changed:', hasSelected)
  console.log('selectedManuscriptId:', manuscriptStore.selectedManuscriptId)
  console.log('selectedManuscript:', manuscriptStore.selectedManuscript)
}, { immediate: true })

// Debug the component render
console.log('🔍 Component setup complete, hasSelectedManuscript:', manuscriptStore.hasSelectedManuscript)
</script>

<style scoped lang="scss">
.manuscript-navigation-wrapper {
  padding: 12px;
  border-bottom: 1px solid rgb(var(--v-theme-surface-variant));
  margin-bottom: 8px;
}

.manuscript-navigation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;

  .header-content {
    display: flex;
    align-items: center;
    gap: 10px;
    flex: 1;
    min-width: 0;
  }

  .manuscript-info {
    flex: 1;
    min-width: 0;
  }

  .manuscript-title {
    font-size: 14px;
    font-weight: 600;
    color: rgb(var(--v-theme-on-surface));
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .manuscript-meta {
    font-size: 11px;
    color: rgb(var(--v-theme-on-surface-variant));
    margin-top: 2px;
  }

  .header-actions {
    display: flex;
    gap: 4px;
  }
}

.search-section {
  margin-bottom: 12px;
}

.loading-state,
.error-state {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  font-size: 13px;
  color: rgb(var(--v-theme-on-surface-variant));
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px 12px;
  text-align: center;

  .empty-text {
    font-size: 14px;
    font-weight: 500;
    margin-top: 8px;
    color: rgb(var(--v-theme-on-surface));
  }

  .empty-subtext {
    font-size: 12px;
    color: rgb(var(--v-theme-on-surface-variant));
    margin-top: 4px;
  }
}

.navigation-tree {
  max-height: 400px;
  overflow-y: auto;
  margin: 0 -12px;
  padding: 0 12px;
}

.navigation-status {
  font-size: 11px;
  color: rgb(var(--v-theme-on-surface-variant));
  padding: 8px 0 4px;
  border-top: 1px solid rgb(var(--v-theme-surface-variant));
  margin-top: 8px;
}
</style>