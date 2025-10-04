import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface OutlineColumn {
  id: string
  label: string
  field: string
  width: number
  sortable: boolean
  editable: boolean
  visible: boolean
  type: 'text' | 'number' | 'date' | 'status' | 'boolean'
}

export interface OutlineSortConfig {
  column: string
  direction: 'asc' | 'desc'
}

export interface OutlineFilterConfig {
  column: string
  operator: 'contains' | 'equals' | 'greater' | 'less' | 'between'
  value: any
}

/**
 * Outline View Store
 *
 * Manages state specific to the outline view mode (spreadsheet-like table).
 * Works in conjunction with folderView store for data management.
 */
export const useOutlineStore = defineStore('outline', () => {
  // Available columns that can be shown in outline
  const availableColumns = ref<OutlineColumn[]>([
    {
      id: 'title',
      label: 'Title',
      field: 'title',
      width: 300,
      sortable: true,
      editable: true,
      visible: true,
      type: 'text'
    },
    {
      id: 'type',
      label: 'Type',
      field: 'type',
      width: 120,
      sortable: true,
      editable: false,
      visible: true,
      type: 'text'
    },
    {
      id: 'synopsis',
      label: 'Synopsis',
      field: 'synopsis',
      width: 400,
      sortable: false,
      editable: true,
      visible: true,
      type: 'text'
    },
    {
      id: 'word_count',
      label: 'Words',
      field: 'word_count',
      width: 100,
      sortable: true,
      editable: false,
      visible: true,
      type: 'number'
    },
    {
      id: 'status',
      label: 'Status',
      field: 'metadata.status',
      width: 120,
      sortable: true,
      editable: true,
      visible: true,
      type: 'status'
    },
    {
      id: 'label',
      label: 'Label',
      field: 'metadata.label',
      width: 120,
      sortable: true,
      editable: true,
      visible: false,
      type: 'text'
    },
    {
      id: 'include_in_compile',
      label: 'Compile',
      field: 'include_in_compile',
      width: 80,
      sortable: true,
      editable: true,
      visible: true,
      type: 'boolean'
    },
    {
      id: 'updated_at',
      label: 'Modified',
      field: 'updated_at',
      width: 150,
      sortable: true,
      editable: false,
      visible: true,
      type: 'date'
    },
    {
      id: 'created_at',
      label: 'Created',
      field: 'created_at',
      width: 150,
      sortable: true,
      editable: false,
      visible: false,
      type: 'date'
    },
    {
      id: 'item_order',
      label: 'Order',
      field: 'item_order',
      width: 80,
      sortable: true,
      editable: false,
      visible: false,
      type: 'number'
    }
  ])

  // Current column configuration
  const visibleColumns = ref<string[]>([
    'title',
    'type',
    'synopsis',
    'word_count',
    'status',
    'include_in_compile',
    'updated_at'
  ])

  // Column widths (persisted)
  const columnWidths = ref<Record<string, number>>({})

  // Sorting configuration
  const sortConfig = ref<OutlineSortConfig>({
    column: 'item_order',
    direction: 'asc'
  })

  // Filtering configuration
  const filters = ref<OutlineFilterConfig[]>([])

  // Search query
  const searchQuery = ref('')

  // Inline editing state
  const editingCell = ref<{
    itemId: number
    columnId: string
  } | null>(null)

  // UI state
  const showColumnPicker = ref(false)

  // Getters

  const visibleColumnConfigs = computed(() => {
    return visibleColumns.value
      .map(id => availableColumns.value.find(col => col.id === id))
      .filter(col => col !== undefined) as OutlineColumn[]
  })

  const hiddenColumns = computed(() => {
    return availableColumns.value.filter(
      col => !visibleColumns.value.includes(col.id)
    )
  })

  const hasActiveFilters = computed(() => {
    return filters.value.length > 0 || searchQuery.value.length > 0
  })

  const isEditing = computed(() => editingCell.value !== null)

  // Actions

  /**
   * Set visible columns
   */
  function setVisibleColumns(columnIds: string[]) {
    visibleColumns.value = columnIds
  }

  /**
   * Toggle column visibility
   */
  function toggleColumn(columnId: string) {
    const index = visibleColumns.value.indexOf(columnId)

    if (index > -1) {
      // Remove column
      visibleColumns.value.splice(index, 1)
    } else {
      // Add column (append to end)
      visibleColumns.value.push(columnId)
    }
  }

  /**
   * Reorder columns
   */
  function reorderColumns(from: number, to: number) {
    const column = visibleColumns.value.splice(from, 1)[0]
    visibleColumns.value.splice(to, 0, column)
  }

  /**
   * Set column width
   */
  function setColumnWidth(columnId: string, width: number) {
    columnWidths.value[columnId] = width

    // Update in available columns
    const column = availableColumns.value.find(col => col.id === columnId)
    if (column) {
      column.width = width
    }
  }

  /**
   * Reset column widths to defaults
   */
  function resetColumnWidths() {
    columnWidths.value = {}
    availableColumns.value.forEach(col => {
      // Reset to default width (from initial config)
      if (col.id === 'title') col.width = 300
      else if (col.id === 'synopsis') col.width = 400
      else if (col.id === 'word_count') col.width = 100
      else col.width = 120
    })
  }

  /**
   * Set sort configuration
   */
  function setSort(column: string, direction: 'asc' | 'desc') {
    sortConfig.value = { column, direction }
  }

  /**
   * Toggle sort direction for column
   */
  function toggleSort(column: string) {
    if (sortConfig.value.column === column) {
      // Toggle direction
      sortConfig.value.direction =
        sortConfig.value.direction === 'asc' ? 'desc' : 'asc'
    } else {
      // New column, default to ascending
      sortConfig.value = { column, direction: 'asc' }
    }
  }

  /**
   * Clear sorting
   */
  function clearSort() {
    sortConfig.value = { column: 'item_order', direction: 'asc' }
  }

  /**
   * Add filter
   */
  function addFilter(filter: OutlineFilterConfig) {
    filters.value.push(filter)
  }

  /**
   * Remove filter
   */
  function removeFilter(index: number) {
    filters.value.splice(index, 1)
  }

  /**
   * Clear all filters
   */
  function clearFilters() {
    filters.value = []
    searchQuery.value = ''
  }

  /**
   * Set search query
   */
  function setSearchQuery(query: string) {
    searchQuery.value = query
  }

  /**
   * Start editing a cell
   */
  function startEditing(itemId: number, columnId: string) {
    const column = availableColumns.value.find(col => col.id === columnId)

    if (column && column.editable) {
      editingCell.value = { itemId, columnId }
    }
  }

  /**
   * Stop editing
   */
  function stopEditing() {
    editingCell.value = null
  }

  /**
   * Check if a cell is being edited
   */
  function isCellEditing(itemId: number, columnId: string): boolean {
    return (
      editingCell.value?.itemId === itemId &&
      editingCell.value?.columnId === columnId
    )
  }

  /**
   * Show/hide column picker
   */
  function toggleColumnPicker() {
    showColumnPicker.value = !showColumnPicker.value
  }

  /**
   * Load outline configuration from preferences
   */
  function loadConfiguration(config: {
    visible_columns?: string[]
    column_widths?: Record<string, number>
    sort_column?: string
    sort_direction?: 'asc' | 'desc'
  }) {
    if (config.visible_columns) {
      visibleColumns.value = config.visible_columns
    }

    if (config.column_widths) {
      columnWidths.value = config.column_widths
      // Apply to available columns
      Object.entries(config.column_widths).forEach(([id, width]) => {
        const column = availableColumns.value.find(col => col.id === id)
        if (column) {
          column.width = width
        }
      })
    }

    if (config.sort_column && config.sort_direction) {
      sortConfig.value = {
        column: config.sort_column,
        direction: config.sort_direction
      }
    }
  }

  /**
   * Get current configuration for saving
   */
  function getConfiguration() {
    return {
      visible_columns: visibleColumns.value,
      column_widths: columnWidths.value,
      sort_column: sortConfig.value.column,
      sort_direction: sortConfig.value.direction
    }
  }

  /**
   * Reset to default configuration
   */
  function resetToDefaults() {
    visibleColumns.value = [
      'title',
      'type',
      'synopsis',
      'word_count',
      'status',
      'include_in_compile',
      'updated_at'
    ]
    resetColumnWidths()
    clearSort()
    clearFilters()
  }

  /**
   * Apply filtering to items
   */
  function filterItems<T extends Record<string, any>>(items: T[]): T[] {
    let filtered = [...items]

    // Apply search query
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      filtered = filtered.filter(item =>
        item.title?.toLowerCase().includes(query) ||
        item.synopsis?.toLowerCase().includes(query)
      )
    }

    // Apply column filters
    filters.value.forEach(filter => {
      filtered = filtered.filter(item => {
        const value = getNestedValue(item, filter.column)

        switch (filter.operator) {
          case 'contains':
            return String(value).toLowerCase().includes(String(filter.value).toLowerCase())
          case 'equals':
            return value === filter.value
          case 'greater':
            return value > filter.value
          case 'less':
            return value < filter.value
          case 'between':
            return value >= filter.value[0] && value <= filter.value[1]
          default:
            return true
        }
      })
    })

    return filtered
  }

  /**
   * Apply sorting to items
   */
  function sortItems<T extends Record<string, any>>(items: T[]): T[] {
    const sorted = [...items]
    const { column, direction } = sortConfig.value

    sorted.sort((a, b) => {
      const aValue = getNestedValue(a, column)
      const bValue = getNestedValue(b, column)

      let comparison = 0

      if (aValue < bValue) comparison = -1
      else if (aValue > bValue) comparison = 1

      return direction === 'asc' ? comparison : -comparison
    })

    return sorted
  }

  /**
   * Helper to get nested object value by path (e.g., 'metadata.status')
   */
  function getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj)
  }

  /**
   * Reset store state
   */
  function $reset() {
    resetToDefaults()
    editingCell.value = null
    showColumnPicker.value = false
  }

  return {
    // State
    availableColumns,
    visibleColumns,
    columnWidths,
    sortConfig,
    filters,
    searchQuery,
    editingCell,
    showColumnPicker,

    // Getters
    visibleColumnConfigs,
    hiddenColumns,
    hasActiveFilters,
    isEditing,

    // Actions
    setVisibleColumns,
    toggleColumn,
    reorderColumns,
    setColumnWidth,
    resetColumnWidths,
    setSort,
    toggleSort,
    clearSort,
    addFilter,
    removeFilter,
    clearFilters,
    setSearchQuery,
    startEditing,
    stopEditing,
    isCellEditing,
    toggleColumnPicker,
    loadConfiguration,
    getConfiguration,
    resetToDefaults,
    filterItems,
    sortItems,
    getNestedValue,
    $reset
  }
})
