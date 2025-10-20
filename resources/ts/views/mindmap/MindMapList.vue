<template>
  <div>
    <VCard>
      <VCardTitle class="d-flex align-center justify-space-between">
        <span>{{ $t('menu.mindMapList') }}</span>
        <VBtn
          color="primary"
          @click="createNewMindmap"
        >
          <VIcon start>bx-plus</VIcon>
          {{ $t('menu.mindMapCreate') }}
        </VBtn>
      </VCardTitle>

      <VCardText>
        <!-- Filters -->
        <VRow class="mb-4">
          <VCol cols="12" md="4">
            <VTextField
              v-model="search"
              :label="$t('Search')"
              prepend-inner-icon="bx-search"
              variant="outlined"
              density="compact"
              clearable
            />
          </VCol>
          <VCol cols="12" md="3">
            <VSelect
              v-model="filter.type"
              :label="$t('Type')"
              :items="typeOptions"
              variant="outlined"
              density="compact"
              clearable
            />
          </VCol>
          <VCol cols="12" md="3">
            <VSelect
              v-model="filter.archived"
              :label="$t('Status')"
              :items="statusOptions"
              variant="outlined"
              density="compact"
              clearable
            />
          </VCol>
        </VRow>

        <!-- Loading State -->
        <div v-if="loading" class="text-center py-8">
          <VProgressCircular indeterminate color="primary" />
        </div>

        <!-- Empty State -->
        <div v-else-if="!mindmaps.length" class="text-center py-8">
          <VIcon size="80" color="grey-lighten-1">bx-network-chart</VIcon>
          <h3 class="mt-4">No Mind Maps Yet</h3>
          <p class="text-grey">Create your first mind map to get started</p>
          <VBtn
            color="primary"
            class="mt-4"
            @click="createNewMindmap"
          >
            <VIcon start>bx-plus</VIcon>
            Create Mind Map
          </VBtn>
        </div>

        <!-- Mind Map Grid -->
        <VRow v-else>
          <VCol
            v-for="mindmap in filteredMindmaps"
            :key="mindmap.id"
            cols="12"
            sm="6"
            md="4"
            lg="3"
          >
            <VCard
              hover
              @click="openMindmap(mindmap)"
              class="mindmap-card"
            >
              <!-- Thumbnail or Icon -->
              <div class="mindmap-thumbnail pa-4 d-flex align-center justify-center">
                <VIcon size="60" color="primary">bx-network-chart</VIcon>
              </div>

              <VCardTitle class="pb-1">
                {{ mindmap.title }}
              </VCardTitle>

              <VCardSubtitle>
                <span v-if="mindmap.is_manuscript_default" class="text-primary">
                  {{ mindmap.manuscript_title }} - Default
                </span>
                <span v-else>
                  {{ formatDate(mindmap.updated_at) }}
                </span>
              </VCardSubtitle>

              <VCardText>
                <p class="text-truncate mb-2">
                  {{ mindmap.description || 'No description' }}
                </p>

                <div class="d-flex align-center justify-space-between">
                  <VChip
                    v-if="mindmap.is_manuscript_default"
                    size="small"
                    color="success"
                    variant="tonal"
                  >
                    <VIcon start size="14">bx-book</VIcon>
                    Manuscript Default
                  </VChip>
                  <VChip
                    v-else-if="mindmap.is_template"
                    size="small"
                    color="info"
                    variant="tonal"
                  >
                    Template
                  </VChip>
                  <VChip
                    v-if="mindmap.is_archived"
                    size="small"
                    color="warning"
                    variant="tonal"
                  >
                    Archived
                  </VChip>
                  <VSpacer v-if="!mindmap.is_manuscript_default && !mindmap.is_template && !mindmap.is_archived" />

                  <VMenu location="bottom end">
                    <template #activator="{ props }">
                      <VBtn
                        v-bind="props"
                        icon
                        size="small"
                        variant="text"
                        @click.stop
                      >
                        <VIcon>bx-dots-vertical-rounded</VIcon>
                      </VBtn>
                    </template>

                    <VList density="compact">
                      <VListItem @click.stop="editMindmap(mindmap)">
                        <template #prepend>
                          <VIcon size="20">bx-edit</VIcon>
                        </template>
                        <VListItemTitle>Edit</VListItemTitle>
                      </VListItem>

                      <VListItem @click.stop="duplicateMindmap(mindmap)">
                        <template #prepend>
                          <VIcon size="20">bx-copy</VIcon>
                        </template>
                        <VListItemTitle>Duplicate</VListItemTitle>
                      </VListItem>

                      <VListItem @click.stop="exportMindmap(mindmap)">
                        <template #prepend>
                          <VIcon size="20">bx-download</VIcon>
                        </template>
                        <VListItemTitle>Export</VListItemTitle>
                      </VListItem>

                      <VListItem
                        @click.stop="toggleArchive(mindmap)"
                      >
                        <template #prepend>
                          <VIcon size="20">{{ mindmap.is_archived ? 'bx-archive-out' : 'bx-archive-in' }}</VIcon>
                        </template>
                        <VListItemTitle>
                          {{ mindmap.is_archived ? 'Unarchive' : 'Archive' }}
                        </VListItemTitle>
                      </VListItem>

                      <VDivider />

                      <VListItem
                        @click.stop="deleteMindmap(mindmap)"
                        class="text-error"
                      >
                        <template #prepend>
                          <VIcon size="20" color="error">bx-trash</VIcon>
                        </template>
                        <VListItemTitle>Delete</VListItemTitle>
                      </VListItem>
                    </VList>
                  </VMenu>
                </div>
              </VCardText>
            </VCard>
          </VCol>
        </VRow>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="mt-4 d-flex justify-center">
          <VPagination
            v-model="currentPage"
            :length="totalPages"
            :total-visible="7"
          />
        </div>
      </VCardText>
    </VCard>

    <!-- Create/Edit Dialog -->
    <VDialog
      v-model="dialogVisible"
      max-width="600"
    >
      <VCard>
        <VCardTitle>
          {{ editingMindmap ? 'Edit Mind Map' : 'Create New Mind Map' }}
        </VCardTitle>

        <VCardText>
          <VForm ref="form" @submit.prevent="saveMindmap">
            <VTextField
              v-model="formData.title"
              label="Title"
              :rules="[requiredRule]"
              variant="outlined"
              class="mb-4"
            />

            <VTextarea
              v-model="formData.description"
              label="Description"
              variant="outlined"
              rows="3"
              class="mb-4"
            />

            <VCheckbox
              v-model="formData.is_template"
              label="Save as template"
            />
          </VForm>
        </VCardText>

        <VCardActions>
          <VSpacer />
          <VBtn
            variant="text"
            @click="dialogVisible = false"
          >
            Cancel
          </VBtn>
          <VBtn
            color="primary"
            variant="flat"
            @click="saveMindmap"
          >
            {{ editingMindmap ? 'Update' : 'Create' }}
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useMindMapStore } from '@/stores/mindmap'
import { useManuscriptStore } from '@/stores/manuscript'
import { useToast } from 'vue-toastification'

