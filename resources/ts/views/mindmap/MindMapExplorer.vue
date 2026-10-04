<template>
  <div class="mindmap-explorer">
    <VCard>
      <VCardTitle>
        {{ $t('menu.mindMapExplorer') }}
      </VCardTitle>

      <VCardText>
        <VRow>
          <VCol cols="12" md="3">
            <!-- Filters Sidebar -->
            <VCard variant="outlined">
              <VCardText>
                <h4 class="mb-3">Filters</h4>

                <VTextField
                  v-model="filters.search"
                  label="Search"
                  prepend-inner-icon="bx-search"
                  variant="outlined"
                  density="compact"
                  class="mb-3"
                  clearable
                />

                <VSelect
                  v-model="filters.type"
                  label="Item Type"
                  :items="itemTypes"
                  variant="outlined"
                  density="compact"
                  class="mb-3"
                  clearable
                />

                <VAutocomplete
                  v-model="filters.tags"
                  label="Tags"
                  :items="availableTags"
                  variant="outlined"
                  density="compact"
                  multiple
                  chips
                  closable-chips
                  class="mb-3"
                />

                <VBtn
                  block
                  color="primary"
                  variant="flat"
                  @click="generateMindmap"
                >
                  Generate Mind Map
                </VBtn>

                <VBtn
                  block
                  variant="text"
                  class="mt-2"
                  @click="resetFilters"
                >
                  Reset Filters
                </VBtn>
              </VCardText>
            </VCard>
          </VCol>

          <VCol cols="12" md="9">
            <!-- Items Grid -->
            <div v-if="loading" class="text-center py-8">
              <VProgressCircular indeterminate color="primary" />
            </div>

            <div v-else-if="!filteredItems.length" class="text-center py-8">
              <VIcon size="80" color="grey-lighten-1">bx-file-blank</VIcon>
              <h3 class="mt-4">No Items Found</h3>
              <p class="text-grey">Try adjusting your filters</p>
            </div>

            <VRow v-else>
              <VCol
                v-for="item in filteredItems"
                :key="item.id"
                cols="12"
                sm="6"
                md="4"
              >
                <VCard
                  hover
                  :class="{ 'selected': selectedItems.includes(item.id) }"
                  @click="toggleItem(item)"
                  class="item-card"
                >
                  <VCardText>
                    <div class="d-flex align-center mb-2">
                      <VIcon :color="getTypeColor(item.type)">
                        {{ getTypeIcon(item.type) }}
                      </VIcon>
                      <VChip
                        size="small"
                        :color="getTypeColor(item.type)"
                        variant="tonal"
                        class="ml-2"
                      >
                        {{ item.type }}
                      </VChip>
                    </div>

                    <h4 class="mb-2">{{ item.title }}</h4>

                    <p class="text-truncate text-grey text-caption mb-2">
                      {{ item.synopsis || 'No description' }}
                    </p>

                    <div v-if="item.tags && item.tags.length" class="d-flex flex-wrap gap-1">
                      <VChip
                        v-for="tag in item.tags.slice(0, 3)"
                        :key="tag"
                        size="x-small"
                        variant="outlined"
                      >
                        {{ tag }}
                      </VChip>
                      <VChip
                        v-if="item.tags.length > 3"
                        size="x-small"
                        variant="text"
                      >
                        +{{ item.tags.length - 3 }}
                      </VChip>
                    </div>
                  </VCardText>

                  <VCheckbox
                    :model-value="selectedItems.includes(item.id)"
                    class="item-checkbox"
                    @click.stop="toggleItem(item)"
                  />
                </VCard>
              </VCol>
            </VRow>

            <!-- Selection Actions -->
            <div v-if="selectedItems.length" class="selection-actions">
              <VCard elevation="8">
                <VCardText class="d-flex align-center justify-space-between">
                  <span>{{ selectedItems.length }} items selected</span>
                  <div class="d-flex gap-2">
                    <VBtn
                      color="primary"
                      variant="flat"
                      @click="createMindmapFromSelection"
                    >
                      <VIcon start>bx-network-chart</VIcon>
                      Create Mind Map
                    </VBtn>
                    <VBtn
                      variant="text"
                      @click="clearSelection"
                    >
                      Clear
                    </VBtn>
                  </div>
                </VCardText>
              </VCard>
            </div>
          </VCol>
        </VRow>
      </VCardText>
    </VCard>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMindmapStore as useMindMapStore } from '@/stores/mindmap'
