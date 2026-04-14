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
        'is-dragging': isDragging,
        'drop-target-inside': localDropPosition === 'inside' && props.draggingNodeId && props.draggingNodeId !== node.id,
        'drop-target-above': localDropPosition === 'above' && props.draggingNodeId && props.draggingNodeId !== node.id,
        'drop-target-below': localDropPosition === 'below' && props.draggingNodeId && props.draggingNodeId !== node.id,
        'in-scrivening-selection': isInScriveningSelection,
      }"
      :style="{ paddingLeft: `${level * 20}px` }"
      :data-node-id="node.id"
      :data-item-id="node.itemId"
      :draggable="node.type !== 'snippet_reference'"
      @contextmenu="handleContextMenu"
      @touchstart="handleTouchStart"
      @touchend="handleTouchEnd"
      @touchmove="handleTouchMove"
      @dragstart="handleDragStart"
      @dragend="handleDragEnd"
      @dragover.prevent.stop="handleDragOver"
      @dragleave.stop="handleDragLeave"
      @drop.stop="handleDrop"
    >
      <!-- Node Content -->
      <div class="node-content">
        <!-- Expansion Toggle (only rendered for folders) -->
        <div
          v-if="hasChildren && !sidebarCollapsed"
          class="expansion-toggle"
          role="button"
          tabindex="0"
          @click.stop="handleToggleExpansion()"
          @keydown.enter.stop="handleToggleExpansion()"
          @keydown.space.prevent.stop="handleToggleExpansion()"
        >
          <VIcon
            :icon="isExpanded ? 'bx-chevron-down' : 'bx-chevron-right'"
            size="14"
          />
        </div>

        <!-- Spacer for items without expansion toggle -->
        <div v-else class="expansion-spacer" />

        <!-- Node Icon -->
        <VIcon
          :icon="node.icon"
          size="16"
          class="node-icon"
          :color="getIconColor()"
        />

        <!-- Child Count Badge (shown when sidebar collapsed and has children) -->
        <VChip
          v-if="sidebarCollapsed && hasChildren && level < maxDepth"
          size="x-small"
          class="child-count-badge"
        >
          {{ node.children.length }}
        </VChip>

        <!-- Node Label (clickable to select/navigate or double-click to rename) -->
        <div
          class="node-label"
          @click="handleNodeClick($event)"
          @dblclick="startInlineRename"
        >
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
            v-if="
              !isRenaming &&
              showMetadata &&
              (node.metadata.wordCount > 0 || node.metadata.hasComments)
            "
            class="node-metadata"
          >
            <span v-if="node.metadata.wordCount > 0" class="word-count">
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
        <div class="status-dot" :class="`status-${node.metadata.status}`" />
      </div>

      <!-- File SVG (cyan curve for non-folder nested items) -->
      <svg
        v-if="level > 0 && node.type !== 'folder'"
        class="tree-connector-svg"
        viewBox="0 0 40 100"
        preserveAspectRatio="none"
        :style="{ insetInlineStart: `${level * 20}px` }"
      >
        <path
          d="M20 10C20 10 0 14 0 0V60"
          class="connector-path"
          style="stroke: cyan;"
        />
      </svg>
    </div>

    <!-- Child Nodes + vertical connectors for each nesting level -->
    <div v-if="canShowChildren" class="child-nodes-wrapper" style="position: relative;">
      <!-- Multiple vertical lines - one for each nesting level -->
      <svg
        v-for="(xPos, idx) in verticalLinePositions"
        :key="`vertical-${idx}`"
        class="folder-connector-svg"
        :viewBox="`0 0 10 ${childNodesHeight}`"
        preserveAspectRatio="none"
        :style="{
          blockSize: `${childNodesHeight}px`,
          insetInlineStart: `${xPos + 5}px`
        }"
      >
        <path
          :d="`M 5 0 V${childNodesHeight}`"
          class="connector-path"
          :style="`stroke: ${['yellow', 'blue', 'green', 'orange', 'purple'][idx % 5]};`"
        />
      </svg>
      <div class="child-nodes" ref="childNodesRef">
      <TreeNode
        v-for="child in node.children"
        :key="child.id"
        :node="child"
        :level="level + 1"
        :expanded-nodes="expandedNodes"
        :selected-node="selectedNode"
        :show-metadata="showMetadata"
        :dragging-node-id="draggingNodeId"
        :dragging-node-ids="draggingNodeIds"
        :selection-mode="selectionMode"
        :scrivening-selections="scriveningSelections"
        :all-nodes="allNodes"
        :max-depth="maxDepth"
        :sidebar-collapsed="sidebarCollapsed"
        @node-click="$emit('node-click', $event)"
        @node-toggle="$emit('node-toggle', $event)"
        @node-context="$emit('node-context', $event)"
        @node-drag-start="$emit('node-drag-start', $event)"
        @node-drag-end="$emit('node-drag-end')"
        @node-drop="$emit('node-drop', $event)"
        @scrivening-selection-toggle="
          $emit('scrivening-selection-toggle', $event)
        "
      />
    </div>
    </div>

    <!-- Empty Folder Hint -->
    <div
      v-if="isEmptyFolder && isExpanded && !sidebarCollapsed"
      class="empty-folder-hint"
      :style="{ paddingLeft: `${(level + 1) * 20 + 28}px` }"
    >
      Drop items here
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DropPosition, DropResult, DropResultMulti } from "@/composables/useDragAndDrop";
import { useDragAndDrop } from "@/composables/useDragAndDrop";
import { useManuscriptStore } from "@/stores/manuscript";
import { useSelectionStore } from "@/stores/selection";
import { computed, nextTick, onBeforeUnmount, ref, watch } from "vue";

