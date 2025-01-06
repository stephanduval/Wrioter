<script setup lang="ts">
import AddNewCompanyDrawer from '@/views/apps/companies/list/AddNewCompanyDrawer.vue';
import { computed, onMounted, ref, watch } from 'vue';

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

// Drawers visibility state
const isAddNewCompanyDrawerVisible = ref(false);

// Headers
const headers = [
  { title: 'Company Name', key: 'companyName' },
  { title: 'Status', key: 'status' },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' },
];

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

onMounted(async () => {
  try {
    await fetchCompanies();
  } catch (error) {
    console.error('Error fetching companies:', error);
  }
});

watch(
  [searchQuery, selectedRole, selectedPlan, selectedStatus, itemsPerPage, page, sortBy, orderBy],
  () => {
    fetchCompanies();
  }
);

// 👉 Handle table actions
const deleteCompany = async (id: number) => {
  await $api(`/companies/${id}`, {
    method: 'DELETE',
  });

  fetchCompanies();
};

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
    <!-- 👉 Filters and Actions -->
    <VCard class="mb-6">
      <VCardItem class="pb-4">
        <VCardTitle>Filters</VCardTitle>
      </VCardItem>

      <VCardText>
        <VRow>
          <!-- 👉 Select Role -->
          <VCol cols="12" sm="4">
            <AppSelect
              v-model="selectedRole"
              placeholder="Select Role"
              :items="roles"
              clearable
              clear-icon="bx-x"
            />
          </VCol>
          <!-- 👉 Select Plan -->
          <VCol cols="12" sm="4">
            <AppSelect
              v-model="selectedPlan"
              placeholder="Select Plan"
              :items="plans"
              clearable
              clear-icon="bx-x"
            />
          </VCol>
          <!-- 👉 Select Status -->
          <VCol cols="12" sm="4">
            <AppSelect
              v-model="selectedStatus"
              placeholder="Select Status"
              :items="status"
              clearable
              clear-icon="bx-x"
            />
          </VCol>
        </VRow>
      </VCardText>

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
