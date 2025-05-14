<script setup lang="ts">
import axios from '@/../js/axios'
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
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
    email: string
  }
}

interface ApiResponse {
  data: Project[]
  total: number
  current_page: number
  per_page: number
  last_page: number
  from: number
  to: number
}

const router = useRouter()
const { t } = useI18n()

// Data table options
const searchQuery = ref('')
const selectedStatus = ref('')
const selectedServiceType = ref('')
const itemsPerPage = ref(10)
const page = ref(1)
const sortBy = ref('created_at')
const sortDesc = ref(true)
const isLoading = ref(true)
const projectsData = ref<ApiResponse | null>(null)
const clients = ref<{ id: number; name: string }[]>([])

// Headers
const headers = computed(() => [
  { title: t('headers.projects.project'), key: 'project', sortable: true },
  { title: t('headers.projects.client'), key: 'client', sortable: true },
  { title: t('headers.projects.serviceType'), key: 'service_type', sortable: true },
  { title: t('headers.projects.deadline'), key: 'deadline', sortable: true },
  { title: t('headers.projects.status'), key: 'status', sortable: true },
  { title: t('headers.projects.actions'), key: 'actions', sortable: false },
])

// Status options
const statusOptions = [
  { title: t('projects.status.received'), value: 'received' },
  { title: t('projects.status.inProgress'), value: 'in_progress' },
  { title: t('projects.status.delivered'), value: 'delivered' },
]

// Status color mapping
const statusColorMap: Record<string, string> = {
  received: 'warning',
  in_progress: 'info',
  delivered: 'success',
}

// Service type options
const serviceTypeOptions = [
  { title: t('projects.form.all'), value: '' },
  { title: t('projects.form.translation'), value: 'translation' },
  { title: t('projects.form.revision'), value: 'revision' },
  { title: t('projects.form.modifications'), value: 'modifications' },
  { title: t('projects.form.transcription'), value: 'transcription' },
  { title: t('projects.form.voiceOver'), value: 'voice_over' },
  { title: t('projects.form.other'), value: 'other' },
]

// Methods
const fetchProjects = async () => {
  isLoading.value = true
  
  try {
    const params = new URLSearchParams()
    
    if (searchQuery.value) params.append('search', searchQuery.value)
    if (selectedStatus.value) params.append('status', selectedStatus.value)
    if (selectedServiceType.value) params.append('service_type', selectedServiceType.value)
    
    params.append('page', page.value.toString())
    params.append('per_page', itemsPerPage.value.toString())
    params.append('sort_by', sortBy.value)
    params.append('sort_desc', sortDesc.value ? '1' : '0')
    
    const response = await axios.get('/projects', { params })
    projectsData.value = response.data
  } catch (error) {
    console.error('Error fetching projects:', error)
  } finally {
    isLoading.value = false
  }
}

const fetchClients = async () => {
  try {
    const response = await axios.get('/users')
    clients.value = response.data.data || []
  } catch (error) {
    console.error('Error fetching clients:', error)
  }
}

const formatDate = (date: string) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString()
}

const resolveStatusVariant = (status: string) => {
  if (status === 'received') return 'warning'
  if (status === 'in_progress') return 'info'
  if (status === 'delivered') return 'success'
  return 'secondary'
}

const handleOptionsUpdate = (options: any) => {
  console.log('Options received:', options)

  // Update sorting
  if (options.sortBy?.length) {
    sortBy.value = options.sortBy[0].key
    sortDesc.value = options.sortBy[0].order === 'desc'
  }

  // Update pagination
  page.value = options.page
  itemsPerPage.value = options.itemsPerPage

  fetchProjects()
}

const viewProject = (id: number) => {
  router.push(`/apps/projects/view/${id}`)
}

const deleteProject = async (id: number) => {
  if (!confirm('Are you sure you want to delete this project?')) return
  
  try {
    await axios.delete(`/projects/${id}`)
    fetchProjects()
  } catch (error) {
    console.error('Error deleting project:', error)
  }
}

// Add updateProjectStatus function
const updateProjectStatus = async (projectId: number, newStatus: string) => {
  try {
    await axios.put(`/projects/${projectId}`, {
      status: newStatus
    })
    // Refresh the projects list after successful update
    await fetchProjects()
  } catch (error) {
    console.error('Error updating project status:', error)
  }
}

