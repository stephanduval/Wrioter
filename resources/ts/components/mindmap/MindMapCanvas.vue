<template>
  <div class="mindmap-canvas">
    <VueFlow
      ref="vueFlowRef"
      v-model:nodes="modelNodes"
      v-model:edges="modelEdges"
      :node-types="nodeTypes"
      :default-viewport="{ x: 0, y: 0, zoom: 1 }"
      :min-zoom="0.1"
      :max-zoom="4"
      :connect-on-click="false"
      :edges-updatable="true"
      @nodes-change="onNodesChange"
      @edges-change="onEdgesChange"
      @node-click="onNodeClick"
      @edge-click="onEdgeClick"
      @connect="onConnect"
      @node-double-click="onNodeDoubleClick"
      @node-context-menu="onNodeContextMenu"
      @pane-context-menu="onPaneContextMenu"
      @node-drag-stop="onNodeDragStop"
    >
      <!-- Background -->
      <Background variant="dots" :gap="16" />

      <!-- Controls -->
      <Controls position="bottom-right" />

      <!-- MiniMap -->
      <MiniMap position="top-right" />

      <!-- Custom Node Types -->
      <template #node-default="{ data, id }">
        <div class="vue-flow__node-default">
          <Handle type="target" position="top" :connectable="true" />
          <div class="node-content">
            <input
              v-if="editingNodeId === id"
              class="node-label-input"
              :value="data.label"
              @blur="finishEditing(id, ($event.target as HTMLInputElement).value)"
              @keydown.enter="($event.target as HTMLInputElement).blur()"
              @keydown.escape="cancelEditing"
              @click.stop
              @mousedown.stop
            />
            <div v-else class="node-label" @click.stop="startEditing(id)">{{ data.label }}</div>
            <div v-if="data.content" class="node-description">
              {{ data.content }}
            </div>
          </div>
          <Handle type="source" position="bottom" :connectable="true" />
        </div>
      </template>

      <template #node-text="{ data, id }">
        <div class="vue-flow__node-text">
          <Handle type="target" position="top" :connectable="true" />
          <VIcon class="node-icon">bx-file-blank</VIcon>
          <input
            v-if="editingNodeId === id"
            class="node-label-input"
            :value="data.label"
            @blur="finishEditing(id, ($event.target as HTMLInputElement).value)"
            @keydown.enter="($event.target as HTMLInputElement).blur()"
            @keydown.escape="cancelEditing"
            @click.stop
            @mousedown.stop
          />
          <div v-else class="node-label" @click.stop="startEditing(id)">{{ data.label }}</div>
          <Handle type="source" position="bottom" :connectable="true" />
        </div>
      </template>

      <template #node-folder="{ data, id }">
        <div class="vue-flow__node-folder">
          <Handle type="target" position="top" :connectable="true" />
          <VIcon class="node-icon" color="primary">bx-folder</VIcon>
          <input
            v-if="editingNodeId === id"
            class="node-label-input"
            :value="data.label"
            @blur="finishEditing(id, ($event.target as HTMLInputElement).value)"
            @keydown.enter="($event.target as HTMLInputElement).blur()"
            @keydown.escape="cancelEditing"
            @click.stop
            @mousedown.stop
          />
          <div v-else class="node-label" @click.stop="startEditing(id)">{{ data.label }}</div>
          <Handle type="source" position="bottom" :connectable="true" />
        </div>
      </template>

      <template #node-character="{ data, id }">
        <div class="vue-flow__node-character">
          <Handle type="target" position="top" :connectable="true" />
          <VIcon class="node-icon" color="info">bx-user</VIcon>
          <input
            v-if="editingNodeId === id"
            class="node-label-input"
            :value="data.label"
            @blur="finishEditing(id, ($event.target as HTMLInputElement).value)"
            @keydown.enter="($event.target as HTMLInputElement).blur()"
            @keydown.escape="cancelEditing"
            @click.stop
            @mousedown.stop
          />
          <div v-else class="node-label" @click.stop="startEditing(id)">{{ data.label }}</div>
          <Handle type="source" position="bottom" :connectable="true" />
        </div>
      </template>

      <template #node-research="{ data, id }">
        <div class="vue-flow__node-research">
          <Handle type="target" position="top" :connectable="true" />
          <VIcon class="node-icon" color="warning">bx-bulb</VIcon>
          <input
            v-if="editingNodeId === id"
            class="node-label-input"
            :value="data.label"
            @blur="finishEditing(id, ($event.target as HTMLInputElement).value)"
            @keydown.enter="($event.target as HTMLInputElement).blur()"
            @keydown.escape="cancelEditing"
            @click.stop
            @mousedown.stop
          />
          <div v-else class="node-label" @click.stop="startEditing(id)">{{ data.label }}</div>
          <Handle type="source" position="bottom" :connectable="true" />
        </div>
      </template>

    </VueFlow>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { VueFlow, Handle, useVueFlow } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import { MiniMap } from '@vue-flow/minimap'
