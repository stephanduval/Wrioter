import { $api } from '@/utils/api'
import type { CorkboardViewConfig } from '@/stores/corkboard'

// Types
export interface CorkboardCard {
  id: string
  itemId: number
  title: string
  synopsis?: string
  content?: string
  status: 'todo' | 'draft' | 'review' | 'done'
  labels?: string[]
  wordCount: number
  characterCount: number
  order: number
  includeInCompile: boolean
  createdAt: string
  updatedAt: string
  metadata?: {
    color?: string
    position?: {
      x: number
      y: number
      z?: number
    }
    customSize?: {
      width: number
      height: number
    }
    notes?: string
    tags?: string[]
  }
}

export interface CorkboardSettings extends CorkboardViewConfig {
  // Additional corkboard-specific settings
}

export interface CorkboardData {
  corkboard: {
    id: number
    title: string
    manuscript_id: number
  }
  cards: CorkboardCard[]
  settings?: CorkboardSettings
  cardPositions?: Record<string, { x: number; y: number; z?: number }>
}

export interface CorkboardLayout {
  type: 'grid' | 'freeform'
  columns?: number
  spacing?: number
  positions?: Record<string, { x: number; y: number; z?: number }>
}

export interface ReorderOperation {
  cardId: string
  fromIndex: number
  toIndex: number
  position?: {
    x: number
    y: number
    z?: number
  }
}

export interface CorkboardCreatePayload {
  title: string
  manuscript_id: number
  settings?: Partial<CorkboardSettings>
}

export interface CardCreatePayload {
  title: string
  synopsis?: string
  content?: string
  item_id?: number
  status?: CorkboardCard['status']
  labels?: string[]
  metadata?: CorkboardCard['metadata']
}

export interface CardUpdatePayload {
  title?: string
  synopsis?: string
  content?: string
  status?: CorkboardCard['status']
  labels?: string[]
  order?: number
  include_in_compile?: boolean
  metadata?: CorkboardCard['metadata']
}

export interface BulkUpdatePayload {
  status?: CorkboardCard['status']
  labels?: string[]
  include_in_compile?: boolean
  metadata?: Partial<CorkboardCard['metadata']>
}

