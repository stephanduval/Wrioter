<template>
  <div>
    <!-- Main Tree Node -->
    <div
      class="tree-node"
      :class="{
        'is-expanded': isExpanded,
        'is-selected': isSelected,
        'is-folder': hasChildren,
        'is-loading': node.state.isLoading,
        'is-dragging': node.state.isDragging
      }"
      :style="{ paddingLeft: `${level * 20}px` }"
      @click="handleNodeClick"
      @contextmenu="handleContextMenu"
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
        @node-click="$emit('node-click', $event)"
        @node-toggle="$emit('node-toggle', $event)"
        @node-context="$emit('node-context', $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

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

interface Props {
  node: TreeNode
  level: number
  expandedNodes: Set<string>
  selectedNode: string | null
  showMetadata?: boolean
}

interface Emits {
  (e: 'node-click', nodeId: string): void
  (e: 'node-toggle', nodeId: string): void
  (e: 'node-context', data: { nodeId: string; event: MouseEvent }): void
}

const props = withDefaults(defineProps<Props>(), {
  showMetadata: true
})

const emit = defineEmits<Emits>()

// Computed properties
const hasChildren = computed(() => props.node.children.length > 0)
const isExpanded = computed(() => props.expandedNodes.has(props.node.id))
const isSelected = computed(() => props.selectedNode === props.node.id)

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
</style>