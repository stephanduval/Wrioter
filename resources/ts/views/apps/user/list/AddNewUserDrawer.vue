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

interface Role {
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
const role = ref<string | null>(null) // Selected role name

const companies = ref<Company[]>([]) // Array to store companies
const roles = ref<Role[]>([]) // Array to store roles

// Computed properties
const companyNames = computed(() => companies.value.map(company => company.name))
const roleNames = computed(() => roles.value.map(role => role.name))

// Validators
const requiredValidator = (value: string | number | null) => !!value || 'This field is required.'

const emailValidator = (value: string | null) =>
  /^[^\s@]+@[^\s.@]*\.[^\s@]+$/.test(value || '') || 'Enter a valid email.'

// Fetch companies on component mount
onMounted(async () => {
  try {
    // Fetch companies
    const companiesResponse = await fetch('/api/companies', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
    })

    if (!companiesResponse.ok)
      throw new Error('Failed to fetch companies.')

    const companiesData = await companiesResponse.json()

    companies.value = companiesData.map((comp: { id: number; companyName: string }) => ({
      id: comp.id,
      name: comp.companyName,
    }))

    // Fetch roles
    const rolesResponse = await fetch('/api/roles', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
    })

    if (!rolesResponse.ok)
      throw new Error('Failed to fetch roles.')

    const rolesData = await rolesResponse.json()

    roles.value = rolesData.map((role: { id: number; name: string }) => ({
      id: role.id,
      name: role.name,
    }))

    console.log('Mapped companies:', companies.value)
    console.log('Mapped roles:', roles.value)
  }
  catch (error) {
    console.error('Error fetching data:', error)
    alert('Unable to load data. Please try again later.')
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
        role: role.value, // Only send the role name
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
                  :rules="[requiredValidator]"
                  label="Select Role"
                  placeholder="Select Role"
                  :items="roleNames"
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
