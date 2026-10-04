/**
 * Split View Type Definitions
 *
 * This file contains all TypeScript interfaces and types for the split view system.
 */

// Layout tree structure
export interface SplitNode {
  id: string
  type: 'container' | 'pane'
  orientation?: 'horizontal' | 'vertical' // only for containers
  size: number // percentage 0-100
  children?: SplitNode[] // only for containers
  paneId?: string // only for panes
}

// Pane configuration
export interface Pane {
  id: string
  tabs: Tab[]
  activeTabId: string | null
  focused: boolean
  viewConfig: {
    scrollPosition: number
    zoom: number
    fontSize: 'small' | 'medium' | 'large'
  }
}

// Tab configuration
export interface Tab {
  id: string
  type: 'editor' | 'manuscript' | 'corkboard' | 'outline'
  itemId?: string
  folderId?: string
  title: string
  isDirty: boolean
  isPinned: boolean
  isLoading: boolean
  lastModified: Date
  viewState: {
    scrollTop: number
    cursorPosition?: number
    selection?: [number, number]
  }
}

// Layout preset templates
export interface LayoutPreset {
  id: string
  name: string
  icon: string
  description: string
  layout: SplitNode
  defaultPanes: Partial<Pane>[]
}

// Split direction
export type SplitDirection = 'horizontal' | 'vertical'

// Navigation direction
export type NavigationDirection = 'up' | 'down' | 'left' | 'right'

// View configuration
export interface ViewConfig {
  scrollPosition: number
  zoom: number
  fontSize: 'small' | 'medium' | 'large'
  lineSpacing?: 'single' | '1.5' | 'double'
}

// Tab create options
export interface TabCreateOptions {
  type: Tab['type']
  itemId?: string
  folderId?: string
  title: string
  isDirty?: boolean
  isPinned?: boolean
  isLoading?: boolean
}

// Layout save/load options
export interface LayoutData {
  layout: SplitNode
  panes: Array<{
    id: string
    tabs: Tab[]
    activeTabId: string | null
    focused: boolean
    viewConfig: ViewConfig
  }>
  focusedPaneId: string | null
}

// Split view state
export interface SplitViewState {
  layout: SplitNode
  panes: Map<string, Pane>
  focusedPaneId: string | null
  isDragging: boolean
  draggedTab: Tab | null
  isFocusMode: boolean
}
