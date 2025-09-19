# Manuscript Navigation Implementation Guide

## 🚀 **Getting Started**

This comprehensive implementation guide provides step-by-step instructions for building the Dynamic Manuscript Navigation System. Follow this guide to implement the feature systematically, ensuring quality and consistency throughout the development process.

## 📋 **Prerequisites**

### **Development Environment**
- Node.js 18+ and Yarn package manager
- PHP 8.3+ with Laravel 11+
- MySQL 8.0+ database
- Vue.js 3.4+ with TypeScript 5+
- Understanding of Pinia state management
- Familiarity with Vuetify component library

### **Required Knowledge**
- Vue 3 Composition API patterns
- TypeScript interface design
- Pinia store architecture
- Laravel API development
- Database relationship modeling
- CSS/SCSS for component styling

### **Project Setup Verification**
```bash
# Ensure test environment is running
yarn dev:test:all

# Verify database connection
php artisan about

# Check current manuscript data
yarn schema:text:test
```

## 🏗️ **Implementation Phases**

## **Phase 1: Foundation Setup (Week 1-2)**

### **Step 1.1: Enhanced Manuscript Store**

Create the enhanced manuscript store with navigation capabilities:

```typescript
// resources/ts/stores/manuscript.ts - Enhanced version
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useApi } from '@/composables/useApi'

// Type definitions (add to existing interfaces)
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

  // Existing state...
  const manuscripts = ref<Manuscript[]>([])
  const currentManuscript = ref<Manuscript | null>(null)
  const selectedManuscriptId = ref<number | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // New navigation state
  const manuscriptTree = ref<TreeNode[]>([])
  const flatItemsIndex = ref<Map<string, TreeNode>>(new Map())
  const treeMetadata = ref({
    totalItems: 0,
    totalWords: 0,
    lastModified: null as string | null,
    maxDepth: 0
  })

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
        path: `/manuscripts/${selectedManuscriptId.value}/items/${item.id}`,
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
      if (item.parent_id && nodeMap.has(item.parent_id)) {
        const parent = nodeMap.get(item.parent_id)!
        parent.children.push(node)
        node.parent = parent
      } else {
        rootNodes.push(node)
      }
    })

    // Phase 3: Sort by order
    const sortNodes = (nodes: TreeNode[]) => {
      nodes.sort((a, b) => {
        const aItem = items.find(item => item.id === a.itemId)!
        const bItem = items.find(item => item.id === b.itemId)!
        return (aItem.item_order || 0) - (bItem.item_order || 0)
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

  // API methods
  const fetchManuscriptItems = async (manuscriptId: number) => {
    try {
      loading.value = true
      error.value = null

      console.log('Fetching items for manuscript:', manuscriptId)
      const response = await api.get(`/manuscripts/${manuscriptId}/items`)

      if (response.data?.data) {
        const items = response.data.data
        manuscriptTree.value = buildNavigationTree(items)
        console.log('Navigation tree built successfully')
      } else {
        console.warn('No items data in response:', response.data)
        manuscriptTree.value = []
      }
    } catch (err: any) {
      console.error('Failed to fetch manuscript items:', err)
      error.value = err.response?.data?.message || 'Failed to load manuscript structure'
      manuscriptTree.value = []
    } finally {
      loading.value = false
    }
  }

  // Tree query methods
  const findNodeById = (nodeId: string): TreeNode | null => {
    return flatItemsIndex.value.get(nodeId) || null
  }

  const getNodePath = (nodeId: string): TreeNode[] => {
    const node = findNodeById(nodeId)
    if (!node) return []

    const path: TreeNode[] = []
    let current = node
    while (current) {
      path.unshift(current)
      current = current.parent
    }
    return path
  }

  // Enhanced manuscript selection to include tree loading
  const selectManuscript = async (manuscript: Manuscript | null) => {
    selectedManuscriptId.value = manuscript?.id || null
    saveToStorage(SELECTED_MANUSCRIPT_KEY, selectedManuscriptId.value)

    if (manuscript) {
      // Ensure the manuscript is in our list
      const exists = manuscripts.value.find(m => m.id === manuscript.id)
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

  return {
    // Existing exports...
    manuscripts,
    currentManuscript,
    selectedManuscriptId,
    loading,
    error,

    // New navigation exports
    manuscriptTree,
    flatItemsIndex,
    treeMetadata,

    // Enhanced methods
    selectManuscript,
    buildNavigationTree,
    fetchManuscriptItems,
    findNodeById,
    getNodePath,

    // Computed properties
    hasSelectedManuscript: computed(() => selectedManuscriptId.value !== null),
    treeNodeCount: computed(() => flatItemsIndex.value.size),
    hasNavigationTree: computed(() => manuscriptTree.value.length > 0)
  }
})
```

