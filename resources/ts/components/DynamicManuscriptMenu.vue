<script setup lang="ts">
import axios from 'axios'
import { onMounted, onUnmounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'

interface ManuscriptItem {
  id: number
  title: string
  type: string
  pivot: {
    order_index: number
  }
}

interface Manuscript {
  id: number
  title: string
  items: ManuscriptItem[]
}

const { t } = useI18n()
const manuscripts = ref<Manuscript[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

let abortController: AbortController | null = null

const fetchManuscripts = async () => {
  try {
    loading.value = true
    
    // Create new abort controller for this request
    abortController = new AbortController()
    
    const response = await axios.get('/api/manuscripts?with=items', {
      signal: abortController.signal
    })
    manuscripts.value = response.data
    console.log('Fetched manuscripts:', manuscripts.value) // Debug log
  } catch (err) {
    // Only set error if request wasn't aborted
    if (!axios.isCancel(err)) {
      console.error('Error fetching manuscripts:', err)
      error.value = 'Failed to load manuscripts'
    }
  } finally {
    loading.value = false
  }
}

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

const getItemTypeTranslation = (type: string) => {
  return t(`menu.manuscripts.items.${type}`)
}

// Validate manuscript data before using in navigation
const isValidManuscript = (manuscript: Manuscript) => {
  return manuscript && 
         typeof manuscript.id === 'number' && 
         manuscript.id > 0 &&
         manuscript.title
}

// Validate item data before using in navigation  
const isValidItem = (item: ManuscriptItem) => {
  return item && 
         typeof item.id === 'number' && 
         item.id > 0 &&
         item.title
}

onMounted(fetchManuscripts)

// Cleanup on unmount to prevent memory leaks and component state issues
onUnmounted(() => {
  if (abortController) {
    abortController.abort()
  }
})
</script>

<template>
  <div>
    <template v-if="loading">
      <VListItem>
        <VListItemTitle class="text-center">
          <VProgressCircular indeterminate />
        </VListItemTitle>
      </VListItem>
    </template>

    <template v-else-if="error">
      <VListItem>
        <VListItemTitle class="text-error">
          {{ error }}
        </VListItemTitle>
      </VListItem>
    </template>

    <template v-else>
      <template v-for="manuscript in manuscripts" :key="manuscript.id">
        <!-- Manuscript Title -->
        <VListItem
          v-if="isValidManuscript(manuscript)"
          :to="{ name: 'manuscripts-view', params: { id: manuscript.id }}"
          :title="manuscript.title"
          :prepend-icon="'bx-book'"
          class="manuscript-title"
        />

        <!-- Manuscript Items -->
        <template v-if="manuscript.items && manuscript.items.length > 0">
          <VListItem
            v-for="item in [...manuscript.items].sort((a, b) => a.pivot.order_index - b.pivot.order_index)"
            :key="item.id"
            v-if="isValidManuscript(manuscript) && isValidItem(item)"
            :to="{ name: 'manuscripts-view', params: { id: manuscript.id }, hash: `#item-${item.id}` }"
            :title="item.title"
            :prepend-icon="getItemTypeIcon(item.type)"
            class="ms-4"
          >
            <template #title>
              <span class="text-sm">
                {{ $t(`menu.manuscripts.items.${getItemTypeTranslation(item.type)}`) }}: {{ item.title }}
              </span>
            </template>
          </VListItem>
        </template>

        <VDivider class="my-2" />
      </template>
    </template>
  </div>
</template>

<style scoped>
.manuscript-title {
  background-color: rgb(var(--v-theme-surface-variant));
  font-weight: 600;
}
</style> 
