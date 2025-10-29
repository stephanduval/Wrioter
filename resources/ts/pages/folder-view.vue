<template>
  <div class="folder-view-page">
    <FolderView :folder-id="folderId" :initial-item-id="itemId" />
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useFolderViewStore } from '@/stores/folderView'
import FolderView from '@/components/folder/FolderView.vue'

const route = useRoute()
const folderViewStore = useFolderViewStore()

// Get folder ID from route params
const folderId = computed(() => {
  const id = route.params.id
  return typeof id === 'string' ? parseInt(id, 10) : Array.isArray(id) ? parseInt(id[0], 10) : 0
})

// Get view mode from query params
const viewMode = computed(() => {
  const view = route.query.view
  if (view === 'manuscript' || view === 'corkboard' || view === 'outline' || view === 'mindmap' || view === 'item') {
    return view
  }
  return 'corkboard' // Default view mode
})

// Get item ID from query params (for when opening a specific item in item view)
const itemId = computed(() => {
  const id = route.query.itemId
  if (id) {
    return typeof id === 'string' ? parseInt(id, 10) : Array.isArray(id) ? parseInt(id[0], 10) : undefined
  }
  return undefined
})

// Set view mode when route changes
watch([viewMode, folderId], ([newViewMode, newFolderId]) => {
  if (newFolderId && newViewMode) {
    folderViewStore.setViewMode(newViewMode)
  }
}, { immediate: true })
</script>

<style scoped>
.folder-view-page {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
}
</style>
