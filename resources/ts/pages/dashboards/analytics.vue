<script setup lang="ts">
import { isToday, parseISO } from 'date-fns';
import { computed, onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';
import { VBtn, VCard, VCardText, VCol, VDivider, VRow } from 'vuetify/components'; // Explicit imports

// Define interface for message summary data (same as in email index.vue)
interface MessageSummary {
  id: number;
  due_date: string | null;
  task_status: 'new' | 'in_process' | 'completed' | null;
}

// Ref for storing summary data of ALL user messages
const allUserMessagesSummary = ref<MessageSummary[]>([]);

// Fetch summary data for ALL user messages (same API as email index.vue)
const fetchAllUserMessagesSummary = async () => {
  try {
    console.log("🔥 Fetching summary data for ALL user messages in dashboard...");
    const response = await $api('/messages/summary'); 
    console.log("✅ Summary Data:", response);
    if (response && Array.isArray(response)) {
      allUserMessagesSummary.value = response;
    } else {
      console.error("❌ Invalid API response format for summary data:", response);
      allUserMessagesSummary.value = [];
    }
  } catch (error) {
    console.error("❌ Error fetching summary data:", error);
    allUserMessagesSummary.value = [];
  }
};

// Computed Properties for Summary Boxes (same as in email index.vue)
const dueTodayCount = computed(() => {
  // Count based on ALL user messages summary
  const count = allUserMessagesSummary.value.filter(m => {
    if (!m.due_date) return false; // Skip if no due date

    try {
      const dueDateObj = parseISO(m.due_date);
      const isDueToday = isToday(dueDateObj);
      return isDueToday;
    } catch (e) {
      console.error(`Error processing due_date ${m.due_date} for message ${m.id}:`, e);
      return false;
    }
  }).length;

  return count;
});

const newTasksCount = computed(() => {
  // Count based on ALL user messages summary with task_status === 'new'
  return allUserMessagesSummary.value.filter(m => m.task_status === 'new').length;
});

onMounted(async () => {
  await fetchAllUserMessagesSummary();
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
            <div class="text-h4">{{ dueTodayCount }}</div>
          </VCardText>
        </VCard>
      </VCol>
      <VCol cols="12" md="6">
        <VCard>
          <VCardText class="text-center">
            <div class="text-subtitle-1">New Tasks</div>
            <div class="text-h4">{{ newTasksCount }}</div>
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
