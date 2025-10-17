<template>
  <div class="simple-split-wrapper">
    <div
      v-if="layout.type === 'container'"
      class="split-container"
      :class="`split-${layout.orientation}`"
      ref="containerRef"
    >
      <template v-for="(child, index) in layout.children" :key="child.id">
        <!-- Render child panes -->
        <div
          v-if="child.type === 'pane'"
          class="split-pane"
          :style="{ flex: `${child.size} 1 0%` }"
        >
          <slot name="pane" :pane-id="child.paneId" :index="index" />
        </div>

        <!-- Render nested containers recursively -->
        <SimpleSplitWrapper
          v-else-if="child.type === 'container'"
          :layout="child"
          :style="{ flex: `${child.size} 1 0%` }"
        >
          <template #pane="slotProps">
            <slot name="pane" v-bind="slotProps" />
          </template>
        </SimpleSplitWrapper>

        <!-- Gutter/Divider between panes -->
        <div
          v-if="index < layout.children!.length - 1"
          class="gutter"
          :class="`gutter-${layout.orientation}`"
          @mousedown="startResize($event, index)"
        >
          <div class="gutter-handle"></div>
        </div>
      </template>
    </div>

    <!-- Single pane mode -->
    <div v-else-if="layout.type === 'pane'" class="split-pane single-pane">
      <slot name="pane" :pane-id="layout.paneId" :index="0" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { SplitNode } from '@/types/splitView'
import { useFolderViewStore } from '@/stores/folderView'

const props = defineProps<{
  layout: SplitNode
}>()

const folderViewStore = useFolderViewStore()
const containerRef = ref<HTMLElement>()
const isResizing = ref(false)
const resizeStartPos = ref(0)
const resizeIndex = ref(0)
const initialSizes = ref<number[]>([])

// Handle resize start
function startResize(event: MouseEvent, index: number) {
  if (!containerRef.value || !props.layout.children) return

  isResizing.value = true
  resizeIndex.value = index

  const isHorizontal = props.layout.orientation === 'horizontal'
  resizeStartPos.value = isHorizontal ? event.clientX : event.clientY

  // Store initial sizes
  initialSizes.value = props.layout.children.map(child => child.size)

  // Add event listeners
  document.addEventListener('mousemove', handleResize)
  document.addEventListener('mouseup', stopResize)

  // Prevent text selection
  event.preventDefault()
  document.body.style.userSelect = 'none'
  document.body.style.cursor = isHorizontal ? 'col-resize' : 'row-resize'
}

// Handle resize move
function handleResize(event: MouseEvent) {
  if (!isResizing.value || !containerRef.value || !props.layout.children) return

  const isHorizontal = props.layout.orientation === 'horizontal'
  const currentPos = isHorizontal ? event.clientX : event.clientY
  const containerSize = isHorizontal
    ? containerRef.value.offsetWidth
    : containerRef.value.offsetHeight

  const delta = ((currentPos - resizeStartPos.value) / containerSize) * 100

  // Update sizes
  const newSizes = [...initialSizes.value]
  newSizes[resizeIndex.value] += delta
  newSizes[resizeIndex.value + 1] -= delta

  // Ensure minimum size (10%)
  if (newSizes[resizeIndex.value] >= 10 && newSizes[resizeIndex.value + 1] >= 10) {
    // Update the layout
    props.layout.children[resizeIndex.value].size = newSizes[resizeIndex.value]
    props.layout.children[resizeIndex.value + 1].size = newSizes[resizeIndex.value + 1]

    // Save to store
    folderViewStore.updateSplitLayout(props.layout)
  }
}

// Handle resize end
function stopResize() {
  isResizing.value = false
  document.removeEventListener('mousemove', handleResize)
  document.removeEventListener('mouseup', stopResize)
  document.body.style.userSelect = ''
  document.body.style.cursor = ''
}
</script>

<style scoped>
.simple-split-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.split-container {
  display: flex;
  width: 100%;
  height: 100%;
  position: relative;
}

.split-container.split-horizontal {
  flex-direction: row;
}

.split-container.split-vertical {
  flex-direction: column;
}

.split-pane {
  position: relative;
  overflow: auto;
  min-width: 0;
  min-height: 0;
}

.split-pane.single-pane {
  width: 100%;
  height: 100%;
}

/* Gutter styles */
.gutter {
  position: relative;
  flex-shrink: 0;
  background-color: rgb(var(--v-theme-surface-variant));
  transition: background-color 0.2s;
}

.gutter:hover {
  background-color: rgb(var(--v-theme-primary));
}

.gutter-horizontal {
  width: 4px;
  cursor: col-resize;
}

.gutter-vertical {
  height: 4px;
  cursor: row-resize;
}

.gutter-handle {
  position: absolute;
  inset: 0;
}

/* Hover area for easier grabbing */
.gutter-horizontal::before {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  left: -4px;
  right: -4px;
  cursor: col-resize;
}

.gutter-vertical::before {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  top: -4px;
  bottom: -4px;
  cursor: row-resize;
}
</style>