<template>
  <div class="folder-view-page">
    <SnippetCollectionView
      :collection-id="collectionId"
      :manuscript-id="manuscriptId"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import SnippetCollectionView from '@/components/snippet/SnippetCollectionView.vue'

const route = useRoute()

// Extract route parameters
const manuscriptId = computed(() => {
  const id = route.params.manuscriptId as string
  return parseInt(id, 10)
})

const collectionId = computed(() => {
  const id = route.params.collectionId as string
  return parseInt(id, 10)
})
</script>

<style scoped>
.folder-view-page {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
  block-size: 100%;
  inline-size: 100%;
}
</style>
