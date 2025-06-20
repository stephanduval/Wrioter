<template>
  <div class="admin-dashboard">
    <VContainer fluid>
      <!-- Header -->
      <VRow class="mb-6">
        <VCol cols="12">
          <div class="d-flex align-center justify-space-between">
            <div>
              <h1 class="text-h4 font-weight-bold mb-2">Admin Dashboard</h1>
              <p class="text-body-1 text-medium-emphasis">
                Comprehensive view of all user account data and system operations
              </p>
            </div>
            <VChip color="success" size="large">
              <VIcon start icon="bx-check-circle" />
              System Online
            </VChip>
          </div>
        </VCol>
      </VRow>

      <!-- Quick Stats -->
      <VRow class="mb-6">
        <VCol cols="12" sm="6" md="3">
          <VCard>
            <VCardText class="text-center">
              <VIcon icon="bx-users" size="32" color="primary" class="mb-2" />
              <div class="text-h5 font-weight-bold">{{ stats.totalUsers }}</div>
              <div class="text-caption">Total Users</div>
            </VCardText>
          </VCard>
        </VCol>
        <VCol cols="12" sm="6" md="3">
          <VCard>
            <VCardText class="text-center">
              <VIcon icon="bx-book" size="32" color="success" class="mb-2" />
              <div class="text-h5 font-weight-bold">{{ stats.totalManuscripts }}</div>
              <div class="text-caption">Manuscripts</div>
            </VCardText>
          </VCard>
        </VCol>
        <VCol cols="12" sm="6" md="3">
          <VCard>
            <VCardText class="text-center">
              <VIcon icon="bx-import" size="32" color="info" class="mb-2" />
              <div class="text-h5 font-weight-bold">{{ stats.scrivenerImports }}</div>
              <div class="text-caption">Scrivener Imports</div>
            </VCardText>
          </VCard>
        </VCol>
        <VCol cols="12" sm="6" md="3">
          <VCard>
            <VCardText class="text-center">
              <VIcon icon="bx-briefcase" size="32" color="warning" class="mb-2" />
              <div class="text-h5 font-weight-bold">{{ stats.activeProjects }}</div>
              <div class="text-caption">Active Projects</div>
            </VCardText>
          </VCard>
        </VCol>
      </VRow>

      <!-- Action Button Board -->
      <VRow class="mb-6">
        <VCol cols="12">
          <VCard>
            <VCardTitle class="d-flex align-center">
              <VIcon icon="bx-cog" class="me-2" />
              System Actions
            </VCardTitle>
            <VCardText>
              <div class="action-grid">
                <!-- User Management -->
                <div class="action-section">
                  <h3 class="text-h6 mb-3">User Management</h3>
                  <div class="d-flex flex-wrap gap-2">
                    <VBtn color="primary" @click="refreshUsers" :loading="loading.users">
                      <VIcon start icon="bx-refresh" />
                      Refresh Users
                    </VBtn>
                    <VBtn color="success" @click="exportUsers">
                      <VIcon start icon="bx-download" />
                      Export Users
                    </VBtn>
                    <VBtn color="info" @click="bulkPasswordReset">
                      <VIcon start icon="bx-key" />
                      Bulk Password Reset
                    </VBtn>
                  </div>
                </div>

                <!-- Content Management -->
                <div class="action-section">
                  <h3 class="text-h6 mb-3">Content Management</h3>
                  <div class="d-flex flex-wrap gap-2">
                    <VBtn color="primary" @click="refreshManuscripts" :loading="loading.manuscripts">
                      <VIcon start icon="bx-refresh" />
                      Refresh Manuscripts
                    </VBtn>
                    <VBtn color="warning" @click="cleanupOrphaned">
                      <VIcon start icon="bx-trash" />
                      Cleanup Orphaned
                    </VBtn>
                    <VBtn color="error" @click="clearFailedImports">
                      <VIcon start icon="bx-x-circle" />
                      Clear Failed Imports
                    </VBtn>
                  </div>
                </div>

                <!-- Queue Management -->
                <div class="action-section">
                  <h3 class="text-h6 mb-3">Queue Management</h3>
                  <div class="d-flex flex-wrap gap-2">
                    <VBtn color="success" @click="checkQueueStatus" :loading="loading.queue">
                      <VIcon start icon="bx-pulse" />
                      Queue Status
                    </VBtn>
                    <VBtn color="info" @click="retryFailedJobs">
                      <VIcon start icon="bx-redo" />
                      Retry Failed Jobs
                    </VBtn>
                    <VBtn color="warning" @click="clearCompletedJobs">
                      <VIcon start icon="bx-check-double" />
                      Clear Completed
                    </VBtn>
                  </div>
                </div>

                <!-- System Maintenance -->
                <div class="action-section">
                  <h3 class="text-h6 mb-3">System Maintenance</h3>
                  <div class="d-flex flex-wrap gap-2">
                    <VBtn color="primary" @click="refreshAll" :loading="loading.refreshAll">
                      <VIcon start icon="bx-refresh" />
                      Refresh All Data
                    </VBtn>
                    <VBtn color="info" @click="checkDiskUsage">
                      <VIcon start icon="bx-hdd" />
                      Disk Usage
                    </VBtn>
                    <VBtn color="warning" @click="clearCaches">
                      <VIcon start icon="bx-trash" />
                      Clear Caches
                    </VBtn>
                  </div>
                </div>
              </div>
            </VCardText>
          </VCard>
        </VCol>
      </VRow>

      <!-- Data Tree Structure -->
      <VRow>
        <!-- Users Tree -->
        <VCol cols="12" lg="6">
          <VCard class="h-100">
            <VCardTitle class="d-flex align-center justify-space-between">
              <div class="d-flex align-center">
                <VIcon icon="bx-users" class="me-2" />
                Users & Accounts
              </div>
              <VChip size="small" color="primary">{{ users.length }}</VChip>
            </VCardTitle>
            <VCardText>
              <VTreeView
                :items="userTreeItems"
                item-title="title"
                item-value="id"
                :load-children="loadUserChildren"
                open-strategy="multiple"
                density="compact"
                class="data-tree"
              >
                <template #prepend="{ item }">
                  <VIcon :icon="item.icon" :color="item.color" size="small" class="me-2" />
                </template>
                <template #append="{ item }">
                  <div class="d-flex align-center gap-1">
                    <VChip
                      v-if="item.status"
                      :color="getStatusColor(item.status)"
                      size="x-small"
                      variant="tonal"
                    >
                      {{ item.status }}
                    </VChip>
                    <VChip
                      v-if="item.count !== undefined"
                      color="grey"
                      size="x-small"
                      variant="outlined"
                    >
                      {{ item.count }}
                    </VChip>
                  </div>
                </template>
              </VTreeView>
            </VCardText>
          </VCard>
        </VCol>

        <!-- Content Tree -->
        <VCol cols="12" lg="6">
          <VCard class="h-100">
            <VCardTitle class="d-flex align-center justify-space-between">
              <div class="d-flex align-center">
                <VIcon icon="bx-book-content" class="me-2" />
                Content & Projects
              </div>
              <VChip size="small" color="success">{{ manuscripts.length }}</VChip>
            </VCardTitle>
            <VCardText>
              <VTreeView
                :items="contentTreeItems"
                item-title="title"
                item-value="id"
                :load-children="loadContentChildren"
                open-strategy="multiple"
                density="compact"
                class="data-tree"
              >
                <template #prepend="{ item }">
                  <VIcon :icon="item.icon" :color="item.color" size="small" class="me-2" />
                </template>
                <template #append="{ item }">
                  <div class="d-flex align-center gap-1">
                    <VChip
                      v-if="item.status"
                      :color="getStatusColor(item.status)"
                      size="x-small"
                      variant="tonal"
                    >
                      {{ item.status }}
                    </VChip>
                    <VChip
                      v-if="item.count !== undefined"
                      color="grey"
                      size="x-small"
                      variant="outlined"
                    >
                      {{ item.count }}
                    </VChip>
                  </div>
                </template>
              </VTreeView>
            </VCardText>
          </VCard>
        </VCol>
      </VRow>

      <!-- Detailed Data Tables -->
      <VRow class="mt-6">
        <!-- Users Table -->
        <VCol cols="12">
          <VCard>
            <VCardTitle class="d-flex align-center justify-space-between">
              <div class="d-flex align-center">
                <VIcon icon="bx-table" class="me-2" />
                User Details
              </div>
              <VTextField
                v-model="userSearch"
                placeholder="Search users..."
                hide-details
                density="compact"
                style="width: 300px;"
                clearable
              >
                <template #prepend-inner>
                  <VIcon icon="bx-search" />
                </template>
              </VTextField>
            </VCardTitle>
            <VDataTable
              :items="filteredUsers"
              :headers="userHeaders"
              :loading="loading.users"
              item-value="id"
              show-expand
              class="elevation-0"
            >
              <template #item.avatar="{ item }">
                <VAvatar size="32" :color="item.avatar ? 'transparent' : 'primary'">
                  <VImg v-if="item.avatar" :src="item.avatar" />
                  <span v-else class="text-sm">{{ getInitials(item.name) }}</span>
                </VAvatar>
              </template>
              
              <template #item.role="{ item }">
                <VChip :color="getRoleColor(item.role)" size="small" variant="tonal">
                  {{ item.role }}
                </VChip>
              </template>

              <template #item.status="{ item }">
                <VChip :color="getStatusColor(item.status)" size="small" variant="tonal">
                  {{ item.status }}
                </VChip>
              </template>

              <template #item.actions="{ item }">
                <div class="d-flex gap-1">
                  <VBtn size="small" variant="text" icon @click="viewUserDetails(item)">
                    <VIcon icon="bx-show" />
                  </VBtn>
                  <VBtn size="small" variant="text" icon @click="editUser(item)">
                    <VIcon icon="bx-edit" />
                  </VBtn>
                  <VBtn size="small" variant="text" icon color="error" @click="deleteUser(item)">
                    <VIcon icon="bx-trash" />
                  </VBtn>
                </div>
              </template>

              <template #expanded-row="{ item }">
                <VRow class="pa-4">
                  <VCol cols="12" md="4">
                    <div class="text-caption text-medium-emphasis">Manuscripts</div>
                    <div class="text-body-2">{{ item.manuscriptCount || 0 }}</div>
                  </VCol>
                  <VCol cols="12" md="4">
                    <div class="text-caption text-medium-emphasis">Scrivener Imports</div>
                    <div class="text-body-2">{{ item.importCount || 0 }}</div>
                  </VCol>
                  <VCol cols="12" md="4">
                    <div class="text-caption text-medium-emphasis">Last Login</div>
                    <div class="text-body-2">{{ formatDate(item.lastLogin) }}</div>
                  </VCol>
                  <VCol cols="12">
                    <div class="text-caption text-medium-emphasis">Department</div>
                    <div class="text-body-2">{{ item.department || 'Not assigned' }}</div>
                  </VCol>
                </VRow>
              </template>
            </VDataTable>
          </VCard>
        </VCol>

        <!-- Manuscripts Table -->
        <VCol cols="12" class="mt-6">
          <VCard>
            <VCardTitle class="d-flex align-center justify-space-between">
              <div class="d-flex align-center">
                <VIcon icon="bx-book" class="me-2" />
                Manuscripts & Content
              </div>
              <VTextField
                v-model="manuscriptSearch"
                placeholder="Search manuscripts..."
                hide-details
                density="compact"
                style="width: 300px;"
                clearable
              >
                <template #prepend-inner>
                  <VIcon icon="bx-search" />
                </template>
              </VTextField>
            </VCardTitle>
            <VDataTable
              :items="filteredManuscripts"
              :headers="manuscriptHeaders"
              :loading="loading.manuscripts"
              item-value="id"
              show-expand
              class="elevation-0"
            >
              <template #item.manuscript_type="{ item }">
                <VChip 
                  :color="item.manuscript_type === 'scrivener' ? 'info' : 'default'" 
                  size="small" 
                  variant="tonal"
                >
                  <VIcon 
                    :icon="item.manuscript_type === 'scrivener' ? 'bx-import' : 'bx-book'" 
                    start 
                    size="16"
                  />
                  {{ item.manuscript_type }}
                </VChip>
              </template>

              <template #item.status="{ item }">
                <VChip :color="getStatusColor(item.status)" size="small" variant="tonal">
                  {{ item.status }}
                </VChip>
              </template>

              <template #item.imported_at="{ item }">
                {{ item.imported_at ? formatDate(item.imported_at) : '-' }}
              </template>

              <template #item.actions="{ item }">
                <div class="d-flex gap-1">
                  <VBtn size="small" variant="text" icon @click="viewManuscript(item)">
                    <VIcon icon="bx-show" />
                  </VBtn>
                  <VBtn size="small" variant="text" icon @click="downloadManuscript(item)">
                    <VIcon icon="bx-download" />
                  </VBtn>
                  <VBtn size="small" variant="text" icon color="error" @click="deleteManuscript(item)">
                    <VIcon icon="bx-trash" />
                  </VBtn>
                </div>
              </template>

              <template #expanded-row="{ item }">
                <VRow class="pa-4">
                  <VCol cols="12" md="6">
                    <div class="text-caption text-medium-emphasis">Description</div>
                    <div class="text-body-2">{{ item.description || 'No description' }}</div>
                  </VCol>
                  <VCol cols="12" md="3">
                    <div class="text-caption text-medium-emphasis">Items Count</div>
                    <div class="text-body-2">{{ item.itemsCount || 0 }}</div>
                  </VCol>
                  <VCol cols="12" md="3">
                    <div class="text-caption text-medium-emphasis">Word Count</div>
                    <div class="text-body-2">{{ item.wordCount || 0 }}</div>
                  </VCol>
                  <VCol v-if="item.scrivener_uuid" cols="12">
                    <div class="text-caption text-medium-emphasis">Scrivener UUID</div>
                    <code class="text-body-2">{{ item.scrivener_uuid }}</code>
                  </VCol>
                </VRow>
              </template>
            </VDataTable>
          </VCard>
        </VCol>

        <!-- Scrivener Imports Table -->
        <VCol cols="12" class="mt-6">
          <VCard>
            <VCardTitle class="d-flex align-center justify-space-between">
              <div class="d-flex align-center">
                <VIcon icon="bx-import" class="me-2" />
                Scrivener Import History
              </div>
              <div class="d-flex align-center gap-2">
                <VBtn size="small" @click="refreshImports" :loading="loading.imports">
                  <VIcon start icon="bx-refresh" />
                  Refresh
                </VBtn>
              </div>
            </VCardTitle>
            <VDataTable
              :items="scrivenerImports"
              :headers="importHeaders"
              :loading="loading.imports"
              item-value="id"
              class="elevation-0"
            >
              <template #item.status="{ item }">
                <div class="d-flex align-center gap-2">
                  <VProgressCircular
                    v-if="item.status === 'processing'"
                    size="16"
                    width="2"
                    indeterminate
                    color="info"
                  />
                  <VChip :color="getStatusColor(item.status)" size="small" variant="tonal">
                    {{ item.status }}
                  </VChip>
                </div>
              </template>

              <template #item.progress="{ item }">
                <div class="d-flex align-center gap-2" style="min-width: 100px;">
                  <VProgressLinear
                    v-if="item.status === 'processing' || item.status === 'pending'"
                    :model-value="item.progress || 0"
                    height="4"
                    color="primary"
                    class="flex-grow-1"
                  />
                  <span class="text-caption">{{ Math.round(item.progress || 0) }}%</span>
                </div>
              </template>

              <template #item.created_at="{ item }">
                {{ formatDate(item.created_at) }}
              </template>

              <template #item.actions="{ item }">
                <div class="d-flex gap-1">
                  <VBtn 
                    v-if="item.status === 'failed'" 
                    size="small" 
                    variant="text" 
                    icon 
                    @click="retryImport(item)"
                  >
                    <VIcon icon="bx-redo" />
                  </VBtn>
                  <VBtn 
                    v-if="item.status === 'pending'" 
                    size="small" 
                    variant="text" 
                    icon 
                    color="warning"
                    @click="cancelImport(item)"
                  >
                    <VIcon icon="bx-x" />
                  </VBtn>
                  <VBtn 
                    size="small" 
                    variant="text" 
                    icon 
                    color="error" 
                    @click="deleteImport(item)"
                  >
                    <VIcon icon="bx-trash" />
                  </VBtn>
                </div>
              </template>
            </VDataTable>
          </VCard>
        </VCol>
      </VRow>
    </VContainer>

    <!-- User Details Dialog -->
    <VDialog v-model="userDialog" max-width="800">
      <VCard v-if="selectedUser">
        <VCardTitle class="d-flex align-center">
          <VAvatar size="40" :color="selectedUser.avatar ? 'transparent' : 'primary'" class="me-3">
            <VImg v-if="selectedUser.avatar" :src="selectedUser.avatar" />
            <span v-else>{{ getInitials(selectedUser.name) }}</span>
          </VAvatar>
          {{ selectedUser.name }}
        </VCardTitle>
        <VCardText>
          <VRow>
            <VCol cols="12" md="6">
              <div class="text-caption text-medium-emphasis">Email</div>
              <div class="text-body-1">{{ selectedUser.email }}</div>
            </VCol>
            <VCol cols="12" md="6">
              <div class="text-caption text-medium-emphasis">Role</div>
              <VChip :color="getRoleColor(selectedUser.role)" size="small">
                {{ selectedUser.role }}
              </VChip>
            </VCol>
            <VCol cols="12" md="6">
              <div class="text-caption text-medium-emphasis">Company</div>
              <div class="text-body-1">{{ selectedUser.company || 'Not assigned' }}</div>
            </VCol>
            <VCol cols="12" md="6">
              <div class="text-caption text-medium-emphasis">Department</div>
              <div class="text-body-1">{{ selectedUser.department || 'Not assigned' }}</div>
            </VCol>
          </VRow>
        </VCardText>
        <VCardActions>
          <VSpacer />
          <VBtn variant="text" @click="userDialog = false">Close</VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { format } from 'date-fns'
