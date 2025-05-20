<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { PerfectScrollbar } from 'vue3-perfect-scrollbar'
import { VSelect } from 'vuetify/components/VSelect'

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
const { t } = useI18n()

const isFormValid = ref(false)
const refForm = ref<VForm | null>(null)

const userName = ref('')
const email = ref('')
const department = ref('')
const company = ref<string | null>(null) // Selected company name
const role = ref<string | null>(null) // Selected role name

const companies = ref<Company[]>([]) // Array to store companies
const roles = ref<Role[]>([]) // Array to store roles

// Computed properties
const companyNames = computed(() => companies.value.map(c => c.name))
const roleNames = computed(() => roles.value.map(r => r.name))

// Validators
const requiredValidator = (value: string | number | null) => !!value || 'This field is required.'

const emailValidator = (value: string | null) =>
  /^[^\s@]+@[^\s.@]*\.[^\s@]+$/.test(value || '') || 'Enter a valid email.'

// Fetch companies on component mount
onMounted(async () => {
  try {
    // Fetch companies
    const companiesResponse = await fetch('/api/companies/all', {
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

    roles.value = rolesData
      .filter((r: { id: number; name: string }) => ['Admin', 'Client'].includes(r.name))
      .map((r: { id: number; name: string }) => ({
        id: r.id,
        name: r.name,
      }))
  }
  catch (error) {
    console.error('Error fetching data:', error)
    emit('userData', { error: 'Unable to load data. Please try again later.' })
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
const onSubmit = async () => {
  const { valid } = await refForm.value?.validate() || { valid: false }
  
  if (!valid) return

  try {
    const userData = {
      name: userName.value,
      email: email.value,
      department: department.value || '',
      password: 'password123',
      company_id: companies.value.find(c => c.name === company.value)?.id,
      role_id: roles.value.find(r => r.name === role.value)?.id,
    }

    const response = await fetch('/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
      body: JSON.stringify(userData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to create user')
    }

    const result = await response.json()
    
    // Emit the success event with the created user data
    emit('userData', { 
      success: true, 
      message: 'User created successfully!',
      user: result.user 
    })
    
    // Close the drawer and reset form
    closeNavigationDrawer()
  }
  catch (error) {
    console.error('Error creating user:', error)
    emit('userData', { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to create user. Please try again.' 
    })
  }
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
      :title="t('users.addNew')"
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
                  :label="t('users.form.username')"
                  placeholder="Johndoe"
                />
              </VCol>

              <!-- Email -->
              <VCol cols="12">
                <AppTextField
                  v-model="email"
                  :rules="[requiredValidator, emailValidator]"
                  :label="t('users.form.email')"
                  placeholder="johndoe@email.com"
                />
              </VCol>

              <!-- Department -->
              <VCol cols="12">
                <AppTextField
                  v-model="department"
                  :label="t('users.form.department')"
                  :placeholder="t('users.form.departmentPlaceholder')"
                />
              </VCol>

              <!-- Company -->
              <VCol cols="12">
                <VSelect
                  v-model="company"
                  :rules="[requiredValidator]"
                  :label="t('users.form.selectCompany')"
                  :placeholder="t('users.form.selectCompany')"
                  :items="companyNames"
                />
              </VCol>

              <!-- Role -->
              <VCol cols="12">
                <VSelect
                  v-model="role"
                  :rules="[requiredValidator]"
                  :label="t('users.form.selectRole')"
                  :placeholder="t('users.form.selectRole')"
                  :items="roleNames"
                />
              </VCol>

              <!-- Submit and Cancel -->
              <VCol cols="12">
                <VBtn
                  type="submit"
                  class="me-4"
                >
                  {{ t('buttons.submit') }}
                </VBtn>
                <VBtn
                  type="reset"
                  variant="tonal"
                  color="error"
                  @click="closeNavigationDrawer"
                >
                  {{ t('buttons.cancel') }}
                </VBtn>
              </VCol>
            </VRow>
          </VForm>
        </VCardText>
      </VCard>
    </PerfectScrollbar>
  </VNavigationDrawer>
</template>
