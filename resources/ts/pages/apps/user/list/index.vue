<script setup lang="ts">
import AddNewUserDrawer from '@/views/apps/user/list/AddNewUserDrawer.vue'
import EditUserDrawer from '@/views/apps/user/list/EditUserDrawer.vue'
import { useI18n } from 'vue-i18n'

import type { UserProperties } from '@db/apps/users/types'

// Define the API response type based on the backend response
interface UserApiResponse {
  data: UserProperties[]
  total: number
  current_page: number
  per_page: number
  last_page: number
  from: number
  to: number
  all_roles?: string[]
}

// 👉 Store
const searchQuery = ref('')
// Removing filter variables
// const selectedRole = ref()
// const selectedPlan = ref()
// const selectedStatus = ref()

// Data table options
const itemsPerPage = ref(10)
const page = ref(1)
const sortBy = ref()
const orderBy = ref()
const selectedRows = ref([])

// Drawers visibility state
const isAddNewUserDrawerVisible = ref(false)
const isEditUserDrawerVisible = ref(false)
const selectedUserId = ref<number | null>(null)

// Add these refs near the top with other refs
const isResetPasswordModalVisible = ref(false)
const selectedUserForReset = ref<{ id: number; name: string; email: string } | null>(null)
const resetCode = ref('')
const isGeneratingReset = ref(false)
const resetError = ref('')

// Add these refs near the other refs at the top of the script
const isDeleteModalVisible = ref(false)
const selectedUserForDelete = ref<{ id: number; name: string; email: string } | null>(null)

// Update data table options
const updateOptions = (options: any) => {
  if (options.sortBy?.length) {
    sortBy.value = options.sortBy[0]?.key
    orderBy.value = options.sortBy[0]?.order
  }

  page.value = options.page || 1
  itemsPerPage.value = options.itemsPerPage || 10

  fetchUsers()
}

const { t } = useI18n()

// Headers
const headers = computed(() => [
  { title: t('headers.users.user'), key: 'user' },
  { title: t('headers.users.department'), key: 'department' },
  { title: t('headers.users.role'), key: 'role' },
  { title: t('headers.users.status'), key: 'status' },
  { title: t('headers.users.actions'), key: 'actions', sortable: false },
])


//   GPT FETCH USERCODE START


// GPT CODE END

// 👉 Fetching users

const { data: usersData, execute: fetchUsers } = useApi<UserApiResponse>(() => {
  const params = new URLSearchParams()
  params.append('page', String(page.value))
  params.append('itemsPerPage', itemsPerPage.value === -1 ? 'all' : String(itemsPerPage.value))
  if (searchQuery.value)
    params.append('q', searchQuery.value)

  const token = localStorage.getItem('accessToken')
  // console.log('Fetching users with params:', {
  //   page: page.value,
  //   itemsPerPage: itemsPerPage.value === -1 ? 'all' : itemsPerPage.value,
  //   searchQuery: searchQuery.value,
  //   token: token ? 'Present' : 'Missing',
  //   url: `/users?${params.toString()}`,
  // })

  return `/users?${params.toString()}`
})

// Add pagination metadata ref
const paginationMeta = ref({
  currentPage: 1,
  lastPage: 1,
  total: 0,
  perPage: 10,
  from: 0,
  to: 0,
})

