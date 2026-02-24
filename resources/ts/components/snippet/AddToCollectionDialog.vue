<template>
  <VDialog
    :model-value="isOpen"
    max-width="500"
    persistent
    @update:model-value="handleClose"
  >
    <VCard>
      <VCardTitle class="d-flex align-center pa-4">
        <VIcon icon="bx-collection" class="me-2" />
        Add to Snippet Collection
      </VCardTitle>

      <VDivider />

      <VCardText class="pa-4">
        <!-- Preview of selected text -->
        <div class="mb-4">
          <label class="text-subtitle-2 text-medium-emphasis mb-1 d-block">
            Selected Text
          </label>
          <blockquote class="selected-text-preview">
            {{ truncatedText }}
          </blockquote>
        </div>

        <!-- Collection selection -->
        <div class="mb-4">
          <label class="text-subtitle-2 text-medium-emphasis mb-1 d-block">
            Choose Collection
          </label>

          <VList v-if="collections.length > 0" class="collection-list" density="compact">
            <VListItem
              v-for="collection in collections"
              :key="collection.id"
              :active="selectedCollectionId === collection.id"
              @click="selectedCollectionId = collection.id"
            >
              <template #prepend>
                <VIcon icon="bx-folder" />
              </template>
              <VListItemTitle>{{ collection.title }}</VListItemTitle>
              <template #append>
                <VChip size="x-small" variant="tonal">
                  {{ collection.snippet_count }}
                </VChip>
              </template>
            </VListItem>
          </VList>

          <VAlert
            v-else-if="!isLoading"
            type="info"
            variant="tonal"
            class="mb-4"
          >
            No collections yet. Create one below.
          </VAlert>
        </div>

        <!-- Create new collection -->
        <VCard variant="outlined" class="mt-2">
          <VCardText class="pa-3">
            <div class="d-flex align-center mb-2">
              <VIcon icon="bx-plus" class="me-2" color="primary" />
              <span class="text-subtitle-2 font-weight-medium">Create New Collection</span>
            </div>
            <VTextField
              v-model="newCollectionTitle"
              label="Collection Name"
              placeholder="e.g., Character Notes, Location Details"
              variant="outlined"
              density="compact"
              :error-messages="createError"
              @keyup.enter="handleCreateAndAdd"
            />
          </VCardText>
        </VCard>
      </VCardText>

      <VDivider />

      <VCardActions class="pa-4">
        <VBtn
          variant="text"
          color="secondary"
          @click="handleClose"
        >
          Cancel
        </VBtn>
        <VSpacer />
        <VBtn
          v-if="newCollectionTitle.trim()"
          color="primary"
          variant="elevated"
          :loading="isCreating"
          @click="handleCreateAndAdd"
        >
          Create & Add
        </VBtn>
        <VBtn
          v-else
          color="primary"
          variant="elevated"
          :disabled="!selectedCollectionId"
          :loading="isAdding"
          @click="handleAddToExisting"
        >
          Add to Collection
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import {
  VDialog,
  VCard,
  VCardTitle,
  VCardText,
  VCardActions,
  VDivider,
  VIcon,
  VBtn,
  VSpacer,
  VList,
  VListItem,
  VListItemTitle,
  VChip,
  VAlert,
  VTextField,
} from 'vuetify/components'
import { useSnippetCollectionStore } from '@/stores/snippetCollection'
import { useManuscriptStore } from '@/stores/manuscript'
import { eventBus, type AddToCollectionEvent } from '@/services/eventBus'

const store = useSnippetCollectionStore()
const manuscriptStore = useManuscriptStore()

// State
const isOpen = ref(false)
const selectedCollectionId = ref<number | null>(null)
const newCollectionTitle = ref('')
const createError = ref('')
const isCreating = ref(false)
const isAdding = ref(false)
const isLoading = ref(false)

// Event data
const eventData = ref<AddToCollectionEvent | null>(null)

// Computed
const collections = store.collections

const truncatedText = computed(() => {
  const text = eventData.value?.selectedText || ''
  if (text.length > 200) {
    return text.substring(0, 200) + '...'
  }
  return text
})

// Methods
const handleOpen = async (data: AddToCollectionEvent) => {
  eventData.value = data
  isOpen.value = true
  selectedCollectionId.value = null
  newCollectionTitle.value = ''
  createError.value = ''

  // Load collections for this manuscript
  isLoading.value = true
  await store.loadCollections(data.manuscriptId)
  isLoading.value = false
}

const handleClose = () => {
  isOpen.value = false
  eventData.value = null
}

const handleAddToExisting = async () => {
  if (!selectedCollectionId.value || !eventData.value) return

  isAdding.value = true
  try {
    const snippet = await store.addSnippet(selectedCollectionId.value, {
      source_item_id: eventData.value.sourceItemId,
      selected_text: eventData.value.selectedText,
      position_data: eventData.value.positionData,
    })

    if (snippet) {
      handleClose()
    }
  } finally {
    isAdding.value = false
  }
}

const handleCreateAndAdd = async () => {
  if (!newCollectionTitle.value.trim() || !eventData.value) {
    createError.value = 'Please enter a collection name'
    return
  }

  isCreating.value = true
  createError.value = ''

  try {
    // Create the collection
    const collection = await store.createCollection(eventData.value.manuscriptId, {
      title: newCollectionTitle.value.trim(),
    })

    if (collection) {
      // Refresh manuscript tree to show new collection
      await manuscriptStore.fetchManuscriptItems(eventData.value.manuscriptId)

      // Add the snippet to the new collection
      const snippet = await store.addSnippet(collection.id, {
        source_item_id: eventData.value.sourceItemId,
        selected_text: eventData.value.selectedText,
        position_data: eventData.value.positionData,
      })

      if (snippet) {
        handleClose()
      }
    }
  } catch (error) {
    createError.value = error instanceof Error ? error.message : 'Failed to create collection'
  } finally {
    isCreating.value = false
  }
}

// Event listener
onMounted(() => {
  eventBus.on('snippet:add-to-collection', handleOpen)
})

onUnmounted(() => {
  eventBus.off('snippet:add-to-collection', handleOpen)
})
</script>

<style scoped lang="scss">
.selected-text-preview {
  padding: 12px 16px;
  margin: 0;
  font-style: italic;
  line-height: 1.5;
  background-color: rgba(var(--v-theme-surface-variant), 0.5);
  border-inline-start: 3px solid rgb(var(--v-theme-primary));
  border-radius: 4px;
  max-block-size: 120px;
  overflow-y: auto;
}

.collection-list {
  max-block-size: 200px;
  overflow-y: auto;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 4px;
}
</style>
