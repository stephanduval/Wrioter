<script setup lang="ts">
import SharedEmailView from '@/components/SharedEmailView.vue'
import axios from 'axios'
import { format } from 'date-fns'
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { VForm } from 'vuetify/components/VForm'
import { VSelect } from 'vuetify/components/VSelect'

// Configure axios
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api'

// Add token handling
const getAuthToken = () => {
  return localStorage.getItem('accessToken')
}

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
})

// Add request interceptor to include token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getAuthToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

const route = useRoute()
const router = useRouter()
const userId = route.params.id as string
const user = ref<any>(null)
const isLoading = ref(true)
const error = ref<string | null>(null)
const messages = ref<any[]>([])

// Add email viewing state
const selectedEmail = ref<any>(null)
const emailMeta = ref({
  hasPreviousEmail: false,
  hasNextEmail: false,
})

// Add after other refs
const isEditing = ref(false)
const isFormValid = ref(false)
const refForm = ref<VForm | null>(null)

const editedUser = ref({
  name: '',
  email: '',
  role: '',
  company: ''
})

// Add company and role data management
const companies = ref<Array<{ id: number, name: string }>>([])
const roles = ref<Array<{ id: number, name: string }>>([])

// Add computed properties for dropdowns
const companyNames = computed(() => companies.value.map(c => c.name))
const roleNames = computed(() => roles.value.map(r => r.name))

// Add validation
const emailValidator = (value: string | null) =>
  /^[^\s@]+@[^\s.@]*\.[^\s@]+$/.test(value || '') || 'Enter a valid email.'

interface User {
  id: number
  name: string
  email: string
  role: string
  companies: Array<{
    id: number
    company_name: string
  }>
  created_at: string
  updated_at: string
}

const fetchUser = async () => {
  isLoading.value = true
  error.value = null
  
  try {
    // console.log('Fetching user with ID:', userId)
    const response = await axiosInstance.get(`/users/${userId}`)
    // console.log('API Response:', response.data)
    
    if (!response.data) {
      throw new Error('No data received from API')
    }
    
    user.value = response.data

    // Fetch messages for this user using the authenticated instance
    const messagesResponse = await axiosInstance.get(`/messages`, {
      params: {
        user_id: userId,
      },
    })
    // console.log('Messages Response:', messagesResponse.data)
    messages.value = messagesResponse.data.data || []
  } catch (err: any) {
    // console.error('Error fetching user details:', err)
    // console.error('Error response:', err.response)
    error.value = err.response?.data?.message || 'Failed to load user details'
    
    // Handle authentication errors
    if (err.response?.status === 401) {
      error.value = 'Your session has expired. Please log in again.'
      // Optionally redirect to login page
      // router.push('/login')
    }
  } finally {
    isLoading.value = false
  }
}

const navigateBack = () => {
  router.push({ name: 'apps-user-list' })
}

const formattedDate = (date: string | undefined) => {
  if (!date) return 'N/A'
  return format(new Date(date), 'MMM dd, yyyy')
}

// Email handling functions
const handleEmailClick = (email: any) => {
  selectedEmail.value = email
}

const handleEmailClose = () => {
  selectedEmail.value = null
  emailMeta.value = {
    hasPreviousEmail: false,
    hasNextEmail: false,
  }
}

const handleEmailRefresh = async () => {
  // Refresh the messages list
  await fetchMessages()
}

const handleEmailNavigate = (direction: 'previous' | 'next') => {
  if (!selectedEmail.value) return

  const currentIndex = messages.value.findIndex(email => email.id === selectedEmail.value?.id)
  if (currentIndex === -1) return

  if (direction === 'previous' && currentIndex > 0) {
    selectedEmail.value = messages.value[currentIndex - 1]
    emailMeta.value = {
      hasPreviousEmail: currentIndex > 1,
      hasNextEmail: true,
    }
  } else if (direction === 'next' && currentIndex < messages.value.length - 1) {
    selectedEmail.value = messages.value[currentIndex + 1]
    emailMeta.value = {
      hasPreviousEmail: true,
      hasNextEmail: currentIndex < messages.value.length - 2,
    }
  }
}

const handleSendReply = async (data: { message: string, attachments: File[] }) => {
  if (!selectedEmail.value) return

  try {
    const formData = new FormData()
    formData.append('subject', `Re: ${selectedEmail.value.subject}`)
    formData.append('body', data.message)
    formData.append('company_id', selectedEmail.value.company_id.toString())
    formData.append('receiver_id', selectedEmail.value.from.id.toString())
    formData.append('reply_to_id', selectedEmail.value.id.toString())

    if (data.attachments && data.attachments.length > 0) {
      data.attachments.forEach(file => formData.append('attachments[]', file))
    }

    const response = await axiosInstance.post('/messages', formData, {
      headers: {
        'Accept': 'application/json',
      },
    })

    if (response.data) {
      await handleEmailRefresh()
      handleEmailClose()
    }
  } catch (error) {
    // console.error('Error sending reply:', error)
  }
}

