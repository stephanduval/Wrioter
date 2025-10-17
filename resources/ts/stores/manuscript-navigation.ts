import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

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
    // This will be enhanced to work with the manuscript store
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

  // Virtual scrolling methods
  const updateVisibleRange = (start: number, end: number) => {
    visibleNodeRange.value = { start, end }
  }

  const enableVirtualScrolling = () => {
    virtualScrolling.value = true
  }

  const disableVirtualScrolling = () => {
    virtualScrolling.value = false
  }

  // Initialize on store creation
  initializeFromStorage()

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
    updateVisibleRange,
    enableVirtualScrolling,
    disableVirtualScrolling,

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