<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useApi } from '@/composables/useApi'

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

// State
const manuscripts = ref<Manuscript[]>([])
const selectedManuscript = ref<Manuscript | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

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
    manuscripts.value = response.data.data
  } catch (err: any) {
    console.error('Failed to fetch manuscripts:', err)
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

// Lifecycle
onMounted(() => {
  if (props.isDialogVisible) {
    fetchManuscripts()
  }
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
        <div v-else-if="manuscripts.length === 0" class="text-center pa-6">
          <VIcon icon="bx-book" size="48" color="grey" />
          <p class="mt-3 text-body-1">No manuscripts found</p>
          <p class="text-body-2 text-grey">Create a manuscript to get started</p>
        </div>

        <!-- Manuscript List -->
        <VList
          v-else
          lines="two"
          class="manuscript-list"
          style="max-height: 450px; overflow-y: auto;"
        >
          <VListItem
            v-for="manuscript in manuscripts"
            :key="manuscript.id"
            :value="manuscript"
            @click="selectManuscript(manuscript)"
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
</template>

<style scoped>
.manuscript-list {
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 0, 0, 0.2) transparent;
}

.manuscript-list::-webkit-scrollbar {
  width: 6px;
}

.manuscript-list::-webkit-scrollbar-track {
  background: transparent;
}

.manuscript-list::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}

.v-list-item--active {
  background-color: rgba(var(--v-theme-primary), 0.08);
}
</style>