<template>
  <div class="scrivener-content-tree">
    <VAlert v-if="loading" type="info" variant="tonal" class="mb-4">
      <VProgressCircular size="20" width="2" indeterminate class="me-2" />
      Loading manuscript structure...
    </VAlert>

    <VAlert v-else-if="error" type="error" variant="tonal" class="mb-4">
      {{ error }}
    </VAlert>

    <div v-else-if="manuscriptData">
      <!-- Manuscript Info -->
      <div class="manuscript-header mb-4 pa-4 bg-surface rounded">
        <div class="d-flex align-center mb-2">
          <VIcon icon="bx-book" color="primary" class="me-2" />
          <span class="text-h6">{{ manuscriptData.title }}</span>
          <VChip size="small" color="info" variant="tonal" class="ms-2">
            Scrivener Project
          </VChip>
        </div>
        <div class="text-body-2 text-medium-emphasis">
          <strong>UUID:</strong> <code>{{ manuscriptData.scrivener_uuid }}</code>
        </div>
        <div class="text-body-2 text-medium-emphasis">
          <strong>Imported:</strong> {{ formatDate(manuscriptData.imported_at) }}
        </div>
        <div class="text-body-2 text-medium-emphasis" v-if="manuscriptData.version">
          <strong>Version:</strong> {{ manuscriptData.version }}
        </div>
      </div>

      <!-- Content Statistics -->
      <VRow class="mb-4" v-if="detailed">
        <VCol cols="3">
          <VCard variant="tonal" color="primary">
            <VCardText class="text-center">
              <div class="text-h6">{{ stats.totalItems }}</div>
              <div class="text-caption">Total Items</div>
            </VCardText>
          </VCard>
        </VCol>
        <VCol cols="3">
          <VCard variant="tonal" color="success">
            <VCardText class="text-center">
              <div class="text-h6">{{ stats.collections }}</div>
              <div class="text-caption">Collections</div>
            </VCardText>
          </VCard>
        </VCol>
        <VCol cols="3">
          <VCard variant="tonal" color="info">
            <VCardText class="text-center">
              <div class="text-h6">{{ stats.totalWords }}</div>
              <div class="text-caption">Total Words</div>
            </VCardText>
          </VCard>
        </VCol>
        <VCol cols="3">
          <VCard variant="tonal" color="warning">
            <VCardText class="text-center">
              <div class="text-h6">{{ stats.includedInCompile }}</div>
              <div class="text-caption">In Compile</div>
            </VCardText>
          </VCard>
        </VCol>
      </VRow>

      <!-- Collections Tree -->
      <div v-if="collections.length > 0">
        <div class="text-h6 mb-3">Collections</div>
        <VExpansionPanels multiple class="mb-4">
          <VExpansionPanel
            v-for="collection in collections"
            :key="collection.id"
            :title="collection.title"
          >
            <template #title>
              <div class="d-flex align-center">
                <VIcon :icon="getCollectionIcon(collection.type)" class="me-2" />
                {{ collection.title }}
                <VChip size="x-small" variant="outlined" class="ms-2">
                  {{ collection.items?.length || 0 }} items
                </VChip>
                <VChip 
                  v-if="collection.color" 
                  size="x-small" 
                  :style="{ backgroundColor: convertScrivenerColor(collection.color) }"
                  class="ms-1"
                >
                  &nbsp;
                </VChip>
              </div>
            </template>
            <VExpansionPanelText>
              <div v-if="collection.type === 'Binder'" class="binder-content">
                <ScrivenerItemTree 
                  :items="collection.items || []" 
                  :detailed="detailed"
                  :manuscript-items="manuscriptItems"
                />
              </div>
              <div v-else-if="collection.items && collection.items.length > 0">
                <VList density="compact">
                  <VListItem
                    v-for="item in collection.items"
                    :key="item.id"
                    :title="item.title"
                    :subtitle="`${item.word_count || 0} words`"
                  >
                    <template #prepend>
                      <VIcon :icon="getItemIcon(item)" size="small" />
                    </template>
                    <template #append>
                      <VChip
                        v-if="item.include_in_compile"
                        size="x-small"
                        color="success"
                        variant="tonal"
                      >
                        Compile
                      </VChip>
                    </template>
                  </VListItem>
                </VList>
              </div>
              <div v-else class="text-body-2 text-medium-emphasis pa-4">
                No items in this collection
              </div>
            </VExpansionPanelText>
          </VExpansionPanel>
        </VExpansionPanels>
      </div>

      <!-- Orphaned Items -->
      <div v-if="orphanedItems.length > 0" class="mt-4">
        <div class="text-h6 mb-3">Orphaned Items</div>
        <VAlert type="warning" variant="tonal" class="mb-3">
          These items are not part of any collection structure
        </VAlert>
        <VList density="compact">
          <VListItem
            v-for="item in orphanedItems"
            :key="item.id"
            :title="item.title"
            :subtitle="`${item.word_count || 0} words • ${item.folder_type || item.type}`"
          >
            <template #prepend>
              <VIcon :icon="getItemIcon(item)" size="small" />
            </template>
            <template #append>
              <VChip
                v-if="item.include_in_compile"
                size="x-small"
                color="success"
                variant="tonal"
              >
                Compile
              </VChip>
            </template>
          </VListItem>
        </VList>
      </div>

      <!-- Project Settings -->
      <div v-if="detailed && manuscriptData.project_settings" class="mt-6">
        <div class="text-h6 mb-3">Project Settings</div>
        <VExpansionPanels>
          <VExpansionPanel title="Labels & Statuses">
            <VExpansionPanelText>
              <VRow>
                <VCol cols="6" v-if="manuscriptData.project_settings.labels">
                  <div class="text-subtitle-2 mb-2">Labels</div>
                  <VChip
                    v-for="label in manuscriptData.project_settings.labels"
                    :key="label.id"
                    size="small"
                    class="me-1 mb-1"
                    :style="{ backgroundColor: label.color }"
                  >
                    {{ label.title }}
                  </VChip>
                </VCol>
                <VCol cols="6" v-if="manuscriptData.project_settings.statuses">
                  <div class="text-subtitle-2 mb-2">Statuses</div>
                  <VChip
                    v-for="status in manuscriptData.project_settings.statuses"
                    :key="status.id"
                    size="small"
                    class="me-1 mb-1"
                    :style="{ backgroundColor: status.color }"
                  >
                    {{ status.title }}
                  </VChip>
                </VCol>
              </VRow>
            </VExpansionPanelText>
          </VExpansionPanel>
          
          <VExpansionPanel title="Custom Metadata" v-if="manuscriptData.custom_metadata">
            <VExpansionPanelText>
              <pre class="text-caption">{{ JSON.stringify(manuscriptData.custom_metadata, null, 2) }}</pre>
            </VExpansionPanelText>
          </VExpansionPanel>
        </VExpansionPanels>
      </div>
    </div>

    <VAlert v-else type="info" variant="tonal">
      No manuscript data available
    </VAlert>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { format } from 'date-fns'