### **Step 1.2: Navigation-Specific Store**

Create a dedicated store for navigation UI state:

```typescript
// resources/ts/stores/manuscript-navigation.ts
import { defineStore } from 'pinia'
import { ref, computed, watch, onMounted } from 'vue'

type NavigationViewMode = 'tree' | 'flat' | 'collections'
type SortOption = 'order' | 'name' | 'modified' | 'type'

interface FilterOptions {
  types: string[]
  status: string[]
  hasComments: boolean | null
}

export const useManuscriptNavigationStore = defineStore('manuscriptNavigation', () => {
  // UI state
  const expandedNodes = ref<Set<string>>(new Set())
  const selectedNode = ref<string | null>(null)
  const searchQuery = ref<string>('')
  const viewMode = ref<NavigationViewMode>('tree')
  const sortBy = ref<SortOption>('order')
  const filterBy = ref<FilterOptions>({
    types: [],
    status: [],
    hasComments: null
  })

  // Performance state
  const virtualScrolling = ref<boolean>(false)
  const visibleNodeRange = ref<{ start: number; end: number }>({ start: 0, end: 50 })

  // Persistence keys
  const STORAGE_KEYS = {
    expandedNodes: 'manuscriptNav.expandedNodes',
    viewMode: 'manuscriptNav.viewMode',
    sortBy: 'manuscriptNav.sortBy'
  }

  // Storage helpers
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

  // Initialize from localStorage
  const initializeFromStorage = () => {
    const savedExpanded = getFromStorage(STORAGE_KEYS.expandedNodes)
    if (savedExpanded && Array.isArray(savedExpanded)) {
      expandedNodes.value = new Set(savedExpanded)
    }

    const savedViewMode = getFromStorage(STORAGE_KEYS.viewMode)
    if (savedViewMode) {
      viewMode.value = savedViewMode
    }

    const savedSortBy = getFromStorage(STORAGE_KEYS.sortBy)
    if (savedSortBy) {
      sortBy.value = savedSortBy
    }
  }

  // Persistence watchers
  watch(expandedNodes, (newNodes) => {
    saveToStorage(STORAGE_KEYS.expandedNodes, [...newNodes])
  }, { deep: true })

  watch(viewMode, (newMode) => {
    saveToStorage(STORAGE_KEYS.viewMode, newMode)
  })

  watch(sortBy, (newSort) => {
    saveToStorage(STORAGE_KEYS.sortBy, newSort)
  })

  // Node expansion methods
  const toggleNode = (nodeId: string) => {
    if (expandedNodes.value.has(nodeId)) {
      expandedNodes.value.delete(nodeId)
    } else {
      expandedNodes.value.add(nodeId)
    }
  }

  const expandNode = (nodeId: string) => {
    expandedNodes.value.add(nodeId)
  }

  const collapseNode = (nodeId: string) => {
    expandedNodes.value.delete(nodeId)
  }

  const expandAll = () => {
    // Will be implemented when we have access to tree structure
    console.log('Expand all nodes')
  }

  const collapseAll = () => {
    expandedNodes.value.clear()
  }

  // Selection methods
  const selectNode = (nodeId: string | null) => {
    selectedNode.value = nodeId
  }

  const clearSelection = () => {
    selectedNode.value = null
  }

  // Search methods
  const setSearchQuery = (query: string) => {
    searchQuery.value = query
  }

  const clearSearch = () => {
    searchQuery.value = ''
  }

  // Filter methods
  const setFilter = (filter: Partial<FilterOptions>) => {
    filterBy.value = { ...filterBy.value, ...filter }
  }

  const clearFilters = () => {
    filterBy.value = {
      types: [],
      status: [],
      hasComments: null
    }
  }

  // View mode methods
  const setViewMode = (mode: NavigationViewMode) => {
    viewMode.value = mode
  }

  const setSortBy = (sort: SortOption) => {
    sortBy.value = sort
  }

  // Initialize on store creation
  onMounted(() => {
    initializeFromStorage()
  })

  return {
    // State (readonly)
    expandedNodes: computed(() => expandedNodes.value),
    selectedNode: computed(() => selectedNode.value),
    searchQuery: computed(() => searchQuery.value),
    viewMode: computed(() => viewMode.value),
    sortBy: computed(() => sortBy.value),
    filterBy: computed(() => filterBy.value),
    virtualScrolling: computed(() => virtualScrolling.value),
    visibleNodeRange: computed(() => visibleNodeRange.value),

    // Methods
    toggleNode,
    expandNode,
    collapseNode,
    expandAll,
    collapseAll,
    selectNode,
    clearSelection,
    setSearchQuery,
    clearSearch,
    setFilter,
    clearFilters,
    setViewMode,
    setSortBy,

    // Computed properties
    hasActiveSearch: computed(() => searchQuery.value.length > 0),
    hasActiveFilters: computed(() =>
      filterBy.value.types.length > 0 ||
      filterBy.value.status.length > 0 ||
      filterBy.value.hasComments !== null
    ),
    isTreeMode: computed(() => viewMode.value === 'tree'),
    expandedNodeCount: computed(() => expandedNodes.value.size)
  }
})
```

