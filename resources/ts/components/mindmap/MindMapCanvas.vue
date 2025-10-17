<template>
  <div class="mindmap-canvas">
    <VueFlow
      ref="vueFlowRef"
      v-model:nodes="modelNodes"
      v-model:edges="modelEdges"
      :node-types="nodeTypes"
      :edge-types="edgeTypes"
      :default-viewport="{ x: 0, y: 0, zoom: 1 }"
      :min-zoom="0.1"
      :max-zoom="4"
      @nodes-change="onNodesChange"
      @edges-change="onEdgesChange"
      @node-click="onNodeClick"
      @edge-click="onEdgeClick"
      @connect="onConnect"
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
          <Handle type="target" position="top" />
          <div class="node-content">
            <div class="node-label">{{ data.label }}</div>
            <div v-if="data.content" class="node-description">
              {{ data.content }}
            </div>
          </div>
          <Handle type="source" position="bottom" />
        </div>
      </template>

      <template #node-text="{ data }">
        <div class="vue-flow__node-text">
          <Handle type="target" position="top" />
          <VIcon class="node-icon">bx-file-blank</VIcon>
          <div class="node-label">{{ data.label }}</div>
          <Handle type="source" position="bottom" />
        </div>
      </template>

      <template #node-folder="{ data }">
        <div class="vue-flow__node-folder">
          <Handle type="target" position="top" />
          <VIcon class="node-icon" color="primary">bx-folder</VIcon>
          <div class="node-label">{{ data.label }}</div>
          <Handle type="source" position="bottom" />
        </div>
      </template>

      <template #node-character="{ data }">
        <div class="vue-flow__node-character">
          <Handle type="target" position="top" />
          <VIcon class="node-icon" color="info">bx-user</VIcon>
          <div class="node-label">{{ data.label }}</div>
          <Handle type="source" position="bottom" />
        </div>
      </template>

      <template #node-research="{ data }">
        <div class="vue-flow__node-research">
          <Handle type="target" position="top" />
          <VIcon class="node-icon" color="warning">bx-bulb</VIcon>
          <div class="node-label">{{ data.label }}</div>
          <Handle type="source" position="bottom" />
        </div>
      </template>

      <!-- Custom Edge Types -->
      <template #edge-bidirectional="edgeProps">
        <BidirectionalEdge v-bind="edgeProps" />
      </template>

      <template #edge-labeled="edgeProps">
        <LabeledEdge v-bind="edgeProps" />
      </template>
    </VueFlow>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { VueFlow, Handle, Background, Controls, MiniMap, useVueFlow } from '@vue-flow/core'
import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'
import BidirectionalEdge from './edges/BidirectionalEdge.vue'
import LabeledEdge from './edges/LabeledEdge.vue'

// Props & Emits
const props = defineProps<{
  nodes: any[]
  edges: any[]
}>()

const emit = defineEmits<{
  'nodes-change': [nodes: any[]]
  'edges-change': [edges: any[]]
  'node-click': [event: MouseEvent, node: any]
  'edge-click': [event: MouseEvent, edge: any]
  'connect': [params: any]
  'node-context-menu': [event: MouseEvent, node: any]
  'pane-context-menu': [event: MouseEvent]
  'update:nodes': [nodes: any[]]
  'update:edges': [edges: any[]]
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
  get: () => props.edges,
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
  bidirectional: 'bidirectional',
  labeled: 'labeled',
}

// Event handlers
const onNodesChange = (changes: any[]) => {
  emit('nodes-change', changes)
}

const onEdgesChange = (changes: any[]) => {
  emit('edges-change', changes)
}

const onNodeClick = (event: MouseEvent, node: any) => {
  emit('node-click', event, node)
}

const onEdgeClick = (event: MouseEvent, edge: any) => {
  emit('edge-click', event, edge)
}

const onConnect = (params: any) => {
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
})
</script>

<style>
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