import ScrivenerItemTree from './ScrivenerItemTree.vue'

interface Props {
  manuscriptId: number
  detailed?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  detailed: false
})

// Data refs
const loading = ref(false)
const error = ref('')
const manuscriptData = ref<any>(null)
const collections = ref<any[]>([])
const manuscriptItems = ref<any[]>([])

// Computed properties
const stats = computed(() => {
  if (!manuscriptItems.value.length) {
    return {
      totalItems: 0,
      collections: collections.value.length,
      totalWords: 0,
      includedInCompile: 0
    }
  }
  
  return {
    totalItems: manuscriptItems.value.length,
    collections: collections.value.length,
    totalWords: manuscriptItems.value.reduce((sum, item) => sum + (item.word_count || 0), 0),
    includedInCompile: manuscriptItems.value.filter(item => item.include_in_compile).length
  }
})

const orphanedItems = computed(() => {
  // Items that are not in any collection
  const collectionItemIds = new Set()
  collections.value.forEach(collection => {
    if (collection.items) {
      collection.items.forEach((item: any) => {
        collectionItemIds.add(item.id)
      })
    }
  })
  
  return manuscriptItems.value.filter(item => !collectionItemIds.has(item.id))
})

// Helper functions
const formatDate = (date: string) => {
  if (!date) return 'Unknown'
  return format(new Date(date), 'MMM d, yyyy HH:mm')
}

const getCollectionIcon = (type: string) => {
  const icons: any = {
    'Binder': 'bx-folder-open',
    'RecentSearch': 'bx-search',
    'Arbitrary': 'bx-collection'
  }
  return icons[type] || 'bx-folder'
}

