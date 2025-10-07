<template>
  <div>
    <!-- Drop Zone Above -->
    <div
      v-if="showDropZoneAbove"
      class="drop-zone drop-zone-above"
      @drop="handleDrop($event, 'above')"
      @dragover.prevent="handleDragOver($event, 'above')"
      @dragleave="handleDragLeave('above')"
    />

    <!-- Main Tree Node -->
    <div
      class="tree-node"
      :class="{
        'is-expanded': isExpanded,
        'is-selected': isSelected,
        'is-folder': hasChildren,
        'is-loading': node.state.isLoading,
        'is-dragging': isDragging,
        'drop-target': dropPosition === 'inside'
      }"
      :style="{ paddingLeft: `${level * 20}px` }"
      :data-node-id="node.id"
      :data-item-id="node.itemId"
      draggable="true"
      @click="handleNodeClick"
      @contextmenu="handleContextMenu"
      @touchstart="handleTouchStart"
      @touchend="handleTouchEnd"
      @touchmove="handleTouchMove"
      @dragstart="handleDragStart"
      @dragend="handleDragEnd"
      @dragover.prevent="handleDragOver($event, 'inside')"
      @dragleave="handleDragLeave('inside')"
      @drop="handleDrop($event, 'inside')"
    >
      <!-- Node Content -->
      <div class="node-content">
        <!-- Expansion Toggle -->
        <button
          v-if="hasChildren"
          class="expansion-toggle"
          @click.stop="handleToggleExpansion"
        >
          <VIcon
            :icon="isExpanded ? 'bx-chevron-down' : 'bx-chevron-right'"
            size="14"
          />
        </button>
        <div
          v-else
          class="expansion-spacer"
        />

        <!-- Node Icon -->
        <VIcon
          :icon="node.icon"
          size="16"
          class="node-icon"
          :color="getIconColor()"
        />

        <!-- Node Label -->
        <div class="node-label">
          <span class="node-title">{{ node.title }}</span>
          <div
            v-if="showMetadata && (node.metadata.wordCount > 0 || node.metadata.hasComments)"
            class="node-metadata"
          >
            <span
              v-if="node.metadata.wordCount > 0"
              class="word-count"
            >
              {{ formatWordCount(node.metadata.wordCount) }} words
            </span>
            <VIcon
              v-if="node.metadata.hasComments"
              icon="bx-comment"
              size="10"
              class="comment-indicator"
            />
            <VIcon
              v-if="!node.metadata.isCompilable"
              icon="bx-x"
              size="10"
              class="no-compile-indicator"
              title="Excluded from compile"
            />
          </div>
        </div>

        <!-- Status Indicator -->
        <div
          class="status-dot"
          :class="`status-${node.metadata.status}`"
        />
      </div>
    </div>

    <!-- Drop Zone Below -->
    <div
      v-if="showDropZoneBelow"
      class="drop-zone drop-zone-below"
      @drop="handleDrop($event, 'below')"
      @dragover.prevent="handleDragOver($event, 'below')"
      @dragleave="handleDragLeave('below')"
    />

    <!-- Child Nodes -->
    <div v-if="hasChildren && isExpanded" class="child-nodes">
      <TreeNode
        v-for="child in node.children"
        :key="child.id"
        :node="child"
        :level="level + 1"
        :expanded-nodes="expandedNodes"
        :selected-node="selectedNode"
        :show-metadata="showMetadata"
        :dragging-node-id="draggingNodeId"
        @node-click="$emit('node-click', $event)"
        @node-toggle="$emit('node-toggle', $event)"
        @node-context="$emit('node-context', $event)"
        @node-drag-start="$emit('node-drag-start', $event)"
        @node-drag-end="$emit('node-drag-end')"
        @node-drop="$emit('node-drop', $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

interface TreeNode {
  id: string
  itemId: number
  title: string
  type: string
  icon: string
  path: string
  children: TreeNode[]
  parent?: TreeNode
  metadata: {
    wordCount: number
    characterCount: number
    status: 'draft' | 'in_progress' | 'completed' | 'archived'
    lastModified: string
    hasComments: boolean
    isCompilable: boolean
    synopsis?: string
  }
  state: {
    isExpanded: boolean
    isSelected: boolean
    isLoading: boolean
    isDragging: boolean
  }
}