interface TreeNode {
  id: string;
  itemId: number;
  title: string;
  type: string;
  icon: string;
  path: string;
  children: TreeNode[];
  parent?: TreeNode;
  metadata: {
    wordCount: number;
    characterCount: number;
    status: "draft" | "in_progress" | "completed" | "archived";
    lastModified: string;
    hasComments: boolean;
    isCompilable: boolean;
  };
  state: {
    isLoading: boolean;
  };
}

interface Props {
  node: TreeNode;
  level?: number;
  expandedNodes: Set<string>;
  selectedNode: string | null;
  showMetadata?: boolean;
  draggingNodeId: string | null;
  draggingNodeIds?: Set<string>;  // For multi-drag support
  selectionMode?: boolean;
  scriveningSelections?: Set<string>;
  allNodes?: TreeNode[];  // All nodes for building drag data
  maxDepth?: number;
  sidebarCollapsed?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  level: 0,
  showMetadata: false,
  selectionMode: false,
  scriveningSelections: () => new Set(),
  draggingNodeIds: () => new Set(),
  allNodes: () => [],
  maxDepth: Infinity,
  sidebarCollapsed: false,
});

const emit = defineEmits<{
  "node-click": [id: string];
  "node-toggle": [id: string];
  "node-context": [{ nodeId: string; event: MouseEvent | TouchEvent }];
  "node-drag-start": [ids: string[]];  // Now supports multiple IDs
  "node-drag-end": [];
  "node-drop": [DropResult | DropResultMulti];  // Supports both single and multi
  "scrivening-selection-toggle": [
    { nodeId: string; itemId: number; checked: boolean },
  ];
}>();

// Rename state
const isRenaming = ref(false);
const renameValue = ref("");
const renameInputRef = ref<HTMLInputElement | null>(null);

// Stores
const manuscriptStore = useManuscriptStore();
const selectionStore = useSelectionStore();

// Drag & Drop composable
const {
  isDragging,
  handleDragStart: dragStart,
  handleDragStartMulti: dragStartMulti,
  handleDragEnd: dragEnd,
  handleDragOver: dragOver,
  handleDragLeave: dragLeave,
  handleDrop: drop,
} = useDragAndDrop();

// Computed properties
const hasChildren = computed(() => props.node.children.length > 0);
const isEmptyFolder = computed(() => props.node.type === 'folder' && !hasChildren.value);
const isExpanded = computed(() => props.expandedNodes.has(props.node.id));
// isSelected now checks BOTH the navigation selection AND the multi-select store
const isNavigationSelected = computed(() => props.selectedNode === props.node.id);
const isMultiSelected = computed(() => selectionStore.isSelected(props.node.id));
const isSelected = computed(() => isNavigationSelected.value || isMultiSelected.value);
const isInScriveningSelection = computed(
  () => props.scriveningSelections?.has(props.node.id) || false,
);

// Computed: determine if children can be shown based on depth limit
const canShowChildren = computed(
  () => hasChildren.value && isExpanded.value && props.level < props.maxDepth,
);

// Track local hover state for this specific node
const localDropPosition = ref<DropPosition>(null);

// Folder connector height (tracks child-nodes div height via ResizeObserver)
const childNodesRef = ref<HTMLElement | null>(null);
const childNodesHeight = ref(0);
let resizeObserver: ResizeObserver | null = null;