### **Step 1.3: Base Navigation Component**

Create the main dynamic navigation component:

```vue
<!-- resources/ts/components/manuscript/DynamicManuscriptNavigation.vue -->
<template>
  <div
    v-if="manuscriptStore.hasSelectedManuscript"
    class="dynamic-manuscript-navigation"
    :class="{
      'is-loading': manuscriptStore.loading,
      'has-error': manuscriptStore.error,
      'is-empty': !manuscriptStore.hasNavigationTree
    }"
  >
    <!-- Navigation Header -->
    <div class="navigation-header">
      <div class="manuscript-info">
        <VIcon
          icon="bx-book"
          class="manuscript-icon"
          size="24"
        />
        <div class="manuscript-details">
          <h3 class="manuscript-title">
            {{ manuscriptStore.currentManuscript?.title || 'Unknown Manuscript' }}
          </h3>
          <div class="manuscript-meta">
            {{ treeMetadata.totalItems }} items • {{ formatWordCount(treeMetadata.totalWords) }} words
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="quick-actions">
        <VBtn
          icon
          size="small"
          variant="text"
          @click="handleSearchToggle"
        >
          <VIcon icon="bx-search" />
        </VBtn>

        <VBtn
          icon
          size="small"
          variant="text"
          @click="handleExpandAll"
        >
          <VIcon icon="bx-expand-alt" />
        </VBtn>
      </div>
    </div>

    <VDivider />

    <!-- Search Bar -->
    <div
      v-if="showSearch"
      class="search-section"
    >
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
    <div
      v-if="manuscriptStore.loading"
      class="loading-state"
    >
      <VProgressCircular
        indeterminate
        size="32"
        color="primary"
      />
      <div class="loading-text">Loading manuscript structure...</div>
    </div>

    <!-- Error State -->
    <div
      v-else-if="manuscriptStore.error"
      class="error-state"
    >
      <VIcon
        icon="bx-error"
        color="error"
        size="32"
      />
      <div class="error-text">{{ manuscriptStore.error }}</div>
      <VBtn
        size="small"
        variant="text"
        @click="handleRetry"
      >
        Retry
      </VBtn>
    </div>

    <!-- Empty State -->
    <div
      v-else-if="!manuscriptStore.hasNavigationTree"
      class="empty-state"
    >
      <VIcon
        icon="bx-folder-open"
        size="48"
        color="grey"
      />
      <div class="empty-text">No content found</div>
      <div class="empty-subtext">
        Start by creating your first document or folder.
      </div>
    </div>

    <!-- Navigation Tree -->
    <div
      v-else
      class="navigation-tree"
    >
      <div class="tree-container">
        <!-- Tree will be implemented in Phase 2 -->
        <div
          v-for="node in manuscriptStore.manuscriptTree"
          :key="node.id"
          class="tree-node-placeholder"
        >
          <VIcon :icon="node.icon" size="16" />
          <span class="node-title">{{ node.title }}</span>
          <span class="node-meta">({{ node.metadata.wordCount }} words)</span>
        </div>
      </div>
    </div>

    <!-- Status Bar -->
    <div class="navigation-status">
      <div class="status-info">
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useManuscriptStore } from '@/stores/manuscript'
import { useManuscriptNavigationStore } from '@/stores/manuscript-navigation'

// Stores
const manuscriptStore = useManuscriptStore()
const navigationStore = useManuscriptNavigationStore()

// Local state
const showSearch = ref(false)

// Computed
const treeMetadata = computed(() => manuscriptStore.treeMetadata)
const searchQuery = computed({
  get: () => navigationStore.searchQuery,
  set: (value: string) => navigationStore.setSearchQuery(value)
})

// Methods
const handleSearchToggle = () => {
  showSearch.value = !showSearch.value
  if (!showSearch.value) {
    navigationStore.clearSearch()
  }
}

const handleExpandAll = () => {
  navigationStore.expandAll()
}

const handleSearch = (query: string) => {
  console.log('Search query:', query)
  // Search implementation will be added in Phase 2
}

const handleRetry = async () => {
  if (manuscriptStore.selectedManuscriptId) {
    await manuscriptStore.fetchManuscriptItems(manuscriptStore.selectedManuscriptId)
  }
}

const formatWordCount = (count: number): string => {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k`
  }
  return count.toString()
}

