<script setup lang="ts">
import { ref, computed, onMounted, watch, onUnmounted } from 'vue'
import { useApi } from '@/composables/useApi'
import { useContextMenu } from '@/composables/useContextMenu'
import { getManuscriptMenuItems } from '@/config/contextMenus/manuscriptMenus'
import { dataSync } from '@/services/dataSync'
import { useManuscriptStore } from '@/stores/manuscript'

interface Manuscript {
  id: number
  title: string
  manuscript_type: 'standard' | 'scrivener'
  created_at: string
  updated_at: string
  description?: string
}

interface Props {
  isDialogVisible: boolean
}

interface Emit {
  (e: 'update:isDialogVisible', value: boolean): void
  (e: 'manuscript-selected', manuscript: Manuscript): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emit>()

const { api } = useApi()
const contextMenu = useContextMenu()

// State
const manuscripts = ref<Manuscript[]>([])
const selectedManuscript = ref<Manuscript | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)
const deleteConfirmDialogVisible = ref(false)
const manuscriptToDelete = ref<Manuscript | null>(null)
const isDeleting = ref(false)

// Computed
const updateModelValue = (val: boolean) => {
  emit('update:isDialogVisible', val)
}

// Methods
const fetchManuscripts = async () => {
  loading.value = true
  error.value = null

  try {
    const response = await api.get('/manuscripts')
    console.log('Manuscripts API response:', response.data)

    // Handle different response structures
    if (response.data && Array.isArray(response.data.data)) {
      manuscripts.value = response.data.data
    } else if (response.data && Array.isArray(response.data)) {
      manuscripts.value = response.data
    } else {
      manuscripts.value = []
      console.warn('Unexpected API response structure:', response.data)
    }
  } catch (err: any) {
    console.error('Failed to fetch manuscripts:', err)
    manuscripts.value = []
    error.value = err.response?.data?.message || 'Failed to load manuscripts'
  } finally {
    loading.value = false
  }
}

const selectManuscript = (manuscript: Manuscript) => {
  selectedManuscript.value = manuscript
}

const onConfirm = () => {
  if (selectedManuscript.value) {
    emit('manuscript-selected', selectedManuscript.value)
    updateModelValue(false)
  }
}

const onCancel = () => {
  selectedManuscript.value = null
  updateModelValue(false)
}

const handleManuscriptContextMenu = (event: MouseEvent, manuscript: Manuscript) => {
  console.log('Context menu triggered for manuscript:', manuscript.id, manuscript.title)
  event.preventDefault()
  event.stopPropagation()

  const menuItems = getManuscriptMenuItems(manuscript, {
    onDeleteRequest: (m: Manuscript) => {
      manuscriptToDelete.value = m
      deleteConfirmDialogVisible.value = true
    }
  })
  console.log('Menu items generated:', menuItems)
  contextMenu.show(event, { items: menuItems })
  console.log('Context menu shown')
}

const handleManuscriptDeleted = (manuscriptId: number) => {
  // Remove the deleted manuscript from the local list
  manuscripts.value = manuscripts.value.filter(m => m.id !== manuscriptId)
  console.log(`Manuscript ${manuscriptId} removed from dialog list`)
}

const handleDeleteConfirm = async () => {
  if (!manuscriptToDelete.value) return

  try {
    isDeleting.value = true
    console.log('User confirmed deletion of manuscript:', manuscriptToDelete.value.id)
    const manuscriptStore = useManuscriptStore()
    await manuscriptStore.deleteManuscript(manuscriptToDelete.value.id)
    console.log('Manuscript deleted successfully')
    deleteConfirmDialogVisible.value = false
    manuscriptToDelete.value = null
  } catch (error) {
    console.error('Failed to delete manuscript:', error)
    alert('Failed to delete manuscript. Please try again.')
  } finally {
    isDeleting.value = false
  }
}

const handleDeleteCancel = () => {
  deleteConfirmDialogVisible.value = false
  manuscriptToDelete.value = null
}

// Lifecycle
onMounted(() => {
  if (props.isDialogVisible) {
    fetchManuscripts()
  }

  // Listen for manuscript deletions
  dataSync.on('manuscript:deleted', ({ manuscriptId }) => {
    handleManuscriptDeleted(manuscriptId)
  })
})

onUnmounted(() => {
  // Clean up listeners
  dataSync.off('manuscript:deleted')
})

// Watch for dialog visibility
watch(() => props.isDialogVisible, (newVal) => {
  if (newVal) {
    fetchManuscripts()
    selectedManuscript.value = null
  }
})
</script>

