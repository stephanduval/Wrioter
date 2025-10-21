<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { $api } from '@/utils/api'

const { t } = useI18n()
const router = useRouter()

const form = ref({
  title: '',
  description: '',
  status: 'draft', // Default status required by backend
})

const loading = ref(false)
const error = ref('')

const handleSubmit = async () => {
  try {
    loading.value = true
    error.value = ''

    // Use $api from utils/api.ts
    const data = await $api('/manuscripts', {
      method: 'POST',
      body: form.value,
    })

    console.log('Manuscript created successfully:', data)

    // Redirect to the manuscripts list page
    router.push({ name: 'manuscripts-list' })
  } catch (e: any) {
    console.error('Manuscript creation error:', e)
    // Handle validation errors
    if (e.data?.errors) {
      const errors = Object.values(e.data.errors).flat()
      error.value = errors.join(', ')
    } else if (e.data?.message) {
      error.value = e.data.message
    } else {
      error.value = e.message || 'Failed to create manuscript'
    }
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
          class="mb-4"
        />

        <VTextarea
          v-model="form.description"
          :label="t('projects.details.description')"
          rows="4"
          class="mb-4"
        />

        <VSelect
          v-model="form.status"
          :label="t('projects.details.status')"
          :items="[
            { title: 'Draft', value: 'draft' },
            { title: 'In Progress', value: 'in_progress' },
            { title: 'Completed', value: 'completed' }
          ]"
          item-title="title"
          item-value="value"
          class="mb-4"
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
