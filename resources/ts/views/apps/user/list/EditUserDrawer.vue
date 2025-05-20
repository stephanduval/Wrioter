<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { PerfectScrollbar } from 'vue3-perfect-scrollbar'
import { VForm } from 'vuetify/components/VForm'
import { VSelect } from 'vuetify/components/VSelect'

// Props and Emit Types
interface Props {
  isDrawerOpen: boolean
  userId: number | null
}

interface Emit {
  (e: 'update:isDrawerOpen', value: boolean): void
  (e: 'userUpdated', value: any): void
}

// Props and Emit
const props = defineProps<Props>()
const emit = defineEmits<Emit>()

// Form Fields
const isFormValid = ref(false)
const refForm = ref<VForm | null>(null)

const userName = ref('')
const email = ref('')
const department = ref('')
const company = ref<string | null>(null)
const role = ref<string | null>(null)

// Companies and Roles
const companies = ref<{ id: number; name: string }[]>([])
const roles = ref<{ id: number; name: string }[]>([])

// Computed Properties
const companyNames = computed(() => companies.value.map(c => c.name))
const roleNames = computed(() => roles.value.map(r => r.name))

// Validators
const requiredValidator = (value: string | number | null) => !!value || 'This field is required.'

const emailValidator = (value: string | null) =>
  /^[^\s@]+@[^\s.@]*\.[^\s@]+$/.test(value || '') || 'Enter a valid email.'

// Fetch User Details
const fetchUserDetails = async () => {
  if (!props.userId)
    return

  try {
    const response = await fetch(`/api/users/${props.userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
    })

    if (!response.ok)
      throw new Error('Failed to fetch user details.')

    const user = await response.json()

    // Map API response to form fields
    userName.value = user.name || ''
    email.value = user.email || ''
    department.value = user.department || ''
    company.value = companies.value.find(c => c.id === user.company_id)?.name || null
    role.value = roles.value.find(r => r.id === user.role_id)?.name || null

    // Log the fetched data for debugging
    console.log('Fetched user details:', {
      name: userName.value,
      email: email.value,
      department: department.value,
      company: company.value,
      role: role.value,
    })
  }
  catch (error) {
    console.error('Error fetching user details:', error)
    emit('userUpdated', { error: 'Failed to fetch user details. Please try again.' })
  }
}

// Fetch Companies and Roles
const fetchDropdownData = async () => {
  try {
    const [companiesResponse, rolesResponse] = await Promise.all([
      fetch('/api/companies/all', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      }),
      fetch('/api/roles', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      }),
    ])

    if (!companiesResponse.ok)
      throw new Error('Failed to fetch companies.')
    if (!rolesResponse.ok)
      throw new Error('Failed to fetch roles.')

    const [companiesData, rolesData] = await Promise.all([
      companiesResponse.json(),
      rolesResponse.json(),
    ])

    companies.value = companiesData.map((comp: { id: number; companyName: string }) => ({
      id: comp.id,
      name: comp.companyName,
    }))
    roles.value = rolesData
      .filter((r: { id: number; name: string }) => ['Admin', 'Client'].includes(r.name))
      .map((r: { id: number; name: string }) => ({
        id: r.id,
        name: r.name,
      }))
  }
  catch (error) {
    console.error('Error fetching dropdown data:', error)
  }
}

// Watchers
watch(() => props.isDrawerOpen, async (isOpen) => {
  if (isOpen && props.userId) {
    await fetchDropdownData() // Ensure dropdowns are loaded first
    await fetchUserDetails() // Then fetch user details
  }
})

// Also keep the userId watcher as a backup
watch(() => props.userId, async (newUserId) => {
  if (newUserId && props.isDrawerOpen) {
    await fetchDropdownData() // Ensure dropdowns are loaded first
    await fetchUserDetails() // Then fetch user details
  }
})

// Close Drawer Handler
const closeDrawer = () => {
  emit('update:isDrawerOpen', false)
  nextTick(() => {
    refForm.value?.reset()
    refForm.value?.resetValidation()
  })
}

// Submit Handler
const submitForm = async () => {
  if (!props.userId)
    return

  refForm.value?.validate().then(async ({ valid }) => {
    if (valid) {
      try {
        const response = await fetch(`/api/users/${props.userId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          },
          body: JSON.stringify({
            name: userName.value || undefined,
            email: email.value || undefined,
            department: department.value || '',
            company_id: companies.value.find(c => c.name === company.value)?.id,
            role_id: roles.value.find(r => r.name === role.value)?.id,
          }),
        })

        if (!response.ok)
          throw new Error('Failed to update user.')

        const updatedUser = await response.json()

        emit('userUpdated', { success: 'User updated successfully!', user: updatedUser })
        closeDrawer()
      }
      catch (error) {
        console.error('Error updating user:', error)
        emit('userUpdated', { error: 'Failed to update user. Please try again.' })
      }
    }
  })
}

// On Mounted
onMounted(async () => {
  await fetchDropdownData() // Fetch companies and roles first
  if (props.userId)
    await fetchUserDetails() // Then fetch user details
})

// i18n
const { t } = useI18n()
</script>

<template>
  <VNavigationDrawer
    temporary
    :width="400"
    location="end"
    border="none"
    class="scrollable-content"
    :model-value="props.isDrawerOpen"
    @update:model-value="closeDrawer"
  >
    <!-- Drawer Header -->
    <AppDrawerHeaderSection
      title="Edit User"
      @cancel="closeDrawer"
    />

    <VDivider />

    <PerfectScrollbar :options="{ wheelPropagation: false }">
      <VCard flat>
        <VCardText>
          <VForm
            ref="refForm"
            v-model="isFormValid"
            @submit.prevent="submitForm"
          >
            <VRow>
              <!-- Username -->
              <VCol cols="12">
                <AppTextField
                  v-model="userName"
                  label="Username"
                  :placeholder="userName || 'Enter username'"
                />
              </VCol>

              <!-- Email -->
              <VCol cols="12">
                <AppTextField
                  v-model="email"
                  :rules="[emailValidator]"
                  label="Email"
                  :placeholder="email || 'Enter email'"
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
                  label="Select Company"
                  :placeholder="company || 'Select Company'"
                  :items="companyNames"
                />
              </VCol>

              <!-- Role -->
              <VCol cols="12">
                <VSelect
                  v-model="role"
                  label="Select Role"
                  :placeholder="role || 'Select Role'"
                  :items="roleNames"
                />
              </VCol>

              <!-- Actions -->
              <VCol cols="12">
                <VBtn
                  type="submit"
                  class="me-4"
                >
                  Save
                </VBtn>
                <VBtn
                  type="reset"
                  variant="tonal"
                  color="error"
                  @click="closeDrawer"
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
