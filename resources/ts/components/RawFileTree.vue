<template>
  <div class="raw-file-tree">
    <VList density="compact">
      <VListItem
        v-for="file in files"
        :key="file.id"
        class="file-item"
        @click="selectFile(file)"
      >
        <template #prepend>
          <VIcon :icon="getFileIcon(file)" :color="getFileColor(file)" size="small" />
        </template>
        
        <VListItemTitle>
          <div class="d-flex align-center justify-space-between">
            <span class="file-name">{{ file.name }}</span>
            <div class="file-info d-flex align-center">
              <VChip 
                size="x-small" 
                :color="getFileTypeColor(file.type)" 
                variant="tonal" 
                class="me-2"
              >
                {{ file.type }}
              </VChip>
              <span class="text-caption text-medium-emphasis">
                {{ formatFileSize(file.size) }}
              </span>
            </div>
          </div>
        </VListItemTitle>
        
        <VListItemSubtitle v-if="file.path">
          <code class="text-caption">{{ file.path }}</code>
        </VListItemSubtitle>
        
        <template #append>
          <div class="file-actions">
            <VBtn
              icon
              size="small"
              variant="text"
              @click.stop="viewFile(file)"
              :disabled="!isViewable(file)"
            >
              <VIcon icon="bx-show" />
              <VTooltip activator="parent">View Content</VTooltip>
            </VBtn>
            
            <VBtn
              icon
              size="small"
              variant="text" 
              @click.stop="downloadFile(file)"
            >
              <VIcon icon="bx-download" />
              <VTooltip activator="parent">Download</VTooltip>
            </VBtn>
          </div>
        </template>
      </VListItem>
    </VList>
    
    <div v-if="files.length === 0" class="text-center pa-4 text-medium-emphasis">
      <VIcon icon="bx-folder-open" size="48" class="mb-2" />
      <div>No files in this category</div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  files: any[]
  fileType: 'raw' | 'attachment'
  itemId?: string
}

interface Emits {
  (e: 'file-selected', file: any, itemId?: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Helper functions
const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const getFileIcon = (file: any) => {
  const extension = file.name.split('.').pop()?.toLowerCase()
  
  // Icon mapping based on file type/extension
  const iconMap: any = {
    // Project files
    'project_xml': 'bx-file-doc',
    'compile': 'bx-cog',
    'styles': 'bx-palette',
    'writing_history': 'bx-history',
    
    // Extensions
    'xml': 'bx-code-alt',
    'scrivx': 'bx-book',
    'rtf': 'bx-file-doc',
    'txt': 'bx-file',
    'pdf': 'bx-file-pdf',
    'jpg': 'bx-image',
    'jpeg': 'bx-image',
    'png': 'bx-image',
    'gif': 'bx-image',
    'wav': 'bx-volume-full',
    'mp3': 'bx-volume-full',
    'mp4': 'bx-video'
  }
  
  return iconMap[file.type] || iconMap[extension] || 'bx-file'
}

const getFileColor = (file: any) => {
  const colorMap: any = {
    'project_xml': 'primary',
    'compile': 'success',
    'styles': 'warning',
    'writing_history': 'info',
    'snapshot': 'secondary'
  }
  
  return colorMap[file.type] || 'default'
}

const getFileTypeColor = (type: string) => {
  const colorMap: any = {
    'project_xml': 'primary',
    'compile': 'success', 
    'styles': 'warning',
    'writing_history': 'info',
    'snapshot': 'secondary',
    'pdf': 'error',
    'image': 'purple',
    'audio': 'green',
    'video': 'blue'
  }
  
  return colorMap[type] || 'default'
}

const isViewable = (file: any) => {
  // Text-based files that can be viewed
  const viewableTypes = [
    'project_xml', 'compile', 'styles', 'writing_history', 'snapshot'
  ]
  const viewableExtensions = ['xml', 'scrivx', 'rtf', 'txt']
  
  const extension = file.name.split('.').pop()?.toLowerCase()
  
  return viewableTypes.includes(file.type) || 
         viewableExtensions.includes(extension || '') ||
         file.mime_type?.startsWith('text/')
}

// Event handlers
const selectFile = (file: any) => {
  viewFile(file)
}

const viewFile = (file: any) => {
  if (isViewable(file)) {
    emit('file-selected', file, props.itemId)
  }
}

const downloadFile = (file: any) => {
  // This will be handled by the parent component
  emit('file-selected', file, props.itemId)
}
</script>

<style scoped>
.raw-file-tree {
  border: 1px solid rgb(var(--v-border-color));
  border-radius: 6px;
  background-color: rgb(var(--v-theme-surface));
}

.file-item {
  border-bottom: 1px solid rgb(var(--v-border-color));
  cursor: pointer;
  transition: background-color 0.2s;
}

.file-item:hover {
  background-color: rgb(var(--v-theme-surface-variant));
}

.file-item:last-child {
  border-bottom: none;
}

.file-name {
  font-family: 'Roboto Mono', monospace;
  font-weight: 500;
}

.file-info {
  gap: 8px;
}

.file-actions {
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s;
}

.file-item:hover .file-actions {
  opacity: 1;
}

code {
  font-size: 0.75rem;
  background-color: rgb(var(--v-theme-surface-variant));
  padding: 2px 4px;
  border-radius: 3px;
}
</style>