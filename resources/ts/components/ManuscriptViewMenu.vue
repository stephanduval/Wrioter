<script setup lang="ts">
import { computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useManuscriptStore } from '@/stores/manuscript'
import { useRouter } from 'vue-router'

interface ManuscriptItem {
  id: number
  title: string
  type: string
  pivot: {
    order_index: number
  }
}

const { t } = useI18n()
const router = useRouter()
const manuscriptStore = useManuscriptStore()

// Computed to check if we should show the manuscript view
const showManuscriptView = computed(() => manuscriptStore.hasSelectedManuscript)
const selectedManuscript = computed(() => manuscriptStore.selectedManuscript)

const getItemTypeIcon = (type: string) => {
  const icons = {
    chapter: 'bx-book-content',
    scene: 'bx-movie',
    character: 'bx-user',
    location: 'bx-map',
    research: 'bx-search',
  }
  return icons[type as keyof typeof icons] || 'bx-file'
}

// Navigate to manuscript's raw files view
const viewRawFiles = (manuscriptId: number) => {
  router.push(`/admin/manuscripts/${manuscriptId}/raw-files`)
}

// Validate item data before using in navigation  
const isValidItem = (item: ManuscriptItem) => {
  return item && 
         typeof item.id === 'number' && 
         item.id > 0 &&
         item.title
}
</script>

<template>
  <div v-if="showManuscriptView && selectedManuscript">
    <!-- Manuscript Header -->
    <VListItem
      :title="selectedManuscript.title"
      :prepend-icon="selectedManuscript.manuscript_type === 'scrivener' ? 'bx-folder' : 'bx-book'"
      class="manuscript-title mb-2"
    >
      <template #append>
        <VBtn
          icon
          size="x-small"
          variant="text"
          @click="manuscriptStore.clearSelection()"
        >
          <VIcon icon="bx-x" />
        </VBtn>
      </template>
    </VListItem>

    <!-- Manuscript Sections (Similar to raw-files page) -->
    <VListSubheader class="text-uppercase text-caption">
      {{ t('menu.manuscripts.sections') }}
    </VListSubheader>

    <!-- Project Files Section -->
    <VListItem
      :to="`/manuscripts/${selectedManuscript.id}`"
      prepend-icon="bx-file-doc"
      title="Project Files"
    />

    <!-- Data Files Section -->
    <VListItem
      :to="`/manuscripts/${selectedManuscript.id}/data`"
      prepend-icon="bx-folder"
      title="Data Files"
    />

    <!-- Snapshots Section -->
    <VListItem
      :to="`/manuscripts/${selectedManuscript.id}/snapshots`"
      prepend-icon="bx-camera"
      title="Snapshots"
    />

    <!-- For Scrivener manuscripts, show raw files -->
    <template v-if="selectedManuscript.manuscript_type === 'scrivener'">
      <VListItem
        prepend-icon="bx-folder-open"
        title="Raw Files"
        @click="viewRawFiles(selectedManuscript.id)"
      />
    </template>

    <VDivider class="my-2" />

    <!-- Manuscript Items -->
    <template v-if="selectedManuscript.items && selectedManuscript.items.length > 0">
      <VListSubheader class="text-uppercase text-caption">
        {{ t('menu.manuscripts.content') }}
      </VListSubheader>
      
      <VListItem
        v-for="item in [...selectedManuscript.items].sort((a, b) => a.pivot.order_index - b.pivot.order_index)"
        :key="item.id"
        v-if="isValidItem(item)"
        :to="{ name: 'manuscripts-view', params: { id: selectedManuscript.id }, hash: `#item-${item.id}` }"
        :title="item.title"
        :prepend-icon="getItemTypeIcon(item.type)"
        class="ms-4"
      />
    </template>
  </div>
</template>

<style scoped>
.manuscript-title {
  background-color: rgb(var(--v-theme-surface-variant));
  font-weight: 600;
}
</style>