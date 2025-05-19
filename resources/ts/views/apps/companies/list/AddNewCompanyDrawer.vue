<script setup lang="ts">
import { defineEmits, defineProps, ref } from 'vue'
import { useI18n } from 'vue-i18n'

// Props and Emits
const props = defineProps({
  isDrawerOpen: {
    type: Boolean,
    required: true,
  },
})
const emit = defineEmits(['update:isDrawerOpen', 'companyData'])
const { t } = useI18n()

// Form Fields
const companyName = ref('')
const isFormValid = ref(false)

// Validators
const requiredValidator = (value: string | null) => !!value || 'This field is required.'

// Close Drawer
const closeDrawer = () => {
  emit('update:isDrawerOpen', false)
  companyName.value = '' // Reset field
}

// Form Submission
const onSubmit = async () => {
  if (!companyName.value.trim()) {
    emit('companyData', { 
      success: false, 
      error: 'Company name is required' 
    })
    return
  }

  try {
    const response = await fetch('/api/companies', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
      body: JSON.stringify({
        company_name: companyName.value.trim(),
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to create company')
    }

    const result = await response.json()

    // Emit success with the created company data
    emit('companyData', { 
      success: true, 
      message: 'Company created successfully!',
      company: result.company 
    })
    
    // Close drawer and reset form
    closeDrawer()
  } 
  catch (error) {
    console.error('Error creating company:', error)
    emit('companyData', { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to create company. Please try again.' 
    })
  }
}
</script>

<template>
  <VNavigationDrawer
    v-model="props.isDrawerOpen"
    temporary
    :width="400"
    location="end"
    border="none"
  >
    <AppDrawerHeaderSection
      :title="t('companies.addNew')"
      @cancel="closeDrawer"
    />

    <VDivider />

    <VCardText>
      <VForm v-model="isFormValid" @submit.prevent="onSubmit">
        <VRow>
          <!-- Company Name -->
          <VCol cols="12">
            <AppTextField
              v-model="companyName"
              :rules="[requiredValidator]"
              :label="t('companies.form.name')"
              :placeholder="t('companies.form.namePlaceholder')"
            />
          </VCol>

          <!-- Submit and Cancel -->
          <VCol cols="12">
            <VBtn type="submit" class="me-4">{{ t('buttons.submit') }}</VBtn>
            <VBtn variant="tonal" color="error" @click="closeDrawer">{{ t('buttons.cancel') }}</VBtn>
          </VCol>
        </VRow>
      </VForm>
    </VCardText>
  </VNavigationDrawer>
</template>
