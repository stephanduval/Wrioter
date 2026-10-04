import { $api } from '@/utils/api'

export interface Manuscript {
  id: number
  title: string
  type: 'scrivener' | 'standard'
  description?: string
  created_at: string
  updated_at: string
}

export const manuscriptsApi = {
  /**
   * Delete a manuscript
   */
  async deleteManuscript(manuscriptId: number): Promise<void> {
    await $api(`/manuscripts/${manuscriptId}`, {
      method: 'DELETE',
    })
  },
}
