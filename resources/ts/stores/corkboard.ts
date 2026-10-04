import { defineStore } from 'pinia'
import { ref, computed, watch, readonly } from 'vue'
import { corkboardApi, type CorkboardCard, type CorkboardSettings, type CorkboardLayout } from '@/api/corkboard'
import { useSelectionStore } from '@/stores/selection'
import { useDragDropStore } from '@/stores/dragDrop'
import { dataSync } from '@/services/dataSync'

// Corkboard view configuration
export interface CorkboardViewConfig {
  zoom: 'small' | 'medium' | 'large'
  layout: 'grid' | 'freeform'
  displayMode: 'synopsis' | 'excerpt' | 'metadata'
  columns: number
  cardSpacing: number
  showWordCount: boolean
  showStatus: boolean
  showLabels: boolean
  autoArrange: boolean
}

// Card filter and sort options
export interface CorkboardFilters {
  status?: string[]
  labels?: string[]
  includeInCompile?: boolean
  hasContent?: boolean
  wordCountRange?: [number, number]
  searchQuery?: string
}

export interface CorkboardSort {
  field: 'order' | 'title' | 'modified' | 'created' | 'word_count'
  direction: 'asc' | 'desc'
}

// Card position for freeform layout
export interface CardPosition {
  x: number
  y: number
  z?: number
}

// Reorder operation
export interface ReorderOperation {
  cardId: string
  fromIndex: number
  toIndex: number
  position?: CardPosition
}