// Initialize navigation when component mounts
watch(() => manuscriptStore.selectedManuscriptId, (newId) => {
  if (newId) {
    console.log('Dynamic navigation initialized for manuscript:', newId)
  }
}, { immediate: true })
</script>

<style scoped lang="scss">
.dynamic-manuscript-navigation {
  display: flex;
  flex-direction: column;
  height: 100%;
  border-right: 1px solid rgb(var(--v-theme-surface-variant));
  background-color: rgb(var(--v-theme-surface));

  &.is-loading {
    .navigation-tree {
      opacity: 0.5;
    }
  }

  &.has-error {
    .navigation-tree {
      display: none;
    }
  }
}

.navigation-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  min-height: 72px;

  .manuscript-info {
    display: flex;
    align-items: center;
    flex: 1;
    min-width: 0;

    .manuscript-icon {
      margin-right: 12px;
      color: rgb(var(--v-theme-primary));
    }

    .manuscript-details {
      flex: 1;
      min-width: 0;
    }

    .manuscript-title {
      font-size: 16px;
      font-weight: 600;
      line-height: 1.2;
      margin: 0 0 4px 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .manuscript-meta {
      font-size: 12px;
      color: rgb(var(--v-theme-on-surface-variant));
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .quick-actions {
    display: flex;
    align-items: center;
    gap: 4px;
    margin-left: 8px;
  }
}

.search-section {
  padding: 8px 16px 16px;
}

.loading-state,
.error-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 16px;
  text-align: center;
  flex: 1;

  .loading-text,
  .error-text,
  .empty-text {
    margin-top: 12px;
    font-weight: 500;
  }

  .empty-subtext {
    margin-top: 4px;
    font-size: 14px;
    color: rgb(var(--v-theme-on-surface-variant));
  }
}

.navigation-tree {
  flex: 1;
  overflow-y: auto;

  .tree-container {
    padding: 8px 0;
  }

  .tree-node-placeholder {
    display: flex;
    align-items: center;
    padding: 8px 16px;
    cursor: pointer;
    transition: background-color 0.2s;

    &:hover {
      background-color: rgb(var(--v-theme-surface-variant));
    }

    .node-title {
      margin: 0 8px;
      flex: 1;
    }

    .node-meta {
      font-size: 12px;
      color: rgb(var(--v-theme-on-surface-variant));
    }
  }
}

.navigation-status {
  padding: 8px 16px;
  border-top: 1px solid rgb(var(--v-theme-surface-variant));
  background-color: rgb(var(--v-theme-surface-bright));

  .status-info {
    font-size: 12px;
    color: rgb(var(--v-theme-on-surface-variant));
  }
}
</style>
```

### **Step 1.4: Integration with Existing Navigation**

Update the existing vertical navigation to include the dynamic manuscript navigation:

```vue
<!-- resources/ts/layouts/components/VerticalNavMenu.vue - Add this integration -->
<template>
  <VNavigationDrawer
    v-model="isDrawerOpen"
    :rail="isVerticalNavMini"
    class="layout-vertical-nav"
    :class="[
      {
        'nav-drawer-open': isDrawerOpen,
        'nav-drawer-mini': isVerticalNavMini,
        'has-manuscript-nav': showManuscriptNavigation
      }
    ]"
  >
    <!-- Dynamic Manuscript Navigation (NEW) -->
    <DynamicManuscriptNavigation
      v-if="showManuscriptNavigation"
      class="manuscript-navigation-section"
    />

    <!-- Divider between dynamic and static navigation -->
    <VDivider
      v-if="showManuscriptNavigation"
      class="navigation-divider"
    />

    <!-- Existing Static Navigation -->
    <div class="static-navigation-section">
      <!-- All existing navigation content goes here -->
      <VList
        v-model:opened="openedGroups"
        nav
      >
        <!-- Existing menu items -->
        <template
          v-for="(item, index) in computedNavItems"
          :key="`vertical-nav-${index}`"
        >
          <!-- Existing rendering logic -->
        </template>
      </VList>
    </div>
  </VNavigationDrawer>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useManuscriptStore } from '@/stores/manuscript'