// Watch for changes in usersData to update pagination
watch(usersData, (data: UserApiResponse | null) => {
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

// Update the fetchUsers call in onMounted
onMounted(async () => {
  // console.log('Component mounted, fetching users...')
  try {
    await fetchUsers()
    // console.log('Initial users fetch complete:', usersData.value)
  }
  catch (error) {
    // console.error('Error fetching users:', error)
  }
})

// Update the watch for search/filter changes
watch(
  [searchQuery, itemsPerPage, page, sortBy, orderBy],
  async () => {
    // console.log('Filters changed, fetching users with:', {
    //   searchQuery: searchQuery.value,
    //   itemsPerPage: itemsPerPage.value,
    //   page: page.value,
    //   sortBy: sortBy.value,
    //   orderBy: orderBy.value,
    // })
    try {
      await fetchUsers()
    }
    catch (error) {
      // console.error('Error fetching users after filter change:', error)
    }
  },
)

const users = computed(() => usersData.value?.data || [])
const totalUsers = computed(() => usersData.value?.total || 0)

// 👉 search filters
// Keeping these variables for reference in case they're used elsewhere
const roles = [
  { title: 'Admin', value: 'admin' },
  { title: 'Author', value: 'author' },
  { title: 'Editor', value: 'editor' },
  { title: 'Maintainer', value: 'maintainer' },
  { title: 'Subscriber', value: 'subscriber' },
]

const plans = [
  { title: 'Basic', value: 'basic' },
  { title: 'Company', value: 'company' },
  { title: 'Enterprise', value: 'enterprise' },
  { title: 'Team', value: 'team' },
]

const status = [
  { title: 'Pending', value: 'pending' },
  { title: 'Active', value: 'active' },
  { title: 'Inactive', value: 'inactive' },
]

const resolveUserRoleVariant = (role: string) => {
  const roleLowerCase = role.toLowerCase()

  if (roleLowerCase === 'subscriber')
    return { color: 'success', icon: 'bx-user' }
  if (roleLowerCase === 'author')
    return { color: 'error', icon: 'bx-desktop' }
  if (roleLowerCase === 'maintainer')
    return { color: 'info', icon: 'bx-pie-chart-alt' }
  if (roleLowerCase === 'editor')
    return { color: 'warning', icon: 'bx-edit' }
  if (roleLowerCase === 'admin')
    return { color: 'primary', icon: 'bx-crown' }

  return { color: 'primary', icon: 'bx-user' }
}

const resolveUserStatusVariant = (stat: string) => {
  const statLowerCase = stat.toLowerCase()
  if (statLowerCase === 'pending')
    return 'warning'
  if (statLowerCase === 'active')
    return 'success'
  if (statLowerCase === 'inactive')
    return 'secondary'

  return 'primary'
}

// 👉 Add new user
const addNewUser = async (response: { success: boolean; message?: string; error?: string; user?: any }) => {
  if (!response.success) {
    // Handle error case - you might want to show a toast notification here
    // console.error('Error adding user:', response.error)
    return
  }

  try {
    // Close the drawer
    isAddNewUserDrawerVisible.value = false

    // Reset to first page to show the new user
    page.value = 1

    // Refetch users with updated data
    await fetchUsers()

    // Optional: Show success message
    // You can add a toast notification here if you have one
  }
  catch (error) {
    // console.error('Error refreshing user list:', error)
  }
}

// 👉 Delete user
const confirmDelete = async () => {
  if (!selectedUserForDelete.value) return

  try {
    const response = await fetch(`/api/users/${selectedUserForDelete.value.id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
    })

    if (!response.ok)
      throw new Error('Failed to delete user')

    // Close the modal
    isDeleteModalVisible.value = false
    selectedUserForDelete.value = null

    // Refetch users to update the table
    fetchUsers()
  }
  catch (error) {
    // console.error('Error deleting user:', error)
  }
}

const openDeleteModal = (user: any) => {
  selectedUserForDelete.value = {
    id: user.id,
    name: user.fullName,
    email: user.email,
  }
  isDeleteModalVisible.value = true
}

// const widgetData = ref([
//   { title: 'Session', value: '21,459', change: 29, desc: 'Total Users', icon: 'bx-group', iconColor: 'primary' },
//   { title: 'Paid Users', value: '4,567', change: 18, desc: 'Last Week Analytics', icon: 'bx-user-plus', iconColor: 'error' },
//   { title: 'Active Users', value: '19,860', change: -14, desc: 'Last Week Analytics', icon: 'bx-user-check', iconColor: 'success' },
//   { title: 'Pending Users', value: '237', change: 42, desc: 'Last Week Analytics', icon: 'bx-user-voice', iconColor: 'warning' },
// ])

// Add this near your other useApi calls
const { data: testData, execute: testApiCall } = useApi('/users?page=2&itemsPerPage=10', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
  },
  credentials: 'include',
})

// Add this to log the results
watch(testData, newData => {
  // console.log('Test API Response:', newData)
}, { immediate: true })

// Call it on mount
onMounted(async () => {
  // console.log('Making test API call...')
  await testApiCall()

  // Your existing code...
  fetchUsers()
})

// Add this computed property after the other computed properties
const tableItemsPerPage = computed({
  get: () => itemsPerPage.value,
  set: (value: number) => {
    itemsPerPage.value = value
    page.value = 1 // Reset to first page when changing items per page
    fetchUsers()
  },
})

// Open Edit Drawer
const openEditUserDrawer = (userId: number) => {
  selectedUserId.value = userId
  isEditUserDrawerVisible.value = true
}

// Add this function with other functions
const generateResetCode = async (userId: number) => {
  try {
    isGeneratingReset.value = true
    resetError.value = ''
    
    const response = await fetch(`/api/users/${userId}/generate-reset-code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
    })

    const data = await response.json()

    if (!response.ok)
      throw new Error(data.message || 'Failed to generate reset code')

    resetCode.value = data.reset_code
  } catch (err) {
    // console.error('Error generating reset code:', err)
    resetError.value = err instanceof Error ? err.message : 'Failed to generate reset code'
  } finally {
    isGeneratingReset.value = false
  }
}

const openResetPasswordModal = (user: any) => {
  selectedUserForReset.value = {
    id: user.id,
    name: user.fullName,
    email: user.email,
  }
  isResetPasswordModalVisible.value = true
  resetCode.value = ''
  resetError.value = ''
}

const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    // You could add a toast notification here
  } catch (err) {
    // console.error('Failed to copy:', err)
  }
}

