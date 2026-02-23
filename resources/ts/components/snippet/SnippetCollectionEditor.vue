<template>
  <div class="snippet-collection-editor">
    <!-- Header -->
    <div class="editor-header">
      <div class="header-left">
        <VIcon icon="bx-collection" size="large" class="me-2" />
        <h2 class="title">{{ collection?.title || 'Snippet Collection' }}</h2>
      </div>
      <div class="header-actions">
        <VBtn
          v-if="hasGhosts"
          variant="outlined"
          color="warning"
          size="small"
          prepend-icon="bx-trash"
          @click="handleClearGhosts"
        >
          Clear Ghosts ({{ stats.ghost }})
        </VBtn>
        <VBtn
          variant="outlined"
          size="small"
          prepend-icon="bx-refresh"
          :loading="isVerifying"
          @click="handleVerifyAll"
        >
          Verify All
        </VBtn>
      </div>
    </div>

    <!-- Stats bar -->
    <div class="stats-bar">
      <VChip variant="tonal" size="small" class="me-2">
        <VIcon icon="bx-file" size="x-small" class="me-1" />
        {{ stats.total }} snippets
      </VChip>
      <VChip v-if="stats.active > 0" color="success" variant="tonal" size="small" class="me-2">
        <VIcon icon="bx-check-circle" size="x-small" class="me-1" />
        {{ stats.active }} active
      </VChip>
      <VChip v-if="stats.ghost > 0" color="grey" variant="outlined" size="small">
        <VIcon icon="bx-ghost" size="x-small" class="me-1" />
        {{ stats.ghost }} ghost
      </VChip>
    </div>

    <VDivider class="my-4" />

    <!-- Loading state -->
    <div v-if="isLoading" class="loading-state">
      <VProgressCircular indeterminate color="primary" />
      <span class="ms-2">Loading snippets...</span>
    </div>

    <!-- Empty state -->
    <div v-else-if="snippets.length === 0" class="empty-state">
      <VIcon icon="bx-collection" size="64" color="grey-lighten-1" />
      <h3 class="mt-4 text-h6">No Snippets Yet</h3>
      <p class="text-body-2 text-medium-emphasis mt-2">
        Select text in your manuscript and use the right-click menu<br>
        to add snippets to this collection.
      </p>
    </div>

    <!-- Snippet list -->
    <div v-else class="snippet-list">
      <SnippetCard
        v-for="snippet in snippets"
        :key="snippet.id"
        :snippet="snippet"
        :manuscript-id="manuscriptId"
        class="mb-3"
        @delete="handleDeleteSnippet"
        @navigate="handleNavigateToSource"
      />
    </div>

    <!-- Confirm delete dialog -->
    <VDialog v-model="showDeleteConfirm" max-width="400">
      <VCard>
        <VCardTitle>Delete Snippet?</VCardTitle>
        <VCardText>
          Are you sure you want to delete this snippet? This action cannot be undone.
        </VCardText>
        <VCardActions>
          <VSpacer />
          <VBtn variant="text" @click="showDeleteConfirm = false">Cancel</VBtn>
          <VBtn color="error" variant="elevated" @click="confirmDelete">Delete</VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  VIcon,
  VBtn,
  VChip,
  VDivider,
  VProgressCircular,
  VDialog,
  VCard,
  VCardTitle,
  VCardText,
  VCardActions,
  VSpacer,
} from 'vuetify/components'
import SnippetCard from './SnippetCard.vue'
import { useSnippetCollectionStore } from '@/stores/snippetCollection'

interface Props {
  collectionId: number
  manuscriptId: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'navigate', itemId: number): void
}>()

const router = useRouter()
const store = useSnippetCollectionStore()

// State
const isVerifying = ref(false)
const showDeleteConfirm = ref(false)
const snippetToDelete = ref<number | null>(null)

// Computed
const collection = computed(() => store.currentCollection.value)
const snippets = computed(() => store.snippets.value)
const stats = computed(() => store.stats.value)
const isLoading = computed(() => store.isLoading.value)
const hasGhosts = computed(() => store.hasGhosts.value)

// Load collection on mount and when ID changes
watch(
  () => props.collectionId,
  async (newId) => {
    if (newId) {
      await store.loadCollection(newId)
    }
  },
  { immediate: true }
)

// Methods
const handleVerifyAll = async () => {
  isVerifying.value = true
  await store.verifyAll()
  isVerifying.value = false
}

const handleClearGhosts = async () => {
  await store.clearGhosts()
}

const handleDeleteSnippet = (snippetId: number) => {
  snippetToDelete.value = snippetId
  showDeleteConfirm.value = true
}

const confirmDelete = async () => {
  if (snippetToDelete.value) {
    await store.deleteSnippet(snippetToDelete.value)
    snippetToDelete.value = null
  }
  showDeleteConfirm.value = false
}

const handleNavigateToSource = (sourceItemId: number) => {
  emit('navigate', sourceItemId)
  router.push({
    name: 'manuscripts-manuscriptId-items-itemId-edit',
    params: {
      manuscriptId: props.manuscriptId,
      itemId: sourceItemId,
    },
  })
}

// Cleanup on unmount
onMounted(() => {
  return () => {
    store.resetState()
  }
})
</script>

<style scoped lang="scss">
.snippet-collection-editor {
  padding: 16px;
  block-size: 100%;
  overflow-y: auto;
}

.editor-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-block-end: 16px;

  .header-left {
    display: flex;
    align-items: center;

    .title {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 500;
    }
  }

  .header-actions {
    display: flex;
    gap: 8px;
  }
}

.stats-bar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  text-align: center;
}

.snippet-list {
  display: flex;
  flex-direction: column;
}
</style>
