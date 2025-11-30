<template>
  <div>
    <!-- Drop Zone Above -->
    <div
      v-if="showDropZoneAbove"
      class="drop-zone drop-zone-above"
      @drop.stop="handleDrop($event, 'above')"
      @dragover.prevent.stop="handleDragOver($event, 'above')"
      @dragleave.stop="handleDragLeave('above')"
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
        'is-multi-dragging': isBeingDragged && !isDragging,
        'drop-target': isDropTarget,
        'in-scrivening-selection': isInScriveningSelection,
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
      @dragover.prevent.stop="handleDragOver($event, 'inside')"
      @dragleave.stop="handleDragLeave('inside')"
      @drop.stop="handleDrop($event, 'inside')"
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
        <div v-else class="expansion-spacer" />

        <!-- Node Icon -->
        <VIcon
          :icon="node.icon"
          size="16"
          class="node-icon"
          :color="getIconColor()"
        />

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
    </div>

    <!-- Drop Zone Below -->
    <div
      v-if="showDropZoneBelow"
      class="drop-zone drop-zone-below"
      @drop.stop="handleDrop($event, 'below')"
      @dragover.prevent.stop="handleDragOver($event, 'below')"
      @dragleave.stop="handleDragLeave('below')"
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
        :dragging-node-ids="draggingNodeIds"
        :selection-mode="selectionMode"
        :scrivening-selections="scriveningSelections"
        :all-nodes="allNodes"
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
</template>

<script setup lang="ts">
import { computed, ref, watch, nextTick, onBeforeUnmount } from "vue";
import { useDragAndDrop, isDropResultMulti } from "@/composables/useDragAndDrop";
import { useManuscriptStore } from "@/stores/manuscript";
import { useSelectionStore } from "@/stores/selection";
import type { DropPosition, DropResult, DropResultMulti } from "@/composables/useDragAndDrop";

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
}

const props = withDefaults(defineProps<Props>(), {
  level: 0,
  showMetadata: false,
  selectionMode: false,
  scriveningSelections: () => new Set(),
  draggingNodeIds: () => new Set(),
  allNodes: () => [],
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
  dropPosition,
  draggingIds,
  handleDragStart: dragStart,
  handleDragStartMulti: dragStartMulti,
  handleDragEnd: dragEnd,
  handleDragOver: dragOver,
  handleDragLeave: dragLeave,
  handleDrop: drop,
} = useDragAndDrop();

// Computed properties
const hasChildren = computed(() => props.node.children.length > 0);
const isExpanded = computed(() => props.expandedNodes.has(props.node.id));
// isSelected now checks BOTH the navigation selection AND the multi-select store
const isNavigationSelected = computed(() => props.selectedNode === props.node.id);
const isMultiSelected = computed(() => selectionStore.isSelected(props.node.id));
const isSelected = computed(() => isNavigationSelected.value || isMultiSelected.value);
const isInScriveningSelection = computed(
  () => props.scriveningSelections?.has(props.node.id) || false,
);

// Show drop zones when dragging
// Track local hover state for this specific node
const localDropPosition = ref<DropPosition>(null);

// Check if this node is being dragged (single or multi)
const isBeingDragged = computed(() => {
  // Check props (passed from parent for multi-drag)
  if (props.draggingNodeIds?.has(props.node.id)) return true;
  // Check local composable state
  if (draggingIds.value.has(props.node.id)) return true;
  // Check single drag
  return props.draggingNodeId === props.node.id;
});

const showDropZoneAbove = computed(
  () =>
    (props.draggingNodeId || props.draggingNodeIds?.size) &&
    !isBeingDragged.value &&
    localDropPosition.value === "above",
);

const showDropZoneBelow = computed(
  () =>
    (props.draggingNodeId || props.draggingNodeIds?.size) &&
    !isBeingDragged.value &&
    localDropPosition.value === "below",
);

const isDropTarget = computed(
  () =>
    (props.draggingNodeId || props.draggingNodeIds?.size) &&
    !isBeingDragged.value &&
    localDropPosition.value === "inside",
);

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

const handleDragOver = (event: DragEvent, position: DropPosition) => {
  event.preventDefault();
  event.stopPropagation();

  const allowInside = props.node.type === "folder" || hasChildren.value;
  dragOver(event, props.node.id, position, {
    allowInside,
    preventSelf: true,
  });
  // Update local drop position for this node
  localDropPosition.value = position;
};

const handleDragLeave = (position: DropPosition) => {
  dragLeave(position);
  // Clear local drop position when leaving this node
  if (localDropPosition.value === position) {
    localDropPosition.value = null;
  }
};

const handleDrop = async (event: DragEvent, position: DropPosition) => {
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
  cursor: grab;
  border-radius: 4px;
  transition: background-color 0.2s;
  padding: 6px 8px;
  margin: 2px 0;

  &:active {
    cursor: grabbing;
  }

  &.is-loading {
    opacity: 0.6;
  }

  &.is-dragging,
  &.is-multi-dragging {
    opacity: 0.7;
    background-color: rgba(59, 130, 246, 0.1);
  }

  &.is-selected {
    background-color: rgba(59, 130, 246, 0.1);
    border: 1px solid rgba(59, 130, 246, 0.3);
  }

  &.in-scrivening-selection {
    background-color: rgba(59, 130, 246, 0.15);
    border-left: 3px solid #3b82f6;

    .node-title {
      font-weight: 500;
    }
  }

  &:hover {
    background-color: rgba(0, 0, 0, 0.05);

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

  &.drop-target {
    background-color: rgba(59, 130, 246, 0.15);
    border: 2px dashed #3b82f6;
    border-radius: 4px;
  }
}

.drop-zone {
  position: relative;
  height: 8px;
  margin: 2px 0;
  z-index: 10;

  &::before {
    content: "";
    position: absolute;
    left: 0;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
    height: 3px;
    background-color: #3b82f6;
    box-shadow: 0 0 6px rgba(59, 130, 246, 0.6);
    border-radius: 2px;
  }

  &.drop-zone-above {
    margin-bottom: 2px;
  }

  &.drop-zone-below {
    margin-top: 2px;
  }
}

.child-nodes {
  margin-left: 0;
}
</style>
