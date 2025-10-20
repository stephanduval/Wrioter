<template>
  <div class="manuscript-mindmap h-100">
    <!-- Header -->
    <VCard class="mb-4">
      <VCardTitle class="d-flex align-center justify-space-between">
        <div class="d-flex align-center gap-3">
          <VIcon size="28" color="primary">bx-network-chart</VIcon>
          <div>
            <h3 class="text-h5">
              {{ currentManuscript?.title || 'Manuscript Mind Map' }}
            </h3>
            <p v-if="currentManuscript" class="text-caption text-grey mt-1">
              Default structure visualization • {{ itemCount }} items
            </p>
          </div>
        </div>

        <div class="d-flex gap-2">
          <VChip v-if="currentMindmap?.is_default" color="success" variant="tonal">
            <VIcon start size="16">bx-check-circle</VIcon>
            Auto-synced
          </VChip>

          <VBtn
            color="primary"
            variant="tonal"
            :disabled="!currentManuscript"
            :loading="syncing"
            @click="syncMindmap"
          >
            <VIcon start>bx-sync</VIcon>
            Sync Items
          </VBtn>

          <VBtn
            variant="tonal"
            :disabled="!currentMindmap"
            @click="toggleViewMode"
          >
            <VIcon start>{{ viewMode === 'grid' ? 'bx-network-chart' : 'bx-grid-alt' }}</VIcon>
            {{ viewMode === 'grid' ? 'Canvas' : 'Grid' }}
          </VBtn>
        </div>
      </VCardTitle>
    </VCard>

    <!-- Mindmap Display -->
    <VCard v-if="selectedManuscriptId" style="height: calc(100vh - 250px);">
      <VCardText class="pa-0 h-100">
        <!-- Loading State -->
        <div v-if="loading" class="d-flex align-center justify-center h-100">
          <div class="text-center">
            <VProgressCircular indeterminate color="primary" size="64" />
            <p class="mt-4 text-h6">Loading mindmap for {{ currentManuscript?.title }}...</p>
          </div>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="d-flex align-center justify-center h-100">
          <div class="text-center">
            <VIcon size="64" color="error">bx-error-circle</VIcon>
            <p class="mt-4 text-error">{{ error }}</p>
            <VBtn class="mt-4" color="primary" @click="loadManuscriptMindmap">
              <VIcon start>bx-refresh</VIcon>
              Retry
            </VBtn>
          </div>
        </div>

        <!-- Grid View -->
        <div v-else-if="viewMode === 'grid'" class="mindmap-grid pa-4">
          <TransitionGroup name="grid" tag="div" class="nodes-grid">
            <VCard
              v-for="node in nodes"
              :key="node.id"
              class="node-card"
              :style="getNodeStyle(node)"
              @click="selectNode(node)"
            >
              <VCardText>
                <div class="d-flex align-center justify-space-between mb-2">
                  <VIcon :color="getTypeColor(node.data.itemType)" size="20">
                    {{ getTypeIcon(node.data.itemType) }}
                  </VIcon>
                  <VChip size="x-small" :color="getTypeColor(node.data.itemType)" variant="tonal">
                    {{ node.data.itemType }}
                  </VChip>
                </div>

                <h4 class="font-weight-medium">{{ node.data.label }}</h4>

                <p v-if="node.data.synopsis" class="text-caption mt-2 text-grey">
                  {{ truncateText(node.data.synopsis, 100) }}
                </p>

                <p v-else-if="node.data.content" class="text-caption mt-2 text-grey">
                  {{ truncateText(node.data.content, 100) }}
                </p>

                <div v-if="getItemChildren(node).length > 0" class="mt-3">
                  <VChip size="x-small" variant="outlined">
                    <VIcon start size="14">bx-git-branch</VIcon>
                    {{ getItemChildren(node).length }} children
                  </VChip>
                </div>
              </VCardText>
            </VCard>
          </TransitionGroup>

          <div v-if="nodes.length === 0" class="d-flex align-center justify-center h-100">
            <div class="text-center">
              <VIcon size="64" color="grey">bx-folder-open</VIcon>
              <p class="mt-4 text-grey">No items in this manuscript yet</p>
              <VBtn class="mt-4" color="primary" variant="tonal" @click="addFirstItem">
                <VIcon start>bx-plus</VIcon>
                Add First Item
              </VBtn>
            </div>
          </div>
        </div>

        <!-- Canvas View (placeholder for future Vue Flow implementation) -->
        <div v-else class="mindmap-canvas d-flex align-center justify-center h-100">
          <div class="text-center">
            <VIcon size="64" color="primary">bx-network-chart</VIcon>
            <p class="mt-4 text-h6">Canvas View</p>
            <p class="text-grey">Interactive canvas coming soon!</p>
            <p class="text-caption mt-4">
              Items are positioned using intelligent hierarchical layout
            </p>
          </div>
        </div>
      </VCardText>
    </VCard>

    <!-- No Manuscript Selected -->
    <VCard v-else>
      <VCardText class="text-center py-16">
        <VIcon size="80" color="grey">bx-book</VIcon>
        <p class="mt-6 text-h5">No Manuscript Selected</p>
        <p class="text-grey mt-2 mb-6">Please select a manuscript to view its mind map</p>
        <VBtn color="primary" to="/build/select-manuscript">
          <VIcon start>bx-book-open</VIcon>
          Select Manuscript
        </VBtn>
      </VCardText>
    </VCard>

    <!-- Item Detail Dialog -->
    <VDialog v-model="itemDialog.visible" max-width="600">
      <VCard>
        <VCardTitle class="d-flex align-center">
          <VIcon class="mr-2" :color="getTypeColor(itemDialog.item?.itemType)">
            {{ getTypeIcon(itemDialog.item?.itemType) }}
          </VIcon>
          {{ itemDialog.item?.label }}
        </VCardTitle>

        <VCardText>
          <div v-if="itemDialog.item">
            <VRow>
              <VCol cols="6">
                <p class="text-caption">Type</p>
                <p class="font-weight-medium">{{ itemDialog.item.itemType }}</p>
              </VCol>
              <VCol cols="6">
                <p class="text-caption">ID</p>
                <p class="font-weight-medium">#{{ itemDialog.item.itemId }}</p>
              </VCol>
            </VRow>

            <div v-if="itemDialog.item.synopsis" class="mt-4">
              <p class="text-caption">Synopsis</p>
              <p>{{ itemDialog.item.synopsis }}</p>
            </div>

            <div v-if="itemDialog.item.content" class="mt-4">
              <p class="text-caption">Content Preview</p>
              <VCard variant="outlined" class="pa-3 text-pre-wrap">
                {{ itemDialog.item.content }}
              </VCard>
            </div>
          </div>
        </VCardText>

        <VCardActions>
          <VSpacer />
          <VBtn variant="text" @click="itemDialog.visible = false">Close</VBtn>
          <VBtn color="primary" variant="flat" @click="openInEditor">
            <VIcon start>bx-edit</VIcon>
            Open in Editor
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useMindMapStore } from '@/stores/mindmap'
import { useManuscriptStore } from '@/stores/manuscript'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import axios from '@/../js/axios'

