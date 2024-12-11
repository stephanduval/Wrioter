<script setup lang="ts">
import AddNewCompanyDrawer from '@/views/apps/companies/list/AddNewCompanyDrawer.vue'

// 👉 Store
const searchQuery = ref('')
const selectedRole = ref()
const selectedPlan = ref()
const selectedStatus = ref()

// Data table options
const itemsPerPage = ref(10)
const page = ref(1)
const sortBy = ref()
const orderBy = ref()
const selectedRows = ref([])

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

  console.log('Updated options:', {
    page: page.value,
    itemsPerPage: itemsPerPage.value,
    sortBy: sortBy.value,
    orderBy: orderBy.value,
  })

  // Trigger API fetch
  fetchCompanies()
}

// Headers
const headers = [
  { title: 'Company Name', key: 'companyName' },
  { title: 'Status', key: 'status' },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' },
]

console.log('users Page loaded')

// 👉 Fetching companies
const { data: companiesData, execute: fetchCompanies } = useApi(() => {
  const params = new URLSearchParams({
    page: String(page.value),
    itemsPerPage: String(itemsPerPage.value),
  }).toString()

  console.log('Fetching from:', `/paginatedCompanies?${params}`)

  return `/paginatedCompanies?${params}`
}, {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
  },
  credentials: 'include',
  onResponse: ({ response }) => {
    console.log('API Response:', response._data)
  },
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

// Watch for changes in companiesData to update pagination
watch(companiesData, data => {
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
  [searchQuery, selectedRole, selectedPlan, selectedStatus, itemsPerPage, page, sortBy, orderBy],
  () => {
    fetchCompanies()
  },
)

const companies = computed(() => companiesData.value?.data || [])
const totalCompanies = computed(() => companiesData.value?.total || 0)

onMounted(async () => {
  try {
    console.log('Fetching companies...')
    await fetchCompanies()
    console.log('Companies fetched:', companiesData.value)
  }
  catch (error) {
    console.error('Error fetching companies:', error)
  }
})

const resolveUserStatusVariant = (status: string) => {
  if (!status)
    return 'secondary'

  switch (status.toLowerCase()) {
    case 'pending':
      return 'warning'
  case 'active':
      return 'success'
  case 'inactive':
      return 'secondary'
  default:
      return 'secondary'
  }
}

const isAddNewCompanyDrawerVisible = ref(false)

// 👉 Add new user
const addNewUser = async (userData: any) => {
  await $api('/apps/users', {
    method: 'POST',
    body: userData,
  })

  // Refetch User
  fetchUsers()
}

// 👉 Delete user
const deleteCompany = async (id: number) => {
  await $api(`/companies/${id}`, {
    method: 'DELETE',
  })

  // Remove from selectedRows
  const index = selectedRows.value.findIndex(row => row === id)
  if (index !== -1)
    selectedRows.value.splice(index, 1)

  // Refetch companies
  fetchCompanies()
}

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
  fetchCompanies()
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
    fetchCompanies()
  }
}
</script>

<template>
  <section>
    <VCard class="mb-6">
      <VDivider />

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

          <!--
            👉 Export button
            <VBtn
            variant="tonal"
            color="secondary"
            prepend-icon="bx-export"
            >
            Export
            </VBtn>
          -->

          <!-- 👉 Add user button -->
          <VBtn
            prepend-icon="bx-plus"
            @click="isAddNewCompanyDrawerVisible = true"
          >
            Add New Company
          </VBtn>
        </div>
      </VCardText>
      <VDivider />

      <!-- SECTION datatable -->
      <VDataTableServer
        v-model:items-per-page="itemsPerPage"
        v-model:model-value="selectedRows"
        v-model:page="page"
        :items="companies"
        item-value="id"
        :items-length="totalCompanies"
        :headers="headers"
        class="text-no-wrap"
        show-select
        @update:options="updateOptions"
      >
        <!-- Company -->
        <template #item.companyName="{ item }">
          <h6 class="text-base">
            {{ item.companyName }}
          </h6>
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
          <IconBtn @click="deleteCompany(item.id)">
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

        <!-- pagination -->
        <template #bottom>
          <TablePagination
            v-model:page="page"
            :items-per-page="itemsPerPage"
            :total-items="totalCompanies"
          />
        </template>
      </VDataTableServer>
      <!-- SECTION -->
    </VCard>
    <!-- 👉 Add New User -->
    <AddNewCompanyDrawer
      v-model:isDrawerOpen="isAddNewCompanyDrawerVisible"
      @user-data="addNewUser"
    />
  </section>
</template>
