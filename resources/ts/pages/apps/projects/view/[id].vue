<script setup lang="ts">
import { format } from 'date-fns'
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

definePage({
  meta: {
    action: 'read',
    subject: 'project',
    layoutWrapperClasses: 'layout-content-height-fixed',
    requiresAuth: true,
  },
})

const route = useRoute()
const router = useRouter()
const projectId = route.params.id as string
const isLoading = ref(true)
const error = ref<string | null>(null)
const isDeleteDialogOpen = ref(false)
const isEditMode = ref(false)
const editedProject = ref<Project | null>(null)

interface Project {
  id: number
  client_id: number
  title: string
  property: string | null
  contact_email: string | null
  date_requested: string
  status: 'received' | 'in_progress' | 'delivered'
  time_preference: 'before_noon' | 'before_4pm' | 'anytime'
  deadline: string | null
  service_type: 'translation' | 'revision' | 'modifications' | 'transcription' | 'voice_over' | 'other' | null
  service_description: string | null
  latest_completion_date: string | null
  created_at: string
  updated_at: string
  client?: {
    id: number
    name: string
    email: string
  }
}

// 👉 Fetch project data
const { data: projectData, execute: fetchProject } = await useApi<{ data: Project }>(`/api/projects/${projectId}`)

// 👉 Fetch messages
const { data: messagesData, execute: fetchMessages } = await useApi<any>(`/api/messages?project_id=${projectId}`)

// Computed properties
const project = computed(() => projectData.value?.data)
const messages = computed(() => messagesData.value?.data || [])

const statusOptions = [
  { title: 'Received', value: 'received' },
  { title: 'In Progress', value: 'in_progress' },
  { title: 'Delivered', value: 'delivered' },
]

const timePreferenceOptions = [
  { title: 'Before Noon', value: 'before_noon' },
  { title: 'Before 4pm', value: 'before_4pm' },
  { title: 'Anytime', value: 'anytime' },
]

const serviceTypeOptions = [
  { title: 'Translation', value: 'translation' },
  { title: 'Revision', value: 'revision' },
  { title: 'Modifications', value: 'modifications' },
  { title: 'Transcription', value: 'transcription' },
  { title: 'Voice Over', value: 'voice_over' },
  { title: 'Other', value: 'other' },
]

const statusColorMap: Record<string, string> = {
  received: 'warning',
  in_progress: 'info',
  delivered: 'success',
}

const formattedDate = (date: string | null) => {
  if (!date) return 'N/A'
  return format(new Date(date), 'MMM dd, yyyy')
}

const startEditing = () => {
  editedProject.value = { ...project.value! }
  isEditMode.value = true
}

const cancelEditing = () => {
  editedProject.value = null
  isEditMode.value = false
}

const saveProject = async () => {
  if (!editedProject.value) return

  try {
    const response = await $api(`/api/projects/${projectId}`, {
      method: 'PUT',
      body: editedProject.value,
    })

    // Refresh data
    await fetchProject()
    
    isEditMode.value = false
    editedProject.value = null
  } catch (err: any) {
    console.error('Error updating project:', err)
    error.value = err.response?.data?.message || 'Failed to update project'
  }
}

const navigateBack = () => {
  router.push({ name: 'apps-projects-list' })
}

const composeMessage = () => {
  router.push({ 
    name: 'apps-email-compose', 
    query: { project_id: projectId } 
  })
}

const deleteProject = async () => {
  try {
    await $api(`/api/projects/${projectId}`, {
      method: 'DELETE',
    })

    // Close the dialog and navigate back
    isDeleteDialogOpen.value = false
    router.push({ name: 'apps-projects-list' })
  } catch (err: any) {
    console.error('Error deleting project:', err)
    if (err.response?.status === 403) {
      error.value = 'You do not have permission to delete this project.'
    } else {
      error.value = 'Failed to delete project. Please try again.'
    }
    isDeleteDialogOpen.value = false
  }
}