const router = useRouter()
const mindmapStore = useMindMapStore()
const manuscriptStore = useManuscriptStore()
const toast = useToast()

// Data
const mindmaps = ref([])
const loading = ref(false)
const search = ref('')
const currentPage = ref(1)
const itemsPerPage = 12
const dialogVisible = ref(false)
const editingMindmap = ref(null)

const filter = ref({
  type: null,
  archived: 'active',
})

const formData = ref({
  title: '',
  description: '',
  is_template: false,
})

const typeOptions = [
  { title: 'All Types', value: null },
  { title: 'Standard', value: 'standard' },
  { title: 'Template', value: 'template' },
]

const statusOptions = [
  { title: 'Active', value: 'active' },
  { title: 'Archived', value: 'archived' },
  { title: 'All', value: null },
]

// Computed
const filteredMindmaps = computed(() => {
  let filtered = [...mindmaps.value]

  // Search filter
  if (search.value) {
    const searchTerm = search.value.toLowerCase()
    filtered = filtered.filter(m =>
      m.title.toLowerCase().includes(searchTerm) ||
      (m.description && m.description.toLowerCase().includes(searchTerm))
    )
  }

  // Type filter
  if (filter.value.type === 'template') {
    filtered = filtered.filter(m => m.is_template)
  } else if (filter.value.type === 'standard') {
    filtered = filtered.filter(m => !m.is_template)
  }

  // Archive filter
  if (filter.value.archived === 'active') {
    filtered = filtered.filter(m => !m.is_archived)
  } else if (filter.value.archived === 'archived') {
    filtered = filtered.filter(m => m.is_archived)
  }

  // Pagination
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filtered.slice(start, end)
})

const totalPages = computed(() => {
  return Math.ceil(mindmaps.value.length / itemsPerPage)
})

