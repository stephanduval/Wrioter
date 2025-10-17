<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useManuscriptStore } from '@/stores/manuscript'
import ManuscriptSelectionDialog from '@/components/dialogs/ManuscriptSelectionDialog.vue'

const router = useRouter()
const manuscriptStore = useManuscriptStore()

// State for manuscript selection dialog
const isDialogVisible = ref(false)

// Open the dialog immediately when page loads
onMounted(() => {
  console.log('Select manuscript page loaded - opening dialog')
  isDialogVisible.value = true
})

// Handle manuscript selection
const handleManuscriptSelected = async (manuscript: any) => {
  console.log('Manuscript selected:', manuscript)

  // Store the selected manuscript
  manuscriptStore.selectManuscript(manuscript)

  // Fetch manuscript with items for navigation
  await manuscriptStore.fetchManuscript(manuscript.id, true)

  // Navigate to manuscript view
  router.push(`/manuscripts/${manuscript.id}`)
}

// Handle dialog close - redirect back to previous page or dashboard
const handleDialogClose = () => {
  console.log('Dialog closed - redirecting to dashboard')
  isDialogVisible.value = false
  // Go back to previous page or dashboard
  router.go(-1) || router.push({ name: 'admin-dashboard' })
}
</script>

<template>
  <div>
    <VCard class="text-center pa-8">
      <VCardTitle class="text-h5 mb-4">
        Select Manuscript
      </VCardTitle>
      <VCardText>
        Choose a manuscript to work with from your library.
      </VCardText>

      <VBtn
        color="primary"
        @click="isDialogVisible = true"
      >
        Open Manuscript Selector
      </VBtn>
    </VCard>

    <!-- Manuscript Selection Dialog -->
    <ManuscriptSelectionDialog
      :is-dialog-visible="isDialogVisible"
      @update:is-dialog-visible="handleDialogClose"
      @manuscript-selected="handleManuscriptSelected"
    />
  </div>
</template>