// Initial data fetch
onMounted(async () => {
  try {
    isLoading.value = true
    await Promise.all([
      fetchProject(),
      fetchMessages(),
    ])
  } catch (err: any) {
    console.error('Error loading data:', err)
    error.value = err.response?.data?.message || 'Failed to load data'
  } finally {
    isLoading.value = false
  }
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
        Project Details
      </VCardTitle>
      
      <template #append>
        <div class="d-flex gap-2">
          <VBtn
            v-if="!isEditMode"
            color="warning"
            variant="outlined"
            @click="startEditing"
          >
            Edit Project
          </VBtn>
          <VBtn
            color="error"
            variant="outlined"
            @click="isDeleteDialogOpen = true"
          >
            Delete Project
          </VBtn>
          <VBtn
            color="primary"
            @click="composeMessage"
          >
            Send Message
          </VBtn>
        </div>
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
          <VCardTitle>Project Information</VCardTitle>
          <template #append v-if="isEditMode">
            <div class="d-flex gap-2">
              <VBtn
                color="secondary"
                variant="text"
                @click="cancelEditing"
              >
                Cancel
              </VBtn>
              <VBtn
                color="primary"
                @click="saveProject"
              >
                Save
              </VBtn>
            </div>
          </template>
        </VCardItem>

        <VDivider />

        <VCardText>
          <VForm v-if="isEditMode && editedProject" @submit.prevent="saveProject">
            <VRow>
              <VCol cols="12">
                <VTextField
                  v-model="editedProject.title"
                  label="Project Title"
                  required
                />
              </VCol>

              <VCol cols="12">
                <VTextField
                  v-model="editedProject.property"
                  label="Property"
                  required
                />
              </VCol>

              <VCol cols="12">
                <VTextField
                  v-model="editedProject.contact_email"
                  label="Contact Email"
                  type="email"
                  required
                />
              </VCol>

              <VCol cols="12">
                <VTextField
                  v-model="editedProject.date_requested"
                  label="Date Requested"
                  type="date"
                  required
                />
              </VCol>

              <VCol cols="12">
                <VSelect
                  v-model="editedProject.status"
                  :items="statusOptions"
                  label="Status"
                  required
                />
              </VCol>

              <VCol cols="12">
                <VSelect
                  v-model="editedProject.time_preference"
                  :items="timePreferenceOptions"
                  label="Time Preference"
                  required
                />
              </VCol>

              <VCol cols="12">
                <VTextField
                  v-model="editedProject.deadline"
                  label="Deadline"
                  type="date"
                  required
                />
              </VCol>

              <VCol cols="12">
                <VTextField
                  v-model="editedProject.latest_completion_date"
                  label="Latest Completion Date"
                  type="date"
                  required
                />
              </VCol>

              <VCol cols="12">
                <VSelect
                  v-model="editedProject.service_type"
                  :items="serviceTypeOptions"
                  label="Service Type"
                  required
                />
              </VCol>

              <VCol cols="12">
                <VTextarea
                  v-model="editedProject.service_description"
                  label="Service Description"
                  rows="4"
                />
              </VCol>
            </VRow>
          </VForm>
          
          <VList v-else>
            <!-- Client Information -->
            <VListItem v-if="project.client">
              <template #prepend>
                <VIcon
                  color="primary"
                  icon="mdi-account"
                  class="me-3"
                />
              </template>
              <VListItemTitle>Client Name</VListItemTitle>
              <VListItemSubtitle>{{ project.client.name }}</VListItemSubtitle>
            </VListItem>

            <!-- Project Title -->
            <VListItem>
              <template #prepend>
                <VIcon
                  color="primary"
                  icon="mdi-format-title"
                  class="me-3"
                />
              </template>
              <VListItemTitle>Project Title</VListItemTitle>
              <VListItemSubtitle>{{ project.title }}</VListItemSubtitle>
            </VListItem>

            <!-- Property -->
            <VListItem v-if="project.property">
              <template #prepend>
                <VIcon
                  color="primary"
                  icon="mdi-home"
                  class="me-3"
                />
              </template>
              <VListItemTitle>Property</VListItemTitle>
              <VListItemSubtitle>{{ project.property }}</VListItemSubtitle>
            </VListItem>

            <!-- Contact Email -->
            <VListItem v-if="project.contact_email">
              <template #prepend>
                <VIcon
                  color="primary"
                  icon="mdi-email"
                  class="me-3"
                />
              </template>
              <VListItemTitle>Contact Email</VListItemTitle>
              <VListItemSubtitle>{{ project.contact_email }}</VListItemSubtitle>
            </VListItem>

            <!-- Date Requested -->
            <VListItem>
              <template #prepend>
                <VIcon
                  color="primary"
                  icon="mdi-calendar-start"
                  class="me-3"
                />
              </template>
              <VListItemTitle>Date Requested</VListItemTitle>
              <VListItemSubtitle>{{ formattedDate(project.date_requested) }}</VListItemSubtitle>
            </VListItem>

            <!-- Status -->
            <VListItem>
              <template #prepend>
                <VIcon
                  color="primary"
                  icon="mdi-information"
                  class="me-3"
                />
              </template>
              <VListItemTitle>Status</VListItemTitle>
              <VListItemSubtitle>
                <VChip
                  :color="statusColorMap[project.status]"
                  size="small"
                  class="text-capitalize"
                >
                  {{ project.status.replace('_', ' ') }}
                </VChip>
              </VListItemSubtitle>
            </VListItem>

            <!-- Time Preference -->
            <VListItem>
              <template #prepend>
                <VIcon
                  color="primary"
                  icon="mdi-clock"
                  class="me-3"
                />
              </template>
              <VListItemTitle>Time Preference</VListItemTitle>
              <VListItemSubtitle class="text-capitalize">{{ project.time_preference.replace('_', ' ') }}</VListItemSubtitle>
            </VListItem>

            <!-- Deadline -->
            <VListItem v-if="project.deadline">
              <template #prepend>
                <VIcon
                  color="primary"
                  icon="mdi-calendar"
                  class="me-3"
                />
              </template>
              <VListItemTitle>Deadline</VListItemTitle>
              <VListItemSubtitle>{{ formattedDate(project.deadline) }}</VListItemSubtitle>
            </VListItem>

            <!-- Latest Completion Date -->
            <VListItem v-if="project.latest_completion_date">
              <template #prepend>
                <VIcon
                  color="primary"
                  icon="mdi-calendar-end"
                  class="me-3"
                />
              </template>
              <VListItemTitle>Latest Completion Date</VListItemTitle>
              <VListItemSubtitle>{{ formattedDate(project.latest_completion_date) }}</VListItemSubtitle>
            </VListItem>

            <!-- Service Type -->
            <VListItem v-if="project.service_type">
              <template #prepend>
                <VIcon
                  color="primary"
                  icon="mdi-briefcase"
                  class="me-3"
                />
              </template>
              <VListItemTitle>Service Type</VListItemTitle>
              <VListItemSubtitle class="text-capitalize">{{ project.service_type.replace('_', ' ') }}</VListItemSubtitle>
            </VListItem>

            <!-- Service Description -->
            <VListItem v-if="project.service_description">
              <template #prepend>
                <VIcon
                  color="primary"
                  icon="mdi-text"
                  class="me-3"
                />
              </template>
              <VListItemTitle>Service Description</VListItemTitle>
              <VListItemSubtitle>{{ project.service_description }}</VListItemSubtitle>
            </VListItem>

            <!-- Created At -->
            <VListItem>
              <template #prepend>
                <VIcon
                  color="primary"
                  icon="mdi-calendar-plus"
                  class="me-3"
                />
              </template>
              <VListItemTitle>Created At</VListItemTitle>
              <VListItemSubtitle>{{ formattedDate(project.created_at) }}</VListItemSubtitle>
            </VListItem>

            <!-- Updated At -->
            <VListItem>
              <template #prepend>
                <VIcon
                  color="primary"
                  icon="mdi-calendar-clock"
                  class="me-3"
                />
              </template>
              <VListItemTitle>Last Updated</VListItemTitle>
              <VListItemSubtitle>{{ formattedDate(project.updated_at) }}</VListItemSubtitle>
            </VListItem>
          </VList>
        </VCardText>
      </VCard>
      
      <VCard
        v-if="project.service_description && !isEditMode"
        class="mt-6"
      >
        <VCardItem>
          <VCardTitle>Service Description</VCardTitle>
        </VCardItem>
        
        <VDivider />
        
        <VCardText>
          <p class="whitespace-pre-wrap">{{ project.service_description }}</p>
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
          <VCardTitle>Messages</VCardTitle>
          <template #append>
            <VBtn
              color="primary"
              variant="text"
              @click="composeMessage"
            >
              New Message
            </VBtn>
          </template>
        </VCardItem>
        
        <VDivider />
        
        <VCardText v-if="!messages.length">
          <VAlert
            color="info"
            variant="tonal"
          >
            No messages found for this project.
          </VAlert>
        </VCardText>
        
        <VList v-else>
          <VListItem
            v-for="message in messages"
            :key="message.id"
            :to="`/apps/email/${message.id}`"
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
              From: {{ message.from?.name || message.from?.email || 'Unknown' }}
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
  
  <!-- Delete Confirmation Dialog -->
  <VDialog
    v-model="isDeleteDialogOpen"
    max-width="500"
  >
    <VCard>
      <VCardTitle class="text-h5">
        Delete Project
      </VCardTitle>
      
      <VCardText>
        <VAlert
          type="warning"
          variant="tonal"
          class="mb-4"
        >
          <VIcon
            icon="mdi-alert"
            start
            color="warning"
          />
          Warning: This action cannot be undone.
        </VAlert>
        Are you sure you want to delete this project?
        All associated messages will be unlinked from this project.
      </VCardText>
      
      <VCardActions>
        <VSpacer />
        <VBtn
          color="secondary"
          variant="text"
          @click="isDeleteDialogOpen = false"
        >
          Cancel
        </VBtn>
        <VBtn
          color="error"
          @click="deleteProject"
        >
          Delete
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<style lang="scss">
.project-status {
  text-transform: capitalize;
}

.whitespace-pre-wrap {
  white-space: pre-wrap;
}
</style> 
