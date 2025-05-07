<script setup lang="ts">
import { format } from 'date-fns'
import { onMounted, ref } from 'vue'
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
const isDeleteDialogOpen = ref(false)

interface Project {
  id: number
  title: string
  property?: string
  time_preference?: string
  service_type?: string
  service_description?: string
  deadline?: string
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
}

const statusColorMap: Record<string, string> = {
  pending: 'warning',
  active: 'success',
  completed: 'secondary',
  cancelled: 'error',
}

const formattedDate = (date: string) => {
  if (!date) return 'N/A'
  return format(new Date(date), 'MMM dd, yyyy')
}

const fetchProject = async () => {
  isLoading.value = true
  error.value = null
  
  try {
    const response = await $api(`/projects/${projectId}`)
    project.value = response.data
    
    // Fetch messages related to this project
    const messagesResponse = await $api('/messages', {
      query: {
        project_id: projectId,
      },
    })
    
    messages.value = messagesResponse.data
  } catch (err: any) {
    console.error('Error fetching project details:', err)
    error.value = err.response?.data?.message || 'Failed to load project details'
  } finally {
    isLoading.value = false
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
    const response = await fetch(`/api/projects/${projectId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || 'Failed to delete project.')
    }

    console.log(`Project ${projectId} deleted successfully.`)
    
    // Close the dialog
    isDeleteDialogOpen.value = false
    
    // Navigate back to projects list after successful deletion
    router.push({ name: 'apps-projects-list' })
  } catch (err: any) {
    console.error('Error deleting project:', err)
    // Show error message to user
    if (err.response?.status === 403) {
      error.value = 'You do not have permission to delete this project.'
    } else {
      error.value = err.message || 'Failed to delete project. Please try again.'
    }
    // Close the dialog
    isDeleteDialogOpen.value = false
  }
}

onMounted(() => {
  fetchProject()
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
              <VListItemTitle>Title</VListItemTitle>
              <VListItemSubtitle>{{ project.title }}</VListItemSubtitle>
            </VListItem>
            
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
            
            <VListItem v-if="project.time_preference">
              <template #prepend>
                <VIcon
                  color="primary"
                  icon="mdi-clock"
                  class="me-3"
                />
              </template>
              <VListItemTitle>Time Preference</VListItemTitle>
              <VListItemSubtitle>{{ project.time_preference }}</VListItemSubtitle>
            </VListItem>
            
            <VListItem v-if="project.service_type">
              <template #prepend>
                <VIcon
                  color="primary"
                  icon="mdi-briefcase"
                  class="me-3"
                />
              </template>
              <VListItemTitle>Service Type</VListItemTitle>
              <VListItemSubtitle>{{ project.service_type }}</VListItemSubtitle>
            </VListItem>
            
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
                  {{ project.status }}
                </VChip>
              </VListItemSubtitle>
            </VListItem>
            
            <VListItem v-if="project.client">
              <template #prepend>
                <VIcon
                  color="primary"
                  icon="mdi-account"
                  class="me-3"
                />
              </template>
              <VListItemTitle>Client</VListItemTitle>
              <VListItemSubtitle>{{ project.client.name }}</VListItemSubtitle>
            </VListItem>
            
            <VListItem v-if="project.company">
              <template #prepend>
                <VIcon
                  color="primary"
                  icon="mdi-office-building"
                  class="me-3"
                />
              </template>
              <VListItemTitle>Company</VListItemTitle>
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
              <VListItemTitle>Created At</VListItemTitle>
              <VListItemSubtitle>{{ formattedDate(project.created_at) }}</VListItemSubtitle>
            </VListItem>
          </VList>
        </VCardText>
      </VCard>
      
      <VCard
        v-if="project.service_description"
        class="mt-6"
      >
        <VCardItem>
          <VCardTitle>Service Description</VCardTitle>
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
        Are you sure you want to delete this project? This action cannot be undone.
        All associated messages and data will be permanently deleted.
      </VCardText>
      
      <VCardActions>
        <VSpacer />
        <VBtn
          color="default"
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
</style> 
