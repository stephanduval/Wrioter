<script setup lang="ts">
import AddNewUserDrawer from '@/views/apps/user/list/AddNewUserDrawer.vue'
import type { UserProperties } from '@db/apps/users/types'

// 👉 Store
const searchQuery = ref('')
const selectedRole = ref()
// const selectedPlan = ref() // Removed
// const selectedStatus = ref() // Removed

// Data table options
const itemsPerPage = ref(10)
const page = ref(1)
const sortBy = ref()
const orderBy = ref()
const selectedRows = ref([])

// Update data table options
const updateOptions = (options: any) => {
  sortBy.value = options.sortBy[0]?.key
  orderBy.value = options.sortBy[0]?.order
}

// Headers (Assuming you uncommented and fixed this, otherwise the table won't show headers)
/*
const headers = [
  { title: 'User', key: 'user' },
  { title: 'Company', key: 'company' },
  { title: 'Role', key: 'role' },
  { title: 'Actions', key: 'actions', sortable: false },
]
*/
// If you prefer no headers, keep the above commented out.

// 👉 Fetching users
// Update API call to remove plan and status query parameters
const { data: usersData, execute: fetchUsers } = await useApi<any>(createUrl('/api/users', { // Ensure API path is correct
  query: {
    q: searchQuery,
    // status: selectedStatus, // Removed
    // plan: selectedPlan, // Removed
    role: selectedRole, // Keep role filter
    itemsPerPage,
    page,
    sortBy,
    orderBy,
  },
}))

// Derive users from the 'data' property of the response
const users = computed((): UserProperties[] => usersData.value?.data || [])
const totalUsers = computed(() => usersData.value?.total || 0)

// 👉 Dynamic roles for filter dropdown
// NOTE: This derives roles from the *currently fetched* users.
// For a complete list, ideally fetch all roles from a dedicated API endpoint.
const availableRoles = computed(() => {
  if (!usersData.value?.all_roles) { // Check if backend provides a dedicated list first
     // Fallback: derive from fetched user data
     const rolesFromUsers = users.value.map(user => user.role).filter(role => role && role !== 'N/A');
     const uniqueRoles = [...new Set(rolesFromUsers)];
     return uniqueRoles.map(role => ({ title: role, value: role }));
  }
  // If backend provides `all_roles` (e.g., ['Admin', 'Manager', ...])
  return usersData.value.all_roles.map((role: string) => ({ title: role, value: role }));
})


// 👉 search filters for roles (Static list removed, using availableRoles now)
// const roles = [ ... ] // Removed

// 👉 search filters for plans (Removed)
// const plans = [ ... ] // Removed

const resolveUserRoleVariant = (role: string) => {
  const roleString = String(role || '');
  const roleLowerCase = roleString.toLowerCase();

  if (roleLowerCase === 'subscriber')
    return { color: 'success', icon: 'bx-user' }
  if (roleLowerCase === 'admin')
    return { color: 'primary', icon: 'bx-crown' }
  if (roleLowerCase === 'manager')
    return { color: 'info', icon: 'bx-pie-chart-alt' }
  if (roleLowerCase === 'editor')
    return { color: 'warning', icon: 'bx-edit' }
  if (roleLowerCase === 'author')
    return { color: 'error', icon: 'bx-desktop' }
  if (roleLowerCase === 'client')
    return { color: 'secondary', icon: 'bx-briefcase' }
  if (roleLowerCase === 'user')
    return { color: 'light', icon: 'bx-user-circle' }
  if (roleLowerCase === 'auth')
    return { color: 'dark', icon: 'bx-shield-quarter'}

  return { color: 'grey', icon: 'bx-help-circle' }
}

const isAddNewUserDrawerVisible = ref(false)

// 👉 Add new user
const addNewUser = async (userData: UserProperties) => {
  await $api('/apps/users', {
    method: 'POST',
    body: userData,
  })

  // refetch User
  fetchUsers()
}