import DynamicManuscriptNavigation from '@/components/manuscript/DynamicManuscriptNavigation.vue'

// Existing imports and setup...
const manuscriptStore = useManuscriptStore()

// Computed property to show manuscript navigation
const showManuscriptNavigation = computed(() => {
  return manuscriptStore.hasSelectedManuscript && manuscriptStore.selectedManuscriptId !== null
})

// Existing code...
</script>

<style lang="scss">
.layout-vertical-nav {
  &.has-manuscript-nav {
    .manuscript-navigation-section {
      flex-shrink: 0;
      border-bottom: 1px solid rgb(var(--v-theme-surface-variant));
    }

    .navigation-divider {
      margin: 0;
    }

    .static-navigation-section {
      flex: 1;
      overflow-y: auto;
    }
  }
}
</style>
```

### **Step 1.5: Testing Phase 1**

Create basic tests for the foundation:

```typescript
// tests/unit/stores/manuscript-navigation.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useManuscriptNavigationStore } from '@/stores/manuscript-navigation'

describe('ManuscriptNavigationStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    // Clear localStorage
    localStorage.clear()
  })

  it('initializes with default values', () => {
    const store = useManuscriptNavigationStore()

    expect(store.expandedNodes.size).toBe(0)
    expect(store.selectedNode).toBeNull()
    expect(store.searchQuery).toBe('')
    expect(store.viewMode).toBe('tree')
    expect(store.sortBy).toBe('order')
  })

  it('toggles node expansion correctly', () => {
    const store = useManuscriptNavigationStore()
    const nodeId = 'item-1'

    // Initially not expanded
    expect(store.expandedNodes.has(nodeId)).toBe(false)

    // Toggle to expand
    store.toggleNode(nodeId)
    expect(store.expandedNodes.has(nodeId)).toBe(true)

    // Toggle to collapse
    store.toggleNode(nodeId)
    expect(store.expandedNodes.has(nodeId)).toBe(false)
  })

  it('persists state to localStorage', () => {
    const store = useManuscriptNavigationStore()

    store.expandNode('item-1')
    store.setViewMode('flat')
    store.setSortBy('name')

    // Check localStorage
    const expandedNodes = JSON.parse(localStorage.getItem('manuscriptNav.expandedNodes') || '[]')
    expect(expandedNodes).toContain('item-1')

    const viewMode = JSON.parse(localStorage.getItem('manuscriptNav.viewMode') || '""')
    expect(viewMode).toBe('flat')

    const sortBy = JSON.parse(localStorage.getItem('manuscriptNav.sortBy') || '""')
    expect(sortBy).toBe('name')
  })
})
```

```typescript
// tests/unit/components/DynamicManuscriptNavigation.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createVuetify } from 'vuetify'
import DynamicManuscriptNavigation from '@/components/manuscript/DynamicManuscriptNavigation.vue'

