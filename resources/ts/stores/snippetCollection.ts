import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  snippetsApi,
  type SnippetCollection,
  type SnippetReference,
  type AddSnippetPayload,
  type CreateCollectionPayload,
} from '@/api/snippets'
import { dataSync } from '@/services/dataSync'

export interface SnippetCollectionState {
  collections: SnippetCollection[]
  currentCollection: SnippetCollection | null
  snippets: SnippetReference[]
  isLoading: boolean
  error: string | null
  stats: {
    total: number
    active: number
    ghost: number
  }
}

export const useSnippetCollectionStore = defineStore('snippetCollection', () => {
  // State
  const state = ref<SnippetCollectionState>({
    collections: [],
    currentCollection: null,
    snippets: [],
    isLoading: false,
    error: null,
    stats: { total: 0, active: 0, ghost: 0 },
  })

  // Computed
  const hasGhosts = computed(() => state.value.stats.ghost > 0)
  const activeSnippets = computed(() =>
    state.value.snippets.filter(s => s.status === 'active')
  )
  const ghostSnippets = computed(() =>
    state.value.snippets.filter(s => s.status === 'ghost')
  )

  // === DATA SYNC EVENT LISTENERS ===
  // Listen for item deletions to mark related snippets as ghosts
  dataSync.on('item:deleted', ({ itemId }) => {
    state.value.snippets.forEach(snippet => {
      if (snippet.source_item_id === itemId && snippet.status !== 'ghost') {
        snippet.status = 'ghost'
        snippet.became_ghost_at = new Date().toISOString()
        state.value.stats.active--
        state.value.stats.ghost++
      }
    })
  })

  // Listen for item updates to refresh snippet text
  dataSync.on('item:updated', ({ itemId }) => {
    const affectedSnippets = state.value.snippets.filter(
      s => s.source_item_id === itemId && s.status === 'active'
    )
    if (affectedSnippets.length > 0 && state.value.currentCollection) {
      // Refresh the collection to get updated text
      loadCollection(state.value.currentCollection.id)
    }
  })

  // Actions
  const loadCollections = async (manuscriptId: number) => {
    try {
      state.value.isLoading = true
      state.value.error = null
      state.value.collections = await snippetsApi.getCollections(manuscriptId)
    } catch (error) {
      console.error('Failed to load snippet collections:', error)
      state.value.error = error instanceof Error ? error.message : 'Failed to load collections'
    } finally {
      state.value.isLoading = false
    }
  }

  const loadCollection = async (collectionId: number) => {
    try {
      state.value.isLoading = true
      state.value.error = null

      const data = await snippetsApi.getCollection(collectionId)

      state.value.currentCollection = data.collection
      state.value.snippets = data.snippets
      state.value.stats = data.stats

      console.log(`Loaded collection "${data.collection.title}" with ${data.stats.total} snippets`)
    } catch (error) {
      console.error('Failed to load snippet collection:', error)
      state.value.error = error instanceof Error ? error.message : 'Failed to load collection'
    } finally {
      state.value.isLoading = false
    }
  }

  const createCollection = async (
    manuscriptId: number,
    payload: CreateCollectionPayload
  ): Promise<SnippetCollection | null> => {
    try {
      state.value.isLoading = true
      state.value.error = null

      const collection = await snippetsApi.createCollection(manuscriptId, payload)
      state.value.collections.push(collection)

      console.log(`Created snippet collection: "${collection.title}"`)

      // Emit dataSync event so manuscript store refreshes the tree
      dataSync.emit('item:created', {
        itemId: collection.id,
        manuscriptId,
        item: collection
      })

      return collection
    } catch (error) {
      console.error('Failed to create snippet collection:', error)
      state.value.error = error instanceof Error ? error.message : 'Failed to create collection'
      return null
    } finally {
      state.value.isLoading = false
    }
  }

  const addSnippet = async (
    collectionId: number,
    payload: AddSnippetPayload
  ): Promise<SnippetReference | null> => {
    try {
      state.value.error = null

      const snippet = await snippetsApi.addSnippet(collectionId, payload)

      // Add to local state if this is the current collection
      if (state.value.currentCollection?.id === collectionId) {
        state.value.snippets.push(snippet)
        state.value.stats.total++
        state.value.stats.active++
      }

      // Update collection count in list
      const collection = state.value.collections.find(c => c.id === collectionId)
      if (collection) {
        collection.snippet_count++
      }

      console.log(`Added snippet to collection ${collectionId}`)
      return snippet
    } catch (error) {
      console.error('Failed to add snippet:', error)
      state.value.error = error instanceof Error ? error.message : 'Failed to add snippet'
      return null
    }
  }

  const renameSnippet = async (snippetId: number, newText: string) => {
    try {
      state.value.error = null

      const updatedSnippet = await snippetsApi.renameSnippet(snippetId, newText)

      // Update local state
      const snippet = state.value.snippets.find(s => s.id === snippetId)
      if (snippet) {
        snippet.reference_text = updatedSnippet.reference_text
        snippet.last_verified_at = updatedSnippet.last_verified_at
      }

      console.log(`Renamed snippet ${snippetId}`)
      return updatedSnippet
    } catch (error) {
      console.error('Failed to rename snippet:', error)
      state.value.error = error instanceof Error ? error.message : 'Failed to rename snippet'
      return null
    }
  }

  const deleteSnippet = async (snippetId: number) => {
    try {
      state.value.error = null

      const snippet = state.value.snippets.find(s => s.id === snippetId)
      await snippetsApi.deleteSnippet(snippetId)

      // Remove from local state
      const index = state.value.snippets.findIndex(s => s.id === snippetId)
      if (index !== -1) {
        state.value.snippets.splice(index, 1)
        state.value.stats.total--
        if (snippet?.status === 'ghost') {
          state.value.stats.ghost--
        } else {
          state.value.stats.active--
        }
      }

      // Update collection count in list
      if (state.value.currentCollection) {
        const collection = state.value.collections.find(
          c => c.id === state.value.currentCollection?.id
        )
        if (collection) {
          collection.snippet_count--
          if (snippet?.status === 'ghost') {
            collection.ghost_count--
          }
        }
      }

      console.log(`Deleted snippet ${snippetId}`)
    } catch (error) {
      console.error('Failed to delete snippet:', error)
      state.value.error = error instanceof Error ? error.message : 'Failed to delete snippet'
    }
  }

  const verifySnippet = async (snippetId: number) => {
    try {
      state.value.error = null

      const result = await snippetsApi.verifySnippet(snippetId)

      // Update local state
      const snippet = state.value.snippets.find(s => s.id === snippetId)
      if (snippet) {
        const wasGhost = snippet.status === 'ghost'
        snippet.status = result.status
        snippet.reference_text = result.reference_text
        snippet.current_text = result.current_text
        snippet.last_verified_at = result.last_verified_at

        // Update stats if status changed
        if (wasGhost && result.status === 'active') {
          state.value.stats.ghost--
          state.value.stats.active++
        } else if (!wasGhost && result.status === 'ghost') {
          state.value.stats.active--
          state.value.stats.ghost++
        }
      }

      console.log(`Verified snippet ${snippetId}: ${result.status}`)
      return result
    } catch (error) {
      console.error('Failed to verify snippet:', error)
      state.value.error = error instanceof Error ? error.message : 'Failed to verify snippet'
      return null
    }
  }

  const verifyAll = async () => {
    if (!state.value.currentCollection) return null

    try {
      state.value.isLoading = true
      state.value.error = null

      const result = await snippetsApi.verifyAll(state.value.currentCollection.id)

      // Reload to get updated snippet data
      await loadCollection(state.value.currentCollection.id)

      console.log(`Verified all snippets: ${result.active} active, ${result.ghost} ghost`)
      return result
    } catch (error) {
      console.error('Failed to verify all snippets:', error)
      state.value.error = error instanceof Error ? error.message : 'Failed to verify snippets'
      return null
    } finally {
      state.value.isLoading = false
    }
  }

  const clearGhosts = async () => {
    if (!state.value.currentCollection) return 0

    try {
      state.value.error = null

      const { cleared } = await snippetsApi.clearGhosts(state.value.currentCollection.id)

      // Remove ghosts from local state
      state.value.snippets = state.value.snippets.filter(s => s.status !== 'ghost')
      state.value.stats.total -= cleared
      state.value.stats.ghost = 0

      // Update collection count
      const collection = state.value.collections.find(
        c => c.id === state.value.currentCollection?.id
      )
      if (collection) {
        collection.snippet_count -= cleared
        collection.ghost_count = 0
      }

      console.log(`Cleared ${cleared} ghost snippets`)
      return cleared
    } catch (error) {
      console.error('Failed to clear ghosts:', error)
      state.value.error = error instanceof Error ? error.message : 'Failed to clear ghosts'
      return 0
    }
  }

  const duplicateCollection = async (
    manuscriptId: number,
    collectionId: number
  ): Promise<SnippetCollection | null> => {
    try {
      state.value.isLoading = true
      state.value.error = null

      const collection = await snippetsApi.duplicateCollection(manuscriptId, collectionId)
      state.value.collections.push(collection)

      console.log(`Duplicated snippet collection: "${collection.title}"`)

      // Emit dataSync event so manuscript store refreshes the tree
      dataSync.emit('item:created', {
        itemId: collection.id,
        manuscriptId,
        item: collection,
      })

      return collection
    } catch (error) {
      console.error('Failed to duplicate snippet collection:', error)
      state.value.error = error instanceof Error ? error.message : 'Failed to duplicate collection'
      return null
    } finally {
      state.value.isLoading = false
    }
  }

  const reorderSnippets = async (snippetIds: number[]) => {
    if (!state.value.currentCollection) return

    try {
      state.value.error = null

      await snippetsApi.reorderSnippets(state.value.currentCollection.id, snippetIds)

      // Update local order
      state.value.snippets = snippetIds
        .map((id, index) => {
          const snippet = state.value.snippets.find(s => s.id === id)
          if (snippet) {
            snippet.order_index = index
          }
          return snippet
        })
        .filter((s): s is SnippetReference => s !== undefined)

      console.log('Snippets reordered')
    } catch (error) {
      console.error('Failed to reorder snippets:', error)
      state.value.error = error instanceof Error ? error.message : 'Failed to reorder snippets'
    }
  }

  const resetState = () => {
    state.value.currentCollection = null
    state.value.snippets = []
    state.value.stats = { total: 0, active: 0, ghost: 0 }
    state.value.error = null
    state.value.isLoading = false
  }

  return {
    // State
    state: computed(() => state.value),
    collections: computed(() => state.value.collections),
    currentCollection: computed(() => state.value.currentCollection),
    snippets: computed(() => state.value.snippets),
    stats: computed(() => state.value.stats),
    isLoading: computed(() => state.value.isLoading),
    error: computed(() => state.value.error),

    // Computed
    hasGhosts,
    activeSnippets,
    ghostSnippets,

    // Actions
    loadCollections,
    loadCollection,
    createCollection,
    duplicateCollection,
    addSnippet,
    renameSnippet,
    deleteSnippet,
    verifySnippet,
    verifyAll,
    clearGhosts,
    reorderSnippets,
    resetState,
  }
})