import { useToast } from 'vue-toastification'

const toast = useToast()

// Data refs
const users = ref<any[]>([])
const manuscripts = ref<any[]>([])
const scrivenerImports = ref<any[]>([])
const userDialog = ref(false)
const selectedUser = ref<any>(null)

// Search filters
const userSearch = ref('')
const manuscriptSearch = ref('')

// Loading states
const loading = ref({
  users: false,
  manuscripts: false,
  imports: false,
  queue: false,
  refreshAll: false
})

// Stats
const stats = ref({
  totalUsers: 0,
  totalManuscripts: 0,
  scrivenerImports: 0,
  activeProjects: 0
})

// Computed properties
const filteredUsers = computed(() => {
  if (!userSearch.value) return users.value
  const search = userSearch.value.toLowerCase()
  return users.value.filter(user => 
    user.name?.toLowerCase().includes(search) ||
    user.email?.toLowerCase().includes(search) ||
    user.role?.toLowerCase().includes(search) ||
    user.company?.toLowerCase().includes(search)
  )
})

const filteredManuscripts = computed(() => {
  if (!manuscriptSearch.value) return manuscripts.value
  const search = manuscriptSearch.value.toLowerCase()
  return manuscripts.value.filter(manuscript => 
    manuscript.title?.toLowerCase().includes(search) ||
    manuscript.description?.toLowerCase().includes(search) ||
    manuscript.manuscript_type?.toLowerCase().includes(search)
  )
})