// 👉 Delete user
const deleteUser = async (id: number) => {
  await $api(`/apps/users/${id}`, {
    method: 'DELETE',
  })

  // Delete from selectedRows
  const index = selectedRows.value.findIndex(row => row === id)
  if (index !== -1)
    selectedRows.value.splice(index, 1)

  // refetch User
  // TODO: Make this async
  fetchUsers()
}
</script>

<template>
  <section>
    <VCard>
      <VCardText class="d-flex flex-md-row flex-column justify-space-between gap-4">
        <AppSelect
          :model-value="itemsPerPage"
          :items="[
            { value: 10, title: '10' },
            { value: 25, title: '25' },
            { value: 50, title: '50' },
            { value: 100, title: '100' },
            { value: -1, title: 'All' },
          ]"
          style="inline-size: 5.5rem;"
          @update:model-value="itemsPerPage = parseInt($event, 10)"
        />

        <div class="d-flex align-start flex-column flex-sm-row flex-wrap gap-4">
          <!-- 👉 Search  -->
          <div style="inline-size: 15.625rem;">
            <AppTextField
              v-model="searchQuery"
              placeholder="Search User"
            />
          </div>

          <!-- 👉 Select role -->
          <div style="inline-size: 9.375rem;">
            <AppSelect
              v-model="selectedRole"
              placeholder="Select Role"
              :items="availableRoles"
              clearable
              clear-icon="bx-x"
            />
          </div>

          <!-- 👉 Select Plan (Removed) -->
          <!--
          <div style="inline-size: 9.375rem;">
            <AppSelect
              v-model="selectedPlan"
              placeholder="Select Plan"
              :items="plans"
              clearable
              clear-icon="bx-x"
            />
          </div>
           -->
           <!-- Select Status filter was likely implicit via the API param, no UI element to remove unless added previously -->
        </div>
      </VCardText>

      <VDivider />

      <!-- SECTION datatable -->
      <VDataTableServer
        v-model:items-per-page="itemsPerPage"
        v-model:model-value="selectedRows"
        v-model:page="page"
        :items-per-page-options="[
          { value: 10, title: '10' },
          { value: 20, title: '20' },
          { value: 50, title: '50' },
          { value: -1, title: '$vuetify.dataFooter.itemsPerPageAll' },
        ]"
        :items="users"
        :items-length="totalUsers"
        :headers="headers" <!-- This will use the headers defined (or commented out) above -->
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

        <!-- 👉 Company -->
        <template #item.company="{ item }">
          <div class="text-body-1 text-high-emphasis text-capitalize">
            {{ item.company }}
          </div>
        </template>

        <!-- 👉 Role -->
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

        <!-- Actions -->
        <template #item.actions="{ item }">
          <IconBtn @click="deleteUser(item.id)">
            <VIcon icon="bx-trash" />
          </IconBtn>

          <IconBtn>
            <VIcon icon="bx-show" />
          </IconBtn>

          <VBtn
            icon
            variant="text"
            color="medium-emphasis"
          >
            <VIcon icon="bx-dots-vertical-rounded" />
            <VMenu activator="parent">
              <VList>
                <VListItem :to="{ name: 'apps-user-view-id', params: { id: item.id } }">
                  <template #prepend>
                    <VIcon icon="bx-show" />
                  </template>

                  <VListItemTitle>View</VListItemTitle>
                </VListItem>

                <VListItem link>
                  <template #prepend>
                    <VIcon icon="bx-pencil" />
                  </template>
                  <VListItemTitle>Edit</VListItemTitle>
                </VListItem>
              </VList>
            </VMenu>
          </VBtn>
        </template>

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
  </section>
</template>

<style lang="scss">
.text-capitalize {
  text-transform: capitalize;
}

.user-list-name:not(:hover) {
  color: rgba(var(--v-theme-on-background), var(--v-medium-emphasis-opacity));
}
</style>