// Add function to fetch dropdown data
const fetchDropdownData = async () => {
  try {
    const [companiesResponse, rolesResponse] = await Promise.all([
      axiosInstance.get('/companies/all'),
      axiosInstance.get('/roles'),
    ])

    companies.value = companiesResponse.data.map((comp: { id: number; companyName: string }) => ({
      id: comp.id,
      name: comp.companyName,
    }))
    roles.value = rolesResponse.data.map((r: { id: number; name: string }) => ({
      id: r.id,
      name: r.name,
    }))
  } catch (error) {
    // console.error('Error fetching dropdown data:', error)
  }
}

// Add function to start editing
const startEditing = () => {
  editedUser.value = {
    name: user.value?.name || '',
    email: user.value?.email || '',
    role: user.value?.role || '',
    company: user.value?.company?.company_name || ''
  }
  isEditing.value = true
}

// Add function to cancel editing
const cancelEditing = () => {
  isEditing.value = false
  editedUser.value = {
    name: '',
    email: '',
    role: '',
    company: ''
  }
}

// Add function to save changes
const saveChanges = async () => {
  try {
    const response = await axiosInstance.put(`/users/${userId}`, {
      name: editedUser.value.name,
      email: editedUser.value.email,
      role_id: roles.value.find(r => r.name === editedUser.value.role)?.id,
      company_id: companies.value.find(c => c.name === editedUser.value.company)?.id
    })

    if (response.data) {
      user.value = response.data
      isEditing.value = false
      await fetchUser() // Refresh user data
    }
  } catch (err: any) {
    // console.error('Error saving user:', err)
    error.value = err.response?.data?.message || 'Failed to save changes'
  }
}

// Add fetchMessages function
const fetchMessages = async () => {
  try {
    const response = await axiosInstance.get(`/messages?user_id=${userId}`)
    if (response.data && Array.isArray(response.data)) {
      messages.value = response.data
    }
  } catch (error) {
    // console.error('Error fetching messages:', error)
  }
}

const { t } = useI18n()

onMounted(async () => {
  // console.log('Component mounted, fetching user...')
  await Promise.all([
    fetchUser(),
    fetchMessages(),
    fetchDropdownData(),
  ])
})
</script>

