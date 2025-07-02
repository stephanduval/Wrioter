<script setup lang="ts">
import DynamicManuscriptMenu from '@/components/DynamicManuscriptMenu.vue'
import ManuscriptViewMenu from '@/components/ManuscriptViewMenu.vue'
import ManuscriptSelectionDialog from '@/components/dialogs/ManuscriptSelectionDialog.vue'
import menu from '@/navigation/vertical/Freynet-Gagné-menu'
import { can } from '@layouts/plugins/casl'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useManuscriptStore } from '@/stores/manuscript'

interface MenuItem {
  heading?: string
  title?: string
  icon?: { icon: string }
  to?: string
  action?: string
  subject?: string
  children?: MenuItem[]
  custom?: boolean
}

interface Manuscript {
  id: number
  title: string
  manuscript_type: 'standard' | 'scrivener'
  created_at: string
  updated_at: string
  description?: string
}

const { t } = useI18n()
const router = useRouter()
const manuscriptStore = useManuscriptStore()

// State for manuscript selection dialog
const isManuscriptDialogVisible = ref(false)

// Handle manuscript selection
const handleManuscriptSelected = async (manuscript: Manuscript) => {
  // Store the selected manuscript
  manuscriptStore.selectManuscript(manuscript)
  
  // Fetch manuscript with items for navigation
  await manuscriptStore.fetchManuscript(manuscript.id, true)
  
  // Navigate to manuscript view
  router.push(`/manuscripts/${manuscript.id}`)
}

// Handle custom menu item clicks
const handleMenuItemClick = (item: MenuItem) => {
  if (item.custom && item.title === 'menu.selectManuscript') {
    isManuscriptDialogVisible.value = true
  }
}

// Create a computed property for the translated menu with permission checks
const translatedMenu = computed(() => {
  return menu.map(item => {
    // Type guard for heading items
    if (item && 'heading' in item && item.heading) {
      return { ...item, heading: t(item.heading) }
    }

    // Type guard for menu items with title
    if (item && 'title' in item && item.title) {
      // Skip if user doesn't have permission
      if (!can(item.action, item.subject)) {
        return null
      }

      const translatedItem: MenuItem = { ...item, title: t(item.title) }
      
      // Handle children with permission checks
      if ('children' in item && Array.isArray(item.children)) {
        const visibleChildren = (item.children as MenuItem[])
          .filter((child: MenuItem) => can(child.action, child.subject))
          .map((child: MenuItem) => ({
            ...child,
            title: child.title ? t(child.title) : undefined
          }))
        
        // Only show parent if it has visible children
        if (visibleChildren.length > 0) {
          translatedItem.children = visibleChildren
        } else {
          return null
        }
      }
      
      return translatedItem
    }
    return null
  }).filter((item): item is MenuItem => item !== null) // Type guard to remove null items
})
</script>

<template>
  <VList>
    <template v-for="(item, index) in translatedMenu" :key="index">
      <VListItem
        v-if="'heading' in item"
        :title="item.heading"
        class="text-uppercase text-caption font-weight-medium"
      />
      <template v-else>
        <VListItem
          v-if="!item.children"
          :title="item.title"
          :to="!item.custom ? item.to : undefined"
          :prepend-icon="item.icon?.icon"
          @click="item.custom ? handleMenuItemClick(item) : undefined"
        />
        <VListItemGroup
          v-else
          :value="false"
        >
          <VListItem
            :title="item.title"
            :prepend-icon="item.icon?.icon"
          >
            <template #append>
              <VIcon
                icon="bx-chevron-down"
                size="small"
              />
            </template>
          </VListItem>
          <VListItem
            v-for="child in item.children"
            :key="child.title"
            :title="child.title"
            :to="child.to"
            class="pl-4"
          />
        </VListItemGroup>
      </template>
    </template>

    <!-- Dynamic Manuscript Menu (Original functionality) -->
    <DynamicManuscriptMenu />

    <!-- Manuscript View Menu (New functionality) -->
    <ManuscriptViewMenu />
  </VList>

  <!-- Manuscript Selection Dialog -->
  <ManuscriptSelectionDialog
    v-model:is-dialog-visible="isManuscriptDialogVisible"
    @manuscript-selected="handleManuscriptSelected"
  />
</template> 
