<script setup lang="ts">
import SharedEmailView from '@/components/SharedEmailView.vue'
import { useEmail } from '@/views/apps/email/useEmail'
import axios from 'axios'
import { format } from 'date-fns'
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'

// Configure axios
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api'

// Add debug logging for localStorage
const debugAuthState = () => {
  console.log('Current Auth State:', {
    accessToken: localStorage.getItem('accessToken') ? 'Present' : 'Missing',
    userData: localStorage.getItem('userData') ? JSON.parse(localStorage.getItem('userData') || '{}') : 'Missing',
    abilityRules: localStorage.getItem('abilityRules') ? 'Present' : 'Missing'
  })
}

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
})

// Add request interceptor to include token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken')
    console.log('Making request to:', config.url, {
      hasToken: !!token,
      method: config.method,
      headers: config.headers
    })
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    console.error('Request interceptor error:', error)
    return Promise.reject(error)
  }
)

// Add response interceptor to handle auth errors
axiosInstance.interceptors.response.use(
  (response) => {
    console.log('Response received:', {
      url: response.config.url,
      status: response.status,
      statusText: response.statusText
    })
    return response
  },
  (error) => {
    console.error('Response error:', {
      url: error.config?.url,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    })
    
    if (error.response?.status === 401 || error.response?.status === 403) {
      console.log('Auth error detected, clearing storage and redirecting to login')
      debugAuthState()
      localStorage.removeItem('accessToken')
      localStorage.removeItem('userData')
      localStorage.removeItem('abilityRules')
      router.push('/login')
    }
    return Promise.reject(error)
  }
)

const route = useRoute()
const router = useRouter()
const projectId = route.params.id as string
const project = ref<Project | null>(null)
const messages = ref<any[]>([])
const isLoading = ref(true)
const error = ref<string | null>(null)
const isEditing = ref(false)
const editedProject = ref<Partial<Project>>({})
const selectedEmail = ref<any>(null)
const emailMeta = ref({
  hasPreviousEmail: false,
  hasNextEmail: false,
})
const isEditDrawerOpen = ref(false)

const { t } = useI18n()

// Add computed property for user role check
const userData = computed(() => {
  try {
    return JSON.parse(localStorage.getItem('userData') || '{}')
  } catch (e) {
    console.error('Error parsing userData:', e)
    return {}
  }
})

const userRole = computed(() => {
  return userData.value?.role?.toLowerCase() || ''
})

const canEditProject = computed(() => {
  return userRole.value !== 'client'
})

interface Project {
  id: number
  title: string
  property?: string
  time_preference?: string
  service_type?: string
  service_description?: string
  deadline?: string
  latest_completion_date?: string
  status: string
  created_at: string
  updated_at: string
  client_id?: number
  client?: {
    id: number
    name: string
    email: string
  }
  company?: {
    id: number
    name: string
  }
  contact_email?: string
  date_requested?: string
  attachments?: any[]
}

const statusColorMap: Record<string, string> = {
  pending: 'warning',
  active: 'success',
  completed: 'secondary',
  cancelled: 'error',
}

const formattedDate = (date: string | undefined) => {
  if (!date) return 'N/A'
  return format(new Date(date), 'MMM dd, yyyy')
}

// Add status options
const statusOptions = [
  { title: 'Received', value: 'received' },
  { title: 'In Progress', value: 'in_progress' },
  { title: 'Delivered', value: 'delivered' },
]

// Add time preference options
const timePreferenceOptions = [
  { title: 'Before Noon', value: 'before_noon' },
  { title: 'Before 4pm', value: 'before_4pm' },
  { title: 'Anytime', value: 'anytime' },
]

// Add service type options
const serviceTypeOptions = [
  { title: 'Translation', value: 'translation' },
  { title: 'Revision', value: 'revision' },
  { title: 'Modifications', value: 'modifications' },
  { title: 'Transcription', value: 'transcription' },
  { title: 'Voice Over', value: 'voice_over' },
  { title: 'Other', value: 'other' },
]

// Add function to strip HTML tags
const stripHtml = (html: string) => {
  const tmp = document.createElement('DIV')
  tmp.innerHTML = html
  return tmp.textContent || tmp.innerText || ''
}

const emailComposable = useEmail()