<template>
  <VDialog
    :model-value="props.isDialogVisible"
    @update:model-value="updateModelValue"
    max-width="600"
    persistent
  >
    <VCard>
      <VCardTitle class="text-h5 pa-6 pb-4">
        Select a Manuscript
      </VCardTitle>

      <VDivider />

      <VCardText class="pa-0">
        <!-- Loading State -->
        <div v-if="loading" class="text-center pa-6">
          <VProgressCircular indeterminate color="primary" />
          <p class="mt-3 text-body-2">Loading manuscripts...</p>
        </div>

        <!-- Error State -->
        <VAlert v-else-if="error" type="error" variant="tonal" class="ma-4">
          {{ error }}
        </VAlert>

        <!-- Empty State -->
        <div v-else-if="!manuscripts || manuscripts.length === 0" class="text-center pa-6">
          <VIcon icon="bx-book" size="48" color="grey" />
          <p class="mt-3 text-body-1">No manuscripts found</p>
          <p class="text-body-2 text-grey">Create a manuscript to get started</p>
        </div>

        <!-- Manuscript List -->
        <VList
          v-else-if="manuscripts && manuscripts.length > 0"
          lines="two"
          class="manuscript-list"
          style="max-block-size: 450px; overflow-y: auto;"
        >
          <VListItem
            v-for="manuscript in manuscripts"
            :key="manuscript.id"
            :value="manuscript"
            @click="selectManuscript(manuscript)"
            @contextmenu.prevent.stop="handleManuscriptContextMenu($event, manuscript)"
            :class="{ 'v-list-item--active': selectedManuscript?.id === manuscript.id }"
          >
            <template #prepend>
              <VIcon 
                :icon="manuscript.manuscript_type === 'scrivener' ? 'bx-folder' : 'bx-book'"
                :color="selectedManuscript?.id === manuscript.id ? 'primary' : 'grey'"
              />
            </template>

            <VListItemTitle>
              {{ manuscript.title }}
            </VListItemTitle>
            
            <VListItemSubtitle>
              <span class="text-caption">
                {{ manuscript.manuscript_type === 'scrivener' ? 'Scrivener Import' : 'Standard Manuscript' }}
                • Updated {{ new Date(manuscript.updated_at).toLocaleDateString() }}
              </span>
            </VListItemSubtitle>

            <template #append>
              <VChip
                v-if="selectedManuscript?.id === manuscript.id"
                color="primary"
                size="small"
                variant="tonal"
              >
                Selected
              </VChip>
            </template>
          </VListItem>
        </VList>
      </VCardText>

      <VDivider />

      <VCardActions class="pa-6 pt-4">
        <VSpacer />
        
        <VBtn
          variant="outlined"
          color="secondary"
          @click="onCancel"
        >
          Cancel
        </VBtn>
        
        <VBtn
          color="primary"
          variant="elevated"
          :disabled="!selectedManuscript"
          @click="onConfirm"
        >
          OK
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>

  <!-- Delete Confirmation Dialog -->
  <VDialog
    v-model="deleteConfirmDialogVisible"
    max-width="400"
    persistent
  >
    <VCard>
      <VCardTitle class="text-h6 pa-6 pb-4">
        Delete Manuscript
      </VCardTitle>

      <VDivider />

      <VCardText class="pa-6">
        <p class="mb-0">
          Are you sure you want to delete <strong>"{{ manuscriptToDelete?.title }}"</strong>?
        </p>
        <p class="text-caption text-grey mt-2 mb-0">
          This action cannot be undone.
        </p>
      </VCardText>

      <VDivider />

      <VCardActions class="pa-6 pt-4">
        <VSpacer />

        <VBtn
          variant="outlined"
          color="secondary"
          :disabled="isDeleting"
          @click="handleDeleteCancel"
        >
          Cancel
        </VBtn>

        <VBtn
          color="error"
          variant="elevated"
          :loading="isDeleting"
          @click="handleDeleteConfirm"
        >
          Delete
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<style scoped>
.manuscript-list {
  scrollbar-color: rgba(0, 0, 0, 20%) transparent;
  scrollbar-width: thin;
}

.manuscript-list::-webkit-scrollbar {
  inline-size: 6px;
}

.manuscript-list::-webkit-scrollbar-track {
  background: transparent;
}

.manuscript-list::-webkit-scrollbar-thumb {
  border-radius: 3px;
  background-color: rgba(0, 0, 0, 20%);
}

.v-list-item--active {
  background-color: rgba(var(--v-theme-primary), 0.08);
}
</style>