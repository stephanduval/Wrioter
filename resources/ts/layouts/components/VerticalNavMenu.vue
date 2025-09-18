<script setup lang="ts">
import DynamicManuscriptMenu from '@/components/DynamicManuscriptMenu.vue'
import ManuscriptViewMenu from '@/components/ManuscriptViewMenu.vue'
import ManuscriptSelectionDrawer from '@/components/dialogs/ManuscriptSelectionDrawer.vue'
import menu from '@/navigation/vertical/Freynet-Gagné-menu'
import { can } from '@layouts/plugins/casl'
import { computed, ref, onMounted } from 'vue'
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

// State for manuscript selection drawer
const isManuscriptDrawerOpen = ref(false)

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
const handleMenuItemClick = (event: Event, item: MenuItem) => {
  console.log('🖱️ CLICK DETECTED:', item.title)
  event.preventDefault()
  event.stopPropagation()
  
  if (item.custom && (item.title === 'Select Manuscript' || item.title === 'menu.selectManuscript')) {
    console.log('🚀 Opening manuscript drawer!')
    isManuscriptDrawerOpen.value = true
  } else {
    console.log('❌ Click not handled for:', item.title)
  }
}

// Create a computed property for the translated menu with permission checks
const translatedMenu = computed(() => {
  return menu.map((item, index) => {
    // Type guard for heading items
    if (item && 'heading' in item && item.heading) {
      return { ...item, heading: t(item.heading) }
    }

    // Type guard for menu items with title
    if (item && 'title' in item && item.title) {
      const hasPermission = can(item.action, item.subject)
      
      // Skip if user doesn't have permission (BUT BYPASS FOR SELECT MANUSCRIPT)
      if (!hasPermission && item.title !== 'menu.selectManuscript') {
        return null
      }

      const translatedItem: MenuItem = {
        ...item,
        title: t(item.title),
        custom: item.custom // Explicitly preserve custom flag
      }
      
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
    console.log(`  -> Item skipped (no title):`, item)
    return null
  }).filter((item): item is MenuItem => {
    const isValid = item !== null
    if (isValid && (item.title === 'Select Manuscript' || item.title === 'menu.selectManuscript')) {
      console.log('=== SELECT MANUSCRIPT ITEM FOUND IN FINAL MENU ===', {
        title: item.title,
        custom: item.custom,
        children: item.children,
        to: item.to,
        fullItem: item
      })
    }
    return isValid
  }) // Type guard to remove null items
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
        <!-- Debug: Log item properties -->
        {{ item.title === 'Select Manuscript' ? console.log('TEMPLATE: Select Manuscript item:', { custom: item.custom, children: item.children, to: item.to }) : null }}

        <!-- CUSTOM MENU ITEMS (clickable, no navigation) - CHECK FIRST -->
        <VListItem
          v-if="item.custom && !item.children"
          :title="item.title"
          :prepend-icon="item.icon?.icon"
          @click.stop="handleMenuItemClick($event, item)"
          style="cursor: pointer;"
          data-test-id="custom-menu-item"
        />

        <!-- REGULAR MENU ITEMS (no custom flag, no children) -->
        <VListItem
          v-else-if="!item.children && !item.custom"
          :title="item.title"
          :to="item.to"
          :prepend-icon="item.icon?.icon"
        />

        <!-- GROUP MENU ITEMS WITH CHILDREN -->
        <VListItemGroup
          v-else-if="item.children && item.children.length > 0"
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
            :prepend-icon="child.icon?.icon"
            class="pl-6"
          />
        </VListItemGroup>
      </template>
    </template>

    <!-- Dynamic Manuscript Menu (Original functionality) -->
    <DynamicManuscriptMenu />

    <!-- Manuscript View Menu (New functionality) -->
    <ManuscriptViewMenu />
  </VList>

  <!-- Manuscript Selection Drawer -->
  <ManuscriptSelectionDrawer
    :is-drawer-open="isManuscriptDrawerOpen"
    @update:is-drawer-open="isManuscriptDrawerOpen = $event"
    @manuscript-selected="handleManuscriptSelected"
  />
</template> 