<template>
  <VCard class="mb-6">
    <VCardItem>
      <template #prepend>
        <VBtn
          icon
          variant="text"
          color="default"
          size="small"
          @click="navigateBack"
        >
          <VIcon
            size="24"
            icon="mdi-arrow-left"
          />
        </VBtn>
      </template>
      
      <VCardTitle class="text-h5">
        {{ t('users.view.title') }}
      </VCardTitle>
    </VCardItem>
  </VCard>

  <VRow v-if="isLoading">
    <VCol cols="12">
      <VCard>
        <VCardText class="d-flex justify-center">
          <VProgressCircular
            indeterminate
            color="primary"
          />
        </VCardText>
      </VCard>
    </VCol>
  </VRow>

  <VRow v-else-if="error">
    <VCol cols="12">
      <VAlert
        type="error"
        variant="tonal"
      >
        {{ error }}
      </VAlert>
    </VCol>
  </VRow>

  <VRow v-else-if="user">
    <!-- User Information -->
    <VCol
      cols="12"
      md="5"
      lg="4"
    >
      <VCard>
        <VCardItem>
          <VCardTitle>{{ t('users.view.information') }}</VCardTitle>
          <template #append>
            <template v-if="isEditing">
              <VBtn
                color="error"
                variant="outlined"
                class="me-4"
                @click="cancelEditing"
              >
                {{ t('users.view.cancel') }}
              </VBtn>
              <VBtn
                color="success"
                @click="saveChanges"
                :loading="isLoading"
              >
                {{ t('users.view.saveChanges') }}
              </VBtn>
            </template>
            <VBtn
              v-else
              color="primary"
              @click="startEditing"
            >
              {{ t('users.view.edit') }}
            </VBtn>
          </template>
        </VCardItem>

        <VDivider />

        <VCardText>
          <VForm
            ref="refForm"
            v-model="isFormValid"
            @submit.prevent="saveChanges"
          >
            <VList>
              <VListItem>
                <template #prepend>
                  <VIcon
                    color="primary"
                    icon="mdi-account"
                    class="me-3"
                  />
                </template>
                <VListItemTitle>{{ t('users.view.name') }}</VListItemTitle>
                <VListItemSubtitle>
                  <VTextField
                    v-if="isEditing"
                    v-model="editedUser.name"
                    density="compact"
                    hide-details
                    variant="underlined"
                  />
                  <template v-else>
                    {{ user?.name }}
                  </template>
                </VListItemSubtitle>
              </VListItem>
              
              <VListItem>
                <template #prepend>
                  <VIcon
                    color="primary"
                    icon="mdi-email"
                    class="me-3"
                  />
                </template>
                <VListItemTitle>{{ t('users.view.email') }}</VListItemTitle>
                <VListItemSubtitle>
                  <VTextField
                    v-if="isEditing"
                    v-model="editedUser.email"
                    density="compact"
                    hide-details
                    variant="underlined"
                    :rules="[emailValidator]"
                  />
                  <template v-else>
                    {{ user?.email }}
                  </template>
                </VListItemSubtitle>
              </VListItem>
              
              <VListItem>
                <template #prepend>
                  <VIcon
                    color="primary"
                    icon="mdi-shield-account"
                    class="me-3"
                  />
                </template>
                <VListItemTitle>{{ t('users.view.role') }}</VListItemTitle>
                <VListItemSubtitle>
                  <VSelect
                    v-if="isEditing"
                    v-model="editedUser.role"
                    :items="roleNames"
                    density="compact"
                    hide-details
                    variant="underlined"
                  />
                  <template v-else>
                    <span class="text-capitalize">{{ user?.role }}</span>
                  </template>
                </VListItemSubtitle>
              </VListItem>
              
              <VListItem>
                <template #prepend>
                  <VIcon
                    color="primary"
                    icon="mdi-office-building"
                    class="me-3"
                  />
                </template>
                <VListItemTitle>{{ t('users.view.company') }}</VListItemTitle>
                <VListItemSubtitle>
                  <VSelect
                    v-if="isEditing"
                    v-model="editedUser.company"
                    :items="companyNames"
                    density="compact"
                    hide-details
                    variant="underlined"
                  />
                  <template v-else>
                    {{ user?.company?.company_name }}
                  </template>
                </VListItemSubtitle>
              </VListItem>
              
              <VListItem>
                <template #prepend>
                  <VIcon
                    color="primary"
                    icon="mdi-calendar-plus"
                    class="me-3"
                  />
                </template>
                <VListItemTitle>{{ t('users.view.createdAt') }}</VListItemTitle>
                <VListItemSubtitle>{{ formattedDate(user?.created_at) }}</VListItemSubtitle>
              </VListItem>

              <VListItem>
                <template #prepend>
                  <VIcon
                    color="primary"
                    icon="mdi-calendar-edit"
                    class="me-3"
                  />
                </template>
                <VListItemTitle>{{ t('users.view.lastUpdated') }}</VListItemTitle>
                <VListItemSubtitle>{{ formattedDate(user?.updated_at) }}</VListItemSubtitle>
              </VListItem>
            </VList>
          </VForm>
        </VCardText>
      </VCard>
    </VCol>

    <!-- User Messages -->
    <VCol
      cols="12"
      md="7"
      lg="8"
    >
      <VCard>
        <VCardItem>
          <VCardTitle>{{ t('users.view.messages') }}</VCardTitle>
        </VCardItem>
        
        <VDivider />
        
        <VCardText v-if="!messages.length">
          <VAlert
            color="info"
            variant="tonal"
          >
            {{ t('users.view.noMessages') }}
          </VAlert>
        </VCardText>
        
        <VList v-else>
          <VListItem
            v-for="message in messages"
            :key="message.id"
            @click="handleEmailClick(message)"
          >
            <template #prepend>
              <VAvatar
                color="primary"
                variant="tonal"
              >
                <VIcon icon="mdi-email" />
              </VAvatar>
            </template>
            
            <VListItemTitle>{{ message.subject }}</VListItemTitle>
            <VListItemSubtitle>
              {{ t('users.view.from') }}: {{ message.from?.name || message.from?.email || 'Unknown' }}
            </VListItemSubtitle>
            
            <template #append>
              <div class="d-flex flex-column align-end">
                <span class="text-xs text-disabled">{{ formattedDate(message.created_at) }}</span>
              </div>
            </template>
          </VListItem>
        </VList>
      </VCard>
    </VCol>
  </VRow>

  <!-- Email View Component -->
  <SharedEmailView
    :email="selectedEmail"
    :email-meta="emailMeta"
    @close="handleEmailClose"
    @refresh="handleEmailRefresh"
    @navigated="handleEmailNavigate"
    @send-reply="handleSendReply"
  />
</template>

<style lang="scss">
.user-role {
  text-transform: capitalize;
}
</style>