import { useToast } from 'vue-toastification'
import axios from '@/../js/axios'

const router = useRouter()
const mindmapStore = useMindMapStore()
const toast = useToast()

// Data
const items = ref([])
const selectedItems = ref<number[]>([])
const loading = ref(false)

const filters = ref({
  search: '',
  type: null,
  tags: [],
})

const itemTypes = [
  { title: 'Text', value: 'text' },
  { title: 'Folder', value: 'folder' },
  { title: 'Character', value: 'character' },
  { title: 'Research', value: 'research' },
  { title: 'Image', value: 'image' },
  { title: 'Link', value: 'link' },
]

const availableTags = ref([
  'plot',
  'character',
  'location',
  'conflict',
  'theme',
  'research',
  'draft',
  'final',
])

// Computed
const filteredItems = computed(() => {
  let filtered = [...items.value]

  // Search filter
  if (filters.value.search) {
    const searchTerm = filters.value.search.toLowerCase()
    filtered = filtered.filter(item =>
      item.title.toLowerCase().includes(searchTerm) ||
      (item.synopsis && item.synopsis.toLowerCase().includes(searchTerm))
    )
  }

  // Type filter
  if (filters.value.type) {
    filtered = filtered.filter(item => item.type === filters.value.type)
  }

  // Tags filter
  if (filters.value.tags.length > 0) {
    filtered = filtered.filter(item =>
      item.tags && filters.value.tags.some(tag => item.tags.includes(tag))
    )
  }

  return filtered
})

// Methods
const loadItems = async () => {
  loading.value = true
  try {
    const response = await axios.get('/api/items')
    items.value = response.data.data || response.data
  } catch (error) {
    console.error('Error loading items:', error)
    toast.error('Failed to load items')
  } finally {
    loading.value = false
  }
}

const toggleItem = (item: any) => {
  const index = selectedItems.value.indexOf(item.id)
  if (index >= 0) {
    selectedItems.value.splice(index, 1)
  } else {
    selectedItems.value.push(item.id)
  }
}

const clearSelection = () => {
  selectedItems.value = []
}

const resetFilters = () => {
  filters.value = {
    search: '',
    type: null,
    tags: [],
  }
}

const generateMindmap = async () => {
  if (filteredItems.value.length === 0) {
    toast.warning('No items to generate mind map from')
    return
  }

  // Auto-select all filtered items
  selectedItems.value = filteredItems.value.map(item => item.id)

  // Create mindmap
  await createMindmapFromSelection()
}

const createMindmapFromSelection = async () => {
  if (selectedItems.value.length === 0) {
    toast.warning('Please select at least one item')
    return
  }

  try {
    // Create new mindmap
    const newMindmap = await mindmapStore.createMindmap({
      title: 'Explorer Mind Map',
      description: `Generated from ${selectedItems.value.length} items`,
    })

    // TODO: Add nodes for each selected item
    // This would require API endpoints to create nodes from items

    toast.success('Mind map created successfully')

    // Navigate to the new mindmap
    router.push({ name: 'mindmap-view', params: { id: newMindmap.id } })
  } catch (error) {
    console.error('Error creating mindmap:', error)
    toast.error('Failed to create mind map')
  }
}

const getTypeIcon = (type: string): string => {
  const icons = {
    text: 'bx-file-blank',
    folder: 'bx-folder',
    character: 'bx-user',
    research: 'bx-bulb',
    image: 'bx-image',
    link: 'bx-link',
  }
  return icons[type] || 'bx-file'
}

const getTypeColor = (type: string): string => {
  const colors = {
    text: 'primary',
    folder: 'secondary',
    character: 'info',
    research: 'warning',
    image: 'success',
    link: 'error',
  }
  return colors[type] || 'grey'
}

// Lifecycle
onMounted(() => {
  loadItems()
})
</script>

<style scoped>
.mindmap-explorer {
  min-height: 100vh;
}

.item-card {
  position: relative;
  transition: all 0.2s;
  cursor: pointer;
}

.item-card:hover {
  transform: translateY(-2px);
}

.item-card.selected {
  border: 2px solid rgb(var(--v-theme-primary));
  background: rgba(var(--v-theme-primary), 0.05);
}

.item-checkbox {
  position: absolute;
  top: 8px;
  right: 8px;
}

.selection-actions {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  min-width: 400px;
}
</style>
