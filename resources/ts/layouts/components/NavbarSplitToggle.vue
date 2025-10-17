<template>
  <VBtn
    icon
    variant="text"
    :color="splitEnabled ? 'primary' : undefined"
    class="navbar-split-toggle-btn"
    @click="toggleSplitView"
  >
    <VIcon
      :icon="splitEnabled ? 'bx-columns' : 'bx-rectangle'"
      size="22"
    />
    <VTooltip
      activator="parent"
      location="bottom"
    >
      Toggle Split View ({{ isMac ? 'Cmd' : 'Ctrl' }}+\)
    </VTooltip>
  </VBtn>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useFolderViewStore } from '@/stores/folderView'

const folderViewStore = useFolderViewStore()
const { splitEnabled } = storeToRefs(folderViewStore)

// Debug logging
console.log('[NavbarSplitToggle] Component mounted')
console.log('[NavbarSplitToggle] Split enabled:', splitEnabled.value)

// Platform detection for keyboard shortcut display
const isMac = computed(() => navigator.platform.toUpperCase().indexOf('MAC') >= 0)

// Toggle split view
function toggleSplitView() {
  console.log('[NavbarSplitToggle] Button clicked!')
  console.log('[NavbarSplitToggle] Current split state:', splitEnabled.value)
  folderViewStore.toggleSplitView()
  console.log('[NavbarSplitToggle] New split state:', splitEnabled.value)
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
.navbar-split-toggle-btn {
  /* Debug border to make button visible */
  border: 2px solid red !important;
  margin: 0 4px;
}
</style>