const userTreeItems = computed(() => {
  const items: any[] = []
  
  // Group users by company
  const companies = [...new Set(users.value.map(u => u.company).filter(Boolean))]
  companies.forEach(company => {
    const companyUsers = users.value.filter(u => u.company === company)
    items.push({
      id: `company-${company}`,
      title: company,
      icon: 'bx-buildings',
      color: 'primary',
      count: companyUsers.length,
      children: companyUsers.map(user => ({
        id: `user-${user.id}`,
        title: user.name,
        icon: 'bx-user',
        color: getRoleColor(user.role),
        status: user.role,
        children: [
          {
            id: `user-manuscripts-${user.id}`,
            title: 'Manuscripts',
            icon: 'bx-book',
            color: 'success',
            count: user.manuscriptCount || 0
          },
          {
            id: `user-imports-${user.id}`,
            title: 'Scrivener Imports',
            icon: 'bx-import',
            color: 'info',
            count: user.importCount || 0
          }
        ]
      }))
    })
  })

  // Add users without company
  const unassignedUsers = users.value.filter(u => !u.company)
  if (unassignedUsers.length > 0) {
    items.push({
      id: 'unassigned',
      title: 'Unassigned Users',
      icon: 'bx-user-x',
      color: 'warning',
      count: unassignedUsers.length,
      children: unassignedUsers.map(user => ({
        id: `user-${user.id}`,
        title: user.name,
        icon: 'bx-user',
        color: getRoleColor(user.role),
        status: user.role
      }))
    })
  }

  return items
})

