<template>
  <div class="pane-placeholder">
    <div class="placeholder-content">
      <VIcon
        icon="mdi-content-duplicate"
        size="64"
        color="grey-lighten-1"
      />
      <h3 class="mt-6 text-h5">Content Already Open</h3>
      <p class="mt-4 text-body-1 text-grey">
        {{ message || 'This content is already open in the other pane.' }}
      </p>
      <VBtn
        v-if="duplicatePaneId"
        variant="outlined"
        color="primary"
        class="mt-6"
        @click="focusOtherPane"
      >
        <VIcon icon="mdi-arrow-right" class="me-2" />
        Switch to Other Pane
      </VBtn>
      <p class="mt-8 text-caption text-grey-darken-1">
        Select a different folder or document from the navigation menu to view it here.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { usePaneStore } from '@/stores/pane'

const props = defineProps<{
  paneId: string
  duplicatePaneId?: string
  message?: string
}>()

const paneStore = usePaneStore()

function focusOtherPane() {
  if (props.duplicatePaneId) {
    paneStore.setActivePane(props.duplicatePaneId)
  }
}
</script>

<style scoped>
.pane-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  block-size: 100%;
  inline-size: 100%;
  background: rgb(var(--v-theme-surface));
}

.placeholder-content {
  text-align: center;
  max-inline-size: 400px;
  padding: 24px;
}
</style>
