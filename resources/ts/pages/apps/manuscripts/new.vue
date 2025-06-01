<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

const { t } = useI18n()
const router = useRouter()

const form = ref({
  title: '',
  description: '',
})

const loading = ref(false)
const error = ref('')

const handleSubmit = async () => {
  try {
    loading.value = true
    error.value = ''
    
    // TODO: Implement manuscript creation API call
    const response = await fetch('/api/manuscripts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(form.value),
    })

    if (!response.ok) {
      throw new Error('Failed to create manuscript')
    }

    const data = await response.json()
    
    // Redirect to the new manuscript's view page
    router.push({ name: 'manuscripts-view', params: { id: data.id } })
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'An error occurred'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <VCard>
    <VCardTitle class="text-h5">
      {{ t('menu.manuscripts.new') }}
    </VCardTitle>

    <VCardText>
      <VForm @submit.prevent="handleSubmit">
        <VTextField
          v-model="form.title"
          :label="t('projects.details.title')"
          required
        />

        <VTextarea
          v-model="form.description"
          :label="t('projects.details.description')"
          rows="4"
        />

        <VAlert
          v-if="error"
          type="error"
          class="mt-4"
        >
          {{ error }}
        </VAlert>

        <div class="d-flex gap-4 mt-4">
          <VBtn
            type="submit"
            :loading="loading"
            color="primary"
          >
            {{ t('buttons.save') }}
          </VBtn>

          <VBtn
            variant="tonal"
            :to="{ name: 'manuscripts-list' }"
          >
            {{ t('buttons.cancel') }}
          </VBtn>
        </div>
      </VForm>
    </VCardText>
  </VCard>
</template> 
