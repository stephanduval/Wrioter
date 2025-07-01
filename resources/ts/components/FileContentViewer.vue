<template>
  <VDialog 
    v-model="isVisible" 
    max-width="1200" 
    persistent
    scrollable
  >
    <VCard>
      <VCardTitle class="d-flex align-center justify-space-between">
        <div class="d-flex align-center">
          <VIcon :icon="getFileIcon()" class="me-2" />
          <div>
            <div class="text-h6">{{ fileData?.name || 'File Viewer' }}</div>
            <div class="text-caption text-medium-emphasis">
              {{ formatFileSize(fileData?.size || 0) }} • {{ fileData?.type || 'Unknown' }}
            </div>
          </div>
        </div>
        <div class="d-flex align-center">
          <VBtn
            icon
            variant="text"
            @click="downloadFile"
            :disabled="!fileData"
          >
            <VIcon icon="bx-download" />
            <VTooltip activator="parent">Download</VTooltip>
          </VBtn>
          <VBtn
            icon
            variant="text"
            @click="closeDialog"
          >
            <VIcon icon="bx-x" />
          </VBtn>
        </div>
      </VCardTitle>

      <VDivider />

      <VCardText class="pa-0">
        <div v-if="loading" class="text-center pa-8">
          <VProgressCircular size="40" width="4" indeterminate />
          <div class="mt-2">Loading file content...</div>
        </div>

        <VAlert v-else-if="error" type="error" variant="tonal" class="ma-4">
          {{ error }}
        </VAlert>

        <div v-else-if="content" class="file-content-container">
          
          <!-- XML Content -->
          <div v-if="isXmlContent" class="xml-content">
            <div class="content-header pa-3 bg-grey-lighten-5 d-flex align-center justify-space-between">
              <span class="text-subtitle-2">XML Content</span>
              <VBtn 
                size="small" 
                variant="outlined"
                @click="toggleXmlFormatting"
              >
                {{ xmlFormatted ? 'Raw' : 'Formatted' }}
              </VBtn>
            </div>
            <pre v-if="xmlFormatted" class="xml-formatted pa-4"><code v-html="highlightedXml"></code></pre>
            <pre v-else class="xml-raw pa-4"><code>{{ content.content }}</code></pre>
          </div>

          <!-- RTF Content -->
          <div v-else-if="isRtfContent" class="rtf-content">
            <div class="content-header pa-3 bg-grey-lighten-5">
              <span class="text-subtitle-2">RTF Content</span>
            </div>
            <div class="rtf-preview pa-4">
              <div class="text-caption text-medium-emphasis mb-2">
                Raw RTF content ({{ content.content?.length || 0 }} characters):
              </div>
              <pre class="rtf-raw"><code>{{ truncateContent(content.content) }}</code></pre>
            </div>
          </div>

          <!-- Text Content -->
          <div v-else-if="isTextContent" class="text-content">
            <div class="content-header pa-3 bg-grey-lighten-5">
              <span class="text-subtitle-2">Text Content</span>
            </div>
            <pre class="text-raw pa-4"><code>{{ content.content }}</code></pre>
          </div>

          <!-- Binary File -->
          <div v-else-if="content.is_binary" class="binary-content">
            <div class="content-header pa-3 bg-grey-lighten-5">
              <span class="text-subtitle-2">Binary File</span>
            </div>
            <div class="binary-preview pa-4 text-center">
              <VIcon icon="bx-file" size="64" class="text-medium-emphasis mb-4" />
              <div class="text-h6 mb-2">{{ fileData.name }}</div>
              <div class="text-body-2 text-medium-emphasis mb-4">
                This is a binary file that cannot be displayed as text.
              </div>
              <VBtn color="primary" @click="downloadFile">
                <VIcon icon="bx-download" class="me-1" />
                Download File
              </VBtn>
            </div>
          </div>

          <!-- Unknown Content -->
          <div v-else class="unknown-content">
            <div class="content-header pa-3 bg-grey-lighten-5">
              <span class="text-subtitle-2">File Content</span>
            </div>
            <div class="unknown-preview pa-4 text-center">
              <VIcon icon="bx-question-mark" size="64" class="text-medium-emphasis mb-4" />
              <div class="text-body-2 text-medium-emphasis">
                Content type not recognized or empty file.
              </div>
            </div>
          </div>

          <!-- File Metadata -->
          <div v-if="content.metadata" class="metadata-section">
            <VDivider />
            <VExpansionPanels>
              <VExpansionPanel title="File Metadata">
                <VExpansionPanelText>
                  <pre class="metadata-content">{{ JSON.stringify(content.metadata, null, 2) }}</pre>
                </VExpansionPanelText>
              </VExpansionPanel>
            </VExpansionPanels>
          </div>

        </div>

        <div v-else class="no-content pa-8 text-center">
          <VIcon icon="bx-file" size="64" class="text-medium-emphasis mb-4" />
          <div class="text-body-2 text-medium-emphasis">
            No content available
          </div>
        </div>

      </VCardText>

      <VDivider />

      <VCardActions>
        <VSpacer />
        <VBtn variant="text" @click="closeDialog">
          Close
        </VBtn>
        <VBtn 
          color="primary" 
          @click="downloadFile"
          :disabled="!fileData"
        >
          <VIcon icon="bx-download" class="me-1" />
          Download
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