watch(childNodesRef, (el) => {
  resizeObserver?.disconnect();
  if (el) {
    childNodesHeight.value = el.offsetHeight;
    resizeObserver = new ResizeObserver(() => {
      childNodesHeight.value = el.offsetHeight;
    });
    resizeObserver.observe(el);
  } else {
    childNodesHeight.value = 0;
  }
});

onBeforeUnmount(() => resizeObserver?.disconnect());

// Determine how many vertical connector lines to draw
// - One line for each ancestor level (0 lines at level 0, 1 at level 1, etc.)
// - Show only if this node has children (folder with expanded children)
const verticalLineCount = computed(() => {
  return hasChildren.value && canShowChildren.value ? props.level : 0;
});

// Generate x-positions for each vertical line (spaced 20px apart, same as indentation)
const verticalLinePositions = computed(() => {
  return Array.from({ length: verticalLineCount.value }, (_, i) => i * 20);
});

// Methods
const handleNodeClick = (event: MouseEvent) => {
  const nodeId = props.node.id;

  // Shift-click toggles scrivening selection (when in selection mode)
  if (event.shiftKey && props.selectionMode) {
    event.preventDefault();
    event.stopPropagation();
    const isCurrentlySelected = isInScriveningSelection.value;
    emit("scrivening-selection-toggle", {
      nodeId: nodeId,
      itemId: props.node.itemId,
      checked: !isCurrentlySelected,
    });
    return;
  }

  // Ctrl+Click (or Cmd+Click on Mac) - toggle multi-selection
  if (event.ctrlKey || event.metaKey) {
    event.preventDefault();
    event.stopPropagation();
    selectionStore.toggleItem(nodeId);
    console.log('[MULTI-SELECT] Ctrl+Click toggled:', nodeId, 'Selection:', selectionStore.getSelectionSummary());
    return;
  }

  // Shift+Click - extend range selection (for multi-select, not scrivening)
  if (event.shiftKey && !props.selectionMode) {
    event.preventDefault();
    event.stopPropagation();
    selectionStore.extendSelection(nodeId);
    console.log('[MULTI-SELECT] Shift+Click extended to:', nodeId, 'Selection:', selectionStore.getSelectionSummary());
    return;
  }

  // Normal click - clear multi-selection and navigate
  if (selectionStore.hasSelection) {
    selectionStore.clearSelection();
  }
  emit("node-click", nodeId);
};

const handleToggleExpansion = () => {
  emit("node-toggle", props.node.id);
};

const handleContextMenu = (event: MouseEvent) => {
  event.preventDefault();
  emit("node-context", { nodeId: props.node.id, event });
};

// Mobile long-press support
let longPressTimer: NodeJS.Timeout | null = null;
const LONG_PRESS_DURATION = 500;

const handleTouchStart = (event: TouchEvent) => {
  longPressTimer = setTimeout(() => {
    // Trigger context menu on long press
    emit("node-context", { nodeId: props.node.id, event: event as any });
  }, LONG_PRESS_DURATION);
};

const handleTouchEnd = () => {
  if (longPressTimer) {
    clearTimeout(longPressTimer);
  }
};

const handleTouchMove = () => {
  if (longPressTimer) {
    clearTimeout(longPressTimer);
  }
};

// Helper to find node data by ID from allNodes tree
const findNodeById = (nodes: TreeNode[], id: string): TreeNode | null => {
  for (const node of nodes) {
    if (node.id === id) return node;
    if (node.children.length > 0) {
      const found = findNodeById(node.children, id);
      if (found) return found;
    }
  }
  return null;
};

// Drag handlers
const handleDragStart = (event: DragEvent) => {
  const nodeId = props.node.id;
  const isNodeSelected = selectionStore.isSelected(nodeId);

  console.log('[DRAG-START] Node:', nodeId, {
    isNodeSelected,
    selectedCount: selectionStore.selectedCount,
    selectedArray: selectionStore.selectedArray,
    allNodesCount: props.allNodes.length,
  });

  // If node is selected and there are multiple selections, drag all selected
  if (isNodeSelected && selectionStore.selectedCount > 1) {
    // Build drag data for all selected items
    const selectedIds = selectionStore.selectedArray;
    console.log('[DRAG-START] Multi-drag mode! Dragging', selectedIds.length, 'items:', selectedIds);
    const dragItems = selectedIds.map(id => {
      // Try to find node in allNodes prop, fallback to current node data
      const foundNode = props.allNodes.length > 0 ? findNodeById(props.allNodes, id) : null;
      if (foundNode) {
        return {
          id: foundNode.id,
          itemId: foundNode.itemId,
          type: foundNode.type,
          title: foundNode.title,
        };
      }
      // If not found and it's the current node, use current node data
      if (id === nodeId) {
        return {
          id: props.node.id,
          itemId: props.node.itemId,
          type: props.node.type,
          title: props.node.title,
        };
      }
      // Fallback: minimal data
      return {
        id,
        itemId: parseInt(id),
        type: 'unknown',
        title: 'Item',
      };
    });

    dragStartMulti(event, dragItems, nodeId);
    emit("node-drag-start", selectedIds);
  } else {
    // Single item drag
    // If not selected, select this item (replaces selection)
    if (!isNodeSelected) {
      selectionStore.selectItem(nodeId);
    }

    dragStart(event, {
      id: props.node.id,
      itemId: props.node.itemId,
      type: props.node.type,
      title: props.node.title,
    });
    emit("node-drag-start", [props.node.id]);
  }
};

