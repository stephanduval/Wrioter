<template>
  <div class="manuscript-mindmap">
    <!-- Manuscript Selector Bar -->
    <VCard class="mb-4">
      <VCardTitle class="d-flex align-center justify-space-between">
        <div class="d-flex align-center gap-3">
          <VIcon size="28" color="primary">bx-book-open</VIcon>
          <VSelect
            v-model="selectedManuscriptId"
            :items="manuscripts"
            :loading="loadingManuscripts"
            item-title="title"
            item-value="id"
            label="Select Manuscript"
            variant="outlined"
            density="comfortable"
            class="manuscript-selector"
            style="min-width: 300px"
            @update:model-value="onManuscriptChange"
          >
            <template #item="{ props, item }">
              <VListItem v-bind="props" :subtitle="`${item.raw.status} • ${item.raw.items?.length || 0} items`">
                <template #prepend>
                  <VIcon>{{ getManuscriptIcon(item.raw.manuscript_type) }}</VIcon>
                </template>
              </VListItem>
            </template>
          </VSelect>

          <VChip v-if="currentManuscript" color="info" variant="tonal">
            {{ itemCount }} items
          </VChip>

          <VChip v-if="currentMindmap?.is_default" color="success" variant="tonal">
            <VIcon start size="16">bx-check-circle</VIcon>
            Default Mindmap
          </VChip>
        </div>

        <div class="d-flex gap-2">
          <VBtn
            color="primary"
            variant="tonal"
            :disabled="!currentManuscript"
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
            {{ viewMode === 'grid' ? 'Canvas View' : 'Grid View' }}
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
      <VCardText class="text-center py-10">
        <VIcon size="64" color="grey">bx-book</VIcon>
        <p class="mt-4 text-h6">Select a Manuscript</p>
        <p class="text-grey">Choose a manuscript from the dropdown to view its structure</p>
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

const mindmapStore = useMindMapStore()
const manuscriptStore = useManuscriptStore()
const router = useRouter()
const toast = useToast()

// State
const selectedManuscriptId = ref<number | null>(null)
const loading = ref(false)
const loadingManuscripts = ref(false)
const error = ref<string | null>(null)
const viewMode = ref<'grid' | 'canvas'>('grid')

const itemDialog = ref({
  visible: false,
  item: null as any
})

// Computed
const manuscripts = computed(() => manuscriptStore.manuscripts || [])
const currentManuscript = computed(() =>
  manuscripts.value.find(m => m.id === selectedManuscriptId.value)
)
const currentMindmap = computed(() => mindmapStore.currentMindmap)
const nodes = computed(() => mindmapStore.nodes)
const edges = computed(() => mindmapStore.edges)
const itemCount = computed(() => nodes.value.length)

// Watch for manuscript changes
watch(selectedManuscriptId, (newId) => {
  if (newId) {
    loadManuscriptMindmap()
  } else {
    mindmapStore.reset()
  }
})

// Methods
const loadManuscripts = async () => {
  loadingManuscripts.value = true
  try {
    await manuscriptStore.fetchManuscripts()
  } catch (err: any) {
    console.error('Failed to load manuscripts:', err)
    toast.error('Failed to load manuscripts')
  } finally {
    loadingManuscripts.value = false
  }
}

const loadManuscriptMindmap = async () => {
  if (!selectedManuscriptId.value) return

  loading.value = true
  error.value = null

  try {
    await mindmapStore.loadManuscriptDefaultMindmap(selectedManuscriptId.value)
    toast.success(`Loaded mindmap for ${currentManuscript.value?.title}`)
  } catch (err: any) {
    console.error('Error loading manuscript mindmap:', err)
    error.value = err.message || 'Failed to load mindmap'
    toast.error('Failed to load mindmap')
  } finally {
    loading.value = false
  }
}

const onManuscriptChange = (id: number) => {
  // Store the selection for persistence
  if (manuscriptStore.selectManuscript) {
    manuscriptStore.selectManuscript(id)
  }
}

const syncMindmap = async () => {
  if (!selectedManuscriptId.value) return

  loading.value = true
  try {
    // Call sync endpoint
    const response = await fetch(`/api/manuscripts/${selectedManuscriptId.value}/sync-mindmap`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      }
    })

    if (response.ok) {
      // Reload the mindmap
      await loadManuscriptMindmap()
      toast.success('Mindmap synced successfully')
    } else {
      throw new Error('Sync failed')
    }
  } catch (err: any) {
    console.error('Error syncing mindmap:', err)
    toast.error('Failed to sync mindmap')
  } finally {
    loading.value = false
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
  if (itemDialog.value.item) {
    // Navigate to item editor
    router.push(`/manuscripts/${selectedManuscriptId.value}/items/${itemDialog.value.item.itemId}`)
  }
  itemDialog.value.visible = false
}

const addFirstItem = () => {
  // Navigate to manuscript editor to add items
  router.push(`/manuscripts/${selectedManuscriptId.value}/edit`)
}

// Utility functions
const getManuscriptIcon = (type: string) => {
  return type === 'scrivener' ? 'bx-import' : 'bx-book'
}

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

const getItemChildren = (node: any) => {
  // Get children nodes based on parent_id
  return nodes.value.filter(n => {
    // This would need proper parent tracking
    return false // Placeholder
  })
}

// Lifecycle
onMounted(() => {
  loadManuscripts()

  // If a manuscript was previously selected, load it
  if (manuscriptStore.selectedManuscriptId) {
    selectedManuscriptId.value = manuscriptStore.selectedManuscriptId
  }
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