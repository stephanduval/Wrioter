<script setup lang="ts">
import axios from '@/../js/axios'
import TablePagination from '@core/components/TablePagination.vue'
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
  has_attachments: boolean
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
const sortBy = ref()
const orderBy = ref()
const selectedRows = ref([])
const isLoading = ref(true)
const projectsData = ref<ApiResponse | null>(null)

// Add pagination metadata ref
const paginationMeta = ref({
  currentPage: 1,
  lastPage: 1,
  total: 0,
  perPage: 10,
  from: 0,
  to: 0,
})

// Watch for changes in projectsData to update pagination
watch(projectsData, (data: ApiResponse | null) => {
  if (!data) return

  paginationMeta.value = {
    currentPage: data.current_page,
    lastPage: data.last_page,
    total: data.total,
    perPage: data.per_page,
    from: data.from,
    to: data.to,
  }
}, { immediate: true })

// Add user role check
const userRole = computed(() => {
  const userData = JSON.parse(localStorage.getItem('userData') || '{}')
  return userData.role?.toLowerCase() || 'user'
})

const isAdmin = computed(() => userRole.value === 'admin')
const isClient = computed(() => userRole.value === 'client')

// Headers
const headers = computed(() => [
  { title: t('headers.projects.project'), key: 'project', sortable: true },
  { title: t('headers.projects.client'), key: 'client', sortable: true },
  { title: t('headers.projects.serviceType'), key: 'service_type', sortable: true },
  { title: t('headers.projects.deadline'), key: 'deadline', sortable: true },
  { title: t('headers.projects.status'), key: 'status', sortable: true },
  { title: t('headers.projects.actions'), key: 'actions', sortable: false, align: 'end' },
])

// Status options
const statusOptions = computed(() => [
  { title: t('projects.status.received'), value: 'received' },
  { title: t('projects.status.in_progress'), value: 'in_progress' },
  { title: t('projects.status.delivered'), value: 'delivered' },
])

// Status color mapping
const statusColorMap: Record<string, string> = {
  received: 'warning',
  in_progress: 'info',
  delivered: 'success',
}

// Service type options
const serviceTypeOptions = computed(() => [
  { title: t('projects.form.all'), value: '' },
  { title: t('projects.form.translation'), value: 'translation' },
  { title: t('projects.form.revision'), value: 'revision' },
  { title: t('projects.form.modifications'), value: 'modifications' },
  { title: t('projects.form.transcription'), value: 'transcription' },
  { title: t('projects.form.voiceOver'), value: 'voice_over' },
  { title: t('projects.form.other'), value: 'other' },
])

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
    params.append('sort_by', sortBy.value || 'created_at')
    params.append('sort_desc', orderBy.value === 'desc' ? '1' : '0')
    
    const response = await axios.get('/projects', { params })
    projectsData.value = response.data
  } catch (error) {
    console.error('Error fetching projects:', error)
  } finally {
    isLoading.value = false
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
  if (options.sortBy?.length) {
    sortBy.value = options.sortBy[0].key
    orderBy.value = options.sortBy[0].order
  }

  page.value = options.page || 1
  itemsPerPage.value = options.itemsPerPage || 10

  fetchProjects()
}

const handleItemsPerPageChange = (value: number) => {
  itemsPerPage.value = value
  page.value = 1 // Reset to first page when changing items per page
  fetchProjects()
}

const viewProject = (id: number) => {
  router.push(`/apps/projects/view/${id}`)
}

const deleteProject = async (id: number) => {
  if (!isAdmin.value) {
    console.error('Only admins can delete projects')
    return
  }
  
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
  if (!isAdmin.value) {
    console.error('Only admins can update project status')
    return
  }

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
})
</script>

<template>
  <div>
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
              @update:model-value="handleItemsPerPageChange"
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
          v-model:model-value="selectedRows"
          :headers="headers"
          :items="projects"
          :items-length="totalProjects"
          :loading="isLoading"
          class="text-no-wrap"
          show-select
          @update:options="handleOptionsUpdate"
        >
          <!-- Project -->
          <template #item.project="{ item }">
            <div class="d-flex align-center">
              <div class="d-flex flex-column text-truncate" style="max-inline-size: 250px;">
                <h6 class="text-base">
                  <RouterLink
                    :to="{ name: 'apps-projects-view-id', params: { id: item.id }}"
                    class="font-weight-medium text-link text-truncate"
                  >
                    {{ item.title }}
                  </RouterLink>
                </h6>
              </div>
            </div>
          </template>

          <!-- Client -->
          <template #item.client="{ item }">
            <div class="d-flex align-center">
              <div class="d-flex flex-column text-truncate" style="max-inline-size: 200px;">
                <h6 class="text-base text-truncate">
                  {{ item.client?.name || 'N/A' }}
                </h6>
                <div class="text-sm text-disabled text-truncate">
                  {{ item.client?.email || '' }}
                </div>
              </div>
            </div>
          </template>

          <!-- Service Type -->
          <template #item.service_type="{ item }">
            <div class="text-capitalize text-truncate" style="max-inline-size: 120px;">
              {{ item.service_type || 'N/A' }}
            </div>
          </template>

          <!-- Deadline -->
          <template #item.deadline="{ item }">
            <div class="text-truncate" style="max-inline-size: 100px;">
              {{ formatDate(item.deadline) }}
            </div>
          </template>

          <!-- Status -->
          <template #item.status="{ item }">
            <div class="d-flex align-center gap-1">
              <VSelect
                v-if="isAdmin"
                v-model="item.status"
                :items="statusOptions"
                density="compact"
                variant="plain"
                hide-details
                class="status-select"
                :color="statusColorMap[item.status]"
                @update:model-value="updateProjectStatus(item.id, $event)"
              >
                <template #selection="{ item: selectedItem }">
                  <VChip
                    :color="statusColorMap[selectedItem.value]"
                    size="small"
                    class="text-capitalize"
                  >
                    {{ selectedItem.title }}
                  </VChip>
                </template>
              </VSelect>
              <VChip
                v-else
                :color="statusColorMap[item.status]"
                size="small"
                class="text-capitalize"
              >
                {{ item.status }}
              </VChip>
              <VIcon
                v-if="item.has_attachments"
                icon="bx-paperclip"
                size="18"
                class="ms-1 text-disabled"
                title="Has attachments"
              />
            </div>
          </template>

          <!-- Actions -->
          <template #item.actions="{ item }">
            <IconBtn @click="viewProject(item.id)">
              <VIcon icon="bx-show" />
            </IconBtn>

            <IconBtn
              v-if="isAdmin"
              @click="deleteProject(item.id)"
            >
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

          <!-- Pagination -->
          <template #bottom>
            <TablePagination
              v-model:page="page"
              :items-per-page="itemsPerPage"
              :total-items="totalProjects"
              :showing-text="t('projects.showing', { from: paginationMeta.from, to: paginationMeta.to, total: paginationMeta.total })"
            />
          </template>
        </VDataTableServer>
      </VCard>
    </section>
  </div>
</template>

<style lang="scss">
.text-capitalize {
  text-transform: capitalize;
}

.text-truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.v-data-table {
  .v-data-table__wrapper {
    overflow-x: auto;
  }
}

.status-select {
  min-inline-size: 120px;
}
</style> 
