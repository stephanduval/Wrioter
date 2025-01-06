<script setup lang="ts">
import { defineEmits, defineProps } from 'vue';

// Define props
const props = defineProps({
  isDrawerOpen: {
    type: Boolean,
    required: true,
  },
});

// Define emits
const emit = defineEmits(['update:isDrawerOpen']);

// Close Drawer
const closeDrawer = () => {
  emit('update:isDrawerOpen', false);
};
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
      <VRow>
        <!-- Company Name Input -->
        <VCol cols="12">
          <AppTextField
            label="Company Name"
            placeholder="Enter company name"
          />
        </VCol>

        <!-- Submit and Cancel Buttons -->
        <VCol cols="12">
          <VBtn class="me-4" @click="closeDrawer">
            Submit
          </VBtn>
          <VBtn variant="tonal" color="error" @click="closeDrawer">
            Cancel
          </VBtn>
        </VCol>
      </VRow>
    </VCardText>
  </VNavigationDrawer>
</template>



<!-- Old working Script

<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue'

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
const companyNames = computed(() => companies.value.map(c => c.name))
const roleNames = computed(() => roles.value.map(r => r.name))

// Validators
const requiredValidator = (value: string | number | null) => !!value || 'This field is required.'

const emailValidator = (value: string | null) =>
  /^[^\s@]+@[^\s.@]*\.[^\s@]+$/.test(value || '') || 'Enter a valid email.'

// Fetch companies and roles on component mount
onMounted(async () => {
  try {
    const token = localStorage.getItem('accessToken')

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    }

    // Fetch companies
    console.log('Fetching companies...')

    const companiesResponse = await fetch('/api/companies', { method: 'GET', headers })

    if (!companiesResponse.ok) {
      console.error('Failed to fetch companies:', companiesResponse.statusText)
      throw new Error('Failed to fetch companies.')
    }

    const companiesData = await companiesResponse.json()

    companies.value = companiesData.map((comp: { id: number; companyName: string }) => ({
      id: comp.id,
      name: comp.companyName,
    }))
    console.log('Companies fetched:', companies.value)

    // Fetch roles
    console.log('Fetching roles...')

    const rolesResponse = await fetch('/api/roles', { method: 'GET', headers })

    if (!rolesResponse.ok) {
      console.error('Failed to fetch roles:', rolesResponse.statusText)
      throw new Error('Failed to fetch roles.')
    }

    const rolesData = await rolesResponse.json()

    roles.value = rolesData.map((r: { id: number; name: string }) => ({
      id: r.id,
      name: r.name,
    }))
    console.log('Roles fetched:', roles.value)
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
  const formData = {
    name: userName.value,
    email: email.value,
    password: 'password123', // Generate or input a secure temp password
    company_id: companies.value.find(c => c.name === company.value)?.id,
    role_id: roles.value.find(r => r.name === role.value)?.id,
  }

  console.log('Submitting form data:', formData)

  refForm.value?.validate().then(async ({ valid }) => {
    if (valid) {
      try {
        const response = await fetch('/api/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          },
          body: JSON.stringify(formData),
        })

        if (!response.ok) {
          console.error('Failed to create user:', response.statusText)
          throw new Error('Failed to create user.')
        }

        const result = await response.json()

        console.log('User created successfully:', result)
        emit('userData', { success: 'User created successfully!' })
        closeNavigationDrawer()
      }
      catch (error) {
        console.error('Error:', error)
        emit('userData', { error: 'Failed to create user. Please try again.' })
      }
    }
  })
}

const handleDrawerModelValueUpdate = (val: boolean) => {
  emit('update:isDrawerOpen', val)
}
</script>
 -->
