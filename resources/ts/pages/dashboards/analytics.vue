<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';
import { VBtn, VCard, VCardText, VCol, VDivider, VRow } from 'vuetify/components'; // Explicit imports

// Placeholder refs for request counts
const requestsDueTodayCount = ref<number>(0)
const newRequestsCount = ref<number>(0)

// Placeholder function to fetch data
// TODO: Implement actual API call to fetch summary data
const fetchRequestSummary = async () => {
  console.log("Fetching request summary data...");
  // Replace with actual API call, e.g.:
  // try {
  //   const response = await $api('/api/requests/summary'); // Example endpoint
  //   requestsDueTodayCount.value = response.dueTodayCount;
  //   newRequestsCount.value = response.newRequestsCount;
  // } catch (error) {
  //   console.error("Error fetching request summary:", error);
  // }
  // Using placeholder values for now:
  requestsDueTodayCount.value = 3; // Placeholder
  newRequestsCount.value = 5; // Placeholder
}

onMounted(() => {
  fetchRequestSummary();
})
</script>

<template>
  <div>
    <!-- Main Title -->
    <h1 class="mb-4 text-h4">Freynet-Gagné Client Portal</h1>

    <!-- Requests Section -->
    <h2 class="mb-3 text-h5">Requests</h2>
    <VRow class="mb-4">
      <VCol cols="12" md="6">
        <VCard>
          <VCardText class="text-center">
            <div class="text-subtitle-1">Requests Due Today</div>
            <div class="text-h4">{{ requestsDueTodayCount }}</div>
          </VCardText>
        </VCard>
      </VCol>
      <VCol cols="12" md="6">
        <VCard>
          <VCardText class="text-center">
            <div class="text-subtitle-1">New Requests</div>
            <div class="text-h4">{{ newRequestsCount }}</div>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <VDivider class="my-6" />

    <!-- Action Cards Section -->
    <VRow>
      <VCol cols="12" md="4">
        <VCard class="text-center" height="100%">
          <VCardText class="d-flex flex-column justify-center align-center fill-height">
            <div class="text-h6 mb-2">New Company</div>
            <RouterLink :to="{ path: '/apps/companies/list', query: { tab: 'new' } }" v-slot="{ navigate }">
              <VBtn @click="navigate">Go to Company Page</VBtn>
            </RouterLink>
          </VCardText>
        </VCard>
      </VCol>
      <VCol cols="12" md="4">
        <VCard class="text-center" height="100%">
          <VCardText class="d-flex flex-column justify-center align-center fill-height">
            <div class="text-h6 mb-2">New User</div>
            <RouterLink :to="{ path: '/apps/user/list', query: { tab: 'new-client' } }" v-slot="{ navigate }">
              <VBtn @click="navigate">Go to User List</VBtn>
            </RouterLink>
          </VCardText>
        </VCard>
      </VCol>
       <VCol cols="12" md="4">
        <VCard class="text-center" height="100%">
          <VCardText class="d-flex flex-column justify-center align-center fill-height">
            <div class="text-h6 mb-2">New Project Request</div>
            <RouterLink :to="{ path: '/apps/email', query: { compose: 'true' } }" v-slot="{ navigate }">
               <VBtn @click="navigate">Start New Request</VBtn>
            </RouterLink>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>
  </div>
</template>

<style lang="scss">
/* Add any specific styles if needed */
.fill-height {
  block-size: 100%;
}
</style>
