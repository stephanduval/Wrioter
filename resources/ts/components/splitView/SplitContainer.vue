<template>
  <div
    v-if="node.type === 'pane'"
    class="split-pane"
    :class="{ 'is-focused': pane?.focused }"
    @click="$emit('focus', node.paneId)"
  >
    <PaneContainer
      v-if="pane"
      :pane="pane"
      @close="$emit('close', node.paneId)"
      @split="(dir) => $emit('split', node.paneId, dir)"
      @tab-add="handleTabAdd"
      @tab-close="handleTabClose"
      @tab-select="handleTabSelect"
      @tab-drag-start="handleTabDragStart"
      @tab-drag-end="handleTabDragEnd"
      @tab-drop="handleTabDrop"
    />
  </div>

  <div
    v-else-if="node.type === 'container'"
    class="split-container"
    :class="`split-${node.orientation}`"
    ref="containerRef"
  >
    <template v-for="(child, index) in node.children" :key="child.id">
      <SplitContainer
        :node="child"
        :panes="panes"
        :style="{ flex: `${child.size} 1 0%` }"
        @focus="$emit('focus', $event)"
        @close="$emit('close', $event)"
        @split="$emit('split', $event)"
        @resize="$emit('resize', $event)"
      />

      <!-- Gutter/Divider -->
      <div
        v-if="index < node.children!.length - 1"
        class="gutter"
        :class="`gutter-${node.orientation}`"
        @mousedown="startResize($event, index)"
      >
        <div class="gutter-handle"></div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useSplitViewStore } from '@/stores/splitView'
import PaneContainer from './PaneContainer.vue'
import type { SplitNode, Pane } from '@/types/splitView'

const props = defineProps<{
  node: SplitNode
  panes: Map<string, Pane>
}>()

const emit = defineEmits<{
  focus: [paneId: string]
  close: [paneId: string]
  split: [paneId: string, direction: 'horizontal' | 'vertical']
  resize: [nodeId: string, sizes: number[]]
}>()

const store = useSplitViewStore()
const containerRef = ref<HTMLElement>()
const isResizing = ref(false)
const resizeStartPos = ref(0)
const resizeIndex = ref(0)

const pane = computed(() =>
  props.node.type === 'pane' && props.node.paneId
    ? props.panes.get(props.node.paneId)
    : null
)

// Resize handling
function startResize(event: MouseEvent, index: number) {
  event.preventDefault()
  isResizing.value = true
  resizeIndex.value = index

  const isHorizontal = props.node.orientation === 'horizontal'
  resizeStartPos.value = isHorizontal ? event.clientX : event.clientY

  document.addEventListener('mousemove', handleResize)
  document.addEventListener('mouseup', stopResize)
  document.body.style.cursor = isHorizontal ? 'col-resize' : 'row-resize'
}

function handleResize(event: MouseEvent) {
  if (!isResizing.value || !containerRef.value || !props.node.children) return

  const isHorizontal = props.node.orientation === 'horizontal'
  const currentPos = isHorizontal ? event.clientX : event.clientY
  const delta = currentPos - resizeStartPos.value

  const containerSize = isHorizontal
    ? containerRef.value.offsetWidth
    : containerRef.value.offsetHeight

  const deltaPercent = (delta / containerSize) * 100

  const children = props.node.children
  const leftChild = children[resizeIndex.value]
  const rightChild = children[resizeIndex.value + 1]

  const newLeftSize = Math.max(10, Math.min(90, leftChild.size + deltaPercent))
  const newRightSize = Math.max(10, Math.min(90, rightChild.size - deltaPercent))

  // Update sizes
  const newSizes = children.map((child, idx) => {
    if (idx === resizeIndex.value) return newLeftSize
    if (idx === resizeIndex.value + 1) return newRightSize
    return child.size
  })

  emit('resize', props.node.id, newSizes)
  resizeStartPos.value = currentPos
}

function stopResize() {
  isResizing.value = false
  document.removeEventListener('mousemove', handleResize)
  document.removeEventListener('mouseup', stopResize)
  document.body.style.cursor = ''
}

// Tab management handlers
function handleTabAdd(itemId: string) {
  if (props.node.paneId) {
    store.addTab(props.node.paneId, {
      type: 'editor',
      itemId,
      title: 'New Document',
      isDirty: false,
      isPinned: false,
      isLoading: false
    })
  }
}

function handleTabClose(tabId: string) {
  if (props.node.paneId) {
    store.closeTab(props.node.paneId, tabId)
  }
}

function handleTabSelect(tabId: string) {
  if (props.node.paneId && pane.value) {
    pane.value.activeTabId = tabId
  }
}

function handleTabDragStart(tabId: string) {
  const tab = pane.value?.tabs.find(t => t.id === tabId)
  if (tab) {
    store.isDragging = true
    store.draggedTab = tab
  }
}

function handleTabDragEnd() {
  store.isDragging = false
  store.draggedTab = null
}

function handleTabDrop(targetPaneId: string, targetIndex: number) {
  if (store.draggedTab && props.node.paneId) {
    store.moveTab(
      store.draggedTab.id,
      props.node.paneId,
      targetPaneId,
      targetIndex
    )
  }
}
</script>

<style lang="scss" scoped>
.split-pane {
  width: 100%;
  height: 100%;
  position: relative;
  border: 2px solid transparent;
  transition: border-color 0.2s;

  &.is-focused {
    border-color: rgb(var(--v-theme-primary));
  }

  &:hover {
    border-color: rgba(var(--v-theme-primary), 0.3);
  }
}

.split-container {
  width: 100%;
  height: 100%;
  display: flex;

  &.split-horizontal {
    flex-direction: row;
  }

  &.split-vertical {
    flex-direction: column;
  }
}

.gutter {
  background-color: rgba(var(--v-border-color), 0.12);
  position: relative;
  transition: background-color 0.2s;
  z-index: 1;

  &:hover {
    background-color: rgba(var(--v-theme-primary), 0.3);
  }

  &.gutter-horizontal {
    cursor: col-resize;
    width: 4px;
    min-width: 4px;
  }

  &.gutter-vertical {
    cursor: row-resize;
    height: 4px;
    min-height: 4px;
  }
}

.gutter-handle {
  position: absolute;
  background: rgba(var(--v-theme-on-surface), 0.2);
  border-radius: 2px;
}

.gutter-horizontal .gutter-handle {
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 2px;
  height: 30px;
}

.gutter-vertical .gutter-handle {
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 30px;
  height: 2px;
}
</style>