import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'

// Props & Emits
const props = defineProps<{
  nodes: any[]
  edges: any[]
}>()

// Watch for edge changes
watch(() => props.edges, (newEdges, oldEdges) => {
  console.log('[MindMapCanvas] edges prop changed:', {
    oldCount: oldEdges?.length,
    newCount: newEdges?.length,
    newEdges: newEdges
  })
}, { deep: true })

const emit = defineEmits<{
  'nodes-change': [nodes: any[]]
  'edges-change': [edges: any[]]
  'node-click': [event: MouseEvent, node: any]
  'node-double-click': [event: MouseEvent, node: any]
  'edge-click': [event: MouseEvent, edge: any]
  'connect': [params: any]
  'node-context-menu': [event: MouseEvent, node: any]
  'pane-context-menu': [event: MouseEvent]
  'update:nodes': [nodes: any[]]
  'update:edges': [edges: any[]]
  'title-updated': [nodeId: string, newTitle: string]
}>()

// Refs
const vueFlowRef = ref(null)
const { fitView, zoomIn, zoomOut, project } = useVueFlow()

// Model binding
const modelNodes = computed({
  get: () => props.nodes,
  set: (value) => emit('update:nodes', value),
})

const modelEdges = computed({
  get: () => {
    console.log('[MindMapCanvas] modelEdges getter called, edges count:', props.edges?.length)
    return props.edges
  },
  set: (value) => emit('update:edges', value),
})

// Node and Edge types
const nodeTypes = {
  default: 'default',
  text: 'text',
  folder: 'folder',
  character: 'character',
  research: 'research',
}

const edgeTypes = {
  default: 'default',
  hierarchy: 'default', // Use default rendering for hierarchy edges
  'one-way': 'default',
  'two-way': 'default',
}

// Inline title editing state
const editingNodeId = ref<string | null>(null)

const startEditing = (nodeId: string) => {
  editingNodeId.value = nodeId
  nextTick(() => {
    // Focus the input after it renders
    const input = document.querySelector('.node-label-input') as HTMLInputElement
    if (input) {
      input.focus()
      input.select()
    }
  })
}

const finishEditing = (nodeId: string, newTitle: string) => {
  if (editingNodeId.value !== nodeId) return
  editingNodeId.value = null
  const trimmed = newTitle.trim()
  if (trimmed) {
    emit('title-updated', nodeId, trimmed)
  }
}

const cancelEditing = () => {
  editingNodeId.value = null
}

// Event handlers
const onNodesChange = (changes: any[]) => {
  emit('nodes-change', changes)
}

const onEdgesChange = (changes: any[]) => {
  emit('edges-change', changes)
}

const onNodeClick = (nodeMouseEvent: { event: MouseEvent; node: any }) => {
  emit('node-click', nodeMouseEvent.event, nodeMouseEvent.node)
}

const onNodeDoubleClick = (nodeMouseEvent: { event: MouseEvent; node: any }) => {
  emit('node-double-click', nodeMouseEvent.event, nodeMouseEvent.node)
}