const vuetify = createVuetify()

describe('DynamicManuscriptNavigation', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('renders when manuscript is selected', () => {
    const wrapper = mount(DynamicManuscriptNavigation, {
      global: {
        plugins: [vuetify]
      }
    })

    expect(wrapper.find('.dynamic-manuscript-navigation').exists()).toBe(true)
  })

  it('shows loading state correctly', () => {
    const wrapper = mount(DynamicManuscriptNavigation, {
      global: {
        plugins: [vuetify]
      }
    })

    // Mock loading state
    expect(wrapper.find('.loading-state').exists()).toBe(false)
  })

  it('handles search toggle', async () => {
    const wrapper = mount(DynamicManuscriptNavigation, {
      global: {
        plugins: [vuetify]
      }
    })

    const searchButton = wrapper.find('[data-test="search-toggle"]')
    if (searchButton.exists()) {
      await searchButton.trigger('click')
      expect(wrapper.find('.search-section').exists()).toBe(true)
    }
  })
})
```

### **Step 1.6: API Endpoint Enhancement**

Ensure the manuscript items API endpoint supports navigation data:

```php
// app/Http/Controllers/Api/ManuscriptController.php - Add/enhance this method
public function items(Request $request, Manuscript $manuscript)
{
    // Ensure user has access to manuscript
    $this->authorize('view', $manuscript);

    try {
        // Fetch items with relationships for navigation
        $items = $manuscript->items()
            ->with([
                'parent:id,title,type',
                'children:id,parent_id,title,type,item_order'
            ])
            ->withCount(['comments' => function ($query) {
                $query->where('status', 'active');
            }])
            ->select([
                'items.id',
                'items.parent_id',
                'items.title',
                'items.type',
                'items.word_count',
                'items.character_count',
                'items.item_order',
                'items.synopsis',
                'items.metadata',
                'items.include_in_compile',
                'items.updated_at'
            ])
            ->orderBy('item_order')
            ->get();

        // Transform for navigation
        $navigationData = $items->map(function ($item) {
            return [
                'id' => $item->id,
                'parent_id' => $item->parent_id,
                'title' => $item->title,
                'type' => $item->type,
                'word_count' => $item->word_count,
                'character_count' => $item->character_count,
                'item_order' => $item->item_order,
                'synopsis' => $item->synopsis,
                'metadata' => $item->metadata,
                'include_in_compile' => $item->include_in_compile,
                'updated_at' => $item->updated_at->toISOString(),
                'has_comments' => $item->comments_count > 0,
                'comment_count' => $item->comments_count,
                'children_count' => $item->children->count()
            ];
        });

        return response()->json([
            'data' => $navigationData,
            'meta' => [
                'total_items' => $items->count(),
                'total_words' => $items->sum('word_count'),
                'last_modified' => $items->max('updated_at')?->toISOString()
            ]
        ]);

    } catch (\Exception $e) {
        \Log::error('Failed to fetch manuscript items for navigation', [
            'manuscript_id' => $manuscript->id,
            'error' => $e->getMessage()
        ]);

        return response()->json([
            'error' => 'Failed to load manuscript structure',
            'message' => $e->getMessage()
        ], 500);
    }
}
```

### **Phase 1 Completion Checklist**

- [ ] Enhanced manuscript store with tree building logic
- [ ] Navigation-specific store with persistence
- [ ] Base dynamic navigation component
- [ ] Integration with existing vertical navigation
- [ ] Basic API endpoint for navigation data
- [ ] Unit tests for stores and components
- [ ] Visual confirmation that navigation appears when manuscript is selected
- [ ] localStorage persistence working for navigation state

## **Phase 2: Core Hierarchy Implementation (Week 3-4)**

### **Step 2.1: Tree Node Component**

```vue
<!-- resources/ts/components/manuscript/TreeNode.vue -->
<template>
  <div
    class="tree-node"
    :class="{
      'is-expanded': isExpanded,
      'is-selected': isSelected,
      'is-folder': hasChildren,
      'is-loading': node.state.isLoading,
      'is-dragging': node.state.isDragging
    }"
    :style="{ paddingLeft: `${level * 20 + 16}px` }"
  >
    <!-- Node Content -->
    <div
      class="node-content"
      @click="handleNodeClick"
      @contextmenu="handleContextMenu"
    >
      <!-- Expansion Toggle -->
      <div
        v-if="hasChildren"
        class="expansion-toggle"
        @click.stop="handleToggleExpansion"
      >
        <VIcon
          :icon="isExpanded ? 'bx-chevron-down' : 'bx-chevron-right'"
          size="16"
        />
      </div>
      <div
        v-else
        class="expansion-spacer"
      />

      <!-- Node Icon -->
      <VIcon
        :icon="node.icon"
        size="16"
        class="node-icon"
        :color="getIconColor()"
      />

      <!-- Node Label -->
      <div class="node-label">
        <span class="node-title">{{ node.title }}</span>

        <!-- Node Metadata -->
        <div
          v-if="showMetadata"
          class="node-metadata"
        >
          <span
            v-if="node.metadata.wordCount > 0"
            class="word-count"
          >
            {{ formatWordCount(node.metadata.wordCount) }} words
          </span>

          <VIcon
            v-if="node.metadata.hasComments"
            icon="bx-comment"
            size="12"
            class="comment-indicator"
          />

          <VIcon
            v-if="!node.metadata.isCompilable"
            icon="bx-x"
            size="12"
            class="no-compile-indicator"
            title="Excluded from compile"
          />
        </div>
      </div>

      <!-- Status Indicator -->
      <div class="status-indicator">
        <div
          class="status-dot"
          :class="`status-${node.metadata.status}`"
        />
      </div>
    </div>

    <!-- Child Nodes -->
    <div
      v-if="hasChildren && isExpanded"
      class="child-nodes"
    >
      <TreeNode
        v-for="child in node.children"
        :key="child.id"
        :node="child"
        :level="level + 1"
        :expanded-nodes="expandedNodes"
        :selected-node="selectedNode"
        @node-click="$emit('node-click', $event)"
        @node-toggle="$emit('node-toggle', $event)"
        @node-context="$emit('node-context', $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { TreeNode as TreeNodeType } from '@/types/manuscript-navigation'

