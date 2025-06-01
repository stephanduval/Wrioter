<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

const manuscript = ref({
  id: null,
  title: '',
  description: '',
  created_at: '',
  updated_at: '',
})

const loading = ref(true)
const error = ref('')

const fetchManuscript = async () => {
  try {
    loading.value = true
    error.value = ''
    
    const response = await fetch(`/api/manuscripts/${route.params.id}`, {
      headers: {
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch manuscript')
    }

    manuscript.value = await response.json()
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'An error occurred'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchManuscript()
})
</script>

<template>
  <VCard v-if="!loading && !error">
    <VCardTitle class="d-flex justify-space-between align-center">
      <span class="text-h5">{{ manuscript.title }}</span>
      <VBtn
        icon
        variant="text"
        :to="{ name: 'manuscripts-list' }"
      >
        <VIcon icon="bx-x" />
      </VBtn>
    </VCardTitle>

    <VCardText>
      <div class="text-body-1 mb-4">
        {{ manuscript.description }}
      </div>

      <VDivider class="my-4" />

      <div class="d-flex gap-4 text-caption">
        <div>
          <span class="font-weight-medium">{{ t('projects.details.createdAt') }}:</span>
          {{ new Date(manuscript.created_at).toLocaleDateString() }}
        </div>
        <div>
          <span class="font-weight-medium">{{ t('projects.details.lastUpdated') }}:</span>
          {{ new Date(manuscript.updated_at).toLocaleDateString() }}
        </div>
      </div>
    </VCardText>
  </VCard>

  <VProgressCircular
    v-else-if="loading"
    indeterminate
    color="primary"
  />

  <VAlert
    v-else-if="error"
    type="error"
    class="mt-4"
  >
    {{ error }}
  </VAlert>
</template> 
