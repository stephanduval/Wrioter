<template>
  <div class="snippet-collection-page">
    <!-- Breadcrumbs -->
    <VBreadcrumbs
      :items="breadcrumbItems"
      class="px-0 py-2"
    >
      <template #prepend>
        <VIcon icon="bx-home" />
      </template>
    </VBreadcrumbs>

    <!-- Main Content -->
    <VCard class="collection-card">
      <SnippetCollectionEditor
        :collection-id="collectionId"
        :manuscript-id="manuscriptId"
        @navigate="handleNavigateToItem"
      />
    </VCard>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useManuscriptStore } from '@/stores/manuscript'
import { useSnippetCollectionStore } from '@/stores/snippetCollection'
import SnippetCollectionEditor from '@/components/snippet/SnippetCollectionEditor.vue'
import { VBreadcrumbs, VIcon, VCard } from 'vuetify/components'

const route = useRoute()
const router = useRouter()
const manuscriptStore = useManuscriptStore()
const snippetStore = useSnippetCollectionStore()

// Extract route parameters
const manuscriptId = computed(() => {
  const id = route.params.manuscriptId as string
  return parseInt(id, 10)
})

const collectionId = computed(() => {
  const id = route.params.collectionId as string
  return parseInt(id, 10)
})

// Breadcrumb navigation
const breadcrumbItems = computed(() => {
  const manuscriptTitle = manuscriptStore.selectedManuscript?.title || 'Manuscript'
  const collectionTitle = snippetStore.currentCollection.value?.title || 'Collection'

  return [
    {
      title: 'Home',
      disabled: false,
      href: '/'
    },
    {
      title: 'Manuscripts',
      disabled: false,
      href: '/manuscripts'
    },
    {
      title: manuscriptTitle,
      disabled: false,
      href: `/manuscripts/${manuscriptId.value}`
    },
    {
      title: collectionTitle,
      disabled: true,
      href: '#'
    }
  ]
})

// Navigation handler
const handleNavigateToItem = (itemId: number) => {
  router.push({
    name: 'manuscripts-manuscriptId-items-itemId-edit',
    params: {
      manuscriptId: manuscriptId.value,
      itemId: itemId
    }
  })
}
</script>

<style scoped lang="scss">
.snippet-collection-page {
  padding: 16px;
  block-size: 100%;
  overflow: hidden;
}

.collection-card {
  block-size: calc(100vh - 120px);
  overflow: hidden;
}
</style>