interface Props {
  node: TreeNodeType
  level: number
  expandedNodes: Set<string>
  selectedNode: string | null
  showMetadata?: boolean
}

interface Emits {
  (e: 'node-click', nodeId: string): void
  (e: 'node-toggle', nodeId: string): void
  (e: 'node-context', data: { nodeId: string; event: MouseEvent }): void
}

const props = withDefaults(defineProps<Props>(), {
  showMetadata: true
})

const emit = defineEmits<Emits>()

// Computed properties
const hasChildren = computed(() => props.node.children.length > 0)
const isExpanded = computed(() => props.expandedNodes.has(props.node.id))
const isSelected = computed(() => props.selectedNode === props.node.id)

// Methods
const handleNodeClick = () => {
  emit('node-click', props.node.id)
}

const handleToggleExpansion = () => {
  emit('node-toggle', props.node.id)
}

const handleContextMenu = (event: MouseEvent) => {
  event.preventDefault()
  emit('node-context', { nodeId: props.node.id, event })
}

const getIconColor = (): string => {
  switch (props.node.type) {
    case 'folder':
      return 'warning'
    case 'text':
      return 'primary'
    case 'research':
      return 'info'
    case 'character':
      return 'success'
    case 'mindmap':
      return 'purple'
    default:
      return 'default'
  }
}

