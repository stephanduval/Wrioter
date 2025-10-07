import axios from 'axios'

export interface ReorderItemOperation {
  item_id: number
  order: number
}

export interface FolderContents {
  folder: {
    id: number
    title: string
    type: string
    parent_id: number | null
  }
  items: any[]
  view_preferences: any
}

/**
 * Get folder contents optimized for the specified view mode
 */
export async function getFolderContents(
  folderId: number,
  viewMode: 'manuscript' | 'corkboard' | 'outline' = 'corkboard'
): Promise<FolderContents> {
  const response = await axios.get(`/api/folders/${folderId}/contents`, {
    params: { view_mode: viewMode }
  })
  return response.data
}

/**
 * Reorder items within a folder
 */
export async function reorderFolderItems(
  folderId: number,
  items: ReorderItemOperation[]
): Promise<void> {
  const response = await axios.post(`/api/folders/${folderId}/reorder`, {
    items
  })
  return response.data
}