const fetchProject = async () => {
  console.log('Fetching project:', projectId)
  debugAuthState()
  isLoading.value = true
  error.value = null
  
  try {
    const response = await axiosInstance.get(`/projects/${projectId}`)
    console.log('Project fetch response:', {
      status: response.status,
      hasData: !!response.data
    })
    
    if (!response.data) {
      throw new Error('No data received from API')
    }
    
    // Add detailed logging of the project data
    console.log('Project Resource Data Structure:', {
      fullResponse: response.data,
      project: response.data.data,
      messages: response.data.data?.messages,
      attachments: response.data.data?.attachments,
      attachmentCount: response.data.data?.attachments?.length || 0,
      client: response.data.data?.client,
      company: response.data.data?.company
    })

    // Log all attachments with their details
    if (response.data.data?.attachments) {
      console.log('All Project Attachments:', response.data.data.attachments.map((attachment: any) => ({
        id: attachment.id,
        filename: attachment.filename,
        message_id: attachment.message_id,
        message_subject: attachment.message_subject,
        message_date: attachment.message_date,
        mime_type: attachment.mime_type,
        size: attachment.size,
        download_url: attachment.download_url,
        created_at: attachment.created_at
      })))
    }
    
    project.value = response.data.data
    
    // Fetch messages related to this project
    console.log('Fetching project messages')
    const messagesResponse = await axiosInstance.get('/messages', {
      params: {
        project_id: projectId,
      },
    })
    console.log('Messages fetch response:', {
      status: messagesResponse.status,
      messageCount: messagesResponse.data.data?.length || 0
    })
    
    messages.value = messagesResponse.data.data || []

    // Add debug logging after data is set
    console.log('Final component state:', {
      project: project.value,
      messages: messages.value,
      hasAttachments: (project.value?.attachments?.length ?? 0) > 0,
      attachmentCount: project.value?.attachments?.length ?? 0,
      firstMessageAttachments: messages.value[0]?.attachments,
      firstProjectAttachment: project.value?.attachments?.[0]
    })
  } catch (err: any) {
    console.error('Error in fetchProject:', {
      error: err,
      response: err.response,
      status: err.response?.status,
      data: err.response?.data
    })
    error.value = err.response?.data?.message || 'Failed to load project details'
  } finally {
    isLoading.value = false
  }
}

// Add a watch to log when project data changes
watch(project, (newVal) => {
  // console.log('Project data updated:', newVal)
}, { deep: true })

// Add a watch to log when messages data changes
watch(messages, (newVal) => {
  // console.log('Messages data updated:', newVal)
}, { deep: true })

const navigateBack = () => {
  router.push({ name: 'apps-projects-list' })
}

const composeMessage = () => {
  // Get the latest message if available
  const latestMessage = messages.value.length > 0 ? messages.value[0] : null
  
  router.push({ 
    name: 'apps-email-compose', 
    query: { 
      project_id: projectId,
      reply_to_id: latestMessage?.id,
      subject: latestMessage ? `Re: ${latestMessage.subject}` : undefined,
      receiver_id: latestMessage?.from?.id
    } 
  })
}

const startEditing = () => {
  if (project.value) {
    // Format dates to YYYY-MM-DD for the date inputs
    editedProject.value = {
      ...project.value,
      deadline: project.value.deadline ? format(new Date(project.value.deadline), 'yyyy-MM-dd') : undefined,
      latest_completion_date: project.value.latest_completion_date ? format(new Date(project.value.latest_completion_date), 'yyyy-MM-dd') : undefined,
    }
    isEditing.value = true
  }
}

const cancelEditing = () => {
  isEditing.value = false
  editedProject.value = {}
}

const saveProject = async () => {
  try {
    isLoading.value = true
    const response = await axiosInstance.put(`/projects/${projectId}`, editedProject.value)
    project.value = response.data.data
    isEditing.value = false
    editedProject.value = {}
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Failed to update project'
  } finally {
    isLoading.value = false
  }
}

const handleEmailClick = (email: any) => {
  selectedEmail.value = email
}

const handleEmailClose = () => {
  selectedEmail.value = null
}

const handleEmailRefresh = () => {
  fetchProject()
}

const handleProjectUpdated = () => {
  fetchProject()
}

