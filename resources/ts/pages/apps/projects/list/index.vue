<script setup lang="ts">
import axios from 'axios'
import { format, isBefore, isToday } from 'date-fns'
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

// Configure axios
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api'

const router = useRouter()

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

interface ProjectsResponse {
  data: Project[]
  meta: {
    current_page: number
    from: number
    last_page: number
    per_page: number
    to: number
    total: number
  }
}

// Data
const searchQuery = ref('')
const statusFilter = ref('all')
const serviceTypeFilter = ref('all')
const clientFilter = ref('')
const deadlineFilter = ref('all')
const page = ref(1)
const perPage = ref(10)
const sortBy = ref('created_at')
const sortDesc = ref(true)
const isLoading = ref(true)
const projectsData = ref<ProjectsResponse | null>(null)
const clients = ref<{ id: number, name: string }[]>([])
const serviceTypes = ref<string[]>([])

// Computed
const projects = computed(() => projectsData.value?.data || [])
const totalProjects = computed(() => projectsData.value?.meta?.total || 0)

// Table headers
const headers = [
  { title: 'ID', key: 'id', sortable: true },
  { title: 'Title', key: 'title', sortable: true },
  { title: 'Client', key: 'client.name', sortable: true },
  { title: 'Service Type', key: 'service_type', sortable: true },
  { title: 'Deadline', key: 'deadline', sortable: true },
  { title: 'Status', key: 'status', sortable: true },
  { title: 'Created', key: 'created_at', sortable: true },
  { title: 'Actions', key: 'actions', sortable: false },
]

// Status options
const statusOptions = [
  { title: 'All', value: 'all' },
  { title: 'Pending', value: 'pending' },
  { title: 'Active', value: 'active' },
  { title: 'Completed', value: 'completed' },
  { title: 'Cancelled', value: 'cancelled' },
]

// Deadline filter options
const deadlineOptions = [
  { title: 'All', value: 'all' },
  { title: 'Today', value: 'today' },
  { title: 'Upcoming', value: 'upcoming' },
  { title: 'Past Due', value: 'past' },
]

// Status color mapping
const statusColorMap: Record<string, string> = {
  pending: 'warning',
  active: 'success',
  completed: 'secondary',
  cancelled: 'error',
}

// Methods
const fetchProjects = async () => {
  isLoading.value = true
  
  try {
    const params = new URLSearchParams()
    
    if (searchQuery.value) params.append('search', searchQuery.value)
    if (statusFilter.value !== 'all') params.append('status', statusFilter.value)
    if (serviceTypeFilter.value !== 'all') params.append('service_type', serviceTypeFilter.value)
    if (clientFilter.value) params.append('client_id', clientFilter.value)
    if (deadlineFilter.value !== 'all') params.append('deadline', deadlineFilter.value)
    
    params.append('page', page.value.toString())
    params.append('per_page', perPage.value.toString())
    params.append('sort_by', sortBy.value)
    params.append('sort_desc', sortDesc.value ? '1' : '0')
    
    const response = await axios.get(`${apiBaseUrl}/projects`, { params })
    projectsData.value = response.data
    
    // Extract unique service types for filter
    if (projects.value.length && !serviceTypes.value.length) {
      const uniqueTypes = new Set<string>()
      projects.value.forEach(project => {
        if (project.service_type) uniqueTypes.add(project.service_type)
      })
      serviceTypes.value = Array.from(uniqueTypes)
    }
  } catch (error) {
    console.error('Error fetching projects:', error)
  } finally {
    isLoading.value = false
  }
}

const fetchClients = async () => {
  try {
    const response = await axios.get(`${apiBaseUrl}/clients`)
    clients.value = response.data.data
  } catch (error) {
    console.error('Error fetching clients:', error)
  }
}

const formatDate = (date: string) => {
  if (!date) return 'N/A'
  return format(new Date(date), 'MMM dd, yyyy')
}

const handlePageChange = (newPage: number) => {
  page.value = newPage
  fetchProjects()
}

const handleSort = ({ key, order }: { key: string, order: boolean | 'asc' | 'desc' }) => {
  sortBy.value = key
  sortDesc.value = order === 'desc'
  fetchProjects()
}

const viewProject = (id: number) => {
  router.push(`/apps/projects/view/${id}`)
}

const editProject = (id: number) => {
  router.push(`/apps/projects/edit/${id}`)
}

const deleteProject = async (id: number) => {
  if (!confirm('Are you sure you want to delete this project?')) return
  
  try {
    await axios.delete(`${apiBaseUrl}/projects/${id}`)
    fetchProjects()
  } catch (error) {
    console.error('Error deleting project:', error)
  }
}

// Custom debounce function
function debounce<T extends (...args: any[]) => any>(
  fn: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null
  
  return function(this: any, ...args: Parameters<T>): void {
    if (timeout !== null) {
      clearTimeout(timeout)
    }
    
    timeout = setTimeout(() => {
      fn.apply(this, args)
      timeout = null
    }, wait)
  }
}

// Create debounced search
const debouncedFetchProjects = debounce(fetchProjects, 500)

// Watch for filter changes
watch([searchQuery, statusFilter, serviceTypeFilter, clientFilter, deadlineFilter], () => {
  page.value = 1 // Reset to first page on filter change
  debouncedFetchProjects()
})

