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
        v-for="node in filteredTree"
        :key="node.id"
        :node="node"
        :level="0"
        :expanded-nodes="navigationStore.expandedNodes"
        :selected-node="navigationStore.selectedNode"
        @node-click="handleNodeClick"
        @node-toggle="handleNodeToggle"
        @node-context="handleNodeContext"
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
import TreeNode from './TreeNode.vue'

// Stores and router
const manuscriptStore = useManuscriptStore()
const navigationStore = useManuscriptNavigationStore()
const router = useRouter()

// Local state
const showSearch = ref(false)

// Computed
const treeMetadata = computed(() => manuscriptStore.treeMetadata)
const searchQuery = computed({
  get: () => navigationStore.searchQuery,
  set: (value: string) => navigationStore.setSearchQuery(value)
})

// Filtered tree based on search
const filteredTree = computed(() => {
  const tree = manuscriptStore.manuscriptTree
  const query = navigationStore.searchQuery.toLowerCase()

  if (!query) {
    return tree
  }

  // Simple search implementation - filter nodes that match the query
  const filterNodes = (nodes: any[]): any[] => {
    return nodes.filter(node => {
      const titleMatch = node.title.toLowerCase().includes(query)
      const hasMatchingChildren = node.children.length > 0 && filterNodes(node.children).length > 0

      if (titleMatch || hasMatchingChildren) {
        // If this node or its children match, include it with filtered children
        return {
          ...node,
          children: hasMatchingChildren ? filterNodes(node.children) : node.children
        }
      }
      return false
    }).filter(Boolean)
  }

  return filterNodes(tree)
})

// Methods
const handleSearchToggle = () => {
  showSearch.value = !showSearch.value
  if (!showSearch.value) {
    navigationStore.clearSearch()
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

const handleSearch = (query: string) => {
  console.log('Search query:', query)
  // The computed filteredTree will automatically update
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
    router.push(node.path)
  }
}

const handleNodeToggle = (nodeId: string) => {
  navigationStore.toggleNode(nodeId)
}

const handleNodeContext = (data: { nodeId: string; event: MouseEvent }) => {
  // TODO: Implement context menu in future phases
  console.log('Context menu for node:', data.nodeId)
}

const formatWordCount = (count: number): string => {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k`
  }
  return count.toString()
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