const mindmapStore = useMindMapStore()
const manuscriptStore = useManuscriptStore()
const router = useRouter()
const toast = useToast()

// State
const loading = ref(false)
const syncing = ref(false)
const error = ref<string | null>(null)
const viewMode = ref<'grid' | 'canvas'>('grid')

const itemDialog = ref({
  visible: false,
  item: null as any
})

// Computed - Use the manuscript store's selected manuscript
const selectedManuscriptId = computed(() => manuscriptStore.selectedManuscriptId)
const currentManuscript = computed(() => manuscriptStore.selectedManuscript)
const currentMindmap = computed(() => mindmapStore.currentMindmap)
const nodes = computed(() => mindmapStore.nodes)
const edges = computed(() => mindmapStore.edges)
const itemCount = computed(() => nodes.value.length)

// Watch for manuscript selection changes
watch(selectedManuscriptId, (newId) => {
  console.log('Manuscript selection changed:', newId)
  if (newId) {
    loadManuscriptMindmap()
  } else {
    mindmapStore.reset()
  }
}, { immediate: true })

// Methods

const loadManuscriptMindmap = async () => {
  if (!selectedManuscriptId.value) {
    console.log('No manuscript selected, skipping mindmap load')
    return
  }

  loading.value = true
  error.value = null

  try {
    console.log('Loading default mindmap for manuscript:', selectedManuscriptId.value)
    await mindmapStore.loadManuscriptDefaultMindmap(selectedManuscriptId.value)
    console.log('Mindmap loaded successfully:', nodes.value.length, 'items')
    toast.success(`Loaded mindmap with ${nodes.value.length} items`)
  } catch (err: any) {
    console.error('Error loading manuscript mindmap:', err)
    error.value = err.message || 'Failed to load mindmap'
    toast.error('Failed to load mindmap')
  } finally {
    loading.value = false
  }
}

