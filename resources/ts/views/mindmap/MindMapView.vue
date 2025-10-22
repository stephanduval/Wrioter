<template>
  <div class="mindmap-view">
    <VCard>
      <VCardTitle class="d-flex align-center justify-space-between">
        <div class="d-flex align-center gap-2">
          <VBtn
            icon
            size="small"
            variant="text"
            @click="router.back()"
          >
            <VIcon>bx-arrow-back</VIcon>
          </VBtn>
          <span>{{ currentMindmap?.title || 'Mind Map' }}</span>
        </div>

        <div class="d-flex gap-2">
          <VBtn
            color="primary"
            variant="tonal"
            @click="handleAddNode"
          >
            <VIcon start>bx-plus</VIcon>
            Add Node
          </VBtn>
          <VBtn
            color="success"
            variant="tonal"
            @click="handleSave"
            :loading="saving"
          >
            <VIcon start>bx-save</VIcon>
            Save
          </VBtn>
          <VBtn
            variant="tonal"
            @click="handleExport"
          >
            <VIcon start>bx-download</VIcon>
            Export
          </VBtn>
        </div>
      </VCardTitle>

      <VCardText>
        <div v-if="loading" class="text-center py-10">
          <VProgressCircular indeterminate color="primary" />
          <p class="mt-4">Loading mind map...</p>
        </div>

        <div v-else-if="error" class="text-center py-10">
          <VIcon size="64" color="error">bx-error-circle</VIcon>
          <p class="mt-4 text-error">{{ error }}</p>
          <VBtn class="mt-4" @click="loadMindmap">Retry</VBtn>
        </div>

        <div v-else class="mindmap-canvas">
          <!-- Simple node display for now -->
          <div class="nodes-grid">
            <VCard
              v-for="node in nodes"
              :key="node.id"
              class="node-card ma-2"
              :class="{ 'node-selected': selectedNode?.id === node.id }"
              @click="selectNode(node)"
            >
              <VCardText>
                <div class="d-flex align-center justify-space-between">
                  <span class="font-weight-medium">{{ node.data.label }}</span>
                  <VBtn
                    icon
                    size="x-small"
                    variant="text"
                    color="error"
                    @click.stop="deleteNode(node)"
                  >
                    <VIcon size="18">bx-trash</VIcon>
                  </VBtn>
                </div>
                <p v-if="node.data.content" class="text-sm mt-2">
                  {{ node.data.content }}
                </p>
              </VCardText>
            </VCard>
          </div>

          <div v-if="nodes.length === 0" class="text-center py-10">
            <VIcon size="64" color="grey">bx-network-chart</VIcon>
            <p class="mt-4 text-grey">No nodes yet. Add your first node to get started!</p>
          </div>
        </div>
      </VCardText>
    </VCard>

    <!-- Node Dialog -->
    <VDialog v-model="nodeDialog.visible" max-width="500">
      <VCard>
        <VCardTitle>
          {{ nodeDialog.isNew ? 'Add Node' : 'Edit Node' }}
        </VCardTitle>
        <VCardText>
          <VTextField
            v-model="nodeDialog.data.label"
            label="Label"
            variant="outlined"
            class="mb-4"
          />
          <VTextarea
            v-model="nodeDialog.data.content"
            label="Content"
            variant="outlined"
            rows="3"
          />
        </VCardText>
        <VCardActions>
          <VSpacer />
          <VBtn variant="text" @click="nodeDialog.visible = false">Cancel</VBtn>
          <VBtn color="primary" variant="flat" @click="saveNode">Save</VBtn>
        </VCardActions>
      </VCard>
    </VDialog>

    <!-- Export Dialog -->
    <VDialog v-model="exportDialog.visible" max-width="500">
      <VCard>
        <VCardTitle>Export Mind Map</VCardTitle>
        <VCardText>
          <VSelect
            v-model="exportDialog.format"
            label="Export Format"
            :items="exportFormats"
            variant="outlined"
          />
        </VCardText>
        <VCardActions>
          <VSpacer />
          <VBtn variant="text" @click="exportDialog.visible = false">Cancel</VBtn>
          <VBtn color="primary" variant="flat" @click="confirmExport">Export</VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMindmapStore as useMindMapStore } from '@/stores/mindmap'