const contentTreeItems = computed(() => {
  const items: any[] = []
  
  // Group manuscripts by type
  const standardManuscripts = manuscripts.value.filter(m => m.manuscript_type !== 'scrivener')
  const scrivenerManuscripts = manuscripts.value.filter(m => m.manuscript_type === 'scrivener')
  
  if (standardManuscripts.length > 0) {
    items.push({
      id: 'standard-manuscripts',
      title: 'Standard Manuscripts',
      icon: 'bx-book',
      color: 'primary',
      count: standardManuscripts.length,
      children: standardManuscripts.map(manuscript => ({
        id: `manuscript-${manuscript.id}`,
        title: manuscript.title,
        icon: 'bx-book-open',
        color: 'primary',
        status: manuscript.status
      }))
    })
  }

  if (scrivenerManuscripts.length > 0) {
    items.push({
      id: 'scrivener-manuscripts',
      title: 'Scrivener Projects',
      icon: 'bx-import',
      color: 'info',
      count: scrivenerManuscripts.length,
      children: scrivenerManuscripts.map(manuscript => ({
        id: `manuscript-${manuscript.id}`,
        title: manuscript.title,
        icon: 'bx-import',
        color: 'info',
        status: manuscript.status
      }))
    })
  }

  // Add import status summary
  const importSummary = scrivenerImports.value.reduce((acc: any, imp) => {
    acc[imp.status] = (acc[imp.status] || 0) + 1
    return acc
  }, {})

  items.push({
    id: 'import-status',
    title: 'Import Status',
    icon: 'bx-pulse',
    color: 'warning',
    children: Object.entries(importSummary).map(([status, count]) => ({
      id: `status-${status}`,
      title: status.charAt(0).toUpperCase() + status.slice(1),
      icon: getStatusIcon(status),
      color: getStatusColor(status),
      count
    }))
  })

  return items
})