const syncMindmap = async () => {
  if (!selectedManuscriptId.value) return

  syncing.value = true
  try {
    console.log('Syncing mindmap for manuscript:', selectedManuscriptId.value)
    await axios.post(`/manuscripts/${selectedManuscriptId.value}/sync-mindmap`)

    // Reload the mindmap
    await loadManuscriptMindmap()
    toast.success('Mindmap synced successfully')
  } catch (err: any) {
    console.error('Error syncing mindmap:', err)
    toast.error('Failed to sync mindmap')
  } finally {
    syncing.value = false
  }
}

const toggleViewMode = () => {
  viewMode.value = viewMode.value === 'grid' ? 'canvas' : 'grid'
}

const selectNode = (node: any) => {
  itemDialog.value = {
    visible: true,
    item: node.data
  }
}

const openInEditor = () => {
  if (itemDialog.value.item && selectedManuscriptId.value) {
    // Navigate to item in editor
    router.push(`/manuscripts/${selectedManuscriptId.value}/items/${itemDialog.value.item.itemId}`)
  }
  itemDialog.value.visible = false
}

// Utility functions

const getTypeIcon = (type: string) => {
  const icons: Record<string, string> = {
    folder: 'bx-folder',
    text: 'bx-file-blank',
    character: 'bx-user',
    scene: 'bx-camera',
    research: 'bx-search',
    mindmap: 'bx-network-chart',
  }
  return icons[type] || 'bx-file'
}

const getTypeColor = (type: string) => {
  const colors: Record<string, string> = {
    folder: 'primary',
    text: 'warning',
    character: 'purple',
    scene: 'success',
    research: 'info',
    mindmap: 'pink',
  }
  return colors[type] || 'grey'
}

const getNodeStyle = (node: any) => {
  const style = node.data.style || {}
  return {
    backgroundColor: style.backgroundColor || '#ffffff',
    borderColor: style.borderColor || '#cccccc',
    borderWidth: '2px',
    borderStyle: 'solid',
  }
}

const truncateText = (text: string, maxLength: number) => {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

// Lifecycle
onMounted(() => {
  console.log('ManuscriptMindMap mounted, selected manuscript:', selectedManuscriptId.value)
  // If a manuscript is already selected, load its mindmap
  // The watch will trigger this automatically
})
</script>

<style scoped>
.manuscript-mindmap {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.manuscript-selector {
  max-width: 400px;
}

.mindmap-grid {
  height: 100%;
  overflow-y: auto;
}

.nodes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
}

.node-card {
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.node-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
}

.mindmap-canvas {
  background: linear-gradient(to bottom, #f5f5f5, #e0e0e0);
}

/* Transition animations */
.grid-enter-active,
.grid-leave-active {
  transition: all 0.3s ease;
}

.grid-enter-from {
  opacity: 0;
  transform: scale(0.8);
}

.grid-leave-to {
  opacity: 0;
  transform: scale(0.8);
}

.text-pre-wrap {
  white-space: pre-wrap;
  font-family: monospace;
  max-height: 300px;
  overflow-y: auto;
}
</style>