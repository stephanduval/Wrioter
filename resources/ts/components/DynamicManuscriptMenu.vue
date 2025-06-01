<script setup lang="ts">
import axios from 'axios'
import { onMounted, ref } from 'vue'
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

const fetchManuscripts = async () => {
  try {
    loading.value = true
    const response = await axios.get('/api/manuscripts?with=items')
    manuscripts.value = response.data
    console.log('Fetched manuscripts:', manuscripts.value) // Debug log
  } catch (err) {
    console.error('Error fetching manuscripts:', err)
    error.value = 'Failed to load manuscripts'
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

onMounted(fetchManuscripts)
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
            :to="{ name: 'items-view', params: { id: item.id }}"
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