type DropPosition = 'above' | 'below' | 'inside' | null

interface Props {
  node: TreeNode
  level: number
  expandedNodes: Set<string>
  selectedNode: string | null
  showMetadata?: boolean
  draggingNodeId?: string | null
}

interface Emits {
  (e: 'node-click', nodeId: string): void
  (e: 'node-toggle', nodeId: string): void
  (e: 'node-context', data: { nodeId: string; event: MouseEvent }): void
  (e: 'node-drag-start', data: { nodeId: string; itemId: number }): void
  (e: 'node-drag-end'): void
  (e: 'node-drop', data: {
    sourceNodeId: string
    sourceItemId: number
    targetNodeId: string
    targetItemId: number
    position: 'above' | 'below' | 'inside'
  }): void
}

const props = withDefaults(defineProps<Props>(), {
  showMetadata: true,
  draggingNodeId: null
})

const emit = defineEmits<Emits>()

// Drag & Drop state
const isDragging = ref(false)
const dropPosition = ref<DropPosition>(null)

// Computed properties
const hasChildren = computed(() => props.node.children.length > 0)
const isExpanded = computed(() => props.expandedNodes.has(props.node.id))
const isSelected = computed(() => props.selectedNode === props.node.id)

// Show drop zones when dragging
const showDropZoneAbove = computed(() =>
  props.draggingNodeId &&
  props.draggingNodeId !== props.node.id &&
  dropPosition.value === 'above'
)

const showDropZoneBelow = computed(() =>
  props.draggingNodeId &&
  props.draggingNodeId !== props.node.id &&
  dropPosition.value === 'below'
)

// Methods
const handleNodeClick = () => {
  emit('node-click', props.node.id)
}

const handleToggleExpansion = () => {
  emit('node-toggle', props.node.id)
}

const handleContextMenu = (event: MouseEvent) => {
  event.preventDefault()
  emit('node-context', { nodeId: props.node.id, event })
}

// Mobile long-press support
let longPressTimer: NodeJS.Timeout | null = null
const LONG_PRESS_DURATION = 500

const handleTouchStart = (event: TouchEvent) => {
  longPressTimer = setTimeout(() => {
    // Trigger context menu on long press
    emit('node-context', { nodeId: props.node.id, event: event as any })
  }, LONG_PRESS_DURATION)
}

const handleTouchEnd = () => {
  if (longPressTimer) {
    clearTimeout(longPressTimer)
    longPressTimer = null
  }
}

const handleTouchMove = () => {
  // Cancel long press if finger moves
  if (longPressTimer) {
    clearTimeout(longPressTimer)
    longPressTimer = null
  }
}

const getIconColor = (): string => {
  switch (props.node.type) {
    case 'folder':
      return 'warning'
    case 'text':
      return 'primary'
    case 'research':
      return 'info'
    case 'character':
      return 'success'
    case 'mindmap':
      return 'purple'
    default:
      return 'default'
  }
}

