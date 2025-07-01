<template>
  <div class="manuscript-raw-files-page">
    <!-- Page Header -->
    <div class="d-flex align-center justify-space-between mb-6">
      <div>
        <h1 class="text-h4 mb-1">Manuscript Raw Files</h1>
        <p class="text-body-1 text-medium-emphasis">
          View and manage raw files imported from Scrivener project
        </p>
      </div>
      
      <VBtn
        color="primary"
        variant="outlined"
        @click="goBack"
      >
        <VIcon icon="bx-arrow-back" class="me-1" />
        Back to Dashboard
      </VBtn>
    </div>

    <!-- Breadcrumbs -->
    <VBreadcrumbs
      :items="breadcrumbs"
      class="pa-0 mb-4"
    >
      <template #divider>
        <VIcon icon="bx-chevron-right" />
      </template>
    </VBreadcrumbs>

    <!-- Main Content -->
    <VCard>
      <VCardText class="pa-6">
        <ManuscriptRawFileViewer 
          v-if="manuscriptId"
          :manuscript-id="manuscriptId"
        />
        
        <VAlert v-else type="error" variant="tonal">
          Invalid manuscript ID provided
        </VAlert>
      </VCardText>
    </VCard>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ManuscriptRawFileViewer from '@/components/ManuscriptRawFileViewer.vue'

const route = useRoute()
const router = useRouter()

// Get manuscript ID from route params
const manuscriptId = computed(() => {
  const id = route.params.id
  return Array.isArray(id) ? parseInt(id[0]) : parseInt(id as string)
})

// Breadcrumbs
const breadcrumbs = computed(() => [
  {
    title: 'Admin Dashboard',
    disabled: false,
    href: '/admin/dashboard'
  },
  {
    title: 'Manuscripts',
    disabled: false,
    href: '/admin/dashboard'
  },
  {
    title: `Raw Files (ID: ${manuscriptId.value})`,
    disabled: true
  }
])

// Navigation
const goBack = () => {
  router.push('/admin/dashboard')
}

// Page title
onMounted(() => {
  document.title = `Raw Files - Manuscript ${manuscriptId.value} | Wrioter Admin`
})
</script>

<style scoped>
.manuscript-raw-files-page {
  padding: 24px;
}

@media (max-width: 960px) {
  .manuscript-raw-files-page {
    padding: 16px;
  }
}
</style>