// Table headers
const userHeaders = [
  { title: 'Avatar', key: 'avatar', sortable: false },
  { title: 'Name', key: 'name' },
  { title: 'Email', key: 'email' },
  { title: 'Role', key: 'role' },
  { title: 'Company', key: 'company' },
  { title: 'Status', key: 'status' },
  { title: 'Actions', key: 'actions', sortable: false }
]

const manuscriptHeaders = [
  { title: 'Title', key: 'title' },
  { title: 'Type', key: 'manuscript_type' },
  { title: 'Status', key: 'status' },
  { title: 'Owner', key: 'user_name' },
  { title: 'Imported', key: 'imported_at' },
  { title: 'Actions', key: 'actions', sortable: false }
]

const importHeaders = [
  { title: 'Filename', key: 'filename' },
  { title: 'Status', key: 'status' },
  { title: 'Progress', key: 'progress' },
  { title: 'User', key: 'user_name' },
  { title: 'Created', key: 'created_at' },
  { title: 'Actions', key: 'actions', sortable: false }
]

// Helper functions
const getInitials = (name: string) => {
  return name?.split(' ').map(n => n[0]).join('').toUpperCase() || '??'
}

const getRoleColor = (role: string) => {
  const colors: any = {
    'Admin': 'error',
    'Manager': 'warning',
    'User': 'primary',
    'Client': 'info'
  }
  return colors[role] || 'grey'
}