const downloadAttachment = (attachment: any) => {
  console.log('Download attachment called with:', attachment)
  
  if (!attachment || typeof attachment !== 'object') {
    console.error('Invalid attachment object:', attachment)
    return
  }

  console.log('Full attachment object:', JSON.stringify(attachment, null, 2))

  if (!attachment.download_url) {
    console.error('No download URL found in attachment:', attachment)
    return
  }

  try {
    const link = document.createElement('a')
    link.href = attachment.download_url
    link.target = '_blank'
    link.rel = 'noopener noreferrer'
    link.click()
  } catch (error) {
    console.error('Error downloading attachment:', error)
  }
}

const downloadAttachments = async (attachments: any[]) => {
  if (!attachments || attachments.length === 0) return

  if (attachments.length > 1) {
    for (const attachment of attachments) {
      if (attachment?.download_url) {
        window.open(attachment.download_url, '_blank')
        await new Promise(resolve => setTimeout(resolve, 500))
      }
    }
    return
  }

  if (attachments[0]?.download_url) {
    window.open(attachments[0].download_url, '_blank')
  }
}

const handleEmailNavigate = (direction: 'previous' | 'next') => {
  if (!selectedEmail.value) return

  const currentIndex = messages.value.findIndex(email => email.id === selectedEmail.value?.id)
  if (currentIndex === -1) return

  if (direction === 'previous' && currentIndex > 0) {
    selectedEmail.value = messages.value[currentIndex - 1]
  } else if (direction === 'next' && currentIndex < messages.value.length - 1) {
    selectedEmail.value = messages.value[currentIndex + 1]
  }
}

const handleSendReply = async (data: { message: string, attachments: File[] }) => {
  if (!selectedEmail.value) return

  try {
    const response = await emailComposable.sendReplyMessage({
      receiver_id: selectedEmail.value.from.id,
      company_id: selectedEmail.value.company_id,
      subject: `Re: ${selectedEmail.value.subject}`,
      body: data.message,
      reply_to_id: selectedEmail.value.id,
      attachments: data.attachments,
    })

    if (response) {
      await fetchProject()
      handleEmailClose()
    }
  } catch (error) {
    console.error('Error sending reply:', error)
  }
}

// Log initial state when component mounts
onMounted(() => {
  console.log('Project View Component Mounted:', {
    projectId,
    route: route.fullPath
  })
  debugAuthState()
  fetchProject()
})

const getFileIcon = (mimeType: string) => {
  if (!mimeType) return 'bx-file'
  
  const type = mimeType.split('/')[0]
  switch (type) {
    case 'image':
      return 'bx-image'
    case 'video':
      return 'bx-video'
    case 'audio':
      return 'bx-music'
    case 'application':
      if (mimeType.includes('pdf')) return 'bx-file-pdf'
      if (mimeType.includes('word')) return 'bx-file-doc'
      if (mimeType.includes('excel') || mimeType.includes('sheet')) return 'bx-file-spreadsheet'
      if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return 'bx-file-slides'
      if (mimeType.includes('zip') || mimeType.includes('compressed')) return 'bx-file-archive'
      return 'bx-file'
    default:
      return 'bx-file'
  }
}

const formatFileSize = (bytes: number) => {
  if (!bytes) return '0 B'
  
  const units = ['B', 'KB', 'MB', 'GB']
  let size = bytes
  let unitIndex = 0
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }
  
  return `${Math.round(size * 100) / 100} ${units[unitIndex]}`
}
</script>

