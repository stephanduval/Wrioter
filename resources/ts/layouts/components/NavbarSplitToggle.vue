<template>
  <div
    @click="handleToggleSplitView"
    style="border: 2px solid red; padding: 4px; cursor: pointer; background: yellow; min-width: 50px; min-height: 50px;"
  >
    <VBtn
      icon
      variant="text"
      size="small"
      :color="splitEnabled ? 'primary' : 'default'"
    >
      <VIcon
        :icon="splitEnabled ? 'mdi-view-split-vertical' : 'mdi-view-agenda-outline'"
        size="22"
      />

      <VTooltip
        activator="parent"
        location="bottom"
      >
        <span>Toggle Split View ({{ isMac ? 'Cmd' : 'Ctrl' }}+\)</span>
      </VTooltip>
    </VBtn>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useFolderViewStore } from '@/stores/folderView'

const folderViewStore = useFolderViewStore()
const { splitEnabled } = storeToRefs(folderViewStore)

// Debug logging on mount
onMounted(() => {
  console.log('[NavbarSplitToggle] Component mounted')
  console.log('[NavbarSplitToggle] folderViewStore:', folderViewStore)
  console.log('[NavbarSplitToggle] splitEnabled ref:', splitEnabled)

  if (folderViewStore) {
    console.log('[NavbarSplitToggle] Store exists: true')
    console.log('[NavbarSplitToggle] toggleSplitView method:', folderViewStore.toggleSplitView)
  } else {
    console.error('[NavbarSplitToggle] Store is undefined!')
  }

  // Add keyboard listener
  window.addEventListener('keydown', handleKeyboard)

  console.log('[NavbarSplitToggle] Keyboard listener added')
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyboard)
})

// Platform detection for keyboard shortcut display
const isMac = computed(() => navigator.platform.toUpperCase().indexOf('MAC') >= 0)

// Toggle split view with extensive logging
function handleToggleSplitView() {
  console.log('[NavbarSplitToggle] handleToggleSplitView called')
  console.log('[NavbarSplitToggle] Current split state:', splitEnabled.value)
  console.log('[NavbarSplitToggle] Store:', folderViewStore)

  try {
    folderViewStore.toggleSplitView()
    console.log('[NavbarSplitToggle] After toggle - New split state:', splitEnabled.value)
  } catch (error) {
    console.error('[NavbarSplitToggle] Error toggling split view:', error)
  }
}

// Keyboard shortcut handler
function handleKeyboard(e: KeyboardEvent) {
  // Check for Cmd/Ctrl + \
  if ((e.metaKey || e.ctrlKey) && (e.key === '\\' || e.key === '|')) {
    e.preventDefault()
    console.log('[NavbarSplitToggle] Keyboard shortcut triggered')
    handleToggleSplitView()
  }
}
</script>

<style scoped>
</style>