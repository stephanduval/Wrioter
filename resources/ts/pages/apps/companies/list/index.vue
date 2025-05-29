<script setup lang="ts">
import AddNewCompanyDrawer from '@/views/apps/companies/list/AddNewCompanyDrawer.vue';
import EditCompanyDrawer from '@/views/apps/companies/list/EditCompanyDrawer.vue';
import TablePagination from '@core/components/TablePagination.vue';
import { computed, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

// 👉 Store
const searchQuery = ref('');
// Removing filter variables
// const selectedRole = ref();
// const selectedPlan = ref();
// const selectedStatus = ref();

// Data table options
const itemsPerPage = ref(10);
const page = ref(1);
const sortBy = ref();
const orderBy = ref();
const selectedRows = ref([]);

const isEditCompanyDrawerVisible = ref(false);
const selectedCompanyId = ref<number | null>(null);

// Drawers visibility state
const isAddNewCompanyDrawerVisible = ref(false);

// Headers
const headers = computed(() => [
  { title: t('headers.companies.name'), key: 'companyName' },
  { title: t('headers.companies.status'), key: 'status' },
  { title: t('headers.companies.actions'), key: 'actions', sortable: false, align: 'end' },
]);

// 👉 Open edit drawer
const openEditCompanyDrawer = (companyId: number) => {
  selectedCompanyId.value = companyId;
  isEditCompanyDrawerVisible.value = true;
};

// Add interface for API response
interface CompanyApiResponse {
  data: Array<{
    id: number
    companyName: string
  }>
  total: number
  current_page: number
  per_page: number
  last_page: number
  from: number
  to: number
}

// 👉 Fetching companies
const { data: companiesData, execute: fetchCompanies } = useApi<CompanyApiResponse>(() => {
  const params = new URLSearchParams()
  params.append('page', String(page.value))
  params.append('itemsPerPage', itemsPerPage.value === -1 ? 'all' : String(itemsPerPage.value))
  if (searchQuery.value)
    params.append('q', searchQuery.value)

  const token = localStorage.getItem('accessToken')
  console.log('Fetching companies with params:', {
    page: page.value,
    itemsPerPage: itemsPerPage.value === -1 ? 'all' : itemsPerPage.value,
    searchQuery: searchQuery.value,
    token: token ? 'Present' : 'Missing',
    url: `/paginatedCompanies?${params.toString()}`,
  })

  return `/paginatedCompanies?${params.toString()}`
})

const companies = computed(() => companiesData.value?.data || []);
const totalCompanies = computed(() => companiesData.value?.total || 0);

// Add pagination metadata ref
const paginationMeta = ref({
  currentPage: 1,
  lastPage: 1,
  total: 0,
  perPage: 10,
  from: 0,
  to: 0,
})

// Watch for changes in companiesData to update pagination
watch(companiesData, (data: CompanyApiResponse | null) => {
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

// Handle Add Company Result
const handleCompanyData = async (response: { success: boolean; message?: string; error?: string; company?: any }) => {
  if (!response.success) {
    // Handle error case - you might want to show a toast notification here
    console.error('Error adding company:', response.error)
    return
  }

  try {
    // Close the drawer
    isAddNewCompanyDrawerVisible.value = false

    // Reset to first page to show the new company
    page.value = 1

    // Refetch companies with updated data
    await fetchCompanies()

    // Optional: Show success message
    // You can add a toast notification here if you have one
  }
  catch (error) {
    console.error('Error refreshing company list:', error)
  }
}

// Add handleCompanyUpdated function to fix linter error
const handleCompanyUpdated = () => {
  fetchCompanies();
}

onMounted(async () => {
  try {
    await fetchCompanies();
  } catch (error) {
    // console.error('Error fetching companies:', error);
  }
});

// Update the watch for search/filter changes
watch(
  [searchQuery, itemsPerPage, page, sortBy, orderBy],
  async () => {
    console.log('Filters changed, fetching companies with:', {
      searchQuery: searchQuery.value,
      itemsPerPage: itemsPerPage.value,
      page: page.value,
      sortBy: sortBy.value,
      orderBy: orderBy.value,
    })
    try {
      await fetchCompanies()
    }
    catch (error) {
      console.error('Error fetching companies after filter change:', error)
    }
  },
)

// Update the handleItemsPerPageChange function
const handleItemsPerPageChange = (value: number) => {
  console.log('Items per page changed:', { oldValue: itemsPerPage.value, newValue: value })
  itemsPerPage.value = Number(value) // Ensure value is treated as a number
  page.value = 1 // Reset to first page when changing items per page
  fetchCompanies()
}

// Update options
const updateOptions = (options: any) => {
  if (options.sortBy?.length) {
    sortBy.value = options.sortBy[0]?.key
    orderBy.value = options.sortBy[0]?.order
  }

  page.value = options.page || 1
  itemsPerPage.value = options.itemsPerPage || 10

  fetchCompanies()
}

// 👉 Delete Company
const deleteCompany = async (id: number) => {
  try {
    const response = await fetch(`/api/companies/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
    })

    if (!response.ok) throw new Error('Failed to delete company.')

    // Refetch companies after deletion
    fetchCompanies()
  } catch (error) {
    // console.error('Error deleting company:', error)
  }
}
</script>

<template>
  <div>
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
                { value: -1, title: 'All' },
              ]"
              :label="t('itemsPerPage')"
              style="inline-size: 6.25rem;"
              @update:model-value="handleItemsPerPageChange"
            />
          </div>
          <VSpacer />

          <div class="app-company-search-filter d-flex align-center flex-wrap gap-4">
            <!-- 👉 Search  -->
            <div style="inline-size: 15.625rem;">
              <AppTextField
                v-model="searchQuery"
                :placeholder="t('companies.search')"
                @update:model-value="() => { page.value = 1; fetchCompanies() }"
              />
            </div>

            <!-- 👉 Add company button -->
            <VBtn
              prepend-icon="bx-plus"
              @click="isAddNewCompanyDrawerVisible = true"
            >
              {{ t('companies.addNew') }}
            </VBtn>
          </div>
        </VCardText>
      </VCard>

      <!-- 👉 Add New Company Drawer -->
      <AddNewCompanyDrawer 
        v-model:isDrawerOpen="isAddNewCompanyDrawerVisible"
        @company-data="handleCompanyData"
      />

      <!-- 👉 Edit Company Drawer -->
      <EditCompanyDrawer
        v-model:isDrawerOpen="isEditCompanyDrawerVisible"
        :company-id="selectedCompanyId"
        @company-updated="handleCompanyUpdated"
      />

      <!-- 👉 Data Table -->
      <VCard class="mb-6">
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
          <!-- Company Name -->
          <template #item.companyName="{ item }">
            <h6 class="text-base">{{ item.companyName }}</h6>
          </template>

          <!-- Actions -->
          <template #item.actions="{ item }">
            <VBtn icon variant="text" color="medium-emphasis" @click="openEditCompanyDrawer(item.id)">
            <VIcon icon="bx-pencil" />
          </VBtn>
            <IconBtn @click="deleteCompany(item.id)">
              <VIcon icon="bx-trash" />
            </IconBtn>
          </template>

          <!-- Pagination -->
          <template #bottom>
            <TablePagination
              v-model:page="page"
              :items-per-page="itemsPerPage"
              :total-items="totalCompanies"
              :showing-text="t('companies.showing', { from: paginationMeta.from, to: paginationMeta.to, total: paginationMeta.total })"
            />
          </template>
        </VDataTableServer>
      </VCard>
    </section>
  </div>
</template>


<!-- <script setup lang="ts">
import { computed, onMounted, ref } from 'vue';

// 👉 Store
const searchQuery = ref('');
const selectedRole = ref();
const selectedPlan = ref();
const selectedStatus = ref();

// Data table options
const itemsPerPage = ref(10);
const page = ref(1);
const sortBy = ref();
const orderBy = ref();
const selectedRows = ref([]);

// Drawer visibility
const isAddNewCompanyDrawerVisible = ref(false); // Controls the drawer visibility

// Fetching companies logic remains the same
const { data: companiesData, execute: fetchCompanies } = useApi(() => {
  const params = new URLSearchParams({
    page: String(page.value),
    itemsPerPage: String(itemsPerPage.value),
  }).toString();

  const token = localStorage.getItem('accessToken');

  return `/paginatedCompanies?${params}`;
}, {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
  },
  credentials: 'include',
});

const companies = computed(() => companiesData.value?.data || []);
const totalCompanies = computed(() => companiesData.value?.total || 0);

onMounted(async () => {
  try {
    await fetchCompanies();
  } catch (error) {
    console.error('Error fetching companies:', error);
  }
});

// Handle table actions
const deleteCompany = async (id: number) => {
  await $api(`/companies/${id}`, {
    method: 'DELETE',
  });

  fetchCompanies();
};
</script>
<template>
  <section>
  -->
    <!-- Add New Company Button -->
   <!-- <VBtn
    prepend-icon="bx-plus"
    @click="isAddNewCompanyDrawerVisible = true"
  >
    Add New Company
  </VBtn>

  <VCard class="mb-6">
    <VDivider />
-->
    <!-- Data Table -->
    <!--
    <VDataTableServer
      v-model:items-per-page="itemsPerPage"
      v-model:model-value="selectedRows"
      v-model:page="page"
      :items="companies"
      item-value="id"
      :items-length="totalCompanies"
      :headers="[
        { title: 'Company Name', key: 'companyName' },
        { title: 'Status', key: 'status' },
        { title: 'Actions', key: 'actions', sortable: false, align: 'end' },
      ]"
      class="text-no-wrap"
      show-select
    >
      <template #item.companyName="{ item }">
        <h6 class="text-base">{{ item.companyName }}</h6>
      </template>

      <template #item.actions="{ item }">
        <VBtn
          icon
          variant="text"
          color="medium-emphasis"
          @click="deleteCompany(item.id)"
        >
          <VIcon icon="bx-trash" />
        </VBtn>
      </template>
    </VDataTableServer>
  </VCard>
-->
  <!-- Add New Company Drawer -->
   <!--
  <AddNewCompanyDrawer
    v-model:isDrawerOpen="isAddNewCompanyDrawerVisible"
  />
</section>
</template>
-->