const formatWordCount = (count: number): string => {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k`
  }
  return count.toString()
}

// Drag and Drop handlers
const handleDragStart = (event: DragEvent) => {
  isDragging.value = true

  // Set drag data
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('application/json', JSON.stringify({
      nodeId: props.node.id,
      itemId: props.node.itemId,
      title: props.node.title,
      type: props.node.type
    }))
  }

  // Emit drag start event
  emit('node-drag-start', {
    nodeId: props.node.id,
    itemId: props.node.itemId
  })
}

const handleDragEnd = () => {
  isDragging.value = false
  dropPosition.value = null
  emit('node-drag-end')
}

const handleDragOver = (event: DragEvent, position: 'above' | 'below' | 'inside') => {
  // Don't allow dropping on itself
  if (props.draggingNodeId === props.node.id) {
    return
  }

  // For folders, allow dropping inside
  // For files, only allow above/below
  if (position === 'inside' && !hasChildren.value) {
    return
  }

  event.preventDefault()
  dropPosition.value = position

  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move'
  }
}

const handleDragLeave = (position: 'above' | 'below' | 'inside') => {
  if (dropPosition.value === position) {
    dropPosition.value = null
  }
}

const handleDrop = (event: DragEvent, position: 'above' | 'below' | 'inside') => {
  event.preventDefault()
  event.stopPropagation()

  // Don't allow dropping on itself
  if (props.draggingNodeId === props.node.id) {
    dropPosition.value = null
    return
  }

  try {
    const dataStr = event.dataTransfer?.getData('application/json')
    if (!dataStr) {
      console.error('No drag data found')
      return
    }

    const dragData = JSON.parse(dataStr)

    // Emit drop event
    emit('node-drop', {
      sourceNodeId: dragData.nodeId,
      sourceItemId: dragData.itemId,
      targetNodeId: props.node.id,
      targetItemId: props.node.itemId,
      position
    })

    dropPosition.value = null
  } catch (error) {
    console.error('Error handling drop:', error)
    dropPosition.value = null
  }
}
</script>

<style scoped lang="scss">
.tree-node {
  position: relative;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.2s;
  padding: 6px 8px;
  margin: 2px 0;

  &:hover {
    background-color: rgba(var(--v-theme-primary), 0.08);
  }

  &.is-loading {
    opacity: 0.6;
  }

  &.is-dragging {
    opacity: 0.4;
  }

  &.is-selected {
    background-color: rgba(var(--v-theme-primary), 0.12);

    .node-title {
      color: rgb(var(--v-theme-primary));
      font-weight: 500;
    }
  }
}

.node-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.expansion-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: 2px;
  transition: background-color 0.2s;

  &:hover {
    background-color: rgba(var(--v-theme-primary), 0.08);
  }
}

.expansion-spacer {
  width: 20px;
}

.node-icon {
  flex-shrink: 0;
}

.node-label {
  flex: 1;
  min-width: 0;
}

.node-title {
  display: block;
  font-size: 13px;
  color: rgb(var(--v-theme-on-surface));
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.node-metadata {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 2px;
  font-size: 11px;
  color: rgb(var(--v-theme-on-surface-variant));

  .word-count {
    font-size: 10px;
  }

  .comment-indicator {
    color: rgb(var(--v-theme-info));
  }

  .no-compile-indicator {
    color: rgb(var(--v-theme-warning));
  }
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;

  &.status-draft {
    background-color: rgb(var(--v-theme-surface-variant));
  }

  &.status-in_progress {
    background-color: rgb(var(--v-theme-warning));
  }

  &.status-completed {
    background-color: rgb(var(--v-theme-success));
  }

  &.status-archived {
    background-color: rgb(var(--v-theme-error));
  }
}

.child-nodes {
  position: relative;

  &::before {
    content: '';
    position: absolute;
    left: 10px;
    top: 0;
    bottom: 0;
    width: 1px;
    background-color: rgba(var(--v-theme-on-surface), 0.12);
  }
}

// Drop zones
.drop-zone {
  position: relative;
  height: 4px;
  margin: 2px 0;
  background-color: transparent;
  transition: all 0.2s;

  &::before {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
    height: 2px;
    background-color: rgb(var(--v-theme-primary));
    opacity: 0;
    transition: opacity 0.2s;
  }

  &:hover::before,
  &.active::before {
    opacity: 1;
  }

  &.drop-zone-above {
    margin-bottom: -2px;
  }

  &.drop-zone-below {
    margin-top: -2px;
  }
}

// Drop target styling (for dropping inside folders)
.tree-node.drop-target {
  background-color: rgba(var(--v-theme-primary), 0.15);
  border: 2px dashed rgb(var(--v-theme-primary));

  &::after {
    content: 'Drop here';
    position: absolute;
    right: 8px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 10px;
    color: rgb(var(--v-theme-primary));
    font-weight: 600;
    text-transform: uppercase;
  }
}

// Dragging cursor
.tree-node[draggable="true"] {
  cursor: grab;

  &:active {
    cursor: grabbing;
  }

  &.is-dragging {
    opacity: 0.4;
    cursor: grabbing;
  }
}
</style>