<template>
  <VBtnToggle
    :model-value="modelValue"
    mandatory
    density="compact"
    color="primary"
    :disabled="disabled"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <VTooltip text="Manuscript View (Cmd+1)" location="bottom">
      <template #activator="{ props }">
        <VBtn
          value="manuscript"
          size="small"
          icon
          v-bind="props"
        >
          <VIcon icon="mdi-file-document-outline" :size="iconSize" />
        </VBtn>
      </template>
    </VTooltip>

    <VTooltip text="Corkboard View (Cmd+2)" location="bottom">
      <template #activator="{ props }">
        <VBtn
          value="corkboard"
          size="small"
          icon
          v-bind="props"
        >
          <VIcon icon="mdi-view-grid-outline" :size="iconSize" />
        </VBtn>
      </template>
    </VTooltip>

    <VTooltip text="Outline View (Cmd+3)" location="bottom">
      <template #activator="{ props }">
        <VBtn
          value="outline"
          size="small"
          icon
          v-bind="props"
        >
          <VIcon icon="mdi-format-list-text" :size="iconSize" />
        </VBtn>
      </template>
    </VTooltip>

    <VTooltip text="Mind Map View (Cmd+4)" location="bottom">
      <template #activator="{ props }">
        <VBtn
          value="mindmap"
          size="small"
          icon
          v-bind="props"
        >
          <VIcon icon="mdi-graph-outline" :size="iconSize" />
        </VBtn>
      </template>
    </VTooltip>

    <VTooltip text="Item Editor (Cmd+5)" location="bottom">
      <template #activator="{ props }">
        <VBtn
          value="item"
          size="small"
          icon
          v-bind="props"
        >
          <VIcon icon="mdi-file-edit-outline" :size="iconSize" />
        </VBtn>
      </template>
    </VTooltip>

    <!-- Edit mode - only shown when specified -->
    <VTooltip v-if="showEditMode" text="Edit View" location="bottom">
      <template #activator="{ props }">
        <VBtn
          value="edit"
          size="small"
          icon
          v-bind="props"
          :disabled="!editModeEnabled"
        >
          <VIcon icon="mdi-pencil-outline" :size="iconSize" />
        </VBtn>
      </template>
    </VTooltip>
  </VBtnToggle>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: string
  disabled?: boolean
  iconSize?: number | string
  showEditMode?: boolean
  editModeEnabled?: boolean
}>()

defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<style scoped>
/* Button group styling */
:deep(.v-btn-toggle) {
  box-shadow: none;
}

:deep(.v-btn-toggle .v-btn) {
  min-width: 32px;
  padding: 0;
}
</style>
