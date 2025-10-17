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
import { computed, onMounted, onUnmounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useFolderViewStore } from '@/stores/folderView'

const folderViewStore = useFolderViewStore()
const { splitEnabled } = storeToRefs(folderViewStore)

// Platform detection for keyboard shortcut display
const isMac = computed(() => navigator.platform.toUpperCase().indexOf('MAC') >= 0)

// Toggle split view
function toggleSplitView() {
  folderViewStore.toggleSplitView()
}

// Keyboard shortcut handler
function handleKeyboard(e: KeyboardEvent) {
  // Check for Cmd/Ctrl + \
  if ((e.metaKey || e.ctrlKey) && (e.key === '\\' || e.key === '|')) {
    e.preventDefault()
    toggleSplitView()
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