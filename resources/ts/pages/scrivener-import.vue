<template>
  <VCard>
    <VCardItem>
      <VCardTitle>{{ $t('scrivener.import.title') }}</VCardTitle>
      <VCardSubtitle>{{ $t('scrivener.import.subtitle') }}</VCardSubtitle>
    </VCardItem>

    <VCardText>
      <VForm @submit.prevent="handleSubmit" data-test="scrivener-import-form">
        <VFileInput
          v-model="file"
          :label="$t('scrivener.import.fileInput')"
          accept=".zip"
          :error-messages="errorMessage"
          :loading="isUploading"
          :disabled="isUploading || isProcessing"
          prepend-icon="bx-import"
          @change="validateFile"
          data-test="file-input"
        />
        
        <!-- File Error Messages -->
        <div v-if="errorMessage" class="text-error mt-2" data-test="file-error">
          {{ errorMessage }}
        </div>

        <!-- Upload Progress -->
        <VProgressLinear
          v-if="isUploading"
          :model-value="uploadProgress"
          color="primary"
          height="20"
          class="mt-4"
          data-test="upload-progress"
        >
          <template #default>
            {{ $t('scrivener.import.uploading', { progress: uploadProgress }) }}
          </template>
        </VProgressLinear>

        <!-- Processing Status -->
        <VCard
          v-if="isProcessing"
          class="mt-4"
          variant="outlined"
          data-test="processing-status"
        >
          <VCardText>
            <div class="d-flex align-center">
              <VProgressCircular
                indeterminate
                color="primary"
                class="me-3"
              />
              <div>
                <div class="text-body-1">
                  {{ $t('scrivener.import.processing') }}
                </div>
                <div class="text-caption">
                  {{ $t('scrivener.import.processingDescription') }}
                </div>
              </div>
            </div>
          </VCardText>
        </VCard>

        <!-- Import Status -->
        <VAlert
          v-if="importStatus"
          :type="importStatus.type"
          class="mt-4"
          closable
          @click:close="importStatus = null"
          data-test="import-status"
        >
          {{ importStatus.message }}
        </VAlert>

        <div class="d-flex justify-end mt-4">
          <VBtn
            type="submit"
            color="primary"
            :loading="isUploading"
            :disabled="!file || isUploading || isProcessing"
            data-test="upload-button"
          >
            {{ $t('scrivener.import.uploadButton') }}
          </VBtn>
        </div>
      </VForm>

      <!-- Recent Imports -->
      <VDivider class="my-4" />
      
      <div class="text-h6 mb-2">
        {{ $t('scrivener.import.recentImports') }}
      </div>

      <VTable v-if="recentImports.length > 0" data-test="recent-imports-table">
        <thead>
          <tr>
            <th>{{ $t('scrivener.import.fileName') }}</th>
            <th>{{ $t('scrivener.import.status') }}</th>
            <th>{{ $t('scrivener.import.date') }}</th>
            <th>{{ $t('scrivener.import.actions') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="{ id, filename, status, created_at, manuscript_id } in recentImports"
            :key="id"
          >
            <td data-test="import-filename">{{ filename }}</td>
            <td>
              <VChip
                :color="getStatusColor(status)"
                size="small"
                data-test="import-status"
              >
                {{ $t(`scrivener.import.statuses.${status}`) }}
              </VChip>
            </td>
            <td>{{ formatDate(created_at) }}</td>
            <td>
              <VBtn
                v-if="status === 'completed' && manuscript_id"
                size="small"
                variant="text"
                :to="{ name: 'manuscripts-view', params: { id: manuscript_id }}"
                data-test="view-manuscript-button"
              >
                {{ $t('scrivener.import.viewManuscript') }}
              </VBtn>
              <VBtn
                v-else-if="status === 'failed'"
                size="small"
                variant="text"
                color="error"
                @click="showErrorDetails(id, filename, error_message)"
              >
                View Error
              </VBtn>
            </td>
          </tr>
        </tbody>
      </VTable>

      <VAlert
        v-else
        type="info"
        variant="tonal"
      >
        {{ $t('scrivener.import.noImports') }}
      </VAlert>
      
      <!-- Clear Failed Imports Button -->
      <div v-if="hasFailedImports" class="mt-4 text-center">
        <VBtn
          color="warning"
          variant="outlined"
          size="small"
          @click="clearFailedImports"
          :loading="clearingFailed"
        >
          Clear Failed Imports
        </VBtn>
      </div>
    </VCardText>
  </VCard>

  <!-- Error Details Dialog -->
  <VDialog v-model="errorDialog" max-width="600">
    <VCard>
      <VCardTitle class="text-h5">
        Import Error Details
      </VCardTitle>
      <VCardText>
        <div class="mb-3">
          <strong>File:</strong> {{ errorDetails.filename }}
        </div>
        <div class="mb-3">
          <strong>Error:</strong>
        </div>
        <VAlert type="error" variant="tonal" class="text-wrap">
          {{ errorDetails.message }}
        </VAlert>
      </VCardText>
      <VCardActions>
        <VSpacer />
        <VBtn color="grey" variant="text" @click="errorDialog = false">
          Close
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<script setup lang="ts">
import { format } from 'date-fns'
import { onMounted, onUnmounted, ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useToast } from 'vue-toastification'

const { t } = useI18n()
const toast = useToast()

// File upload state
const file = ref<File | null>(null)
const isUploading = ref(false)
const isProcessing = ref(false)
const uploadProgress = ref(0)
const errorMessage = ref('')
const importStatus = ref<{ type: 'success' | 'error', message: string } | null>(null)

// Recent imports state
const recentImports = ref<Array<{
  id: number
  filename: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  created_at: string
  manuscript_id?: number
  error_message?: string
}>>([])

// Error dialog state
const errorDialog = ref(false)
const errorDetails = ref({ filename: '', message: '' })
const clearingFailed = ref(false)

// Polling interval for status updates
let statusPollingInterval: number | null = null

// Track the current upload ID for processing status
const currentUploadId = ref<number | null>(null)

// Computed properties
const hasFailedImports = computed(() => {
  return recentImports.value.some(imp => imp.status === 'failed')
})

onMounted(async () => {
  await fetchRecentImports()
  startStatusPolling()
})

const startStatusPolling = () => {
  // Poll every 5 seconds for status updates
  statusPollingInterval = window.setInterval(async () => {
    const pendingImports = recentImports.value.filter(imp => 
      imp.status === 'pending' || imp.status === 'processing'
    )
    
    if (pendingImports.length > 0) {
      await fetchRecentImports()
      
      // Check if current upload is complete
      if (currentUploadId.value && isProcessing.value) {
        const currentImport = recentImports.value.find(imp => imp.id === currentUploadId.value)
        if (currentImport && (currentImport.status === 'completed' || currentImport.status === 'failed')) {
          isProcessing.value = false
          currentUploadId.value = null
          
          if (currentImport.status === 'completed') {
            toast.success(t('scrivener.import.processingComplete'))
          } else {
            toast.error(t('scrivener.import.processingFailed'))
          }
        }
      }
    } else if (isProcessing.value && currentUploadId.value) {
      // If no pending imports but we're still processing, check our specific upload
      const currentImport = recentImports.value.find(imp => imp.id === currentUploadId.value)
      if (currentImport && (currentImport.status === 'completed' || currentImport.status === 'failed')) {
        isProcessing.value = false
        currentUploadId.value = null
        
        if (currentImport.status === 'completed') {
          toast.success(t('scrivener.import.processingComplete'))
        } else {
          toast.error(t('scrivener.import.processingFailed'))
        }
      }
    }
  }, 5000)
}

const fetchRecentImports = async () => {
  try {
    const response = await fetch('/api/scrivener/imports', {
      headers: {
        'Accept': 'application/json',
        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
    })
    if (!response.ok) throw new Error('Failed to fetch imports')
    recentImports.value = await response.json()
  }
  catch (error) {
    console.error('Error fetching imports:', error)
  }
}

const validateFile = (event: Event) => {
  const target = event.target as HTMLInputElement
  const selectedFile = target.files?.[0]

  if (!selectedFile) {
    file.value = null
    errorMessage.value = ''
    return
  }

  if (selectedFile.type !== 'application/zip' && !selectedFile.name.endsWith('.zip')) {
    errorMessage.value = t('scrivener.import.errors.invalidFileType')
    file.value = null
    return
  }

  if (selectedFile.size > 50 * 1024 * 1024) { // 50MB limit
    errorMessage.value = t('scrivener.import.errors.fileTooLarge')
    file.value = null
    return
  }

  errorMessage.value = ''
  file.value = selectedFile
}

const handleSubmit = async () => {
  if (!file.value) return

  isUploading.value = true
  uploadProgress.value = 0
  errorMessage.value = ''
  importStatus.value = null

  try {
    const formData = new FormData()
    formData.append('file', file.value)

    const xhr = new XMLHttpRequest()
    
    // Handle upload progress
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        uploadProgress.value = Math.round((event.loaded / event.total) * 100)
      }
    }

    // Create a promise to handle the XHR request
    const uploadPromise = new Promise((resolve, reject) => {
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(JSON.parse(xhr.responseText))
        } else {
          reject(new Error(xhr.responseText || 'Upload failed'))
        }
      }
      xhr.onerror = () => reject(new Error('Network error'))
    })

    xhr.open('POST', '/api/scrivener/import')
    xhr.setRequestHeader('X-CSRF-TOKEN', document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '')
    xhr.setRequestHeader('Authorization', `Bearer ${localStorage.getItem('accessToken')}`)
    xhr.send(formData)

    const result = await uploadPromise
    isProcessing.value = true
    importStatus.value = {
      type: 'success',
      message: t('scrivener.import.uploadSuccess')
    }
    
    // Refresh the imports list
    await fetchRecentImports()
    
    // Set the current upload ID to track processing status
    if (result && result.id) {
      currentUploadId.value = result.id
    }
    
    // Reset form
    file.value = null
  }
  catch (error) {
    importStatus.value = {
      type: 'error',
      message: error instanceof Error ? error.message : t('scrivener.import.errors.uploadFailed')
    }
    toast.error(importStatus.value.message)
    isProcessing.value = false
    currentUploadId.value = null
  }
  finally {
    isUploading.value = false
    uploadProgress.value = 0
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
      return 'success'
    case 'processing':
      return 'info'
    case 'pending':
      return 'warning'
    case 'failed':
      return 'error'
    default:
      return 'grey'
  }
}

const formatDate = (date: string) => {
  return format(new Date(date), 'PPpp')
}

const showErrorDetails = (id: number, filename: string, message: string) => {
  errorDetails.value = { filename, message }
  errorDialog.value = true
}

const clearFailedImports = async () => {
  clearingFailed.value = true
  try {
    const failedImports = recentImports.value.filter(imp => imp.status === 'failed')
    
    for (const imp of failedImports) {
      await fetch(`/api/scrivener/imports/${imp.id}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      })
    }
    
    await fetchRecentImports()
    toast.success('Failed imports cleared successfully')
  } catch (error) {
    console.error('Error clearing failed imports:', error)
    toast.error('Failed to clear imports')
  } finally {
    clearingFailed.value = false
  }
}

// Cleanup polling on component unmount
onUnmounted(() => {
  if (statusPollingInterval) {
    clearInterval(statusPollingInterval)
  }
})
</script>

<style scoped>
.v-card {
  margin-block: 0;
  margin-inline: auto;
  max-inline-size: 800px;
}
</style> 
 