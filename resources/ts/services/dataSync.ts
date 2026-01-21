import mitt from 'mitt'

// Event payload types
export interface ItemCreatedEvent {
  manuscriptId: number
  item: {
    id: number
    itemId: number
    title: string
    parentId: number | null
    order: number
    type: string
  }
}

export interface ItemUpdatedEvent {
  manuscriptId: number
  itemId: number
  changes: {
    title?: string
    content?: string
    metadata?: Record<string, any>
  }
}

export interface ItemDeletedEvent {
  manuscriptId: number
  itemId: number
}

export interface ItemMovedEvent {
  manuscriptId: number
  itemId: number
  newParentId: number | null
  newOrder: number
}

export interface ItemReorderedEvent {
  manuscriptId: number
  items: Array<{ itemId: number; order: number }>
}

// Type-safe event map
export type DataSyncEvents = {
  'item:created': ItemCreatedEvent
  'item:updated': ItemUpdatedEvent
  'item:deleted': ItemDeletedEvent
  'item:moved': ItemMovedEvent
  'item:reordered': ItemReorderedEvent
}

// Create typed emitter instance (singleton)
export const dataSync = mitt<DataSyncEvents>()

// Add debug logging in development
if (import.meta.env.DEV) {
  dataSync.on('*', (type, event) => {
    console.log(`[DataSync] ${String(type)}:`, event)
  })
}