<template>
  <div>
    <h1 class="text-h4 mb-4">{{ t('projects.details.title') }}</h1>

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
          {{ t('projects.details.information') }}
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

    <VRow v-else-if="project">
      <!-- Project Information -->
      <VCol
        cols="12"
        md="5"
        lg="4"
      >
        <VCard>
          <VCardItem>
            <VCardTitle>
              {{ t('projects.details.projectInformation') }}
            </VCardTitle>
            <template #append>
              <template v-if="isEditing && canEditProject">
                <VBtn
                  color="error"
                  variant="outlined"
                  class="me-4"
                  @click="cancelEditing"
                >
                  {{ t('projects.details.cancel') }}
                </VBtn>
                <VBtn
                  color="success"
                  @click="saveProject"
                  :loading="isLoading"
                >
                  {{ t('projects.details.saveChanges') }}
                </VBtn>
              </template>
              <VBtn
                v-else-if="canEditProject"
                color="primary"
                @click="startEditing"
              >
                {{ t('projects.details.edit') }}
              </VBtn>
            </template>
          </VCardItem>

          <VDivider />

          <VCardText>
            <VList>
              <VListItem>
                <template #prepend>
                  <VIcon
                    color="primary"
                    icon="mdi-format-title"
                    class="me-3"
                  />
                </template>
                <VListItemTitle>
                  {{ t('projects.details.title') }}
                </VListItemTitle>
                <VListItemSubtitle>
                  <VTextField
                    v-if="isEditing && canEditProject"
                    v-model="editedProject.title"
                    density="compact"
                    hide-details
                  />
                  <template v-else>
                    {{ project?.title }}
                  </template>
                </VListItemSubtitle>
              </VListItem>
              
              <VListItem>
                <template #prepend>
                  <VIcon
                    color="primary"
                    icon="mdi-home"
                    class="me-3"
                  />
                </template>
                <VListItemTitle>
                  {{ t('projects.details.property') }}
                </VListItemTitle>
                <VListItemSubtitle>
                  <VTextField
                    v-if="isEditing && canEditProject"
                    v-model="editedProject.property"
                    density="compact"
                    hide-details
                  />
                  <template v-else>
                    {{ project?.property }}
                  </template>
                </VListItemSubtitle>
              </VListItem>
              
              <VListItem>
                <template #prepend>
                  <VIcon
                    color="primary"
                    icon="mdi-clock"
                    class="me-3"
                  />
                </template>
                <VListItemTitle>
                  {{ t('projects.details.timePreference') }}
                </VListItemTitle>
                <VListItemSubtitle>
                  <VSelect
                    v-if="isEditing && canEditProject"
                    v-model="editedProject.time_preference"
                    :items="timePreferenceOptions"
                    density="compact"
                    hide-details
                  />
                  <template v-else>
                    {{ project?.time_preference }}
                  </template>
                </VListItemSubtitle>
              </VListItem>
              
              <VListItem>
                <template #prepend>
                  <VIcon
                    color="primary"
                    icon="mdi-briefcase"
                    class="me-3"
                  />
                </template>
                <VListItemTitle>
                  {{ t('projects.details.serviceType') }}
                </VListItemTitle>
                <VListItemSubtitle>
                  <VSelect
                    v-if="isEditing && canEditProject"
                    v-model="editedProject.service_type"
                    :items="serviceTypeOptions"
                    density="compact"
                    hide-details
                  />
                  <template v-else>
                    {{ project?.service_type }}
                  </template>
                </VListItemSubtitle>
              </VListItem>
              
              <VListItem>
                <template #prepend>
                  <VIcon
                    color="primary"
                    icon="mdi-calendar"
                    class="me-3"
                  />
                </template>
                <VListItemTitle>
                  {{ t('projects.details.deadline') }}
                </VListItemTitle>
                <VListItemSubtitle>
                  <VTextField
                    v-if="isEditing && canEditProject"
                    v-model="editedProject.deadline"
                    type="date"
                    density="compact"
                    hide-details
                  />
                  <template v-else>
                    {{ formattedDate(project?.deadline) }}
                  </template>
                </VListItemSubtitle>
              </VListItem>

              <VListItem>
                <template #prepend>
                  <VIcon
                    color="primary"
                    icon="mdi-calendar-check"
                    class="me-3"
                  />
                </template>
                <VListItemTitle>
                  {{ t('projects.details.latestCompletionDate') }}
                </VListItemTitle>
                <VListItemSubtitle>
                  <VTextField
                    v-if="isEditing && canEditProject"
                    v-model="editedProject.latest_completion_date"
                    type="date"
                    density="compact"
                    hide-details
                  />
                  <template v-else>
                    {{ formattedDate(project?.latest_completion_date) }}
                  </template>
                </VListItemSubtitle>
              </VListItem>
              
              <VListItem>
                <template #prepend>
                  <VIcon
                    color="primary"
                    icon="mdi-information"
                    class="me-3"
                  />
                </template>
                <VListItemTitle>
                  {{ t('projects.details.status') }}
                </VListItemTitle>
                <VListItemSubtitle>
                  <VSelect
                    v-if="isEditing && canEditProject"
                    v-model="editedProject.status"
                    :items="statusOptions"
                    density="compact"
                    hide-details
                  />
                  <template v-else>
                    <VChip
                      :color="statusColorMap[project?.status || '']"
                      size="small"
                      class="text-capitalize"
                    >
                      {{ t(`projects.status.${project?.status || 'received'}`) }}
                    </VChip>
                  </template>
                </VListItemSubtitle>
              </VListItem>
              
              <VListItem v-if="project?.client">
                <template #prepend>
                  <VIcon
                    color="primary"
                    icon="mdi-account"
                    class="me-3"
                  />
                </template>
                <VListItemTitle>
                  {{ t('projects.details.client') }}
                </VListItemTitle>
                <VListItemSubtitle>{{ project.client.name }}</VListItemSubtitle>
              </VListItem>
              
              <VListItem>
                <template #prepend>
                  <VIcon
                    color="primary"
                    icon="mdi-email"
                    class="me-3"
                  />
                </template>
                <VListItemTitle>
                  {{ t('projects.details.contactEmail') }}
                </VListItemTitle>
                <VListItemSubtitle>
                  <VTextField
                    v-if="isEditing && canEditProject"
                    v-model="editedProject.contact_email"
                    density="compact"
                    hide-details
                  />
                  <template v-else>
                    {{ project?.contact_email }}
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
                <VListItemTitle>
                  {{ t('projects.details.dateRequested') }}
                </VListItemTitle>
                <VListItemSubtitle>{{ formattedDate(project?.date_requested) }}</VListItemSubtitle>
              </VListItem>
              
              <VListItem v-if="project?.company">
                <template #prepend>
                  <VIcon
                    color="primary"
                    icon="mdi-office-building"
                    class="me-3"
                  />
                </template>
                <VListItemTitle>
                  {{ t('projects.details.company') }}
                </VListItemTitle>
                <VListItemSubtitle>{{ project.company.name }}</VListItemSubtitle>
              </VListItem>
              
              <VListItem>
                <template #prepend>
                  <VIcon
                    color="primary"
                    icon="mdi-calendar-plus"
                    class="me-3"
                  />
                </template>
                <VListItemTitle>
                  {{ t('projects.details.createdAt') }}
                </VListItemTitle>
                <VListItemSubtitle>{{ formattedDate(project?.created_at) }}</VListItemSubtitle>
              </VListItem>

              <VListItem>
                <template #prepend>
                  <VIcon
                    color="primary"
                    icon="mdi-calendar-edit"
                    class="me-3"
                  />
                </template>
                <VListItemTitle>
                  {{ t('projects.details.lastUpdated') }}
                </VListItemTitle>
                <VListItemSubtitle>{{ formattedDate(project?.updated_at) }}</VListItemSubtitle>
              </VListItem>

              <VListItem>
                <template #prepend>
                  <VIcon
                    color="primary"
                    icon="mdi-text-box"
                    class="me-3"
                  />
                </template>
                <VListItemTitle>
                  {{ t('projects.details.serviceDescription') }}
                </VListItemTitle>
                <VListItemSubtitle>
                  <VTextarea
                    v-if="isEditing && canEditProject"
                    v-model="editedProject.service_description"
                    density="compact"
                    hide-details
                    rows="3"
                    auto-grow
                  />
                  <template v-else>
                    {{ project?.service_description || t('projects.details.noDescription') }}
                  </template>
                </VListItemSubtitle>
              </VListItem>
            </VList>
          </VCardText>
        </VCard>
      </VCol>
      
      <!-- Project Messages -->
      <VCol
        cols="12"
        md="7"
        lg="8"
      >
        <VCard class="mb-4">
          <VCardItem>
            <VCardTitle>
              {{ t('projects.details.messages') }}
            </VCardTitle>
          </VCardItem>
          
          <VDivider />
          
          <VCardText v-if="!messages.length">
            <VAlert
              color="info"
              variant="tonal"
            >
              {{ t('projects.details.noMessagesFound') }}
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
              <VListItemSubtitle class="d-flex flex-column">
                <span>{{ t('projects.details.from') }}: {{ message.from?.fullName || message.from?.email || t('projects.details.unknown') }}</span>
                <!-- Add message preview with truncation and HTML stripping -->
                <span class="text-truncate" style="max-inline-size: 300px;">{{ stripHtml(message.body || '') }}</span>
              </VListItemSubtitle>
              
              <template #append>
                <div class="d-flex flex-column align-end gap-2">
                  <div class="d-flex align-center gap-2">
                    <!-- Add attachment icon if message has attachments -->
                    <IconBtn
                      v-if="message.attachments?.length"
                      @click.stop="downloadAttachments(message.attachments)"
                      :title="message.attachments.length > 1 ? `${message.attachments.length} attachments` : '1 attachment'"
                    >
                      <VIcon
                        icon="bx-paperclip"
                        size="20"
                        color="primary"
                      />
                    </IconBtn>
                    <span class="text-xs text-disabled">{{ formattedDate(message.sent_at || message.time || message.created_at) }}</span>
                  </div>
                  <VChip
                    :color="statusColorMap[message.status]"
                    size="small"
                    class="text-capitalize"
                  >
                    {{ t(`emails.status.${message.status || 'new'}`) }}
                  </VChip>
                </div>
              </template>
            </VListItem>
          </VList>
        </VCard>
      </VCol>
    </VRow>

    <SharedEmailView
      :email="selectedEmail"
      :email-meta="{
        hasPreviousEmail: selectedEmail && messages.findIndex(m => m.id === selectedEmail.id) > 0,
        hasNextEmail: selectedEmail && messages.findIndex(m => m.id === selectedEmail.id) < messages.length - 1
      }"
      :download-attachment="downloadAttachment"
      @close="handleEmailClose"
      @refresh="handleEmailRefresh"
      @navigated="handleEmailNavigate"
      @send-reply="handleSendReply"
    />

    <!-- Attachments Section -->
    <VCard class="mb-6">
      <VCardItem>
        <VCardTitle>
          {{ t('projects.details.attachments') }}
          <VChip
            v-if="project?.attachments?.length"
            color="primary"
            size="small"
            class="ms-2"
          >
            {{ project.attachments.length }}
          </VChip>
        </VCardTitle>
        <template #append>
          <VBtn
            v-if="project?.attachments?.length"
            color="primary"
            variant="tonal"
            @click="downloadAttachments(project.attachments)"
          >
            <VIcon
              icon="bx-download"
              size="20"
              class="me-1"
            />
            {{ t('emails.actions.downloadAll') }}
          </VBtn>
        </template>
      </VCardItem>

      <VDivider />

      <VCardText>
        <div v-if="!project?.attachments?.length">
          {{ t('projects.details.noAttachments') }}
        </div>
        <div v-else>
          <VList>
            <VListItem
              v-for="attachment in project.attachments"
              :key="attachment.id"
              class="attachment-item"
            >
              <template #prepend>
                <VIcon
                  :icon="getFileIcon(attachment.mime_type)"
                  size="24"
                  color="primary"
                  class="me-3"
                />
              </template>

              <VListItemTitle class="d-flex flex-column">
                <a
                  href="#"
                  class="text-decoration-none"
                  @click.prevent="downloadAttachment(attachment)"
                >
                  {{ attachment.filename }}
                </a>
                <span class="text-caption text-medium-emphasis">
                  {{ t('projects.details.fromMessage') }}: {{ attachment.message_subject }}
                  ({{ formattedDate(attachment.message_date) }})
                </span>
              </VListItemTitle>

              <VListItemSubtitle>
                {{ formatFileSize(attachment.size) }}
              </VListItemSubtitle>

              <template #append>
                <VBtn
                  variant="text"
                  color="primary"
                  size="small"
                  @click="downloadAttachment(attachment)"
                >
                  <VIcon
                    icon="bx-download"
                    size="20"
                    class="me-1"
                  />
                  {{ t('emails.actions.download') }}
                </VBtn>
              </template>
            </VListItem>
          </VList>
        </div>
      </VCardText>
    </VCard>
  </div>
</template>

<style lang="scss">
.project-status {
  text-transform: capitalize;
}

.attachment-item {
  transition: background-color 0.2s ease;

  &:hover {
    background-color: rgb(var(--v-theme-surface-variant));
  }
}
</style> 