const handleDragEnd = () => {
  dragEnd();
  emit("node-drag-end");
};

// Calculate drop position based on cursor Y position within the node
const calculateDropPosition = (event: DragEvent): 'above' | 'below' | 'inside' => {
  const target = event.currentTarget as HTMLElement;
  if (!target) return 'below';

  const rect = target.getBoundingClientRect();
  const y = event.clientY - rect.top;
  const height = rect.height;

  // Allow dropping inside any item (except snippet_reference)
  // When dropping onto a leaf text item, the backend auto-creates a folder
  const canDropInside = props.node.type !== 'snippet_reference';

  if (y < height * 0.25) {
    return 'above';
  } else if (y > height * 0.75) {
    return 'below';
  } else {
    // Middle zone - drop inside if folder, otherwise below
    return canDropInside ? 'inside' : 'below';
  }
};

const handleDragOver = (event: DragEvent) => {
  event.preventDefault();
  event.stopPropagation();

  const position = calculateDropPosition(event);
  const allowInside = props.node.type !== 'snippet_reference';

  dragOver(event, props.node.id, position, {
    allowInside,
    preventSelf: true,
  });

  // Update local drop position for this node
  localDropPosition.value = position;
};

const handleDragLeave = () => {
  dragLeave(localDropPosition.value);
  // Clear local drop position when leaving this node
  localDropPosition.value = null;
};

const handleDrop = async (event: DragEvent) => {
  const position = localDropPosition.value || 'below';
  const result = drop(event, props.node.id, props.node.itemId, position);

  if (result) {
    // Emit the full result (single or multi)
    emit("node-drop", result);
  }
  // Clear local drop position after drop
  localDropPosition.value = null;
};