interface Props {
  modelValue: boolean
  fileData: any
  manuscriptId: number
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'download', file: any): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Data refs
const loading = ref(false)
const error = ref('')
const content = ref<any>(null)
const xmlFormatted = ref(true)

// Computed
const isVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const isXmlContent = computed(() => {
  return content.value?.content && 
         (content.value?.content.includes('<?xml') || 
          content.value?.content.includes('<ScrivenerProject') ||
          props.fileData?.name?.endsWith('.xml') ||
          props.fileData?.name?.endsWith('.scrivx'))
})

const isRtfContent = computed(() => {
  return content.value?.content && 
         (content.value?.content.includes('{\\rtf') ||
          props.fileData?.name?.endsWith('.rtf'))
})

const isTextContent = computed(() => {
  return content.value?.content && 
         !isXmlContent.value && 
         !isRtfContent.value && 
         !content.value?.is_binary
})

const highlightedXml = computed(() => {
  if (!isXmlContent.value || !content.value?.content) return ''
  
  try {
    // Simple XML formatting and highlighting
    let formatted = formatXml(content.value.content)
    
    // Add basic syntax highlighting
    formatted = formatted
      .replace(/(&lt;\/?[^&gt;]+&gt;)/g, '<span style="color: #0066cc;">$1</span>')
      .replace(/(\w+)=/g, '<span style="color: #009900;">$1</span>=')
      .replace(/="([^"]*)"/g, '="<span style="color: #cc0000;">$1</span>"')
    
    return formatted
  } catch (e) {
    return content.value.content
  }
})

// Helper functions
const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const getFileIcon = () => {
  if (!props.fileData) return 'bx-file'
  
  const extension = props.fileData.name.split('.').pop()?.toLowerCase()
  const iconMap: any = {
    'xml': 'bx-code-alt',
    'scrivx': 'bx-book',
    'rtf': 'bx-file-doc',
    'txt': 'bx-file',
    'pdf': 'bx-file-pdf',
    'jpg': 'bx-image',
    'jpeg': 'bx-image',
    'png': 'bx-image'
  }
  
  return iconMap[extension] || 'bx-file'
}

const formatXml = (xml: string) => {
  // Simple XML formatter
  let formatted = ''
  let indent = 0
  const tab = '  '
  
  xml = xml.replace(/></g, '>\n<')
  const lines = xml.split('\n')
  
  for (let line of lines) {
    line = line.trim()
    if (line.length === 0) continue
    
    if (line.startsWith('</')) {
      indent--
    }
    
    formatted += tab.repeat(Math.max(0, indent)) + line + '\n'
    
    if (line.startsWith('<') && !line.startsWith('</') && !line.endsWith('/>')) {
      indent++
    }
  }
  
  return formatted.replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

const truncateContent = (content: string, maxLength = 2000) => {
  if (!content) return ''
  if (content.length <= maxLength) return content
  return content.substring(0, maxLength) + '\n\n... (content truncated)'
}

const toggleXmlFormatting = () => {
  xmlFormatted.value = !xmlFormatted.value
}

// API functions
const fetchFileContent = async () => {
  if (!props.fileData) return
  
  loading.value = true
  error.value = ''
  content.value = null
  
  try {
    let url = ''
    
    if (props.fileData.fileType === 'raw') {
      url = `/api/admin/manuscripts/${props.manuscriptId}/raw-files/${props.fileData.id}`
    } else if (props.fileData.fileType === 'attachment') {
      url = `/api/admin/items/${props.fileData.itemId}/attachments/${props.fileData.id}`
    }
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        'Accept': 'application/json'
      }
    })
    
    if (!response.ok) {
      throw new Error(`Failed to fetch file content (${response.status})`)
    }
    
    content.value = await response.json()
    
  } catch (err) {
    console.error('fetchFileContent Error:', err)
    error.value = err instanceof Error ? err.message : 'Failed to load file content'
  } finally {
    loading.value = false
  }
}

// Event handlers
const closeDialog = () => {
  isVisible.value = false
}

const downloadFile = () => {
  if (props.fileData) {
    emit('download', props.fileData)
  }
}

// Watchers
watch(() => props.fileData, (newFile) => {
  if (newFile && props.modelValue) {
    fetchFileContent()
  }
}, { immediate: true })

watch(() => props.modelValue, (isOpen) => {
  if (isOpen && props.fileData) {
    fetchFileContent()
  } else if (!isOpen) {
    content.value = null
    error.value = ''
  }
})
</script>

<style scoped>
.file-content-container {
  max-height: 70vh;
  overflow-y: auto;
}

.content-header {
  border-bottom: 1px solid rgb(var(--v-border-color));
  position: sticky;
  top: 0;
  z-index: 1;
}

.xml-formatted,
.xml-raw,
.text-raw,
.rtf-raw {
  background-color: rgb(var(--v-theme-surface));
  border: 1px solid rgb(var(--v-border-color));
  border-radius: 4px;
  max-height: 500px;
  overflow: auto;
  font-family: 'Roboto Mono', monospace;
  font-size: 0.875rem;
  line-height: 1.4;
  margin: 0;
}

.xml-formatted code {
  white-space: pre;
}

.metadata-content {
  background-color: rgb(var(--v-theme-surface-variant));
  padding: 12px;
  border-radius: 4px;
  font-family: 'Roboto Mono', monospace;
  font-size: 0.75rem;
  margin: 0;
}

.binary-preview,
.unknown-preview {
  min-height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
</style>