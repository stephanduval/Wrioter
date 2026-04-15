<template>
  <VDialog
    :model-value="modelValue"
    max-width="480"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <VCard>
      <VCardTitle class="d-flex align-center">
        <span>Saved Views</span>
        <VSpacer />
        <VBtn icon variant="text" size="small" @click="emit('update:modelValue', false)">
          <VIcon>mdi-close</VIcon>
        </VBtn>
      </VCardTitle>

      <VCardText v-if="mindmapStore.savedViews.length === 0" class="text-center py-8 text-medium-emphasis">
        No saved views yet. Use "Save Layout As..." to create one.
      </VCardText>

      <VList v-else density="compact" class="py-0">
        <VListItem
          v-for="view in mindmapStore.savedViews"
          :key="view.id"
          :class="{ 'active-view': view.id === mindmapStore.activeSavedViewId }"
        >
          <template #prepend>
            <VIcon
              v-if="view.id === mindmapStore.activeSavedViewId"
              size="small"
              color="primary"
              class="me-2"
            >
              mdi-check-circle
            </VIcon>
            <VIcon v-else size="small" class="me-2" color="grey">mdi-circle-outline</VIcon>
          </template>

          <div class="d-flex align-center flex-grow-1" style="min-inline-size: 0;">
            <!-- Inline rename: editable text field -->
            <VTextField
              v-if="editingViewId === view.id"
              v-model="editingName"
              density="compact"
              variant="outlined"
              hide-details
              autofocus
              class="flex-grow-1"
              @blur="finishRename(view.id)"
              @keyup.enter="finishRename(view.id)"
              @keyup.escape="cancelRename"
              @click.stop
            />
            <!-- View name (double-click to rename) -->
            <span
              v-else
              class="text-body-2 text-truncate flex-grow-1"
              style="cursor: default;"
              @dblclick.stop="startRename(view)"
            >
              {{ view.name }}
            </span>
          </div>

          <template #append>
            <VBtn
              icon
              variant="text"
              size="x-small"
              color="primary"
              title="Load view"
              @click.stop="loadView(view.id)"
            >
              <VIcon size="small">mdi-upload</VIcon>
            </VBtn>
            <VBtn
              icon
              variant="text"
              size="x-small"
              color="error"
              title="Delete view"
              @click.stop="deleteView(view.id)"
            >
              <VIcon size="small">mdi-delete-outline</VIcon>
            </VBtn>
          </template>
        </VListItem>
      </VList>
    </VCard>
  </VDialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useMindmapStore } from '@/stores/mindmap'

interface Props {
  modelValue: boolean
  folderId: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'load-view': [viewId: number]
}>()

const mindmapStore = useMindmapStore()

// Inline rename state
const editingViewId = ref<number | null>(null)
const editingName = ref('')

function startRename(view: { id: number; name: string }) {
  editingViewId.value = view.id
  editingName.value = view.name
}

async function finishRename(viewId: number) {
  const trimmed = editingName.value.trim()
  if (!trimmed || editingViewId.value !== viewId) {
    cancelRename()
    return
  }

  const view = mindmapStore.savedViews.find(v => v.id === viewId)
  if (view && trimmed !== view.name) {
    try {
      await mindmapStore.renameSavedView(props.folderId, viewId, trimmed)
    } catch (err) {
      console.error('Failed to rename view:', err)
    }
  }
  editingViewId.value = null
}

function cancelRename() {
  editingViewId.value = null
  editingName.value = ''
}

function loadView(viewId: number) {
  emit('load-view', viewId)
  emit('update:modelValue', false)
}

async function deleteView(viewId: number) {
  try {
    await mindmapStore.deleteSavedView(props.folderId, viewId)
  } catch (err) {
    console.error('Failed to delete view:', err)
  }
}
</script>

<style scoped>
.active-view {
  background: rgba(var(--v-theme-primary), 0.08);
}
</style>