const onEdgeClick = (event: MouseEvent, edge: any) => {
  emit('edge-click', event, edge)
}

const onConnect = (params: any) => {
  console.log('MindMapCanvas onConnect triggered:', params)
  emit('connect', params)
}

const onNodeContextMenu = (event: MouseEvent, node: any) => {
  emit('node-context-menu', event, node)
}

const onPaneContextMenu = (event: MouseEvent) => {
  emit('pane-context-menu', event)
}

const onNodeDragStop = (event: MouseEvent, node: any) => {
  // Auto-save position after drag
  console.log('Node drag stopped:', node)
}

// Expose methods
defineExpose({
  fitView,
  zoomIn,
  zoomOut,
  project,
  startEditing,
  editingNodeId,
})
</script>

<style scoped>
.mindmap-canvas {
  width: 100%;
  height: 100%;
  background: var(--v-theme-surface);
}

/* Default Node Styles */
.vue-flow__node-default {
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  padding: 10px;
  min-width: 150px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.2s;
}

.vue-flow__node-default:hover {
  border-color: rgb(var(--v-theme-primary));
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.vue-flow__node-default.selected {
  border-color: rgb(var(--v-theme-primary));
  box-shadow: 0 0 0 2px rgba(var(--v-theme-primary-rgb), 0.2);
}

/* Text Node */
.vue-flow__node-text {
  background: #f7f9fc;
  border: 1px solid #cbd5e0;
  border-radius: 6px;
  padding: 8px 12px;
  min-width: 120px;
  text-align: center;
}

/* Folder Node */
.vue-flow__node-folder {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px;
  min-width: 140px;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

/* Character Node */
.vue-flow__node-character {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
  border: none;
  border-radius: 50px;
  padding: 12px 20px;
  min-width: 140px;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

/* Research Node */
.vue-flow__node-research {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
  color: #333;
  border: none;
  border-radius: 8px;
  padding: 10px;
  min-width: 140px;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

/* Node Content */
.node-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.node-label {
  font-weight: 600;
  font-size: 14px;
  color: #333;
  cursor: text;
}

.node-label-input {
  box-sizing: border-box;
  border: 1px solid rgb(var(--v-theme-primary));
  border-radius: 4px;
  background: white;
  color: #333;
  font-size: 14px;
  font-weight: 600;
  inline-size: 100%;
  outline: none;
  padding-block: 2px;
  padding-inline: 4px;
}

.node-description {
  font-size: 12px;
  color: #666;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.node-icon {
  font-size: 24px;
  margin-bottom: 4px;
}

/* Handle Styles */
.vue-flow__handle {
  width: 8px;
  height: 8px;
  background: rgb(var(--v-theme-primary));
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.vue-flow__handle:hover {
  width: 12px;
  height: 12px;
}

/* Edge Styles */
.vue-flow__edge-path {
  stroke: #b1b1b7;
  stroke-width: 2;
}

.vue-flow__edge-path:hover {
  stroke: rgb(var(--v-theme-primary));
  stroke-width: 3;
}

.vue-flow__edge.selected .vue-flow__edge-path {
  stroke: rgb(var(--v-theme-primary));
  stroke-width: 3;
}

/* Hierarchy Edge - solid gray, non-editable */
.vue-flow__edge[data-type="hierarchy"] .vue-flow__edge-path {
  stroke: #999;
  stroke-width: 2;
  stroke-dasharray: 0;
}

.vue-flow__edge[data-type="hierarchy"]:hover .vue-flow__edge-path {
  stroke: #666;
  stroke-width: 2;
}

.vue-flow__edge[data-type="hierarchy"].selected .vue-flow__edge-path {
  stroke: #666;
  stroke-width: 2;
}

/* Custom edges - dashed blue, user-created */
.vue-flow__edge[data-editable="true"] .vue-flow__edge-path {
  stroke: #3b82f6;
  stroke-dasharray: 5, 5;
}

/* Controls */
.vue-flow__controls {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* MiniMap */
.vue-flow__minimap {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style>