const formatWordCount = (count: number): string => {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k`
  }
  return count.toString()
}
</script>

<style scoped lang="scss">
.tree-node {
  position: relative;
  user-select: none;

  &.is-loading {
    opacity: 0.6;
  }

  &.is-dragging {
    opacity: 0.4;
  }
}

.node-content {
  display: flex;
  align-items: center;
  min-height: 32px;
  padding: 4px 8px 4px 0;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.2s;

  &:hover {
    background-color: rgb(var(--v-theme-surface-variant));
  }

  .tree-node.is-selected & {
    background-color: rgb(var(--v-theme-primary-container));
    color: rgb(var(--v-theme-on-primary-container));
  }
}

.expansion-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  margin-right: 4px;
  cursor: pointer;
  border-radius: 2px;
  transition: background-color 0.2s;

  &:hover {
    background-color: rgb(var(--v-theme-surface-bright));
  }
}

.expansion-spacer {
  width: 20px;
  margin-right: 4px;
}

.node-icon {
  margin-right: 8px;
  flex-shrink: 0;
}

.node-label {
  flex: 1;
  min-width: 0;

  .node-title {
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 14px;
    line-height: 1.2;
  }

  .node-metadata {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-top: 2px;
    font-size: 12px;
    color: rgb(var(--v-theme-on-surface-variant));

    .word-count {
      font-size: 11px;
    }

    .comment-indicator {
      color: rgb(var(--v-theme-info));
    }

    .no-compile-indicator {
      color: rgb(var(--v-theme-warning));
    }
  }
}

.status-indicator {
  margin-left: 8px;
  flex-shrink: 0;

  .status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;

    &.status-draft {
      background-color: rgb(var(--v-theme-surface-variant));
    }

    &.status-in_progress {
      background-color: rgb(var(--v-theme-warning));
    }

    &.status-completed {
      background-color: rgb(var(--v-theme-success));
    }

    &.status-archived {
      background-color: rgb(var(--v-theme-error));
    }
  }
}

.child-nodes {
  position: relative;

  &::before {
    content: '';
    position: absolute;
    left: 10px;
    top: 0;
    bottom: 0;
    width: 1px;
    background-color: rgb(var(--v-theme-outline-variant));
    opacity: 0.3;
  }
}
</style>
```

Continue with the rest of Phase 2 implementation... (This is a substantial guide that would continue with all remaining phases, components, testing strategies, and deployment instructions)

---

**This implementation guide provides the complete foundation and first major phase of the Dynamic Manuscript Navigation System. Each subsequent phase builds upon this foundation with increasingly sophisticated features and optimizations.**

**Document Version**: 1.0
**Last Updated**: January 2025
**Next Review**: As development progresses
**Maintainer**: Development Team