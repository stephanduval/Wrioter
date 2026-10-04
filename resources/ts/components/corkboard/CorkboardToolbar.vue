<template>
  <VToolbar
    density="compact"
    color="surface-variant"
    class="corkboard-toolbar"
  >
    <!-- Zoom Controls -->
    <VBtnGroup density="compact">
      <VBtn
        :variant="zoom === 'small' ? 'flat' : 'text'"
        size="small"
        @click="$emit('update:zoom', 'small')"
      >
        Small
      </VBtn>
      <VBtn
        :variant="zoom === 'medium' ? 'flat' : 'text'"
        size="small"
        @click="$emit('update:zoom', 'medium')"
      >
        Medium
      </VBtn>
      <VBtn
        :variant="zoom === 'large' ? 'flat' : 'text'"
        size="small"
        @click="$emit('update:zoom', 'large')"
      >
        Large
      </VBtn>
    </VBtnGroup>

    <VDivider vertical class="mx-2" />

    <!-- Display Mode -->
    <VBtnGroup density="compact">
      <VBtn
        :variant="displayMode === 'synopsis' ? 'flat' : 'text'"
        size="small"
        @click="$emit('update:displayMode', 'synopsis')"
      >
        Synopsis
      </VBtn>
      <VBtn
        :variant="displayMode === 'excerpt' ? 'flat' : 'text'"
        size="small"
        @click="$emit('update:displayMode', 'excerpt')"
      >
        Excerpt
      </VBtn>
      <VBtn
        :variant="displayMode === 'metadata' ? 'flat' : 'text'"
        size="small"
        @click="$emit('update:displayMode', 'metadata')"
      >
        Metadata
      </VBtn>
    </VBtnGroup>

    <VSpacer />

    <!-- Search -->
    <VTextField
      :model-value="searchQuery"
      prepend-inner-icon="bx-search"
      placeholder="Search cards..."
      density="compact"
      hide-details
      clearable
      style="max-width: 300px"
      class="me-2"
      @update:model-value="$emit('search', $event)"
    />

    <!-- Card Count -->
    <VChip size="small" variant="tonal" class="me-2">
      {{ totalCount }} card{{ totalCount !== 1 ? 's' : '' }}
      <template v-if="selectedCount > 0">
        ({{ selectedCount }} selected)
      </template>
    </VChip>

    <!-- Actions Menu -->
    <VMenu>
      <template #activator="{ props }">
        <VBtn
          icon="bx-dots-vertical-rounded"
          size="small"
          v-bind="props"
        />
      </template>

      <VList>
        <VListItem @click="$emit('toggle-selection-mode')">
          <template #prepend>
            <VIcon icon="bx-select-multiple" />
          </template>
          <VListItemTitle>Selection Mode</VListItemTitle>
        </VListItem>
      </VList>
    </VMenu>
  </VToolbar>
</template>

<script setup lang="ts">
defineProps<{
  zoom: 'small' | 'medium' | 'large'
  layout: 'grid' | 'freeform'
  displayMode: 'synopsis' | 'excerpt' | 'metadata'
  columns: number
  selectedCount: number
  totalCount: number
  filters?: any
  isLoading?: boolean
}>()

defineEmits<{
  'update:zoom': [value: 'small' | 'medium' | 'large']
  'update:layout': [value: 'grid' | 'freeform']
  'update:displayMode': [value: 'synopsis' | 'excerpt' | 'metadata']
  'update:columns': [value: number]
  'search': [query: string]
  'filter': [filters: any]
  'sort': [sort: any]
  'create-card': []
  'bulk-action': [action: string]
  'toggle-selection-mode': []
}>()

const searchQuery = defineModel<string>('searchQuery', { default: '' })
</script>

<style scoped>
.corkboard-toolbar {
  flex-shrink: 0;
  border-bottom: 1px solid rgb(var(--v-theme-surface-variant));
}
</style>