const getItemIcon = (item: any) => {
  if (item.folder_type) {
    const icons: any = {
      'chapter': 'bx-book-bookmark',
      'scene': 'bx-file-doc',
      'character': 'bx-user',
      'location': 'bx-map',
      'research': 'bx-search-alt',
      'folder': 'bx-folder'
    }
    return icons[item.folder_type] || 'bx-file'
  }
  
  const typeIcons: any = {
    'text': 'bx-file-doc',
    'folder': 'bx-folder',
    'image': 'bx-image',
    'file': 'bx-file'
  }
  return typeIcons[item.type] || 'bx-file'
}

const convertScrivenerColor = (color: string) => {
  // Convert Scrivener color format (e.g., "0.702312 0.888273 0.974258") to RGB
  if (!color) return '#cccccc'
  
  const parts = color.split(' ')
  if (parts.length === 3) {
    const r = Math.round(parseFloat(parts[0]) * 255)
    const g = Math.round(parseFloat(parts[1]) * 255)
    const b = Math.round(parseFloat(parts[2]) * 255)
    return `rgb(${r}, ${g}, ${b})`
  }
  
  return color.startsWith('#') ? color : '#cccccc'
}

// API functions
const fetchManuscriptData = async () => {
  loading.value = true
  error.value = ''
  
  try {
    // Fetch manuscript details
    const manuscriptResponse = await fetch(`/api/manuscripts/${props.manuscriptId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        'Accept': 'application/json'
      }
    })
    
    if (!manuscriptResponse.ok) {
      const responseText = await manuscriptResponse.text()
      console.error('Manuscript API Error:', responseText)
      throw new Error(`Failed to fetch manuscript (${manuscriptResponse.status})`)
    }
    
    const responseText = await manuscriptResponse.text()
    try {
      manuscriptData.value = JSON.parse(responseText)
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError, 'Response:', responseText)
      throw new Error('Invalid JSON response from manuscript API')
    }
    
    // Fetch collections for this manuscript
    try {
      const collectionsResponse = await fetch(`/api/manuscripts/${props.manuscriptId}/collections`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Accept': 'application/json'
        }
      })
      
      if (collectionsResponse.ok) {
        const collectionsText = await collectionsResponse.text()
        try {
          collections.value = JSON.parse(collectionsText)
        } catch (parseError) {
          console.warn('Collections JSON Parse Error:', parseError)
          collections.value = []
        }
      } else {
        console.warn('Collections API failed:', collectionsResponse.status)
        collections.value = []
      }
    } catch (collectionsError) {
      console.warn('Collections API Error:', collectionsError)
      collections.value = []
    }
    
    // Fetch items for this manuscript
    try {
      const itemsResponse = await fetch(`/api/manuscripts/${props.manuscriptId}/items`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Accept': 'application/json'
        }
      })
      
      if (itemsResponse.ok) {
        const itemsText = await itemsResponse.text()
        try {
          manuscriptItems.value = JSON.parse(itemsText)
          // Organize items into collections
          organizeItemsIntoCollections()
        } catch (parseError) {
          console.warn('Items JSON Parse Error:', parseError)
          manuscriptItems.value = []
        }
      } else {
        console.warn('Items API failed:', itemsResponse.status)
        manuscriptItems.value = []
      }
    } catch (itemsError) {
      console.warn('Items API Error:', itemsError)
      manuscriptItems.value = []
    }
    
  } catch (err) {
    console.error('fetchManuscriptData Error:', err)
    error.value = err instanceof Error ? err.message : 'Failed to load manuscript data'
  } finally {
    loading.value = false
  }
}

const organizeItemsIntoCollections = () => {
  // Create a map of items by their UUID for quick lookup
  const itemsMap = new Map()
  manuscriptItems.value.forEach(item => {
    if (item.scrivener_uuid) {
      itemsMap.set(item.scrivener_uuid, item)
    }
  })
  
  // Attach items to collections
  collections.value.forEach(collection => {
    if (collection.item_uuids && Array.isArray(collection.item_uuids)) {
      collection.items = collection.item_uuids
        .map((uuid: string) => itemsMap.get(uuid))
        .filter(Boolean)
    } else {
      collection.items = []
    }
  })
}

// Initialize
onMounted(() => {
  fetchManuscriptData()
})
</script>

<style scoped>
.scrivener-content-tree {
  font-family: 'Roboto Mono', monospace;
}

.manuscript-header {
  border: 1px solid rgb(var(--v-border-color));
}

.binder-content {
  max-height: 400px;
  overflow-y: auto;
}

pre {
  background-color: rgb(var(--v-theme-surface));
  padding: 12px;
  border-radius: 4px;
  overflow-x: auto;
}
</style>