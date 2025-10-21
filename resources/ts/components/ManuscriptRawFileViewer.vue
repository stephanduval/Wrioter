<template>
  <div class="manuscript-raw-file-viewer">
    <VAlert v-if="loading" type="info" variant="tonal" class="mb-4">
      <VProgressCircular size="20" width="2" indeterminate class="me-2" />
      Loading manuscript raw files...
    </VAlert>

    <VAlert v-else-if="error" type="error" variant="tonal" class="mb-4">
      {{ error }}
    </VAlert>

    <div v-else-if="structure">
      <!-- Manuscript Header -->
      <div class="manuscript-header mb-4 pa-4 bg-surface rounded">
        <div class="d-flex align-center justify-space-between mb-3">
          <div class="d-flex align-center">
            <VIcon icon="bx-folder-open" color="primary" class="me-2" size="24" />
            <span class="text-h5">{{ structure.manuscript.title }}</span>
            <VChip size="small" color="info" variant="tonal" class="ms-2">
              Raw Files
            </VChip>
          </div>
          <VBtn 
            color="primary" 
            variant="outlined" 
            size="small"
            @click="refreshData"
            :loading="loading"
          >
            <VIcon icon="bx-refresh" class="me-1" />
            Refresh
          </VBtn>
        </div>
        
        <div class="text-body-2 text-medium-emphasis mb-2">
          <strong>UUID:</strong> <code>{{ structure.manuscript.scrivener_uuid }}</code>
        </div>
        <div class="text-body-2 text-medium-emphasis mb-2">
          <strong>Imported:</strong> {{ formatDate(structure.manuscript.imported_at) }}
        </div>
        <div class="text-body-2 text-medium-emphasis" v-if="structure.manuscript.version">
          <strong>Version:</strong> {{ structure.manuscript.version }}
        </div>
      </div>

      <!-- Statistics Cards -->
      <VRow class="mb-4">
        <VCol cols="3">
          <VCard variant="tonal" color="primary">
            <VCardText class="text-center">
              <div class="text-h6">{{ structure.stats.total_raw_files }}</div>
              <div class="text-caption">Raw Files</div>
            </VCardText>
          </VCard>
        </VCol>
        <VCol cols="3">
          <VCard variant="tonal" color="success">
            <VCardText class="text-center">
              <div class="text-h6">{{ structure.stats.total_attachments }}</div>
              <div class="text-caption">Attachments</div>
            </VCardText>
          </VCard>
        </VCol>
        <VCol cols="3">
          <VCard variant="tonal" color="info">
            <VCardText class="text-center">
              <div class="text-h6">{{ formatFileSize(structure.stats.total_size) }}</div>
              <div class="text-caption">Total Size</div>
            </VCardText>
          </VCard>
        </VCol>
        <VCol cols="3">
          <VCard variant="tonal" color="warning">
            <VCardText class="text-center">
              <div class="text-h6">{{ structure.project_files.length + structure.data_files.length + structure.snapshots.length + structure.settings.length }}</div>
              <div class="text-caption">File Groups</div>
            </VCardText>
          </VCard>
        </VCol>
      </VRow>

      <!-- File Structure -->
      <VExpansionPanels multiple class="mb-4">
        
        <!-- Project Files -->
        <VExpansionPanel v-if="structure.project_files.length > 0">
          <VExpansionPanelTitle>
            <div class="d-flex align-center">
              <VIcon icon="bx-file-doc" color="primary" class="me-2" />
              Project Files
              <VChip size="x-small" variant="outlined" class="ms-2">
                {{ structure.project_files.length }} files
              </VChip>
            </div>
          </VExpansionPanelTitle>
          <VExpansionPanelText>
            <RawFileTree 
              :files="structure.project_files" 
              file-type="raw"
              @file-selected="onFileSelected"
            />
          </VExpansionPanelText>
        </VExpansionPanel>

        <!-- Data Files (Item Attachments) -->
        <VExpansionPanel v-if="structure.data_files.length > 0">
          <VExpansionPanelTitle>
            <div class="d-flex align-center">
              <VIcon icon="bx-folder" color="success" class="me-2" />
              Data Files
              <VChip size="x-small" variant="outlined" class="ms-2">
                {{ getTotalAttachments() }} files in {{ structure.data_files.length }} items
              </VChip>
            </div>
          </VExpansionPanelTitle>
          <VExpansionPanelText>
            <div class="data-files-container">
              <div 
                v-for="item in structure.data_files" 
                :key="item.uuid"
                class="item-folder mb-3"
              >
                <div class="item-header d-flex align-center mb-2 pa-2 bg-grey-lighten-5 rounded">
                  <VIcon :icon="getItemIcon(item)" class="me-2" />
                  <strong>{{ item.title }}</strong>
                  <VChip size="x-small" color="info" variant="tonal" class="ms-2">
                    {{ item.type }}
                  </VChip>
                  <VChip size="x-small" variant="outlined" class="ms-1">
                    {{ item.attachments.length }} files
                  </VChip>
                </div>
                <RawFileTree 
                  :files="item.attachments" 
                  file-type="attachment"
                  :item-id="item.uuid"
                  @file-selected="onAttachmentSelected"
                  class="ms-4"
                />
              </div>
            </div>
          </VExpansionPanelText>
        </VExpansionPanel>

        <!-- Snapshots -->
        <VExpansionPanel v-if="structure.snapshots.length > 0">
          <VExpansionPanelTitle>
            <div class="d-flex align-center">
              <VIcon icon="bx-camera" color="warning" class="me-2" />
              Snapshots
              <VChip size="x-small" variant="outlined" class="ms-2">
                {{ structure.snapshots.length }} files
              </VChip>
            </div>
          </VExpansionPanelTitle>
          <VExpansionPanelText>
            <RawFileTree 
              :files="structure.snapshots" 
              file-type="raw"
              @file-selected="onFileSelected"
            />
          </VExpansionPanelText>
        </VExpansionPanel>

        <!-- Settings -->
        <VExpansionPanel v-if="structure.settings.length > 0">
          <VExpansionPanelTitle>
            <div class="d-flex align-center">
              <VIcon icon="bx-cog" color="secondary" class="me-2" />
              Settings
              <VChip size="x-small" variant="outlined" class="ms-2">
                {{ structure.settings.length }} files
              </VChip>
            </div>
          </VExpansionPanelTitle>
          <VExpansionPanelText>
            <RawFileTree 
              :files="structure.settings" 
              file-type="raw"
              @file-selected="onFileSelected"
            />
          </VExpansionPanelText>
        </VExpansionPanel>

      </VExpansionPanels>
    </div>

    <VAlert v-else type="info" variant="tonal">
      No raw file data available for this manuscript
    </VAlert>

    <!-- File Content Viewer Dialog -->
    <FileContentViewer
      v-model="showContentViewer"
      :file-data="selectedFile"
      :manuscript-id="manuscriptId"
      @download="onDownloadFile"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { format } from 'date-fns'