// Computed
const projects = computed(() => projectsData.value?.data || [])
const totalProjects = computed(() => projectsData.value?.total || 0)

// Watch for filter changes
watch(
  [searchQuery, selectedStatus, selectedServiceType],
  () => {
    page.value = 1 // Reset to first page on filter change
    fetchProjects()
  },
)

// Initialize
onMounted(() => {
  fetchProjects()
  fetchClients()
})
</script>

<template>
  <section>
    <VCard>
      <VCardText class="d-flex flex-wrap gap-4">
        <div class="me-3 d-flex gap-3">
          <AppSelect
            :model-value="itemsPerPage"
            :items="[
              { value: 10, title: '10' },
              { value: 25, title: '25' },
              { value: 50, title: '50' },
              { value: 100, title: '100' },
              { value: -1, title: 'All' },
            ]"
            :label="t('itemsPerPage')"
            style="inline-size: 6.25rem;"
            @update:model-value="itemsPerPage = parseInt($event, 10)"
          />
        </div>
        <VSpacer />

        <div class="app-user-search-filter d-flex align-center flex-wrap gap-4">
          <!-- 👉 Search -->
          <div style="inline-size: 15.625rem;">
            <AppTextField
              v-model="searchQuery"
              :placeholder="t('projects.search')"
            />
          </div>

          <!-- 👉 Status Select -->
          <div style="inline-size: 9.375rem;">
            <AppSelect
              v-model="selectedStatus"
              :items="statusOptions"
              :placeholder="t('headers.projects.status')"
              clearable
              clear-icon="bx-x"
            />
          </div>

          <!-- 👉 Service Type Select -->
          <div style="inline-size: 9.375rem;">
            <AppSelect
              v-model="selectedServiceType"
              :items="serviceTypeOptions"
              :placeholder="t('headers.projects.serviceType')"
              clearable
              clear-icon="bx-x"
            />
          </div>
        </div>
      </VCardText>

      <VDivider />

      <!-- SECTION datatable -->
      <VDataTableServer
        v-model:items-per-page="itemsPerPage"
        v-model:page="page"
        :headers="headers"
        :items="projects"
        :items-length="totalProjects"
        :loading="isLoading"
        class="text-no-wrap"
        @update:options="handleOptionsUpdate"
      >
        <!-- Project -->
        <template #item.project="{ item }">
          <div class="d-flex align-center">
            <div class="d-flex flex-column">
              <h6 class="text-base">
                <RouterLink
                  :to="`/apps/projects/view/${item.id}`"
                  class="font-weight-medium text-link"
                >
                  {{ item.title }}
                </RouterLink>
              </h6>
              <div class="text-sm text-disabled">
                {{ item.property || 'No property specified' }}
              </div>
            </div>
          </div>
        </template>

        <!-- Client -->
        <template #item.client="{ item }">
          <div class="d-flex align-center">
            <div class="d-flex flex-column">
              <h6 class="text-base">
                {{ item.client?.name || 'N/A' }}
              </h6>
              <div class="text-sm text-disabled">
                {{ item.client?.email || '' }}
              </div>
            </div>
          </div>
        </template>

        <!-- Service Type -->
        <template #item.service_type="{ item }">
          <div class="text-capitalize">
            {{ item.service_type || 'N/A' }}
          </div>
        </template>

        <!-- Deadline -->
        <template #item.deadline="{ item }">
          <div>{{ formatDate(item.deadline) }}</div>
        </template>

        <!-- Status -->
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
                {{ t(`projects.status.${item.value}`) }}
              </VChip>
            </template>
          </VSelect>
        </template>

        <!-- Actions -->
        <template #item.actions="{ item }">
          <IconBtn @click="viewProject(item.id)">
            <VIcon icon="bx-show" />
          </IconBtn>

          <IconBtn @click="deleteProject(item.id)">
            <VIcon icon="bx-trash" />
          </IconBtn>
        </template>

        <!-- Loading -->
        <template #loading>
          <div class="d-flex justify-center align-center pa-4">
            <VProgressCircular indeterminate />
          </div>
        </template>

        <!-- No Data -->
        <template #no-data>
          <div class="d-flex justify-center align-center pa-4">
            No projects found
          </div>
        </template>
      </VDataTableServer>
    </VCard>
  </section>
</template>

<style lang="scss">
.text-capitalize {
  text-transform: capitalize;
}
</style> 