const getStatusColor = (status: string) => {
  const colors: any = {
    'active': 'success',
    'inactive': 'grey',
    'pending': 'warning',
    'processing': 'info',
    'completed': 'success',
    'failed': 'error',
    'draft': 'grey',
    'in_progress': 'info',
    'published': 'success'
  }
  return colors[status] || 'grey'
}

const getStatusIcon = (status: string) => {
  const icons: any = {
    'pending': 'bx-time',
    'processing': 'bx-loader-alt',
    'completed': 'bx-check',
    'failed': 'bx-x'
  }
  return icons[status] || 'bx-circle'
}

const formatDate = (date: string) => {
  if (!date) return 'Never'
  return format(new Date(date), 'MMM d, yyyy HH:mm')
}

// API functions
const fetchUsers = async () => {
  loading.value.users = true
  try {
    const response = await fetch('/api/users', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        'Accept': 'application/json'
      }
    })
    const data = await response.json()
    users.value = data.data || []
    stats.value.totalUsers = users.value.length
  } catch (error) {
    console.error('Error fetching users:', error)
    toast.error('Failed to fetch users')
  } finally {
    loading.value.users = false
  }
}

const fetchManuscripts = async () => {
  loading.value.manuscripts = true
  try {
    const response = await fetch('/api/manuscripts', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        'Accept': 'application/json'
      }
    })
    manuscripts.value = await response.json()
    stats.value.totalManuscripts = manuscripts.value.length
  } catch (error) {
    console.error('Error fetching manuscripts:', error)
    toast.error('Failed to fetch manuscripts')
  } finally {
    loading.value.manuscripts = false
  }
}

