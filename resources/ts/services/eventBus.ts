import mitt from 'mitt'

// Event payload types for UI events
export interface AddToCollectionEvent {
  selectedText: string
  sourceItemId: number
  manuscriptId: number
  positionData: {
    from: number
    to: number
  }
}

export interface CustomizeIconEvent {
  manuscriptId: number
  itemId: number
  title: string
  currentIconName: string | null
  currentIconColor: string | null
  useCustomIcon: boolean
  defaultIcon: string
}

export interface SummarizeTextEvent {
  selectedText: string
}

// Type-safe event map for UI events
export type EventBusEvents = {
  'snippet:add-to-collection': AddToCollectionEvent
  'item:customize-icon': CustomizeIconEvent
  'ai:summarize': SummarizeTextEvent
}

// Create typed emitter instance (singleton)
export const eventBus = mitt<EventBusEvents>()

// Add debug logging in development
if (import.meta.env.DEV) {
  eventBus.on('*', (type, event) => {
    console.log(`[EventBus] ${String(type)}:`, event)
  })
}
