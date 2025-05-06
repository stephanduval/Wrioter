<script setup lang="ts">
import AddNewUserDrawer from '@/views/apps/user/list/AddNewUserDrawer.vue'
import EditUserDrawer from '@/views/apps/user/list/EditUserDrawer.vue'

import type { UserProperties } from '@db/apps/users/types'

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

// Update data table options
const updateOptions = (options: any) => {
  console.log('Options received:', options)

  // Update sorting
  if (options.sortBy?.length) {
    sortBy.value = options.sortBy[0]?.key
    orderBy.value = options.sortBy[0]?.order
  }

  // Update pagination
  page.value = options.page || 1
  itemsPerPage.value = options.itemsPerPage || 10

  // Trigger API fetch
  fetchUsers()
}

// Headers
const headers = [
  { title: 'User', key: 'user' },
  { title: 'Role', key: 'role' },
  { title: 'Company', key: 'company' },
  // { title: 'Status', key: 'status' },
  { title: 'Actions', key: 'actions', sortable: false },
]


//   GPT FETCH USERCODE START


// GPT CODE END

// 👉 Fetching users

const { data: usersData, execute: fetchUsers } = useApi(() => {
  const params = new URLSearchParams({
    page: String(page.value),
    itemsPerPage: String(itemsPerPage.value),
  }).toString()

  const token = localStorage.getItem('accessToken')
  console.log('Access Token before API call:', token) // Debugging line


  console.log('Access Token:', token)
  console.log('API URL:', `/users?${params}`)

  return `/users?${params}`
}, {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
  },
  credentials: 'include',
})

// Add this to store pagination metadata
const paginationMeta = ref({
  currentPage: 1,
  lastPage: 1,
  total: 0,
  perPage: 10,
  from: 0,
  to: 0,
})

// Watch for changes in usersData to update pagination
watch(usersData, data => {
  if (data) {
    paginationMeta.value = {
      currentPage: data.current_page,
      lastPage: data.last_page,
      total: data.total,
      perPage: data.per_page,
      from: data.from,
      to: data.to,
    }
  }
}, { immediate: true })

watch(
  // Removed filter variables from watch array
  [searchQuery, itemsPerPage, page, sortBy, orderBy],
  () => {
    fetchUsers()
  },
)

const users = computed(() => usersData.value?.data || [])
const totalUsers = computed(() => usersData.value?.total || 0)

onMounted(async () => {
  try {
    console.log('Fetching users...')
    await fetchUsers()
    console.log('Users fetched:', usersData.value)
  }
  catch (error) {
    console.error('Error fetching users:', error)
  }
})

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
const addNewUser = async (userData: UserProperties) => {
  // await $api('/apps/users', {
    await $api('/apps/users', {
    method: 'POST',
    body: userData,
  })

  // Refetch User
  fetchUsers()
}

// 👉 Delete user
const deleteUser = async (id: number) => {
  try {
    const response = await fetch(`/api/users/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
    })

    if (!response.ok)
      throw new Error('Failed to delete user')

    console.log('User deleted successfully.')

    // Refetch users to update the table
    fetchUsers()
  }
  catch (error) {
    console.error('Error deleting user:', error)
  }
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
  console.log('Test API Response:', newData)
}, { immediate: true })

// Call it on mount
onMounted(async () => {
  console.log('Making test API call...')
  await testApiCall()

  // Your existing code...
  fetchUsers()
})

// Update the options handler
const handleOptionsUpdate = (options: any) => {
  console.log('Options received:', options)

  const newOptions = {
    page: options.page || 1,
    itemsPerPage: options.itemsPerPage || 10,
    sortBy: options.sortBy?.[0],
    orderBy: options.sortBy?.[0]?.order,
  }

  console.log('Updated options:', newOptions)

  // Only fetch if page or itemsPerPage changed
  if (page.value !== newOptions.page || itemsPerPage.value !== newOptions.itemsPerPage) {
    page.value = newOptions.page
    itemsPerPage.value = newOptions.itemsPerPage
    fetchUsers()
  }
}

// Open Edit Drawer
const openEditUserDrawer = (userId: number) => {
  selectedUserId.value = userId
  isEditUserDrawerVisible.value = true
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
            :model-value="itemsPerPage"
            :items="[
              { value: 10, title: '10' },
              { value: 25, title: '25' },
              { value: 50, title: '50' },
              { value: 100, title: '100' },
              { value: -1, title: 'All' },
            ]"
            style="inline-size: 6.25rem;"
            @update:model-value="itemsPerPage = parseInt($event, 10)"
          />
        </div>
        <VSpacer />

        <div class="app-user-search-filter d-flex align-center flex-wrap gap-4">
          <!-- 👉 Search  -->
          <div style="inline-size: 15.625rem;">
            <AppTextField
              v-model="searchQuery"
              placeholder="Search User"
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
            Add New User
          </VBtn>
        </div>
      </VCardText>
      <VDivider />

      <!-- SECTION datatable -->
      <VDataTableServer
        v-model:items-per-page="itemsPerPage"
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

        <!-- Company -->
        <template #item.company="{ item }">
          <div class="text-body-1 text-high-emphasis text-capitalize">
            {{ item.company || 'N/A' }}
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
          <IconBtn @click="deleteUser(item.id)">
            <VIcon icon="bx-trash" />
          </IconBtn>

          <VBtn
            icon
            variant="text"
            color="medium-emphasis"
            @click="openEditUserDrawer(item.id)"
          >
            <VIcon icon="bx-pencil" />
          </VBtn>
        </template>

        <!-- Pagination -->
        <template #bottom>
          <TablePagination
            v-model:page="page"
            :items-per-page="itemsPerPage"
            :total-items="totalUsers"
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
  </section>
</template>