import RawFileTree from './RawFileTree.vue'
import FileContentViewer from './FileContentViewer.vue'

interface Props {
  manuscriptId: number
}

const props = defineProps<Props>()

// Data refs
const loading = ref(false)
const error = ref('')
const structure = ref<any>(null)
const showContentViewer = ref(false)
const selectedFile = ref<any>(null)

// Helper functions
const formatDate = (date: string) => {
  if (!date) return 'Unknown'
  return format(new Date(date), 'MMM d, yyyy HH:mm')
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const getItemIcon = (item: any) => {
  const icons: any = {
    'folder': 'bx-folder',
    'text': 'bx-file-doc',
    'image': 'bx-image',
    'file': 'bx-file'
  }
  return icons[item.type] || 'bx-file'
}

const getTotalAttachments = () => {
  if (!structure.value?.data_files) return 0
  return structure.value.data_files.reduce((total: number, item: any) => {
    return total + (item.attachments?.length || 0)
  }, 0)
}

// API functions
const fetchManuscriptStructure = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const response = await fetch(`/api/admin/manuscripts/${props.manuscriptId}/structure`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        'Accept': 'application/json'
      }
    })
    
    if (!response.ok) {
      throw new Error(`Failed to fetch manuscript structure (${response.status})`)
    }
    
    structure.value = await response.json()
    
  } catch (err) {
    console.error('fetchManuscriptStructure Error:', err)
    error.value = err instanceof Error ? err.message : 'Failed to load manuscript structure'
  } finally {
    loading.value = false
  }
}

const refreshData = () => {
  fetchManuscriptStructure()
}

// Event handlers
const onFileSelected = (file: any) => {
  selectedFile.value = {
    ...file,
    fileType: 'raw'
  }
  showContentViewer.value = true
}

const onAttachmentSelected = (file: any, itemId: string) => {
  selectedFile.value = {
    ...file,
    fileType: 'attachment',
    itemId: itemId
  }
  showContentViewer.value = true
}

const onDownloadFile = (file: any) => {
  let downloadUrl = ''
  
  if (file.fileType === 'raw') {
    downloadUrl = `/api/admin/manuscripts/${props.manuscriptId}/raw-files/${file.id}/download`
  } else if (file.fileType === 'attachment') {
    downloadUrl = `/api/admin/items/${file.itemId}/attachments/${file.id}/download`
  }
  
  if (downloadUrl) {
    const link = document.createElement('a')
    link.href = downloadUrl + `?token=${localStorage.getItem('accessToken')}`
    link.download = file.name
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}

// Initialize
onMounted(() => {
  fetchManuscriptStructure()
})
</script>

<style scoped>
.manuscript-raw-file-viewer {
  font-family: 'Roboto Mono', monospace;
}

.manuscript-header {
  border: 1px solid rgb(var(--v-border-color));
}

.data-files-container {
  max-height: 600px;
  overflow-y: auto;
}

.item-folder {
  border: 1px solid rgb(var(--v-border-color));
  border-radius: 8px;
  padding: 8px;
}

.item-header {
  border-bottom: 1px solid rgb(var(--v-border-color));
}
</style>