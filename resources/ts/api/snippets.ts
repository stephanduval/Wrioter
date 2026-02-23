import { $api } from '@/utils/api'

export interface SnippetCollection {
  id: number
  title: string
  parent_id: number | null
  snippet_count: number
  ghost_count: number
  created_at: string
  updated_at: string
}

export interface SnippetReference {
  id: number
  source_item_id: number | null
  source_item_title: string | null
  reference_text: string
  current_text: string | null
  status: 'active' | 'ghost'
  order_index: number
  position_data: {
    from: number
    to: number
  }
  last_verified_at: string | null
  became_ghost_at: string | null
  metadata: Record<string, any> | null
}

export interface CollectionWithSnippets {
  collection: SnippetCollection
  snippets: SnippetReference[]
  stats: {
    total: number
    active: number
    ghost: number
  }
}

export interface CreateCollectionPayload {
  title: string
  parent_id?: number | null
}

export interface AddSnippetPayload {
  source_item_id: number
  selected_text: string
  position_data: {
    from: number
    to: number
  }
  anchor_text_before?: string
  anchor_text_after?: string
  metadata?: Record<string, any>
}

export interface UpdateSnippetPayload {
  order_index?: number
  metadata?: Record<string, any>
}

export interface VerifyResult {
  status: 'active' | 'ghost'
  reference_text: string
  current_text: string | null
  last_verified_at: string | null
  verification_result: {
    status: string
    text?: string
    changed?: boolean
    message?: string
  }
}

export interface VerifyAllResult {
  total: number
  active: number
  ghost: number
  changed: number
}

export const snippetsApi = {
  // =====================
  // Collection Operations
  // =====================

  /**
   * List all snippet collections for a manuscript
   */
  async getCollections(manuscriptId: number): Promise<SnippetCollection[]> {
    const response = await $api(`/manuscripts/${manuscriptId}/snippet-collections`)
    return response.data
  },

  /**
   * Create a new snippet collection
   */
  async createCollection(
    manuscriptId: number,
    payload: CreateCollectionPayload
  ): Promise<SnippetCollection> {
    const response = await $api(`/manuscripts/${manuscriptId}/snippet-collections`, {
      method: 'POST',
      body: payload,
    })
    return response.data
  },

  /**
   * Get a collection with all its snippets
   */
  async getCollection(collectionId: number): Promise<CollectionWithSnippets> {
    const response = await $api(`/snippet-collections/${collectionId}`)
    return response.data
  },

  /**
   * Update a collection
   */
  async updateCollection(
    collectionId: number,
    payload: Partial<CreateCollectionPayload>
  ): Promise<SnippetCollection> {
    const response = await $api(`/snippet-collections/${collectionId}`, {
      method: 'PUT',
      body: payload,
    })
    return response.data
  },

  /**
   * Delete a collection
   */
  async deleteCollection(collectionId: number): Promise<void> {
    await $api(`/snippet-collections/${collectionId}`, {
      method: 'DELETE',
    })
  },

  /**
   * Verify all snippets in a collection
   */
  async verifyAll(collectionId: number): Promise<VerifyAllResult> {
    const response = await $api(`/snippet-collections/${collectionId}/verify-all`, {
      method: 'POST',
    })
    return response.data
  },

  /**
   * Clear all ghost snippets from a collection
   */
  async clearGhosts(collectionId: number): Promise<{ cleared: number }> {
    const response = await $api(`/snippet-collections/${collectionId}/clear-ghosts`, {
      method: 'POST',
    })
    return response.data
  },

  // ====================
  // Snippet Operations
  // ====================

  /**
   * List all snippets in a collection
   */
  async getSnippets(collectionId: number): Promise<SnippetReference[]> {
    const response = await $api(`/snippet-collections/${collectionId}/snippets`)
    return response.data
  },

  /**
   * Add a snippet to a collection
   */
  async addSnippet(
    collectionId: number,
    payload: AddSnippetPayload
  ): Promise<SnippetReference> {
    const response = await $api(`/snippet-collections/${collectionId}/snippets`, {
      method: 'POST',
      body: payload,
    })
    return response.data
  },

  /**
   * Update a snippet
   */
  async updateSnippet(
    snippetId: number,
    payload: UpdateSnippetPayload
  ): Promise<SnippetReference> {
    const response = await $api(`/snippets/${snippetId}`, {
      method: 'PUT',
      body: payload,
    })
    return response.data
  },

  /**
   * Delete a snippet
   */
  async deleteSnippet(snippetId: number): Promise<void> {
    await $api(`/snippets/${snippetId}`, {
      method: 'DELETE',
    })
  },

  /**
   * Verify a single snippet
   */
  async verifySnippet(snippetId: number): Promise<VerifyResult> {
    const response = await $api(`/snippets/${snippetId}/verify`, {
      method: 'POST',
    })
    return response.data
  },

  /**
   * Reorder snippets in a collection
   */
  async reorderSnippets(
    collectionId: number,
    snippetIds: number[]
  ): Promise<void> {
    await $api(`/snippet-collections/${collectionId}/snippets/reorder`, {
      method: 'POST',
      body: { snippet_ids: snippetIds },
    })
  },
}