// Format word count for display
const formatWordCount = (count: number): string => {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k`;
  }
  return count.toString();
};

// Get icon color based on node type
const getIconColor = (): string => {
  const type = props.node.type || "default";
  const colorMap: Record<string, string> = {
    folder: "amber",
    document: "blue",
    scene: "green",
    character: "red",
    location: "purple",
    item: "orange",
    snippet_collection: "deep-purple",
    snippet_reference: "deep-purple-lighten-2",
    default: "gray",
  };
  return colorMap[type] || colorMap.default;
};

// Rename methods
const startInlineRename = () => {
  isRenaming.value = true;
  renameValue.value = props.node.title;
  nextTick(() => {
    renameInputRef.value?.focus();
    renameInputRef.value?.select();
  });
};

const confirmRename = async () => {
  const newTitle = renameValue.value.trim();
  isRenaming.value = false;

  if (!newTitle || newTitle === props.node.title) {
    return;
  }

  try {
    const manuscriptId = manuscriptStore.selectedManuscript?.id;
    if (manuscriptId) {
      await manuscriptStore.renameItem(
        manuscriptId,
        props.node.itemId,
        newTitle,
      );
    }
  } catch (error) {
    console.error("Failed to rename item:", error);
  }
};

const cancelRename = () => {
  isRenaming.value = false;
  renameValue.value = "";
};

// Keyboard shortcut handler
const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === "F2" && isSelected.value && !isRenaming.value) {
    event.preventDefault();
    startInlineRename();
  }
};

// Setup keyboard listener when node is selected
watch(isSelected, (selected) => {
  if (selected) {
    window.addEventListener("keydown", handleKeyDown);
  } else {
    window.removeEventListener("keydown", handleKeyDown);
  }
});

// Cleanup on unmount
onBeforeUnmount(() => {
  window.removeEventListener("keydown", handleKeyDown);
});
</script>

<style scoped lang="scss">
.tree-node {
  position: relative;
  border: 1px solid transparent;
  border-radius: 4px;
  cursor: grab;
  margin-block: 2px;
  margin-inline: 0;
  padding-block: 6px;
  padding-inline: 8px;
  transition: background-color 0.2s;

  &:active {
    cursor: grabbing;
  }

  &.is-loading {
    opacity: 0.6;
  }

  &.is-dragging,
  &.is-multi-dragging {
    background-color: rgba(59, 130, 246, 10%);
    opacity: 0.7;
  }

  &.is-selected {
    border: 1px solid rgba(59, 130, 246, 30%);
    background-color: rgba(59, 130, 246, 10%);
  }

  &.in-scrivening-selection {
    background-color: rgba(59, 130, 246, 15%);
    border-inline-start: 3px solid #3b82f6;

    .node-title {
      font-weight: 500;
    }
  }

  &:hover {
    background-color: rgba(0, 0, 0, 5%);

    .node-label {
      cursor: pointer;
    }
  }

  .node-content {
    display: flex;
    align-items: center;
    gap: 8px;

    .expansion-toggle {
      display: flex;
      flex-shrink: 0;
      align-items: center;
      justify-content: center;
      block-size: 20px;
      cursor: pointer;
      inline-size: 20px;
      transition: transform 0.2s;

      &:hover {
        background-color: rgba(0, 0, 0, 5%);
      }
    }

    .expansion-spacer {
      flex-shrink: 0;
      inline-size: 20px;
    }

    .node-icon {
      flex-shrink: 0;
      block-size: 16px;
      inline-size: 16px;
    }

    .node-label {
      display: flex;
      flex: 1;
      align-items: center;
      padding: 0;
      margin: 0;
      cursor: pointer;
      gap: 8px;
      min-inline-size: 0;

      .node-title {
        overflow: hidden;
        flex: 1;
        padding: 0;
        margin: 0;
        min-inline-size: 0;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .node-rename-input {
        flex: 1;
        border: 2px solid #3b82f6;
        border-radius: 4px;
        font-family: inherit;
        font-size: inherit;
        padding-block: 4px;
        padding-inline: 8px;

        &:focus {
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 10%);
          outline: none;
        }
      }

      .node-metadata {
        display: flex;
        align-items: center;
        color: #9ca3af;
        font-size: 0.75rem;
        gap: 4px;

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
      flex-shrink: 0;
      border-radius: 50%;
      block-size: 8px;
      inline-size: 8px;

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

  // Drop target styles - inside (folder drop)
  &.drop-target-inside {
    border: 2px dashed #3b82f6;
    border-radius: 4px;
    background-color: rgba(59, 130, 246, 15%);
  }

  // Drop target styles - above (insert before)
  &.drop-target-above {
    &::before {
      position: absolute;
      z-index: 10;
      border-radius: 2px;
      background-color: #3b82f6;
      block-size: 3px;
      box-shadow: 0 0 6px rgba(59, 130, 246, 60%);
      content: "";
      inset-block-start: -2px;
      inset-inline: 0;
    }
  }

  // Drop target styles - below (insert after)
  &.drop-target-below {
    &::after {
      position: absolute;
      z-index: 10;
      border-radius: 2px;
      background-color: #3b82f6;
      block-size: 3px;
      box-shadow: 0 0 6px rgba(59, 130, 246, 60%);
      content: "";
      inset-block-end: -2px;
      inset-inline: 0;
    }
  }

  // SVG Tree connector (animated curved lines for nested items)
  .tree-connector-svg {
    position: absolute;
    animation: fade-in-connector 0.6s ease-out 0.2s forwards;
    inline-size: 40px;
    inset-block-start: 0;
    inset-inline-start: 0;
    opacity: 0;
    pointer-events: none;

    .connector-path {
      animation: draw-connector 0.8s ease-out 0.1s forwards;
      fill: none;
      stroke: #fff;
      stroke-dasharray: 30;
      stroke-dashoffset: 30;
      stroke-linecap: round;
      stroke-linejoin: round;
      stroke-width: 1.5;
    }

    &:hover .connector-path {
      stroke: #d1d5db;
      stroke-width: 2;
    }
  }
}

@keyframes fade-in-connector {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

@keyframes draw-connector {
  from {
    stroke-dashoffset: 30;
  }

  to {
    stroke-dashoffset: 0;
  }
}

.child-nodes {
  margin-inline-start: 0;
}

.child-nodes-wrapper {
  position: relative;

  .folder-connector-svg {
    position: absolute;
    overflow: visible;
    inline-size: 10px;
    inset-block-start: 0;
    inset-inline-start: 0;
    pointer-events: none;
  }
}

.empty-folder-hint {
  color: #9ca3af;
  font-size: 0.75rem;
  font-style: italic;
  opacity: 0.7;
  padding-block: 4px;
}
</style>
