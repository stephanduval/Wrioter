<template>
  <div class="split-view-manager" :class="{ 'is-dragging': isDragging }">
    <!-- Toolbar -->
    <div class="split-view-toolbar">
      <div class="toolbar-left">
        <VBtn
          size="small"
          variant="text"
          @click="splitActive('vertical')"
          :disabled="!focusedPaneId"
        >
          <VIcon icon="mdi-view-split-vertical" />
          Split Vertical
        </VBtn>
        <VBtn
          size="small"
          variant="text"
          @click="splitActive('horizontal')"
          :disabled="!focusedPaneId"
        >
          <VIcon icon="mdi-view-split-horizontal" />
          Split Horizontal
        </VBtn>
      </div>

      <div class="toolbar-center">
        <VBtnToggle
          v-model="selectedPreset"
          variant="outlined"
          density="compact"
          divided
        >
          <VBtn value="single" @click="applyPreset('single')">
            <VIcon icon="mdi-square-outline" />
          </VBtn>
          <VBtn value="vertical" @click="applyPreset('vertical')">
            <VIcon icon="mdi-view-column-outline" />
          </VBtn>
          <VBtn value="horizontal" @click="applyPreset('horizontal')">
            <VIcon icon="mdi-view-row-outline" />
          </VBtn>
          <VBtn value="grid" @click="applyPreset('grid')">
            <VIcon icon="mdi-view-grid-outline" />
          </VBtn>
        </VBtnToggle>
      </div>

      <div class="toolbar-right">
        <VBtn
          size="small"
          variant="text"
          @click="saveCurrentLayout"
        >
          <VIcon icon="mdi-content-save" />
          Save Layout
        </VBtn>
      </div>
    </div>

    <!-- Split Container -->
    <div class="split-view-content">
      <SplitContainer
        :node="layout"
        :panes="panes"
        @focus="handlePaneFocus"
        @close="handlePaneClose"
        @split="handlePaneSplit"
        @resize="handleResize"
      />
    </div>

    <!-- Tab Drag Overlay -->
    <TabDragOverlay
      v-if="isDragging && draggedTab"
      :tab="draggedTab"
      :pointer-position="pointerPosition"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute } from 'vue-router'
import { useSplitViewStore } from '@/stores/splitView'
import SplitContainer from './SplitContainer.vue'
import TabDragOverlay from './TabDragOverlay.vue'
import { layoutPresets } from '@/config/layoutPresets'

const route = useRoute()
const store = useSplitViewStore()
const {
  layout,
  panes,
  focusedPaneId,
  isDragging,
  draggedTab
} = storeToRefs(store)

const selectedPreset = ref('single')
const pointerPosition = ref({ x: 0, y: 0 })

// Handle pointer move for tab dragging
function handlePointerMove(event: PointerEvent) {
  pointerPosition.value = {
    x: event.clientX,
    y: event.clientY
  }
}

// Split active pane
function splitActive(direction: 'horizontal' | 'vertical') {
  if (focusedPaneId.value) {
    store.splitPane(focusedPaneId.value, direction)
  }
}

// Apply layout preset
function applyPreset(presetId: string) {
  const preset = layoutPresets[presetId]
  if (preset) {
    store.applyPreset(preset)
    selectedPreset.value = presetId
  }
}

// Event handlers
function handlePaneFocus(paneId: string) {
  store.focusPane(paneId)
}

function handlePaneClose(paneId: string) {
  store.closePane(paneId)
}

function handlePaneSplit(paneId: string, direction: 'horizontal' | 'vertical') {
  store.splitPane(paneId, direction)
}

function handleResize(nodeId: string, sizes: number[]) {
  store.updateNodeSizes(nodeId, sizes)
}

// Save current layout
async function saveCurrentLayout() {
  const manuscriptId = route.params.manuscriptId as string
  if (manuscriptId) {
    try {
      await store.saveLayout(manuscriptId, 'Custom Layout')
      // TODO: Show success notification
    } catch (error) {
      // TODO: Show error notification
      console.error('Failed to save layout:', error)
    }
  }
}

// Keyboard shortcuts
function handleKeydown(event: KeyboardEvent) {
  const isMeta = event.metaKey || event.ctrlKey

  if (isMeta) {
    // Handle different key codes for minus/underscore
    if (event.key === '-' || event.key === '_' || event.code === 'Minus') {
      event.preventDefault()
      splitActive('horizontal')
      return
    }

    // Handle backslash/pipe
    if (event.key === '\\' || event.key === '|' || event.code === 'Backslash') {
      event.preventDefault()
      splitActive('vertical')
      return
    }

    // Handle close pane
    if ((event.key === 'w' || event.key === 'W') && focusedPaneId.value && store.paneCount > 1) {
      event.preventDefault()
      store.closePane(focusedPaneId.value)
      return
    }
  }
}

onMounted(() => {
  document.addEventListener('pointermove', handlePointerMove)
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('pointermove', handlePointerMove)
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<style lang="scss" scoped>
.split-view-manager {
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;

  &.is-dragging {
    cursor: grabbing;
  }
}

.split-view-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
  border-bottom: 1px solid rgba(var(--v-border-color), 0.12);
  background: rgb(var(--v-theme-surface));

  .toolbar-left,
  .toolbar-center,
  .toolbar-right {
    display: flex;
    align-items: center;
    gap: 8px;
  }
}

.split-view-content {
  flex: 1;
  position: relative;
  overflow: hidden;
}
</style>
