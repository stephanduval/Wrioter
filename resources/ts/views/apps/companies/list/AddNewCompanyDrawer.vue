<script setup lang="ts">
import { defineEmits, defineProps, ref } from 'vue'

// Props and Emits
const props = defineProps({
  isDrawerOpen: {
    type: Boolean,
    required: true,
  },
})
const emit = defineEmits(['update:isDrawerOpen', 'companyData'])

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
    console.error('Company name is required')
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

    if (!response.ok) throw new Error('Failed to create company.')

    const result = await response.json()

    emit('companyData', { success: 'Company created successfully!', data: result })
    closeDrawer()
  } catch (error) {
    console.error('Error adding company:', error)
    emit('companyData', { error: 'Failed to create company. Please try again.' })
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
      title="Add New Company"
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
              label="Company Name"
              placeholder="Enter company name"
            />
          </VCol>

          <!-- Submit and Cancel -->
          <VCol cols="12">
            <VBtn type="submit" class="me-4">Submit</VBtn>
            <VBtn variant="tonal" color="error" @click="closeDrawer">Cancel</VBtn>
          </VCol>
        </VRow>
      </VForm>
    </VCardText>
  </VNavigationDrawer>
</template>
