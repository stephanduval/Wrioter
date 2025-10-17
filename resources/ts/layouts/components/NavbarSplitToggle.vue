<template>
  <VTooltip
    :text="`Toggle Split View (${isMac ? 'Cmd' : 'Ctrl'}+\\)`"
    location="bottom"
  >
    <template #activator="{ props: tooltipProps }">
      <IconBtn
        v-bind="tooltipProps"
        :class="{ 'text-primary': splitEnabled }"
        @click="toggleSplitView"
      >
        <VIcon
          :icon="splitEnabled ? 'mdi-view-split-vertical' : 'mdi-view-agenda-outline'"
          size="22"
        />
      </IconBtn>
    </template>
  </VTooltip>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useFolderViewStore } from '@/stores/folderView'
import { useRoute } from 'vue-router'

const route = useRoute()
const folderViewStore = useFolderViewStore()
const { splitEnabled } = storeToRefs(folderViewStore)

// Check if we're on a page that supports split view
const isSplitViewAvailable = computed(() => {
  // Only show on pages that have folder view functionality
  // You can adjust this logic based on your routing structure
  return route.name === 'project-id-folder-folderId' ||
         route.path.includes('/folder/') ||
         route.path.includes('/manuscript/')
})

// Platform detection for keyboard shortcut display
const isMac = computed(() => navigator.platform.toUpperCase().indexOf('MAC') >= 0)

// Toggle split view
function toggleSplitView() {
  if (isSplitViewAvailable.value) {
    folderViewStore.toggleSplitView()
  }
}

// Keyboard shortcut handler
function handleKeyboard(e: KeyboardEvent) {
  // Check for Cmd/Ctrl + \
  if ((e.metaKey || e.ctrlKey) && (e.key === '\\' || e.key === '|')) {
    if (isSplitViewAvailable.value) {
      e.preventDefault()
      toggleSplitView()
    }
  }
}

// Add global keyboard listener
onMounted(() => {
  window.addEventListener('keydown', handleKeyboard)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyboard)
})
</script>

<style scoped>
.text-primary {
  color: rgb(var(--v-theme-primary)) !important;
}
</style>