const resetPasswordUrl = computed(() => {
  if (!resetCode.value || !selectedUserForReset.value?.email) return ''
  const baseUrl = import.meta.env.VITE_FRONTEND_URL || window.location.origin
  return `${baseUrl}/reset-password?code=${resetCode.value}&email=${encodeURIComponent(selectedUserForReset.value.email)}`
})

const copyInstructions = () => {
  const instructions = `Your password for Freynet-Gagne has been reset. Please visit the link below to enter a new password.

${resetPasswordUrl.value}

The reset code will expire in 60 minutes`
  
  copyToClipboard(instructions)
}
</script>

<template>
  <section>
    <!-- 👉 Widgets -->
      <!-- <div class="d-flex mb-6">
        <VRow>
          <template
            v-for="(data, id) in widgetData"
            :key="id"
          >
            <VCol
              cols="12"
              md="3"
              sm="6"
            >
              <VCard>
                <VCardText>
                  <div class="d-flex justify-space-between">
                    <div class="d-flex flex-column gap-y-1">
                      <div class="text-body-1 text-high-emphasis">
                        {{ data.title }}
                      </div>
                      <div class="d-flex gap-x-2 align-center">
                        <h4 class="text-h4">
                          {{ data.value }}
                        </h4>
                        <div
                          class="text-base"
                          :class="data.change > 0 ? 'text-success' : 'text-error'"
                        >
                          ({{ prefixWithPlus(data.change) }}%)
                        </div>
                      </div>
                      <div class="text-sm">
                        {{ data.desc }}
                      </div>
                    </div>
                    <VAvatar
                      :color="data.iconColor"
                      variant="tonal"
                      rounded
                      size="40"
                    >
                      <VIcon
                        :icon="data.icon"
                        size="24"
                      />
                    </VAvatar>
                  </div>
                </VCardText>
              </VCard>
            </VCol>
          </template>
        </VRow>
      </div> -->

    <VCard class="mb-6">
      <!-- Removing the Filter title and filter options -->
      <VCardText class="d-flex flex-wrap gap-4">
        <div class="me-3 d-flex gap-3">
          <AppSelect
            :model-value="tableItemsPerPage"
            :items="[
              { value: 10, title: '10' },
              { value: 25, title: '25' },
              { value: 50, title: '50' },
              { value: 100, title: '100' },
              { value: -1, title: 'All' },
            ]"
            :label="t('itemsPerPage')"
            style="inline-size: 6.25rem;"
            @update:model-value="tableItemsPerPage = $event"
          />
        </div>
        <VSpacer />

        <div class="app-user-search-filter d-flex align-center flex-wrap gap-4">
          <!-- 👉 Search  -->
          <div style="inline-size: 15.625rem;">
            <AppTextField
              v-model="searchQuery"
              :placeholder="t('users.search')"
            />
          </div>

          <!-- 👉 Export button
          <VBtn
            variant="tonal"
            color="secondary"
            prepend-icon="bx-export"
          >
            Export
          </VBtn> -->

          <!-- 👉 Add user button -->
          <VBtn
            prepend-icon="bx-plus"
            @click="isAddNewUserDrawerVisible = true"
          >
            {{ t('users.addNew') }}
          </VBtn>
        </div>
      </VCardText>
      <VDivider />

      <!-- SECTION datatable -->
      <VDataTableServer
        v-model:items-per-page="tableItemsPerPage"
        v-model:model-value="selectedRows"
        v-model:page="page"
        :items="users"
        item-value="id"
        :items-length="totalUsers"
        :headers="headers"
        class="text-no-wrap"
        show-select
        @update:options="updateOptions"
      >
        <!-- User -->
        <template #item.user="{ item }">
          <div class="d-flex align-center gap-x-4">
            <VAvatar
              size="34"
              :variant="!item.avatar ? 'tonal' : undefined"
              :color="!item.avatar ? resolveUserRoleVariant(item.role).color : undefined"
            >
              <VImg
                v-if="item.avatar"
                :src="item.avatar"
              />
              <span v-else>{{ avatarText(item.fullName) }}</span>
            </VAvatar>
            <div class="d-flex flex-column">
              <h6 class="text-base">
                <RouterLink
                  :to="{ name: 'apps-user-view-id', params: { id: item.id } }"
                  class="font-weight-medium text-link"
                >
                  {{ item.fullName }}
                </RouterLink>
              </h6>
              <div class="text-sm">
                {{ item.email }}
              </div>
            </div>
          </div>
        </template>

        <!-- Department -->
        <template #item.department="{ item }">
          <div class="d-flex flex-column">
            <div class="text-body-1 text-high-emphasis">
              {{ item.department || 'N/A' }}
            </div>
          </div>
        </template>

        <!-- Role -->
        <template #item.role="{ item }">
          <div class="d-flex align-center gap-x-2">
            <VIcon
              :size="20"
              :icon="resolveUserRoleVariant(item.role).icon"
              :color="resolveUserRoleVariant(item.role).color"
            />

            <div class="text-capitalize text-high-emphasis text-body-1">
              {{ item.role }}
            </div>
          </div>
        </template>

        <!-- Status -->
        <template #item.status="{ item }">
          <VChip
            :color="resolveUserStatusVariant(item.status)"
            size="small"
            label
            class="text-capitalize"
          >
            {{ item.status }}
          </VChip>
        </template>

        <!-- Actions -->
        <template #item.actions="{ item }">
          <VBtn
            icon
            variant="text"
            color="medium-emphasis"
            @click="openEditUserDrawer(item.id)"
          >
            <VIcon icon="bx-pencil" />
          </VBtn>
          <VBtn
            icon
            variant="text"
            color="medium-emphasis"
            @click="openResetPasswordModal(item)"
          >
            <VIcon icon="bx-lock" />
          </VBtn>
          <VBtn
            icon
            variant="text"
            color="warning"
            @click="openDeleteModal(item)"
          >
            <VIcon icon="bx-trash" />
          </VBtn>
        </template>

        <!-- Pagination -->
        <template #bottom>
          <TablePagination
            v-model:page="page"
            :items-per-page="itemsPerPage"
            :total-items="totalUsers"
            :showing-text="t('users.showing', { from: paginationMeta.from, to: paginationMeta.to, total: paginationMeta.total })"
          />
        </template>
      </VDataTableServer>

      <!-- SECTION -->
    </VCard>
    <!-- 👉 Add New User -->
    <AddNewUserDrawer
      v-model:isDrawerOpen="isAddNewUserDrawerVisible"
      @user-data="addNewUser"
    />

    <!-- 👉 Edit User -->
    <EditUserDrawer
      v-model:isDrawerOpen="isEditUserDrawerVisible"
      :user-id="selectedUserId"
      @user-updated="fetchUsers"
    />

    <!-- Reset Password Modal -->
    <VDialog
      v-model="isResetPasswordModalVisible"
      max-width="500"
    >
      <VCard>
        <VCardTitle class="text-h5 pa-6">
          Reset Password ...
        </VCardTitle>

        <VCardText class="pa-6">
          <VAlert
            v-if="resetError"
            color="error"
            variant="tonal"
            class="mb-4"
          >
            {{ resetError }}
          </VAlert>

          <p class="mb-4">
            Are you sure you want to reset the password for <strong>{{ selectedUserForReset?.name }}</strong> ({{ selectedUserForReset?.email }})?
          </p>

          <p class="mb-4 text-warning">
            This will generate a new reset code that can be used to set a new password. The user will need to use this code to reset their password.
          </p>

          <div v-if="resetCode" class="mb-4">
            <VAlert
              color="info"
              variant="tonal"
              class="mt-4"
            >
              <template #prepend>
                <VIcon icon="bx-info-circle" />
              </template>
              <p class="mb-2">Instructions for the user:</p>
              <ol class="mb-0">
                <li class="mt-2">
                  <div class="d-flex align-center gap-2">
                    <VTextField
                      :model-value="resetPasswordUrl"
                      readonly
                      variant="outlined"
                      density="compact"
                      class="flex-grow-1"
                      label="Direct Reset Password Link"
                    />
                    <VBtn
                      icon
                      variant="tonal"
                      @click="copyInstructions"
                      title="Copy complete instructions"
                    >
                      <VIcon icon="bx-copy" />
                    </VBtn>
                  </div>
                </li>
                <li class="mt-2">The reset code will expire in 60 minutes</li>
              </ol>
            </VAlert>
          </div>
        </VCardText>

        <VCardActions class="pa-6 pt-0">
          <VSpacer />
          <VBtn
            variant="tonal"
            color="secondary"
            @click="isResetPasswordModalVisible = false"
          >
            Cancel
          </VBtn>
          <VBtn
            color="primary"
            :loading="isGeneratingReset"
            :disabled="!!resetCode"
            @click="generateResetCode(selectedUserForReset?.id!)"
          >
            {{ resetCode ? 'Reset Code Generated' : 'Generate Reset Code' }}
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>

    <!-- Delete Confirmation Modal -->
    <VDialog
      v-model="isDeleteModalVisible"
      max-width="500"
    >
      <VCard>
        <VCardTitle class="text-h5 pa-6">
          Delete User
        </VCardTitle>

        <VCardText class="pa-6">
          <VAlert
            color="warning"
            variant="tonal"
            class="mb-4"
          >
            <template #prepend>
              <VIcon icon="bx-error" />
            </template>
            Warning: This action cannot be undone.
          </VAlert>

          <p class="mb-4">
            Are you sure you want to delete <strong>{{ selectedUserForDelete?.name }}</strong> ({{ selectedUserForDelete?.email }})?
          </p>

          <p class="text-warning mb-4">
            This will permanently remove the user and all associated data from the system.
          </p>
        </VCardText>

        <VCardActions class="pa-6 pt-0">
          <VSpacer />
          <VBtn
            variant="tonal"
            color="secondary"
            @click="isDeleteModalVisible = false"
          >
            Cancel
          </VBtn>
          <VBtn
            color="error"
            @click="confirmDelete"
          >
            Delete User
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </section>
</template>