const fetchScrivenerImports = async () => {
  loading.value.imports = true
  try {
    const response = await fetch('/api/scrivener/imports', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        'Accept': 'application/json'
      }
    })
    scrivenerImports.value = await response.json()
    stats.value.scrivenerImports = scrivenerImports.value.length
  } catch (error) {
    console.error('Error fetching imports:', error)
    toast.error('Failed to fetch imports')
  } finally {
    loading.value.imports = false
  }
}

// Action functions
const refreshUsers = () => fetchUsers()
const refreshManuscripts = () => fetchManuscripts()
const refreshImports = () => fetchScrivenerImports()

const refreshAll = async () => {
  loading.value.refreshAll = true
  try {
    await Promise.all([
      fetchUsers(),
      fetchManuscripts(),
      fetchScrivenerImports()
    ])
    toast.success('All data refreshed successfully')
  } catch (error) {
    toast.error('Failed to refresh data')
  } finally {
    loading.value.refreshAll = false
  }
}

const viewUserDetails = (user: any) => {
  selectedUser.value = user
  userDialog.value = true
}

const editUser = (user: any) => {
  toast.info(`Edit user: ${user.name}`)
}

const deleteUser = (user: any) => {
  toast.warning(`Delete user: ${user.name}`)
}

const viewManuscript = (manuscript: any) => {
  toast.info(`View manuscript: ${manuscript.title}`)
}

const downloadManuscript = (manuscript: any) => {
  toast.info(`Download manuscript: ${manuscript.title}`)
}

const deleteManuscript = (manuscript: any) => {
  toast.warning(`Delete manuscript: ${manuscript.title}`)
}

const retryImport = (importItem: any) => {
  toast.info(`Retry import: ${importItem.filename}`)
}

const cancelImport = (importItem: any) => {
  toast.warning(`Cancel import: ${importItem.filename}`)
}

const deleteImport = (importItem: any) => {
  toast.warning(`Delete import: ${importItem.filename}`)
}

// Placeholder action functions
const exportUsers = () => toast.info('Export users feature')
const bulkPasswordReset = () => toast.info('Bulk password reset feature')
const cleanupOrphaned = () => toast.info('Cleanup orphaned content feature')
const clearFailedImports = () => toast.info('Clear failed imports feature')
const checkQueueStatus = () => toast.info('Queue status check feature')
const retryFailedJobs = () => toast.info('Retry failed jobs feature')
const clearCompletedJobs = () => toast.info('Clear completed jobs feature')
const checkDiskUsage = () => toast.info('Disk usage check feature')
const clearCaches = () => toast.info('Clear caches feature')

// Tree loading functions
const loadUserChildren = async (item: any) => {
  // This would load children dynamically if needed
  return item.children || []
}

const loadContentChildren = async (item: any) => {
  // This would load children dynamically if needed
  return item.children || []
}

// Initialize
onMounted(() => {
  refreshAll()
})
</script>

<style scoped>
.admin-dashboard {
  background-color: rgb(var(--v-theme-surface));
}

.action-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.action-section {
  padding: 1rem;
  border: 1px solid rgb(var(--v-border-color));
  border-radius: 8px;
  background-color: rgb(var(--v-theme-surface));
}

.data-tree {
  max-height: 500px;
  overflow-y: auto;
}

.v-data-table {
  background-color: transparent;
}

.elevation-0 {
  box-shadow: none !important;
}
</style>