// Initialize
onMounted(() => {
  fetchProjects()
  fetchClients()
})
</script>

<template>
  <section>
    <!-- Header -->
    <VCard class="mb-6">
      <VCardItem>
        <VCardTitle class="text-h5">
          Projects
        </VCardTitle>
        <template #append>
          <VBtn
            color="primary"
            prepend-icon="mdi-plus"
            to="/apps/projects/add"
          >
            Add Project
          </VBtn>
        </template>
      </VCardItem>
    </VCard>

    <!-- Filters -->
    <VCard class="mb-6">
      <VCardText>
        <VRow>
          <VCol
            cols="12"
            sm="6"
            md="4"
            lg="3"
          >
            <VTextField
              v-model="searchQuery"
              density="compact"
              label="Search"
              placeholder="Search by title or property"
              prepend-inner-icon="mdi-magnify"
              single-line
              hide-details
            />
          </VCol>

          <VCol
            cols="12"
            sm="6"
            md="4"
            lg="3"
          >
            <VSelect
              v-model="statusFilter"
              :items="statusOptions"
              item-title="title"
              item-value="value"
              label="Status"
              density="compact"
              hide-details
            />
          </VCol>

          <VCol
            cols="12"
            sm="6"
            md="4"
            lg="3"
          >
            <VSelect
              v-model="serviceTypeFilter"
              :items="[
                { title: 'All', value: 'all' },
                ...serviceTypes.map(type => ({ title: type, value: type }))
              ]"
              item-title="title"
              item-value="value"
              label="Service Type"
              density="compact"
              hide-details
            />
          </VCol>

          <VCol
            cols="12"
            sm="6"
            md="4"
            lg="3"
          >
            <VSelect
              v-model="deadlineFilter"
              :items="deadlineOptions"
              item-title="title"
              item-value="value"
              label="Deadline"
              density="compact"
              hide-details
            />
          </VCol>

          <VCol
            v-if="clients.length"
            cols="12"
            sm="6"
            md="4"
            lg="3"
          >
            <VSelect
              v-model="clientFilter"
              :items="[
                { title: 'All Clients', value: '' },
                ...clients.map(client => ({ title: client.name, value: client.id }))
              ]"
              item-title="title"
              item-value="value"
              label="Client"
              density="compact"
              hide-details
            />
          </VCol>
        </VRow>
      </VCardText>
    </VCard>

    <!-- Projects Table -->
    <VCard>
      <VCardText>
        <VDataTableServer
          v-model:items-per-page="perPage"
          v-model:page="page"
          :headers="headers"
          :items="projects"
          :items-length="totalProjects"
          :loading="isLoading"
          density="comfortable"
          @update:options="handleSort"
        >
          <!-- Client Column -->
          <template #item.client.name="{ item }">
            {{ item.client?.name || 'N/A' }}
          </template>

          <!-- Service Type Column -->
          <template #item.service_type="{ item }">
            <span v-if="item.service_type">
              {{ item.service_type }}
            </span>
            <span v-else class="text-disabled">
              N/A
            </span>
          </template>

          <!-- Deadline Column -->
          <template #item.deadline="{ item }">
            <div
              v-if="item.deadline"
              :class="{
                'text-error': item.deadline && isBefore(new Date(item.deadline), new Date()) && !isToday(new Date(item.deadline)),
                'text-warning': item.deadline && isToday(new Date(item.deadline))
              }"
            >
              {{ formatDate(item.deadline) }}
            </div>
            <span v-else class="text-disabled">
              N/A
            </span>
          </template>

          <!-- Status Column -->
          <template #item.status="{ item }">
            <VChip
              :color="statusColorMap[item.status]"
              size="small"
              class="text-capitalize"
            >
              {{ item.status }}
            </VChip>
          </template>

          <!-- Created At Column -->
          <template #item.created_at="{ item }">
            {{ formatDate(item.created_at) }}
          </template>

          <!-- Actions Column -->
          <template #item.actions="{ item }">
            <VBtn
              icon
              variant="text"
              size="small"
              color="default"
              @click="viewProject(item.id)"
            >
              <VIcon icon="mdi-eye" />
            </VBtn>

            <VBtn
              icon
              variant="text"
              size="small"
              color="info"
              @click="editProject(item.id)"
            >
              <VIcon icon="mdi-pencil" />
            </VBtn>

            <VBtn
              icon
              variant="text"
              size="small"
              color="error"
              @click="deleteProject(item.id)"
            >
              <VIcon icon="mdi-delete" />
            </VBtn>
          </template>

          <!-- No Items Slot -->
          <template #no-data>
            <div class="text-center py-6">
              <VIcon
                icon="mdi-clipboard-text-outline"
                size="large"
                class="mb-2"
              />
              <p class="text-body-1">No projects found</p>
              <VBtn
                color="primary"
                @click="fetchProjects"
              >
                Reset Filters
              </VBtn>
            </div>
          </template>
        </VDataTableServer>

        <!-- Pagination -->
        <div class="d-flex justify-end mt-4">
          <VPagination
            v-model="page"
            :length="projectsData?.meta?.last_page || 1"
            @update:model-value="handlePageChange"
          />
        </div>
      </VCardText>
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
</style> 