// Methods
const loadMindmaps = async () => {
  loading.value = true
  try {
    // Load regular mindmaps
    const regularMindmaps = await mindmapStore.loadMindmaps()

    // Check if a manuscript is selected and fetch its default mindmap
    if (manuscriptStore.selectedManuscriptId) {
      try {
        const response = await mindmapStore.api.get(
          `/manuscripts/${manuscriptStore.selectedManuscriptId}/default-mindmap`
        )

        if (response.data && response.data.mindmap) {
          // Add the default mindmap to the list with a special indicator
          const defaultMindmap = {
            ...response.data.mindmap,
            is_manuscript_default: true,
            manuscript_id: manuscriptStore.selectedManuscriptId,
            manuscript_title: manuscriptStore.manuscripts?.find(
              m => m.id === manuscriptStore.selectedManuscriptId
            )?.title || 'Manuscript'
          }

          // Combine default mindmap with regular mindmaps, putting default first
          mindmaps.value = [defaultMindmap, ...regularMindmaps.filter(
            m => m.id !== defaultMindmap.id
          )]
        } else {
          mindmaps.value = regularMindmaps
        }
      } catch (error) {
        console.error('Error loading manuscript default mindmap:', error)
        // If error loading default, just show regular mindmaps
        mindmaps.value = regularMindmaps
      }
    } else {
      mindmaps.value = regularMindmaps
    }
  } catch (error) {
    console.error('Error loading mindmaps:', error)
    toast.error('Failed to load mind maps')
  } finally {
    loading.value = false
  }
}

const createNewMindmap = () => {
  editingMindmap.value = null
  formData.value = {
    title: '',
    description: '',
    is_template: false,
  }
  dialogVisible.value = true
}

const editMindmap = (mindmap: any) => {
  editingMindmap.value = mindmap
  formData.value = {
    title: mindmap.title,
    description: mindmap.description || '',
    is_template: mindmap.is_template || false,
  }
  dialogVisible.value = true
}

const saveMindmap = async () => {
  try {
    if (editingMindmap.value) {
      await mindmapStore.updateMindmap(editingMindmap.value.id, formData.value)
      toast.success('Mind map updated successfully')
    } else {
      const newMindmap = await mindmapStore.createMindmap(formData.value)
      toast.success('Mind map created successfully')
      // Navigate to the new mindmap
      router.push({ name: 'mindmap-view', params: { id: newMindmap.id } })
    }
    dialogVisible.value = false
    loadMindmaps()
  } catch (error) {
    console.error('Error saving mindmap:', error)
    toast.error('Failed to save mind map')
  }
}

const openMindmap = (mindmap: any) => {
  router.push({ name: 'mindmap-view', params: { id: mindmap.id } })
}

const duplicateMindmap = async (mindmap: any) => {
  try {
    await mindmapStore.duplicateMindmap(mindmap.id)
    toast.success('Mind map duplicated successfully')
    loadMindmaps()
  } catch (error) {
    console.error('Error duplicating mindmap:', error)
    toast.error('Failed to duplicate mind map')
  }
}

const exportMindmap = async (mindmap: any) => {
  // TODO: Implement export functionality
  toast.info('Export functionality coming soon')
}

const toggleArchive = async (mindmap: any) => {
  try {
    await mindmapStore.updateMindmap(mindmap.id, {
      is_archived: !mindmap.is_archived,
    })
    toast.success(mindmap.is_archived ? 'Mind map unarchived' : 'Mind map archived')
    loadMindmaps()
  } catch (error) {
    console.error('Error toggling archive:', error)
    toast.error('Failed to update mind map')
  }
}

const deleteMindmap = async (mindmap: any) => {
  if (confirm(`Are you sure you want to delete "${mindmap.title}"?`)) {
    try {
      await mindmapStore.deleteMindmap(mindmap.id)
      toast.success('Mind map deleted successfully')
      loadMindmaps()
    } catch (error) {
      console.error('Error deleting mindmap:', error)
      toast.error('Failed to delete mind map')
    }
  }
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString()
}

const requiredRule = (v: any) => !!v || 'This field is required'

// Lifecycle
onMounted(() => {
  loadMindmaps()
})

// Watch for changes in selected manuscript
watch(() => manuscriptStore.selectedManuscriptId, () => {
  loadMindmaps()
})
</script>

<style scoped>
.mindmap-card {
  transition: transform 0.2s;
  cursor: pointer;
}

.mindmap-card:hover {
  transform: translateY(-4px);
}

.mindmap-thumbnail {
  height: 120px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
</style>