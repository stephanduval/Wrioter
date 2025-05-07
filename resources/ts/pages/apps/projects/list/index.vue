<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

interface Project {
  id: number
  title: string
  property?: string
  service_type?: string
  deadline?: string
  latest_completion_date?: string
  status: string
  client?: {
    name: string
  }
}

interface ProjectsResponse {
  data: Project[]
  total: number
}

const router = useRouter()

// Data table options
const searchQuery = ref('')
const itemsPerPage = ref(10)
const page = ref(1)
const sortBy = ref('')
const orderBy = ref('')
const selectedRows = ref([])

// Headers
const headers = [
  { title: 'Title', key: 'title' },
  { title: 'Client', key: 'client' },
  { title: 'Service Type', key: 'service_type' },
  { title: 'Deadline', key: 'deadline' },
  { title: 'Latest Completion Date', key: 'latest_completion_date' },
  { title: 'Status', key: 'status' },
  { title: 'Actions', key: 'actions', sortable: false },
]

// Status color mapping
const statusColorMap: Record<string, string> = {
  pending: 'warning',
  active: 'success',
  completed: 'secondary',
  cancelled: 'error',
}

// Add status options
const statusOptions = [
  { title: 'Received', value: 'received' },
  { title: 'In Progress', value: 'in_progress' },
  { title: 'Delivered', value: 'delivered' },
]

// 👉 Fetching projects
const { data: projectsData, execute: fetchProjects } = useApi<ProjectsResponse>(() => {
  const params = new URLSearchParams({
    page: String(page.value),
    itemsPerPage: String(itemsPerPage.value),
    sortBy: sortBy.value || '',
    sortDesc: orderBy.value === 'desc' ? '1' : '0',
    search: searchQuery.value,
  }).toString()

  return `/projects?${params}`
}, {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
  },
  credentials: 'include',
})

const projects = computed(() => projectsData.value?.data || [])
const totalProjects = computed(() => projectsData.value?.total || 0)

// Update options
const updateOptions = (options: any) => {
  if (options.sortBy?.length) {
    sortBy.value = options.sortBy[0]?.key
    orderBy.value = options.sortBy[0]?.order
  }

  page.value = options.page || 1
  itemsPerPage.value = options.itemsPerPage || 10

  fetchProjects()
}

// Format date helper
const formatDate = (date: string) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString()
}

// Actions
const viewProject = (id: number) => {
  router.push(`/apps/projects/view/${id}`)
}

const deleteProject = async (id: number) => {
  if (!confirm('Are you sure you want to delete this project?')) return
  
  try {
    const response = await fetch(`/api/projects/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
    })

    if (!response.ok) throw new Error('Failed to delete project.')

    console.log(`Project ${id} deleted successfully.`)

    // Refetch projects after deletion
    fetchProjects()
  } catch (error) {
    console.error('Error deleting project:', error)
  }
}

// Add function to update project status
const updateProjectStatus = async (projectId: number, newStatus: string) => {
  try {
    await $api(`/projects/${projectId}`, {
      method: 'PUT',
      body: JSON.stringify({ status: newStatus }),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
    })
    // Refresh the projects list
    fetchProjects()
  } catch (error) {
    console.error('Error updating project status:', error)
  }
}

// Watch for changes
watch(
  [searchQuery, itemsPerPage, page, sortBy, orderBy],
  () => {
    fetchProjects()
  },
)

onMounted(() => {
  fetchProjects()
})
</script>

<template>
  <section>
    <VCard class="mb-6">
      <VCardText class="d-flex flex-wrap gap-4">
        <div class="me-3 d-flex gap-3">
          <AppSelect
            :model-value="itemsPerPage"
            :items="[
              { value: 10, title: '10' },
              { value: 25, title: '25' },
              { value: 50, title: '50' },
              { value: 100, title: '100' },
            ]"
            style="inline-size: 6.25rem;"
            @update:model-value="itemsPerPage = parseInt($event, 10)"
          />
        </div>
        <VSpacer />

        <div class="d-flex align-center flex-wrap gap-4">
          <div style="inline-size: 15.625rem;">
            <AppTextField v-model="searchQuery" placeholder="Search Project" />
          </div>

          <VBtn
            prepend-icon="bx-plus"
            to="/apps/projects/add"
          >
            Add Project
          </VBtn>
        </div>
      </VCardText>
    </VCard>

    <VCard>
      <VDataTableServer
        v-model:items-per-page="itemsPerPage"
        v-model:page="page"
        :items="projects"
        :headers="headers"
        :items-length="totalProjects"
        class="text-no-wrap"
        @update:options="updateOptions"
      >
        <template #item.client="{ item }">
          <div class="text-body-1">
            {{ item.client?.name || 'N/A' }}
          </div>
        </template>

        <template #item.service_type="{ item }">
          <div class="text-body-1 text-capitalize">
            {{ item.service_type || 'N/A' }}
          </div>
        </template>

        <template #item.deadline="{ item }">
          <div class="text-body-1">
            {{ formatDate(item.deadline) }}
          </div>
        </template>

        <template #item.latest_completion_date="{ item }">
          <div class="text-body-1">
            {{ formatDate(item.latest_completion_date) }}
          </div>
        </template>

        <template #item.status="{ item }">
          <VSelect
            v-model="item.status"
            :items="statusOptions"
            density="compact"
            variant="plain"
            hide-details
            class="status-select"
            :color="statusColorMap[item.status]"
            @update:model-value="updateProjectStatus(item.id, $event)"
          >
            <template #selection="{ item }">
              <VChip
                :color="statusColorMap[item.value]"
                size="small"
                class="text-capitalize"
              >
                {{ item.title }}
              </VChip>
            </template>
          </VSelect>
        </template>

        <template #item.actions="{ item }">
          <VBtn
            icon
            variant="text"
            size="small"
            color="medium-emphasis"
            @click="viewProject(item.id)"
          >
            <VIcon icon="bx-show" />
          </VBtn>

          <IconBtn @click="deleteProject(item.id)">
            <VIcon icon="bx-trash" />
          </IconBtn>
        </template>
      </VDataTableServer>
    </VCard>
  </section>
</template>

<style scoped>
.w-auto {
  inline-size: auto !important;
}

.min-w-150 {
  min-inline-size: 150px;
}

.status-select {
  max-inline-size: 150px;
}

:deep(.v-select .v-field__input) {
  padding: 0;
  min-block-size: unset;
}

:deep(.v-select .v-field) {
  background: transparent !important;
}
</style> 
