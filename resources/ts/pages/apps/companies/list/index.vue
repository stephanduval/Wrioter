<script setup lang="ts">
import AddNewCompanyDrawer from '@/views/apps/companies/list/AddNewCompanyDrawer.vue';
import EditCompanyDrawer from '@/views/apps/companies/list/EditCompanyDrawer.vue';
import { computed, onMounted, ref, watch } from 'vue';

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
const headers = [
  { title: 'Company Name', key: 'companyName' },
  { title: 'Status', key: 'status' },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' },
];

// 👉 Open edit drawer
const openEditCompanyDrawer = (companyId: number) => {
  selectedCompanyId.value = companyId;
  isEditCompanyDrawerVisible.value = true;
};

// 👉 Fetching companies
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

// Handle Add Company Result
const handleCompanyData = (data: any) => {
  if (data.success) {
    console.log('Company added:', data.data)
    // Refetch companies or update the list
    fetchCompanies();

  } else if (data.error) {
    console.error(data.error)
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
    console.error('Error fetching companies:', error);
  }
});

watch(
  // Removed selectedRole, selectedPlan, selectedStatus from the watch array
  [searchQuery, itemsPerPage, page, sortBy, orderBy],
  () => {
    fetchCompanies();
  }
);

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

    console.log(`Company ${id} deleted successfully.`)

    // Refetch companies after deletion
    fetchCompanies()
  } catch (error) {
    console.error('Error deleting company:', error)
  }
}

// 👉 Update options
const updateOptions = (options: any) => {
  if (options.sortBy?.length) {
    sortBy.value = options.sortBy[0]?.key;
    orderBy.value = options.sortBy[0]?.order;
  }

  page.value = options.page || 1;
  itemsPerPage.value = options.itemsPerPage || 10;

  fetchCompanies();
};
</script>

<template>
  <section>
    <!-- Removed the Filters Card -->
    
    <VCard class="mb-6">
      <!-- Keeping just the search and actions section -->
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
            <AppTextField v-model="searchQuery" placeholder="Search Company" />
          </div>

          <!-- 👉 Add New Company Button -->
          <VBtn
            prepend-icon="bx-plus"
            @click="isAddNewCompanyDrawerVisible = true"
          >
            Add New Company
          </VBtn>
        </div>
      </VCardText>
    </VCard>

    <!-- 👉 Add New Company Drawer -->
    <AddNewCompanyDrawer v-model:isDrawerOpen="isAddNewCompanyDrawerVisible" />

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
      </VDataTableServer>
    </VCard>
  </section>
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
