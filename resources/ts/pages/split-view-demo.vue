<script setup lang="ts">
import { onMounted } from 'vue'
import { useSplitViewStore } from '@/stores/splitView'
import SplitViewManager from '@/components/splitView/SplitViewManager.vue'

const splitViewStore = useSplitViewStore()

// Demo: Add some sample tabs on mount
onMounted(() => {
  const mainPane = Array.from(splitViewStore.panes.keys())[0]

  if (mainPane) {
    // Add a few demo tabs
    splitViewStore.addTab(mainPane, {
      type: 'editor',
      itemId: 'demo-1',
      title: 'Chapter 1: Introduction',
      isDirty: false,
      isPinned: false,
      isLoading: false
    })

    splitViewStore.addTab(mainPane, {
      type: 'manuscript',
      folderId: 'demo-folder',
      title: 'Full Manuscript View',
      isDirty: false,
      isPinned: false,
      isLoading: false
    })

    splitViewStore.addTab(mainPane, {
      type: 'corkboard',
      folderId: 'demo-folder',
      title: 'Corkboard',
      isDirty: true,
      isPinned: false,
      isLoading: false
    })
  }
})
</script>

<template>
  <VContainer fluid class="split-view-demo pa-0">
    <VCard class="demo-header" flat>
      <VCardTitle>
        <h1>Split View Demo</h1>
        <p class="text-subtitle-1">
          Test the split view functionality with multiple panes and tabs
        </p>
      </VCardTitle>
      <VCardText>
        <VAlert type="info" variant="tonal" class="mb-4">
          <strong>Keyboard Shortcuts:</strong>
          <ul>
            <li><kbd>Cmd/Ctrl</kbd> + <kbd>\</kbd> - Split Vertical</li>
            <li><kbd>Cmd/Ctrl</kbd> + <kbd>-</kbd> - Split Horizontal</li>
            <li><kbd>Cmd/Ctrl</kbd> + <kbd>W</kbd> - Close Pane</li>
          </ul>
        </VAlert>
      </VCardText>
    </VCard>

    <div class="split-view-container">
      <SplitViewManager />
    </div>
  </VContainer>
</template>

<style scoped lang="scss">
.split-view-demo {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.demo-header {
  border-bottom: 1px solid rgba(var(--v-border-color), 0.12);

  h1 {
    font-size: 24px;
    margin-bottom: 8px;
  }

  ul {
    margin-left: 24px;
    margin-top: 8px;
  }

  kbd {
    padding: 2px 6px;
    background: rgba(var(--v-theme-on-surface), 0.1);
    border-radius: 3px;
    font-family: monospace;
    font-size: 12px;
  }
}

.split-view-container {
  flex: 1;
  overflow: hidden;
}
</style>
