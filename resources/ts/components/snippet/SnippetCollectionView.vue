<template>
  <div class="folder-view">
    <!-- Loading State -->
    <VProgressLinear
      v-if="isLoading"
      indeterminate
      color="primary"
    />

    <!-- Error State -->
    <VAlert
      v-if="storeError"
      type="error"
      closable
      @click:close="storeError = null"
    >
      {{ storeError }}
    </VAlert>

    <!-- Toolbar with View Mode Switcher -->
    <VToolbar
      density="compact"
      color="surface"
      class="folder-view-toolbar"
    >
      <!-- Collection Title -->
      <VToolbarTitle>
        <VIcon icon="bx-collection" class="me-2" />
        {{ collection?.title || 'Snippet Collection' }}
        <VChip
          v-if="stats.total > 0"
          size="small"
          class="ms-2"
        >
          {{ stats.total }} {{ stats.total === 1 ? 'snippet' : 'snippets' }}
        </VChip>
        <VChip
          v-if="stats.ghost > 0"
          size="small"
          color="grey"
          variant="outlined"
          class="ms-1"
        >
          {{ stats.ghost }} ghost
        </VChip>
      </VToolbarTitle>

      <VSpacer />

      <!-- View Mode Switcher -->
      <ViewModeSwitcher
        v-model="currentViewMode"
        class="me-2"
      />

      <VDivider vertical class="mx-2" />

      <!-- Verify All -->
      <VTooltip text="Verify all snippets against source">
        <template #activator="{ props: tooltipProps }">
          <VBtn
            icon="bx-refresh"
            size="small"
            :loading="isVerifying"
            v-bind="tooltipProps"
            @click="handleVerifyAll"
          />
        </template>
      </VTooltip>

      <!-- Clear Ghosts -->
      <VTooltip v-if="hasGhosts" text="Remove ghost snippets">
        <template #activator="{ props: tooltipProps }">
          <VBtn
            icon="bx-trash"
            size="small"
            color="warning"
            v-bind="tooltipProps"
            @click="handleClearGhosts"
          />
        </template>
      </VTooltip>

      <!-- Additional Actions Menu -->
      <VMenu>
        <template #activator="{ props }">
          <VBtn
            icon="bx-dots-vertical-rounded"
            size="small"
            v-bind="props"
          />
        </template>

        <VList>
          <VListItem @click="handleRefresh">
            <template #prepend>
              <VIcon icon="bx-refresh" />
            </template>
            <VListItemTitle>Refresh</VListItemTitle>
          </VListItem>
        </VList>
      </VMenu>
    </VToolbar>

    <!-- View Content -->
    <div class="folder-view-content">
      <!-- Empty State -->
      <VAlert
        v-if="!isLoading && adaptedItems.length === 0"
        type="info"
        variant="tonal"
        class="ma-4"
      >
        <VAlertTitle>No Snippets Yet</VAlertTitle>
        <p>
          Select text in your manuscript and use the right-click menu
          to add snippets to this collection.
        </p>
      </VAlert>

      <!-- View Modes -->
      <template v-else>
        <ManuscriptView
          v-if="currentViewMode === 'manuscript'"
          :folder-id="collectionId"
          :folder="collectionAsFolder"
          :items="adaptedItems"
        />

        <CorkboardView
          v-else-if="currentViewMode === 'corkboard'"
          :folder-id="collectionId"
          :folder="collectionAsFolder"
          :items="adaptedItems"
        />

        <OutlineView
          v-else-if="currentViewMode === 'outline'"
          :folder-id="collectionId"
          :folder="collectionAsFolder"
          :items="adaptedItems"
        />

        <MindMapView
          v-else-if="currentViewMode === 'mindmap'"
          :folder-id="collectionId"
          :folder="collectionAsFolder"
          :items="adaptedItems"
        />

        <ItemView
          v-else-if="currentViewMode === 'item'"
          :folder-id="collectionId"
          :folder="collectionAsFolder"
          :items="adaptedItems"
          :manuscript-id="manuscriptId"
        />
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onBeforeUnmount } from 'vue'
import { storeToRefs } from 'pinia'
import {
  VProgressLinear,
  VAlert,
  VAlertTitle,
  VToolbar,
  VToolbarTitle,
  VIcon,
  VChip,
  VSpacer,
  VDivider,
  VBtn,
  VTooltip,
  VMenu,
  VList,
  VListItem,
  VListItemTitle,
} from 'vuetify/components'
import ManuscriptView from '@/components/manuscript/ManuscriptView.vue'
import CorkboardView from '@/components/corkboard/CorkboardView.vue'
import OutlineView from '@/components/outline/OutlineView.vue'
import MindMapView from '@/components/mindmap/MindMapView.vue'
import ItemView from '@/components/item/ItemView.vue'
import ViewModeSwitcher from '@/components/shared/ViewModeSwitcher.vue'
import { useSnippetCollectionStore } from '@/stores/snippetCollection'
import type { FolderItem, FolderData } from '@/stores/folderView'
import type { ViewMode } from '@/stores/folderView'

interface Props {
  collectionId: number
  manuscriptId: number
}

const props = defineProps<Props>()

// Store
const store = useSnippetCollectionStore()
const {
  currentCollection: collection,
  snippets,
  stats,
  isLoading,
  hasGhosts,
} = storeToRefs(store)

// Local state
const currentViewMode = ref<ViewMode>('corkboard')
const isVerifying = ref(false)
const storeError = ref<string | null>(null)

// Adapt collection to FolderData shape for view components
const collectionAsFolder = computed<FolderData | null>(() => {
  const col = collection.value
  if (!col) return null
  return {
    id: col.id,
    title: col.title,
    type: 'folder',
    manuscript_id: props.manuscriptId,
  }
})

// Adapt SnippetReference[] → FolderItem[] for view components
const adaptedItems = computed<FolderItem[]>(() => {
  const items = snippets.value
  if (!items) return []

  return items.map(snippet => {
    const text = snippet.reference_text || ''
    const wordCount = text.split(/\s+/).filter(w => w.length > 0).length

    return {
      id: snippet.id,
      title: snippet.source_item_title || 'Untitled Snippet',
      type: 'text',
      synopsis: text.length > 200 ? text.substring(0, 200) + '...' : text,
      content: text,
      excerpt: text.length > 100 ? text.substring(0, 100) + '...' : text,
      word_count: wordCount,
      item_order: snippet.order_index,
      metadata: {
        status: snippet.status === 'active' ? 'draft' : 'archived',
        isCompilable: snippet.status === 'active',
        sourceItemId: snippet.source_item_id,
        snippetStatus: snippet.status,
      },
      include_in_compile: snippet.status === 'active',
      updated_at: snippet.last_verified_at || '',
    }
  })
})

// Load collection on mount and when ID changes
watch(
  () => props.collectionId,
  async (newId) => {
    if (newId) {
      storeError.value = null
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

const handleRefresh = async () => {
  if (props.collectionId) {
    await store.loadCollection(props.collectionId)
  }
}

// Cleanup on unmount
onBeforeUnmount(() => {
  store.resetState()
})
</script>

<style scoped>
.folder-view {
  display: flex;
  overflow: hidden;
  flex-direction: column;
  block-size: 100%;
  inline-size: 100%;
}

.folder-view-toolbar {
  flex-shrink: 0;
  border-block-end: 1px solid rgb(var(--v-theme-surface-variant));
}

.folder-view-content {
  position: relative;
  overflow: auto;
  flex: 1;
}
</style>
