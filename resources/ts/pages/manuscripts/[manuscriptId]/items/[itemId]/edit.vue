<template>
  <div class="item-editor-page">
    <!-- Breadcrumbs -->
    <VBreadcrumbs
      :items="breadcrumbItems"
      class="px-0 py-2"
    >
      <template #prepend>
        <VIcon icon="bx-home" />
      </template>
    </VBreadcrumbs>

    <!-- Main Content -->
    <VCard class="editor-card">
      <ItemEditor
        :manuscript-id="manuscriptId"
        :item-id="itemId"
        :show-synopsis="true"
      />
    </VCard>

    <!-- Floating Action Button for Mobile -->
    <VFab
      class="floating-save-btn d-sm-none"
      location="bottom end"
      color="primary"
      icon="bx-save"
      :disabled="!itemStore.canSave"
      @click="itemStore.saveManually"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter, onBeforeRouteLeave } from 'vue-router'
import { useItemStore } from '@/stores/item'
import { useManuscriptStore } from '@/stores/manuscript'
import ItemEditor from '@/components/manuscript/ItemEditor.vue'

interface RouteParams {
  manuscriptId: string
  itemId: string
}

const route = useRoute()
const router = useRouter()
const itemStore = useItemStore()
const manuscriptStore = useManuscriptStore()

// Extract route parameters
const manuscriptId = computed(() => {
  const id = route.params.manuscriptId as string
  return parseInt(id, 10)
})

const itemId = computed(() => {
  const id = route.params.itemId as string
  return parseInt(id, 10)
})

// Breadcrumb navigation
const breadcrumbItems = computed(() => {
  const manuscriptTitle = manuscriptStore.selectedManuscript?.title || 'Manuscript'
  const itemTitle = itemStore.state.currentItem?.title || 'Item'

  return [
    {
      title: 'Home',
      disabled: false,
      href: '/'
    },
    {
      title: 'Manuscripts',
      disabled: false,
      href: '/manuscripts'
    },
    {
      title: manuscriptTitle,
      disabled: false,
      href: `/manuscripts/${manuscriptId.value}`
    },
    {
      title: itemTitle,
      disabled: true
    }
  ]
})

// Handle browser back/forward navigation
const handlePopState = () => {
  // Save any pending changes before navigating away
  if (itemStore.state.hasUnsavedChanges) {
    itemStore.saveManually()
  }
}

// Handle page beforeunload (user closing tab/refreshing)
const handleBeforeUnload = (event: BeforeUnloadEvent) => {
  if (itemStore.state.hasUnsavedChanges) {
    event.preventDefault()
    event.returnValue = 'You have unsaved changes. Are you sure you want to leave?'
    return event.returnValue
  }
}

onMounted(() => {
  // Validate route parameters
  if (isNaN(manuscriptId.value) || isNaN(itemId.value)) {
    console.error('Invalid route parameters')
    router.push('/manuscripts')
    return
  }

  // Add event listeners
  window.addEventListener('popstate', handlePopState)
  window.addEventListener('beforeunload', handleBeforeUnload)

  console.log('Item editor page mounted for manuscript:', manuscriptId.value, 'item:', itemId.value)
})

onUnmounted(() => {
  // Clean up event listeners
  window.removeEventListener('popstate', handlePopState)
  window.removeEventListener('beforeunload', handleBeforeUnload)

  // Reset item store state
  itemStore.resetState()
})

// Use Vue Router's composition API for navigation guards
onBeforeRouteLeave(async (to, from) => {
  if (itemStore.state.hasUnsavedChanges) {
    const shouldLeave = confirm('You have unsaved changes. Are you sure you want to leave?')
    if (shouldLeave) {
      // Try to save before leaving
      try {
        await itemStore.saveManually()
      } catch (error) {
        console.warn('Failed to save before navigation:', error)
      }
      itemStore.resetState()
      return true
    } else {
      return false
    }
  } else {
    itemStore.resetState()
    return true
  }
})
</script>

<style scoped lang="scss">
.item-editor-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 16px;
  overflow: hidden;
}

.editor-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  margin-top: 8px;
}

.floating-save-btn {
  position: fixed !important;
  bottom: 24px;
  right: 24px;
  z-index: 100;
}

// Responsive adjustments
@media (max-width: 768px) {
  .item-editor-page {
    padding: 8px;
  }
}

// Full height editor on larger screens
@media (min-width: 1200px) {
  .item-editor-page {
    height: calc(100vh - 64px); // Account for nav bar
  }
}
</style>