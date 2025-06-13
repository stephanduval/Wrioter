<template>
  <VCard>
    <VCardItem>
      <VCardTitle>{{ $t('scrivener.import.title') }}</VCardTitle>
      <VCardSubtitle>{{ $t('scrivener.import.subtitle') }}</VCardSubtitle>
    </VCardItem>

    <VCardText>
      <VForm @submit.prevent="handleSubmit">
        <VFileInput
          v-model="file"
          :label="$t('scrivener.import.fileInput')"
          accept=".zip"
          :error-messages="errorMessage"
          :loading="isUploading"
          :disabled="isUploading || isProcessing"
          prepend-icon="bx-import"
          @change="validateFile"
        />

        <!-- Upload Progress -->
        <VProgressLinear
          v-if="isUploading"
          :model-value="uploadProgress"
          color="primary"
          height="20"
          class="mt-4"
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
        >
          {{ importStatus.message }}
        </VAlert>

        <div class="d-flex justify-end mt-4">
          <VBtn
            type="submit"
            color="primary"
            :loading="isUploading"
            :disabled="!file || isUploading || isProcessing"
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

      <VTable v-if="recentImports.length > 0">
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
            <td>{{ filename }}</td>
            <td>
              <VChip
                :color="getStatusColor(status)"
                size="small"
              >
                {{ $t(`scrivener.import.statuses.${status}`) }}
              </VChip>
            </td>
            <td>{{ formatDate(created_at) }}</td>
            <td>
              <VBtn
                v-if="status === 'completed'"
                size="small"
                variant="text"
                :to="{ name: 'manuscripts-view', params: { id: manuscript_id }}"
              >
                {{ $t('scrivener.import.viewManuscript') }}
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
    </VCardText>
  </VCard>
</template>

<script setup lang="ts">
import { format } from 'date-fns'
import { onMounted, onUnmounted, ref } from 'vue'
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
}>>([])

// Polling interval for status updates
let statusPollingInterval: number | null = null

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
    
    // Reset form
    file.value = null
  }
  catch (error) {
    importStatus.value = {
      type: 'error',
      message: error instanceof Error ? error.message : t('scrivener.import.errors.uploadFailed')
    }
    toast.error(importStatus.value.message)
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
 