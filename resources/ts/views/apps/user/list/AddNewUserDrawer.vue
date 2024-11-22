<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue'
import { PerfectScrollbar } from 'vue3-perfect-scrollbar'
import { VSelect } from 'vuetify/components'

import type { VForm } from 'vuetify/components/VForm'

interface Emit {
  (e: 'update:isDrawerOpen', value: boolean): void
  (e: 'userData', value: any): void
}

interface Props {
  isDrawerOpen: boolean
}

interface Company {
  id: number
  name: string
}

const props = defineProps<Props>()
const emit = defineEmits<Emit>()

const isFormValid = ref(false)
const refForm = ref<VForm | null>(null)

const userName = ref('')
const email = ref('')
const company = ref<string | null>(null) // Selected company name
const role = ref<string | null>(null)

const companies = ref<Company[]>([]) // Array to store companies

// Computed property for company names
const companyNames = computed(() => companies.value.map(company => company.name))

// Validators
const requiredValidator = (value: string | number | null) => !!value || 'This field is required.'

const emailValidator = (value: string | null) =>
  /^[^\s@]+@[^\s.@]*\.[^\s@]+$/.test(value || '') || 'Enter a valid email.'

// Fetch companies on component mount
onMounted(async () => {
  try {
    const response = await fetch('/api/companies', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
    })

    if (!response.ok)
      throw new Error('Failed to fetch companies.')

    const responseData = await response.json()

    companies.value = responseData.map((comp: { id: number; companyName: string }) => ({
      id: comp.id,
      name: comp.companyName,
    }))

    console.log('Mapped companies:', companies.value)
  }
  catch (error) {
    console.error('Error fetching companies:', error)
    alert('Unable to load companies. Please try again later.')
  }
})

// Drawer close handler
const closeNavigationDrawer = () => {
  emit('update:isDrawerOpen', false)

  nextTick(() => {
    refForm.value?.reset()
    refForm.value?.resetValidation()
  })
}

// Form submission
const onSubmit = () => {
  refForm.value?.validate().then(({ valid }) => {
    if (valid) {
      emit('userData', {
        id: 0,
        company: company.value, // Only send the company name
        role: role.value,
        email: email.value,
        avatar: '',
        billing: 'Auto Debit',
      })
      emit('update:isDrawerOpen', false)
      nextTick(() => {
        refForm.value?.reset()
        refForm.value?.resetValidation()
      })
    }
  })
}

const handleDrawerModelValueUpdate = (val: boolean) => {
  emit('update:isDrawerOpen', val)
}
</script>

<template>
  <VNavigationDrawer
    temporary
    :width="400"
    location="end"
    border="none"
    class="scrollable-content"
    :model-value="props.isDrawerOpen"
    @update:model-value="handleDrawerModelValueUpdate"
  >
    <!-- Drawer Title -->
    <AppDrawerHeaderSection
      title="Add New User"
      @cancel="closeNavigationDrawer"
    />

    <VDivider />

    <PerfectScrollbar :options="{ wheelPropagation: false }">
      <VCard flat>
        <VCardText>
          <VForm
            ref="refForm"
            v-model="isFormValid"
            @submit.prevent="onSubmit"
          >
            <VRow>
              <!-- Username -->
              <VCol cols="12">
                <AppTextField
                  v-model="userName"
                  :rules="[requiredValidator]"
                  label="Username"
                  placeholder="Johndoe"
                />
              </VCol>

              <!-- Email -->
              <VCol cols="12">
                <AppTextField
                  v-model="email"
                  :rules="[requiredValidator, emailValidator]"
                  label="Email"
                  placeholder="johndoe@email.com"
                />
              </VCol>

              <!-- Company -->
              <VCol cols="12">
                <VSelect
                  v-model="company"
                  :rules="[requiredValidator]"
                  label="Select Company"
                  placeholder="Select Company"
                  :items="companyNames"
                />
              </VCol>

              <!-- Role -->
              <VCol cols="12">
                <VSelect
                  v-model="role"
                  label="Select Role"
                  placeholder="Select Role"
                  :rules="[requiredValidator]"
                  :items="['Admin', 'Author', 'Editor', 'Maintainer', 'Subscriber']"
                />
              </VCol>

              <!-- Submit and Cancel -->
              <VCol cols="12">
                <VBtn
                  type="submit"
                  class="me-4"
                >
                  Submit
                </VBtn>
                <VBtn
                  type="reset"
                  variant="tonal"
                  color="error"
                  @click="closeNavigationDrawer"
                >
                  Cancel
                </VBtn>
              </VCol>
            </VRow>
          </VForm>
        </VCardText>
      </VCard>
    </PerfectScrollbar>
  </VNavigationDrawer>
</template>
