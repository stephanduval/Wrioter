<template>
  <Teleport to="body">
    <!-- Desktop Floating Context Menu -->
    <ContextMenu
      v-if="contextMenuStore.displayMode === 'floatingMenu'"
      :visible="contextMenuStore.isVisible"
      :position="contextMenuStore.position"
      :items="contextMenuStore.currentConfig?.items"
      @close="contextMenuStore.hide"
    />

    <!-- Mobile Bottom Sheet Context Menu -->
    <MobileBottomSheet
      v-if="contextMenuStore.displayMode === 'bottomSheet'"
      :modelValue="contextMenuStore.showBottomSheet"
      :items="contextMenuStore.currentConfig?.items"
      @update:modelValue="(value) => !value && contextMenuStore.hide()"
      @close="contextMenuStore.hide"
    />
  </Teleport>
</template>

<script setup lang="ts">
import { useContextMenuStore } from '@/stores/contextMenu'
import ContextMenu from './ContextMenu.vue'
import MobileBottomSheet from './MobileBottomSheet.vue'

// Use the global context menu store directly
const contextMenuStore = useContextMenuStore()
</script>

<style scoped>
/* No styles needed - components handle their own styling */
</style>