import { useToast } from 'vue-toastification'

const route = useRoute()
const router = useRouter()
const mindmapStore = useMindMapStore()
const toast = useToast()

// State
const loading = ref(false)
const saving = ref(false)
const error = ref<string | null>(null)
const selectedNode = ref(null)
const currentMindmap = ref(null)
const nodes = ref([])
const edges = ref([])

const nodeDialog = ref({
  visible: false,
  isNew: true,
  data: {
    label: '',
    content: '',
  },
})

const exportDialog = ref({
  visible: false,
  format: 'json',
})

const exportFormats = [
  { title: 'JSON', value: 'json' },
  { title: 'GraphML', value: 'graphml' },
  { title: 'Markdown', value: 'markdown' },
]

// Methods
const loadMindmap = async () => {
  loading.value = true
  error.value = null

  try {
    const id = route.params.id
    const data = await mindmapStore.loadMindmap(id)
    currentMindmap.value = data.mindmap
    nodes.value = mindmapStore.nodes
    edges.value = mindmapStore.edges
  } catch (err: any) {
    console.error('Error loading mindmap:', err)
    error.value = err.message || 'Failed to load mind map'
    toast.error('Failed to load mind map')
  } finally {
    loading.value = false
  }
}

const handleAddNode = () => {
  nodeDialog.value = {
    visible: true,
    isNew: true,
    data: {
      label: '',
      content: '',
    },
  }
  selectedNode.value = null
}

const selectNode = (node: any) => {
  selectedNode.value = node
  nodeDialog.value = {
    visible: true,
    isNew: false,
    data: {
      label: node.data.label,
      content: node.data.content || '',
    },
  }
}

const saveNode = async () => {
  try {
    if (nodeDialog.value.isNew) {
      // Create new item in mindmap
      await mindmapStore.createNewItem({
        type: 'text',
        title: nodeDialog.value.data.label,
        content: nodeDialog.value.data.content,
        position: { x: Math.random() * 400, y: Math.random() * 400 },
      })
      toast.success('Item added successfully')
    } else {
      // Note: Item content updates would go through the items API
      // For now, we just update the local display
      // TODO: Add item update endpoint integration
      toast.info('Item editing coming soon')
    }

    nodes.value = mindmapStore.nodes
    nodeDialog.value.visible = false
  } catch (err: any) {
    console.error('Error saving node:', err)
    toast.error('Failed to save item')
  }
}

const deleteNode = async (node: any) => {
  if (!confirm('Are you sure you want to remove this item from the mind map?')) return

  try {
    await mindmapStore.removeItemFromMindmap(node.id)
    nodes.value = mindmapStore.nodes
    toast.success('Item removed from mind map')
  } catch (err: any) {
    console.error('Error removing item:', err)
    toast.error('Failed to remove item')
  }
}

const handleSave = async () => {
  saving.value = true

  try {
    // Positions are auto-saved when created/moved
    // This button could be used for batch updates if needed
    toast.success('All changes are automatically saved')
  } catch (err: any) {
    console.error('Error saving mindmap:', err)
    toast.error('Failed to save mind map')
  } finally {
    saving.value = false
  }
}

const handleExport = () => {
  exportDialog.value.visible = true
}

const confirmExport = async () => {
  try {
    const data = await mindmapStore.exportMindmap(exportDialog.value.format)

    // Create download
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${currentMindmap.value?.title || 'mindmap'}.${exportDialog.value.format}`
    a.click()
    URL.revokeObjectURL(url)

    toast.success('Mind map exported successfully')
    exportDialog.value.visible = false
  } catch (err: any) {
    console.error('Error exporting mindmap:', err)
    toast.error('Failed to export mind map')
  }
}

// Lifecycle
onMounted(() => {
  loadMindmap()
})
</script>

<style scoped>
.mindmap-view {
  height: 100%;
}

.mindmap-canvas {
  min-height: 500px;
}

.nodes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
  padding: 1rem;
}

.node-card {
  cursor: pointer;
  transition: all 0.2s;
  border: 2px solid transparent;
}

.node-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.node-selected {
  border-color: rgb(var(--v-theme-primary));
}
</style>
