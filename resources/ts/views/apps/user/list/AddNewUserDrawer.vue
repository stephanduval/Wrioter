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

// Add these new refs for the success modal
const isSuccessModalVisible = ref(false)
const newUserData = ref<{ email: string; name: string; resetCode?: string } | null>(null)
const resetPasswordUrl = computed(() => {
  if (!newUserData.value?.resetCode || !newUserData.value?.email) return ''
  const baseUrl = import.meta.env.VITE_FRONTEND_URL || window.location.origin
  return `${baseUrl}/reset-password?code=${newUserData.value.resetCode}&email=${encodeURIComponent(newUserData.value.email)}`
})

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

    console.log('Sending user creation request:', { ...userData, password: '[REDACTED]' })

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
    console.log('User creation response:', {
      success: true,
      hasResetCode: !!result.reset_code,
      userEmail: result.user?.email,
      responseKeys: Object.keys(result)
    })
    
    // Store the new user data and show success modal
    newUserData.value = {
      email: result.user.email,
      name: result.user.name,
      resetCode: result.reset_code
    }

    console.log('New user data prepared for modal:', {
      email: newUserData.value.email,
      name: newUserData.value.name,
      hasResetCode: !!newUserData.value.resetCode
    })

    isSuccessModalVisible.value = true
    
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

const copyWelcomeMessage = () => {
  if (!newUserData.value) return
  
  const message = `Welcome to Freynet-Gagné Portal!

Dear ${newUserData.value.name},

Your account has been created successfully. To get started, please set your password by visiting the link below:

${resetPasswordUrl.value}

This link will expire in 60 minutes. If you need a new link, please contact your administrator.

Best regards,
Freynet-Gagné Team`
  
  navigator.clipboard.writeText(message)
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

    <!-- Add Success Modal -->
    <VDialog
      v-model="isSuccessModalVisible"
      max-width="600"
    >
      <VCard>
        <VCardTitle class="text-h5 pa-6">
          User Created Successfully
        </VCardTitle>

        <VCardText class="pa-6">
          <VAlert
            color="success"
            variant="tonal"
            class="mb-4"
          >
            <template #prepend>
              <VIcon icon="bx-check-circle" />
            </template>
            The user has been created successfully. Please copy and send the welcome message below to the new user.
          </VAlert>

          <div class="mb-4">
            <p class="text-body-1 mb-2">
              <strong>User Details:</strong>
            </p>
            <p class="text-body-2">
              Name: {{ newUserData?.name }}<br>
              Email: {{ newUserData?.email }}
            </p>
          </div>

          <VAlert
            color="info"
            variant="tonal"
            class="mt-4"
          >
            <template #prepend>
              <VIcon icon="bx-info-circle" />
            </template>
            <p class="mb-2">Welcome Message (click to copy):</p>
            <div class="d-flex align-center gap-2">
              <VTextField
                :model-value="resetPasswordUrl"
                readonly
                variant="outlined"
                density="compact"
                class="flex-grow-1"
                label="Reset Password Link"
              />
              <VBtn
                icon
                variant="tonal"
                @click="copyWelcomeMessage"
                title="Copy welcome message"
              >
                <VIcon icon="bx-copy" />
              </VBtn>
            </div>
          </VAlert>
        </VCardText>

        <VCardActions class="pa-6 pt-0">
          <VSpacer />
          <VBtn
            color="primary"
            @click="isSuccessModalVisible = false"
          >
            Close
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </VNavigationDrawer>
</template>