export const useCorkboardStore = defineStore('corkboard', () => {
  // Core state
  const manuscriptId = ref<number | null>(null)
  const corkboardId = ref<number | null>(null)
  const cards = ref<CorkboardCard[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // View configuration
  const viewConfig = ref<CorkboardViewConfig>({
    zoom: 'medium',
    layout: 'grid',
    displayMode: 'excerpt',
    columns: 4,
    cardSpacing: 16,
    showWordCount: true,
    showStatus: true,
    showLabels: true,
    autoArrange: true
  })

  // Filters and sorting
  const filters = ref<CorkboardFilters>({})
  const sort = ref<CorkboardSort>({
    field: 'order',
    direction: 'asc'
  })

  // Card positions for freeform layout
  const cardPositions = ref<Map<string, CardPosition>>(new Map())

  // Auto-save state
  const hasUnsavedChanges = ref(false)
  const lastSaved = ref<Date | null>(null)
  const autoSaveEnabled = ref(true)

  // Selection integration
  const selectionStore = useSelectionStore()
  const dragDropStore = useDragDropStore()

  // === DATA SYNC EVENT LISTENERS ===
  // Listen for item updates
  dataSync.on('item:updated', ({ itemId, changes }) => {
    // Corkboard cards use string IDs, items use number IDs
    const card = cards.value.find(c => c.id === String(itemId) || c.itemId === itemId)
    if (card) {
      if (changes.title) {
        card.title = changes.title
        console.log(`[CorkboardStore] Updated title for card ${card.id}`)
      }
    }
  })

  // Listen for item deletion
  dataSync.on('item:deleted', ({ itemId }) => {
    const index = cards.value.findIndex(c => c.id === String(itemId) || c.itemId === itemId)
    if (index !== -1) {
      const cardId = cards.value[index].id
      cards.value.splice(index, 1)

      // Remove from selection if selected
      selectionStore.removeFromSelection(cardId)

      // Remove position data
      cardPositions.value.delete(cardId)

      console.log(`[CorkboardStore] Removed card for item ${itemId}`)
    }
  })

  // Computed properties
  const filteredCards = computed(() => {
    let result = [...cards.value]

    // Apply filters
    if (filters.value.status?.length) {
      result = result.filter(card =>
        filters.value.status!.includes(card.status || 'draft')
      )
    }

    if (filters.value.labels?.length) {
      result = result.filter(card =>
        card.labels?.some(label => filters.value.labels!.includes(label))
      )
    }

    if (filters.value.includeInCompile !== undefined) {
      result = result.filter(card =>
        card.includeInCompile === filters.value.includeInCompile
      )
    }

    if (filters.value.hasContent !== undefined) {
      result = result.filter(card =>
        filters.value.hasContent ? (card.content?.length || 0) > 0 : (card.content?.length || 0) === 0
      )
    }

    if (filters.value.wordCountRange) {
      const [min, max] = filters.value.wordCountRange
      result = result.filter(card =>
        card.wordCount >= min && card.wordCount <= max
      )
    }

    if (filters.value.searchQuery) {
      const query = filters.value.searchQuery.toLowerCase()
      result = result.filter(card =>
        card.title.toLowerCase().includes(query) ||
        card.synopsis?.toLowerCase().includes(query) ||
        card.content?.toLowerCase().includes(query)
      )
    }

    // Apply sorting
    result.sort((a, b) => {
      let aValue: any
      let bValue: any

      switch (sort.value.field) {
        case 'title':
          aValue = a.title.toLowerCase()
          bValue = b.title.toLowerCase()
          break
        case 'modified':
          aValue = new Date(a.updatedAt).getTime()
          bValue = new Date(b.updatedAt).getTime()
          break
        case 'created':
          aValue = new Date(a.createdAt).getTime()
          bValue = new Date(b.createdAt).getTime()
          break
        case 'word_count':
          aValue = a.wordCount
          bValue = b.wordCount
          break
        case 'order':
        default:
          aValue = a.order
          bValue = b.order
          break
      }

      const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      return sort.value.direction === 'asc' ? comparison : -comparison
    })

    return result
  })

  const selectedCards = computed(() => {
    const selectedIds = selectionStore.selectedArray
    return cards.value.filter(card => selectedIds.includes(card.id))
  })

  const hasCards = computed(() => cards.value.length > 0)

  const cardCount = computed(() => cards.value.length)

  const filteredCardCount = computed(() => filteredCards.value.length)

  const totalWordCount = computed(() =>
    cards.value.reduce((total, card) => total + card.wordCount, 0)
  )

  const selectedWordCount = computed(() =>
    selectedCards.value.reduce((total, card) => total + card.wordCount, 0)
  )

  // Grid layout helpers
  const gridColumns = computed(() => {
    if (viewConfig.value.layout !== 'grid') return 1

    switch (viewConfig.value.zoom) {
      case 'small': return Math.max(viewConfig.value.columns + 2, 6)
      case 'large': return Math.max(viewConfig.value.columns - 1, 2)
      default: return viewConfig.value.columns
    }
  })

  const cardWidth = computed(() => {
    const spacing = viewConfig.value.cardSpacing
    const cols = gridColumns.value
    return `calc((100% - ${spacing * (cols - 1)}px) / ${cols})`
  })

  // Actions
  const loadCorkboard = async (mId: number, cId?: number) => {
    try {
      isLoading.value = true
      error.value = null

      manuscriptId.value = mId
      corkboardId.value = cId || null

      const data = await corkboardApi.getCorkboard(mId, cId)

      cards.value = data.cards
      if (data.settings) {
        viewConfig.value = { ...viewConfig.value, ...data.settings }
      }

      // Load saved positions for freeform layout
      if (viewConfig.value.layout === 'freeform' && data.cardPositions) {
        cardPositions.value = new Map(Object.entries(data.cardPositions))
      }

      // Set selection context
      selectionStore.setContext({
        containerId: 'corkboard-container',
        itemType: 'corkboard-card',
        selectableSelector: '[data-card-id]'
      })

      console.log('Corkboard loaded:', cards.value.length, 'cards')
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load corkboard'
      console.error('Failed to load corkboard:', err)
    } finally {
      isLoading.value = false
    }
  }

  const createCard = async (cardData: Partial<CorkboardCard>) => {
    if (!manuscriptId.value) return null

    try {
      const newCard = await corkboardApi.createCard(manuscriptId.value, cardData)
      cards.value.push(newCard)
      markUnsaved()
      return newCard
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create card'
      throw err
    }
  }

  const updateCard = async (cardId: string, updates: Partial<CorkboardCard>) => {
    if (!manuscriptId.value) return

    try {
      const updatedCard = await corkboardApi.updateCard(manuscriptId.value, cardId, updates)
      const index = cards.value.findIndex(card => card.id === cardId)

      if (index !== -1) {
        cards.value[index] = updatedCard
        markUnsaved()
      }

      return updatedCard
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update card'
      throw err
    }
  }

  const deleteCard = async (cardId: string) => {
    if (!manuscriptId.value) return

    try {
      await corkboardApi.deleteCard(manuscriptId.value, cardId)
      cards.value = cards.value.filter(card => card.id !== cardId)

      // Remove from selection if selected
      selectionStore.removeFromSelection(cardId)

      // Remove position data
      cardPositions.value.delete(cardId)

      markUnsaved()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete card'
      throw err
    }
  }

  const reorderCards = async (operations: ReorderOperation[]) => {
    if (!manuscriptId.value || operations.length === 0) return

    try {
      // Optimistically update local state
      const oldCards = [...cards.value]

      operations.forEach(op => {
        const card = cards.value.find(c => c.id === op.cardId)
        if (card) {
          card.order = op.toIndex

          if (op.position && viewConfig.value.layout === 'freeform') {
            cardPositions.value.set(op.cardId, op.position)
          }
        }
      })

      // Sort cards by new order
      cards.value.sort((a, b) => a.order - b.order)

      try {
        await corkboardApi.reorderCards(manuscriptId.value, operations)
        markUnsaved()
      } catch (err) {
        // Revert on error
        cards.value = oldCards
        throw err
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to reorder cards'
      throw err
    }
  }

  const bulkUpdateCards = async (cardIds: string[], updates: Partial<CorkboardCard>) => {
    if (!manuscriptId.value || cardIds.length === 0) return

    try {
      await corkboardApi.bulkUpdate(manuscriptId.value, cardIds, updates)

      // Update local state
      cardIds.forEach(cardId => {
        const card = cards.value.find(c => c.id === cardId)
        if (card) {
          Object.assign(card, updates)
        }
      })

      markUnsaved()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to bulk update cards'
      throw err
    }
  }

  // View configuration
  const setZoom = (zoom: CorkboardViewConfig['zoom']) => {
    viewConfig.value.zoom = zoom
    saveViewConfig()
  }

  const setLayout = (layout: CorkboardViewConfig['layout']) => {
    viewConfig.value.layout = layout

    if (layout === 'grid' && viewConfig.value.autoArrange) {
      autoArrangeCards()
    }

    saveViewConfig()
  }

  const setDisplayMode = (mode: CorkboardViewConfig['displayMode']) => {
    viewConfig.value.displayMode = mode
    saveViewConfig()
  }

  const setColumns = (columns: number) => {
    viewConfig.value.columns = Math.max(1, Math.min(columns, 8))
    saveViewConfig()
  }

  // Filtering and sorting
  const setFilters = (newFilters: Partial<CorkboardFilters>) => {
    filters.value = { ...filters.value, ...newFilters }
  }

  const clearFilters = () => {
    filters.value = {}
  }

  const setSort = (newSort: Partial<CorkboardSort>) => {
    sort.value = { ...sort.value, ...newSort }
  }

  // Card positioning (freeform layout)
  const setCardPosition = (cardId: string, position: CardPosition) => {
    cardPositions.value.set(cardId, position)
    markUnsaved()
  }

  const getCardPosition = (cardId: string): CardPosition | null => {
    return cardPositions.value.get(cardId) || null
  }

  const autoArrangeCards = () => {
    if (viewConfig.value.layout !== 'grid') return

    const spacing = viewConfig.value.cardSpacing
    const cols = gridColumns.value

    cards.value.forEach((card, index) => {
      const row = Math.floor(index / cols)
      const col = index % cols

      const position: CardPosition = {
        x: col * (200 + spacing),
        y: row * (150 + spacing)
      }

      cardPositions.value.set(card.id, position)
    })

    markUnsaved()
  }

  // Save operations
  const saveViewConfig = async () => {
    if (!manuscriptId.value || !corkboardId.value) return

    try {
      await corkboardApi.saveSettings(manuscriptId.value, corkboardId.value, viewConfig.value)
    } catch (err) {
      console.error('Failed to save view config:', err)
    }
  }

  const savePositions = async () => {
    if (!manuscriptId.value || !corkboardId.value) return
    if (viewConfig.value.layout !== 'freeform') return

    try {
      const positions = Object.fromEntries(cardPositions.value)
      await corkboardApi.savePositions(manuscriptId.value, corkboardId.value, positions)
      lastSaved.value = new Date()
      hasUnsavedChanges.value = false
    } catch (err) {
      console.error('Failed to save positions:', err)
    }
  }

  const markUnsaved = () => {
    hasUnsavedChanges.value = true
  }

  // Auto-save setup
  let autoSaveTimeout: number | null = null

  const triggerAutoSave = () => {
    if (!autoSaveEnabled.value || !hasUnsavedChanges.value) return

    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout)
    }

    autoSaveTimeout = window.setTimeout(() => {
      savePositions()
    }, 2000) // Save after 2 seconds of inactivity
  }

  // Watch for changes to trigger auto-save
  watch(
    () => cardPositions.value,
    () => {
      if (hasUnsavedChanges.value) {
        triggerAutoSave()
      }
    },
    { deep: true }
  )

  // Selection helpers
  const selectCard = (cardId: string, additive = false) => {
    if (additive) {
      selectionStore.toggleItem(cardId)
    } else {
      selectionStore.selectItem(cardId)
    }
  }

  const selectCards = (cardIds: string[]) => {
    selectionStore.replaceSelection(cardIds)
  }

  const clearSelection = () => {
    selectionStore.clearSelection()
  }

  // Drag and drop integration
  const handleCardDrop = (draggedCardIds: string[], targetIndex: number, targetPosition?: CardPosition) => {
    const operations: ReorderOperation[] = []

    draggedCardIds.forEach((cardId, offset) => {
      const card = cards.value.find(c => c.id === cardId)
      if (!card) return

      const fromIndex = card.order
      const toIndex = targetIndex + offset

      operations.push({
        cardId,
        fromIndex,
        toIndex,
        position: targetPosition ? {
          x: targetPosition.x + (offset * 20),
          y: targetPosition.y + (offset * 20)
        } : undefined
      })
    })

    return reorderCards(operations)
  }

  // Utilities
  const getCardById = (cardId: string): CorkboardCard | undefined => {
    return cards.value.find(card => card.id === cardId)
  }

  const getCardIndex = (cardId: string): number => {
    return cards.value.findIndex(card => card.id === cardId)
  }

  const reset = () => {
    manuscriptId.value = null
    corkboardId.value = null
    cards.value = []
    cardPositions.value.clear()
    filters.value = {}
    hasUnsavedChanges.value = false
    lastSaved.value = null
    error.value = null

    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout)
      autoSaveTimeout = null
    }
  }

  return {
    // State
    manuscriptId: readonly(manuscriptId),
    corkboardId: readonly(corkboardId),
    cards: readonly(cards),
    isLoading: readonly(isLoading),
    error: readonly(error),
    viewConfig,
    filters,
    sort,
    cardPositions: readonly(cardPositions),
    hasUnsavedChanges: readonly(hasUnsavedChanges),
    lastSaved: readonly(lastSaved),
    autoSaveEnabled,

    // Computed
    filteredCards,
    selectedCards,
    hasCards,
    cardCount,
    filteredCardCount,
    totalWordCount,
    selectedWordCount,
    gridColumns,
    cardWidth,

    // Actions
    loadCorkboard,
    createCard,
    updateCard,
    deleteCard,
    reorderCards,
    bulkUpdateCards,

    // View configuration
    setZoom,
    setLayout,
    setDisplayMode,
    setColumns,

    // Filtering and sorting
    setFilters,
    clearFilters,
    setSort,

    // Positioning
    setCardPosition,
    getCardPosition,
    autoArrangeCards,

    // Selection
    selectCard,
    selectCards,
    clearSelection,

    // Drag and drop
    handleCardDrop,

    // Utilities
    getCardById,
    getCardIndex,
    reset,

    // Save operations
    saveViewConfig,
    savePositions,
    triggerAutoSave
  }
})