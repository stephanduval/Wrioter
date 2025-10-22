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

        <!-- Node Label (clickable to select/navigate or double-click to rename) -->
        <div class="node-label" @click="handleNodeClick" @dblclick="startInlineRename">
          <!-- Inline Rename Input -->
          <input
            v-if="isRenaming"
            ref="renameInputRef"
            v-model="renameValue"
            type="text"
            class="node-rename-input"
            @keydown.enter="confirmRename"
            @keydown.escape="cancelRename"
            @blur="confirmRename"
            @click.stop
          />
          <!-- Display Title -->
          <span v-else class="node-title">{{ node.title }}</span>
          <div
            v-if="!isRenaming && showMetadata && (node.metadata.wordCount > 0 || node.metadata.hasComments)"
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
import { computed, ref, watch, nextTick, onBeforeUnmount } from 'vue'
import { useDragAndDrop } from '@/composables/useDragAndDrop'
import { useManuscriptStore } from '@/stores/manuscript'
import type { DropPosition } from '@/composables/useDragAndDrop'

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
  }
  state: {
    isLoading: boolean
  }
}

interface Props {
  node: TreeNode
  level?: number
  expandedNodes: Set<string>
  selectedNode: string | null
  showMetadata?: boolean
  draggingNodeId: string | null
}

const props = withDefaults(defineProps<Props>(), {
  level: 0,
  showMetadata: false
})

const emit = defineEmits<{
  'node-click': [id: string]
  'node-toggle': [id: string]
  'node-context': [{ nodeId: string; event: MouseEvent | TouchEvent }]
  'node-drag-start': [id: string]
  'node-drag-end': []
  'node-drop': [{ sourceId: string; targetId: string; position: DropPosition }]
}>()

// Rename state
const isRenaming = ref(false)
const renameValue = ref('')
const renameInputRef = ref<HTMLInputElement | null>(null)

// Store
const manuscriptStore = useManuscriptStore()

// Drag & Drop composable
const {
  isDragging,
  dropPosition,
  handleDragStart: dragStart,
  handleDragEnd: dragEnd,
  handleDragOver: dragOver,
  handleDragLeave: dragLeave,
  handleDrop: drop
} = useDragAndDrop()

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
  }
}

const handleTouchMove = () => {
  if (longPressTimer) {
    clearTimeout(longPressTimer)
  }
}

// Drag handlers
const handleDragStart = (event: DragEvent) => {
  dragStart(event, props.node.id)
  emit('node-drag-start', props.node.id)
}

const handleDragEnd = (event: DragEvent) => {
  dragEnd(event)
  emit('node-drag-end')
}

const handleDragOver = (event: DragEvent, position: DropPosition) => {
  dragOver(event, position)
}

const handleDragLeave = (position: DropPosition) => {
  dragLeave(position)
}

const handleDrop = (event: DragEvent, position: DropPosition) => {
  event.preventDefault()
  event.stopPropagation()

  const sourceId = event.dataTransfer?.getData('nodeId')
  if (sourceId && sourceId !== props.node.id) {
    emit('node-drop', {
      sourceId,
      targetId: props.node.id,
      position
    })
  }
  dragLeave(position)
}

// Format word count for display
const formatWordCount = (count: number): string => {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k`
  }
  return count.toString()
}

// Get icon color based on node type
const getIconColor = (): string => {
  const type = props.node.type || 'default'
  const colorMap: Record<string, string> = {
    folder: 'amber',
    document: 'blue',
    scene: 'green',
    character: 'red',
    location: 'purple',
    item: 'orange',
    default: 'gray'
  }
  return colorMap[type] || colorMap.default
}

// Rename methods
const startInlineRename = () => {
  isRenaming.value = true
  renameValue.value = props.node.title
  nextTick(() => {
    renameInputRef.value?.focus()
    renameInputRef.value?.select()
  })
}

const confirmRename = async () => {
  const newTitle = renameValue.value.trim()
  isRenaming.value = false

  if (!newTitle || newTitle === props.node.title) {
    return
  }

  try {
    const manuscriptId = manuscriptStore.selectedManuscript?.id
    if (manuscriptId) {
      await manuscriptStore.renameItem(manuscriptId, props.node.itemId, newTitle)
    }
  } catch (error) {
    console.error('Failed to rename item:', error)
  }
}

const cancelRename = () => {
  isRenaming.value = false
  renameValue.value = ''
}

// Keyboard shortcut handler
const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'F2' && isSelected.value && !isRenaming.value) {
    event.preventDefault()
    startInlineRename()
  }
}

// Setup keyboard listener when node is selected
watch(isSelected, (selected) => {
  if (selected) {
    window.addEventListener('keydown', handleKeyDown)
  } else {
    window.removeEventListener('keydown', handleKeyDown)
  }
})

// Cleanup on unmount
onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeyDown)
})
</script>

<style scoped lang="scss">
.tree-node {
  position: relative;
  cursor: default;
  border-radius: 4px;
  transition: background-color 0.2s;
  padding: 6px 8px;
  margin: 2px 0;

  &.is-loading {
    opacity: 0.6;
  }

  &.is-dragging {
    opacity: 0.7;
    background-color: rgba(59, 130, 246, 0.1);
  }

  &.is-selected {
    background-color: rgba(59, 130, 246, 0.1);
    border: 1px solid rgba(59, 130, 246, 0.3);
  }

  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }

  .node-content {
    display: flex;
    align-items: center;
    gap: 8px;

    .expansion-toggle {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 20px;
      height: 20px;
      padding: 0;
      border: none;
      background: none;
      cursor: pointer;
      transition: transform 0.2s;

      &:hover {
        background-color: rgba(0, 0, 0, 0.05);
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
      display: flex;
      align-items: center;
      gap: 8px;
      min-width: 0;
      cursor: pointer;

      .node-title {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .node-rename-input {
        flex: 1;
        padding: 4px 8px;
        border: 2px solid #3b82f6;
        border-radius: 4px;
        font-family: inherit;
        font-size: inherit;

        &:focus {
          outline: none;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
      }

      .node-metadata {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 0.75rem;
        color: #9ca3af;

        .word-count {
          white-space: nowrap;
        }

        .comment-indicator,
        .no-compile-indicator {
          flex-shrink: 0;
        }
      }
    }

    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      flex-shrink: 0;

      &.status-draft {
        background-color: #e5e7eb;
      }

      &.status-in_progress {
        background-color: #fbbf24;
      }

      &.status-completed {
        background-color: #34d399;
      }

      &.status-archived {
        background-color: #9ca3af;
      }
    }
  }

  .drop-zone {
    height: 2px;
    background-color: #3b82f6;
    margin: 4px 0;
    border-radius: 1px;

    &.drop-zone-above {
      margin-bottom: 4px;
    }

    &.drop-zone-below {
      margin-top: 4px;
    }
  }

  .child-nodes {
    margin-left: 0;
  }
}
</style>
