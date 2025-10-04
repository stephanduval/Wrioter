import { $api } from '@/utils/api'

export interface Item {
  id: number
  title: string
  content: string
  content_markdown?: string
  content_format: 'markdown' | 'html'
  word_count: number
  character_count: number
  synopsis?: string
  metadata?: any
  manuscript_id: number
  updated_at: string
  created_at: string
}

export interface ItemVersion {
  id: number
  name?: string
  change_description?: string
  created_at: string
}

export interface ItemUpdatePayload {
  title?: string
  content?: string
  content_markdown?: string
  content_format?: 'markdown' | 'html'
  synopsis?: string
  metadata?: any
}

export interface ItemCreatePayload {
  title: string
  content?: string
  content_markdown?: string
  content_format?: 'markdown' | 'html'
  synopsis?: string
  type?: string
  parent_id?: number
  metadata?: any
}

export const itemsApi = {
  /**
   * Create a new item in a manuscript
   */
  async createItem(manuscriptId: number, payload: ItemCreatePayload): Promise<Item> {
    const response = await $api(`/manuscripts/${manuscriptId}/items`, {
      method: 'POST',
      body: payload
    })
    return response.data
  },

  /**
   * Get a specific item from a manuscript
   */
  async getItem(manuscriptId: number, itemId: number): Promise<Item> {
    const response = await $api(`/manuscripts/${manuscriptId}/items/${itemId}`)
    return response.data
  },

  /**
   * Update an item in a manuscript
   */
  async updateItem(
    manuscriptId: number,
    itemId: number,
    payload: ItemUpdatePayload
  ): Promise<Item> {
    const response = await $api(`/manuscripts/${manuscriptId}/items/${itemId}`, {
      method: 'PUT',
      body: payload
    })
    return response.data
  },

  /**
   * Get version history for an item
   */
  async getItemVersions(manuscriptId: number, itemId: number): Promise<ItemVersion[]> {
    const response = await $api(`/manuscripts/${manuscriptId}/items/${itemId}/versions`)
    return response.data
  },

  /**
   * Debounced update function for auto-save
   */
  createDebouncedUpdate(delay = 1000) {
    let timeoutId: NodeJS.Timeout | null = null

    return (
      manuscriptId: number,
      itemId: number,
      payload: ItemUpdatePayload
    ): Promise<Item> => {
      return new Promise((resolve, reject) => {
        if (timeoutId) {
          clearTimeout(timeoutId)
        }

        timeoutId = setTimeout(async () => {
          try {
            const result = await itemsApi.updateItem(manuscriptId, itemId, payload)
            resolve(result)
          } catch (error) {
            reject(error)
          }
        }, delay)
      })
    }
  }
}