// API functions
export const corkboardApi = {
  /**
   * Get corkboard data with cards
   */
  async getCorkboard(manuscriptId: number, corkboardId?: number): Promise<CorkboardData> {
    const url = corkboardId
      ? `/manuscripts/${manuscriptId}/corkboard/${corkboardId}`
      : `/manuscripts/${manuscriptId}/corkboard`

    const response = await $api(url)
    return response.data
  },

  /**
   * Create a new corkboard
   */
  async createCorkboard(payload: CorkboardCreatePayload): Promise<CorkboardData> {
    const response = await $api('/corkboards', {
      method: 'POST',
      body: payload
    })
    return response.data
  },

  /**
   * Update corkboard settings
   */
  async updateCorkboard(
    manuscriptId: number,
    corkboardId: number,
    updates: Partial<CorkboardCreatePayload>
  ): Promise<CorkboardData> {
    const response = await $api(`/manuscripts/${manuscriptId}/corkboard/${corkboardId}`, {
      method: 'PUT',
      body: updates
    })
    return response.data
  },

  /**
   * Delete a corkboard
   */
  async deleteCorkboard(manuscriptId: number, corkboardId: number): Promise<void> {
    await $api(`/manuscripts/${manuscriptId}/corkboard/${corkboardId}`, {
      method: 'DELETE'
    })
  },

  /**
   * Create a new card
   */
  async createCard(manuscriptId: number, payload: CardCreatePayload): Promise<CorkboardCard> {
    const response = await $api(`/manuscripts/${manuscriptId}/corkboard/cards`, {
      method: 'POST',
      body: payload
    })
    return response.data
  },

  /**
   * Update a card
   */
  async updateCard(
    manuscriptId: number,
    cardId: string,
    updates: CardUpdatePayload
  ): Promise<CorkboardCard> {
    const response = await $api(`/manuscripts/${manuscriptId}/corkboard/cards/${cardId}`, {
      method: 'PUT',
      body: updates
    })
    return response.data
  },

  /**
   * Delete a card
   */
  async deleteCard(manuscriptId: number, cardId: string): Promise<void> {
    await $api(`/manuscripts/${manuscriptId}/corkboard/cards/${cardId}`, {
      method: 'DELETE'
    })
  },

  /**
   * Reorder cards
   */
  async reorderCards(manuscriptId: number, operations: ReorderOperation[]): Promise<void> {
    await $api(`/manuscripts/${manuscriptId}/corkboard/reorder`, {
      method: 'PUT',
      body: { operations }
    })
  },

  /**
   * Bulk update multiple cards
   */
  async bulkUpdate(
    manuscriptId: number,
    cardIds: string[],
    updates: BulkUpdatePayload
  ): Promise<CorkboardCard[]> {
    const response = await $api(`/manuscripts/${manuscriptId}/corkboard/cards/bulk`, {
      method: 'PUT',
      body: {
        card_ids: cardIds,
        updates
      }
    })
    return response.data
  },

  /**
   * Search cards
   */
  async searchCards(
    manuscriptId: number,
    query: string,
    filters?: {
      status?: string[]
      labels?: string[]
      include_in_compile?: boolean
    }
  ): Promise<CorkboardCard[]> {
    const params = new URLSearchParams({
      q: query,
      ...(filters?.status && { status: filters.status.join(',') }),
      ...(filters?.labels && { labels: filters.labels.join(',') }),
      ...(filters?.include_in_compile !== undefined && {
        include_in_compile: filters.include_in_compile.toString()
      })
    })

    const response = await $api(`/manuscripts/${manuscriptId}/corkboard/search?${params}`)
    return response.data
  },

  /**
   * Save corkboard settings
   */
  async saveSettings(
    manuscriptId: number,
    corkboardId: number,
    settings: CorkboardSettings
  ): Promise<void> {
    await $api(`/manuscripts/${manuscriptId}/corkboard/${corkboardId}/settings`, {
      method: 'PUT',
      body: settings
    })
  },

  /**
   * Save card positions (for freeform layout)
   */
  async savePositions(
    manuscriptId: number,
    corkboardId: number,
    positions: Record<string, { x: number; y: number; z?: number }>
  ): Promise<void> {
    await $api(`/manuscripts/${manuscriptId}/corkboard/${corkboardId}/positions`, {
      method: 'PUT',
      body: { positions }
    })
  },

  /**
   * Export corkboard data
   */
  async exportCorkboard(
    manuscriptId: number,
    corkboardId: number,
    format: 'json' | 'csv' | 'pdf'
  ): Promise<Blob> {
    const response = await $api(
      `/manuscripts/${manuscriptId}/corkboard/${corkboardId}/export?format=${format}`,
      {
        method: 'GET',
        headers: {
          'Accept': format === 'json' ? 'application/json' :
                   format === 'csv' ? 'text/csv' : 'application/pdf'
        }
      }
    )

    return response.blob()
  },

  /**
   * Import cards from file
   */
  async importCards(
    manuscriptId: number,
    corkboardId: number,
    file: File,
    options?: {
      merge?: boolean
      update_existing?: boolean
    }
  ): Promise<{
    imported: number
    updated: number
    errors: string[]
  }> {
    const formData = new FormData()
    formData.append('file', file)

    if (options?.merge) {
      formData.append('merge', 'true')
    }
    if (options?.update_existing) {
      formData.append('update_existing', 'true')
    }

    const response = await $api(
      `/manuscripts/${manuscriptId}/corkboard/${corkboardId}/import`,
      {
        method: 'POST',
        body: formData
      }
    )

    return response.data
  },

  /**
   * Get card statistics
   */
  async getStatistics(manuscriptId: number, corkboardId?: number): Promise<{
    total_cards: number
    total_words: number
    by_status: Record<string, number>
    by_label: Record<string, number>
    completion_rate: number
    average_words_per_card: number
  }> {
    const url = corkboardId
      ? `/manuscripts/${manuscriptId}/corkboard/${corkboardId}/statistics`
      : `/manuscripts/${manuscriptId}/corkboard/statistics`

    const response = await $api(url)
    return response.data
  },

  /**
   * Create debounced update function for auto-save
   */
  createDebouncedUpdate(delay = 1000) {
    let timeoutId: NodeJS.Timeout | null = null

    return (
      manuscriptId: number,
      cardId: string,
      updates: CardUpdatePayload
    ): Promise<CorkboardCard> => {
      return new Promise((resolve, reject) => {
        if (timeoutId) {
          clearTimeout(timeoutId)
        }

        timeoutId = setTimeout(async () => {
          try {
            const result = await corkboardApi.updateCard(manuscriptId, cardId, updates)
            resolve(result)
          } catch (error) {
            reject(error)
          }
        }, delay)
      })
    }
  }
}