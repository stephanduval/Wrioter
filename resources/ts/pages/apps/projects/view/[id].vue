<script setup lang="ts">
import SharedEmailView from '@/components/SharedEmailView.vue'
import axios from 'axios'
import { format } from 'date-fns'
import { onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'

// Configure axios
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api'

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

const fetchProject = async () => {
  isLoading.value = true
  error.value = null
  
  try {
    // console.log('Fetching project with ID:', projectId)
    const response = await axios.get(`${apiBaseUrl}/projects/${projectId}`)
    // console.log('API Response:', response.data)
    
    if (!response.data) {
      throw new Error('No data received from API')
    }
    
    project.value = response.data
    
    // Fetch messages related to this project
    // console.log('Fetching messages for project:', projectId)
    const messagesResponse = await axios.get(`${apiBaseUrl}/messages`, {
      params: {
        project_id: projectId,
      },
    })
    // console.log('Messages Response:', messagesResponse.data)
    
    messages.value = messagesResponse.data.data || []
  } catch (err: any) {
    // console.error('Error fetching project details:', err)
    // console.error('Error response:', err.response)
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
    const response = await axios.put(`${apiBaseUrl}/projects/${projectId}`, editedProject.value)
    project.value = response.data.data
    isEditing.value = false
    editedProject.value = {}
  } catch (err: any) {
    // console.error('Error updating project:', err)
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

const downloadAttachments = async (attachments: { id: number; download_url: string }[]) => {
  if (!attachments || attachments.length === 0) return

  // If there are multiple attachments, open the email view instead
  if (attachments.length > 1) {
    // Find the message that contains these attachments
    const message = messages.value.find(m => m.attachments?.some((a: { id: number }) => attachments.some(att => att.id === a.id)))
    if (message) {
      handleEmailClick(message)
    }
    return
  }

  // For single attachment, download directly
  try {
    window.open(attachments[0].download_url, '_blank')
  } catch (error) {
    // console.error('Error downloading attachment:', error)
  }
}

// Add a function to download a single attachment
const downloadAttachment = (attachment: any) => {
  if (!attachment?.download_url) return
  window.open(attachment.download_url, '_blank')
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
    const formData = new FormData()
    formData.append('subject', `Re: ${selectedEmail.value.subject}`)
    formData.append('message', data.message)
    formData.append('company_id', selectedEmail.value.company_id.toString())
    formData.append('receiver_id', selectedEmail.value.from.id.toString())
    formData.append('reply_to_id', selectedEmail.value.id.toString())

    if (data.attachments) {
      data.attachments.forEach(file => formData.append('attachments[]', file))
    }

    const response = await axios.post(`${apiBaseUrl}/messages`, formData, {
      headers: {
        'Accept': 'application/json',
      },
    })

    if (response.data) {
      await fetchProject()
      handleEmailClose()
    }
  } catch (error) {
    // console.error('Error sending reply:', error)
  }
}

onMounted(() => {
  // console.log('Component mounted, fetching project...')
  fetchProject()
})
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
        
        <template #append>
          <VBtn
            color="primary"
            @click="composeMessage"
          >
            {{ t('projects.details.sendMessage') }}
          </VBtn>
        </template>
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
              <template v-if="isEditing">
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
                v-else
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
                    v-if="isEditing"
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
                    v-if="isEditing"
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
                    v-if="isEditing"
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
                    v-if="isEditing"
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
                    v-if="isEditing"
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
                    v-if="isEditing"
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
                    v-if="isEditing"
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
                      {{ t(`projects.status.${project?.status}`) }}
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
                    v-if="isEditing"
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
                    v-if="isEditing"
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
        
        <VCard
          v-if="project.service_description"
          class="mt-6"
        >
          <VCardItem>
            <VCardTitle>
              {{ t('projects.details.serviceDescription') }}
            </VCardTitle>
          </VCardItem>
          
          <VDivider />
          
          <VCardText>
            <p>{{ project.service_description }}</p>
          </VCardText>
        </VCard>
      </VCol>
      
      <!-- Project Messages -->
      <VCol
        cols="12"
        md="7"
        lg="8"
      >
        <VCard>
          <VCardItem>
            <VCardTitle>
              {{ t('projects.details.messages') }}
            </VCardTitle>
            <template #append>
              <VBtn
                color="primary"
                variant="text"
                @click="composeMessage"
              >
                {{ t('projects.details.newMessage') }}
              </VBtn>
            </template>
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
                <span class="text-truncate" style="max-inline-size: 300px;">{{ stripHtml(message.message) }}</span>
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
      <VCardText>
        <h3 class="text-h6 mb-4">{{ t('projects.details.attachments') }}</h3>
        <div v-if="!project?.attachments?.length">
          {{ t('projects.details.noAttachments') }}
        </div>
        <div v-else class="d-flex flex-column gap-2">
          <div
            v-for="attachment in project.attachments"
            :key="attachment.id"
            class="d-flex align-center justify-space-between"
          >
            <div class="d-flex align-center gap-2">
              <VIcon
                icon="bx-file"
                size="20"
                color="primary"
              />
              <span>{{ attachment.filename }}</span>
            </div>
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
          </div>
        </div>
      </VCardText>
    </VCard>

    <!-- Edit Project Drawer -->
    <EditProjectDrawer
      v-model:is-drawer-open="isEditDrawerOpen"
      :project="project"
      @project-updated="handleProjectUpdated"
    />
  </div>
</template>

<style lang="scss">
.project-status {
  text-transform: capitalize;
}
</style> 
