<template>
  <div>
    <!-- File Upload Section -->
    <VCard class="mb-4">
      <VCardTitle>Import Scrivener File</VCardTitle>
      <VCardText>
        <VForm @submit.prevent="handleSubmit">
          <VFileInput
            v-model="file"
            :label="$t('scrivener.import.fileInput')"
            accept=".zip"
            :error-messages="errors.file"
            @change="validateFile"
          />
          <VBtn
            type="submit"
            color="primary"
            :loading="uploading"
            :disabled="!file || uploading"
          >
            {{ $t('scrivener.import.uploadButton') }}
          </VBtn>
        </VForm>
      </VCardText>
    </VCard>

    <!-- Recent Imports Section -->
    <VCard>
      <VCardTitle>Recent Imports</VCardTitle>
      <VCardText>
        <VDataTable
          :headers="headers"
          :items="imports"
          :loading="loading"
        >
          <template #item.status="{ item }">
            <VChip :color="getStatusColor(item.status)">
              {{ item.status }}
            </VChip>
          </template>

          <template #item.progress="{ item }">
            <div v-if="item.status === 'processing'">
              <VProgressLinear
                :model-value="item.progress"
                :color="getProgressColor(item.progress)"
                height="20"
              >
                <template #default>
                  {{ Math.round(item.progress) }}%
                </template>
              </VProgressLinear>
              <div class="text-caption mt-1">
                {{ item.current_step }}
              </div>
            </div>
            <div v-else-if="item.status === 'failed'" class="text-error">
              {{ item.error_message }}
            </div>
          </template>

          <template #item.actions="{ item }">
            <VBtn
              v-if="item.status === 'pending'"
              @click="cancelImport(item)"
              color="error"
              size="small"
            >
              Cancel
            </VBtn>
            <VBtn
              v-if="item.status === 'failed'"
              @click="retryImport(item)"
              color="primary"
              size="small"
            >
              Retry
            </VBtn>
          </template>
        </VDataTable>
      </VCardText>
    </VCard>
  </div>
</template>

<script setup>
import axios from 'axios'
import { onMounted, onUnmounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const file = ref(null)
const uploading = ref(false)
const loading = ref(false)
const imports = ref([])
const errors = ref({})
const pollInterval = ref(null)

const headers = [
  { title: 'Filename', key: 'filename' },
  { title: 'Status', key: 'status' },
  { title: 'Progress', key: 'progress' },
  { title: 'Created', key: 'created_at' },
  { title: 'Actions', key: 'actions', sortable: false },
]

const validateFile = () => {
  errors.value = {}
  if (!file.value) return

  if (!file.value.name.endsWith('.zip')) {
    errors.value.file = t('scrivener.import.errors.invalidFileType')
    file.value = null
    return
  }

  if (file.value.size > 50 * 1024 * 1024) { // 50MB
    errors.value.file = t('scrivener.import.errors.fileTooLarge')
    file.value = null
    return
  }
}

const handleSubmit = async () => {
  if (!file.value) return

  uploading.value = true
  errors.value = {}

  const formData = new FormData()
  formData.append('file', file.value)

  try {
    const response = await axios.post('/api/scrivener/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    // Clear the file input
    file.value = null

    // Refresh the imports list
    await fetchImports()

    // Start polling for updates
    startPolling()

  } catch (error) {
    console.error('Upload failed:', error)
    errors.value.file = error.response?.data?.message || t('scrivener.import.errors.uploadFailed')
  } finally {
    uploading.value = false
  }
}

const fetchImports = async () => {
  loading.value = true
  try {
    const response = await axios.get('/api/scrivener/imports')
    imports.value = response.data
  } catch (error) {
    console.error('Failed to fetch imports:', error)
  } finally {
    loading.value = false
  }
}

const startPolling = () => {
  // Clear any existing interval
  if (pollInterval.value) {
    clearInterval(pollInterval.value)
  }

  // Start polling every 2 seconds
  pollInterval.value = setInterval(async () => {
    const hasProcessing = imports.value.some(imp => imp.status === 'processing')
    if (hasProcessing) {
      await fetchImports()
    } else {
      // Stop polling if no imports are processing
      clearInterval(pollInterval.value)
      pollInterval.value = null
    }
  }, 2000)
}

const getStatusColor = (status) => {
  switch (status) {
    case 'pending': return 'warning'
    case 'processing': return 'info'
    case 'completed': return 'success'
    case 'failed': return 'error'
    default: return 'grey'
  }
}

const getProgressColor = (progress) => {
  if (progress >= 90) return 'success'
  if (progress >= 50) return 'info'
  return 'primary'
}

const cancelImport = async (importItem) => {
  try {
    await axios.post(`/api/scrivener/imports/${importItem.id}/cancel`)
    await fetchImports()
  } catch (error) {
    console.error('Failed to cancel import:', error)
  }
}

const retryImport = async (importItem) => {
  try {
    await axios.post(`/api/scrivener/imports/${importItem.id}/retry`)
    await fetchImports()
    startPolling()
  } catch (error) {
    console.error('Failed to retry import:', error)
  }
}

onMounted(() => {
  fetchImports()
})

onUnmounted(() => {
  if (pollInterval.value) {
    clearInterval(pollInterval.value)
  }
})
</script>

<style scoped>
.v-progress-linear {
  border-radius: 4px;
}
</style> 
