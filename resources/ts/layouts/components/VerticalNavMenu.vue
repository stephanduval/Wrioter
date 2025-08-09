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

// State for manuscripts dropdown
const manuscripts = ref<Manuscript[]>([])
const loadingManuscripts = ref(true)

// Fetch manuscripts for dropdown
const fetchManuscripts = async () => {
  try {
    loadingManuscripts.value = true
    const accessToken = localStorage.getItem('accessToken')
    
    if (!accessToken) {
      console.warn('No access token found, skipping manuscript fetch')
      return
    }
    
    const response = await fetch('/api/manuscripts', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json'
      }
    })
    
    if (!response.ok) {
      throw new Error(`Failed to fetch manuscripts: ${response.status}`)
    }
    
    const data = await response.json()
    manuscripts.value = data
    console.log('📚 Loaded manuscripts for dropdown:', manuscripts.value.length)
  } catch (error) {
    console.error('Error fetching manuscripts:', error)
  } finally {
    loadingManuscripts.value = false
  }
}

// Fetch manuscripts on mount
onMounted(() => {
  fetchManuscripts()
})

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
      
      // Add manuscripts as children to Select Manuscript item
      if (item.title === 'menu.selectManuscript') {
        const manuscriptChildren: MenuItem[] = []
        
        if (!loadingManuscripts.value && manuscripts.value.length > 0) {
          manuscripts.value.forEach(manuscript => {
            manuscriptChildren.push({
              title: manuscript.title,
              icon: { icon: manuscript.manuscript_type === 'scrivener' ? 'bx-import' : 'bx-book' },
              to: `/manuscripts/${manuscript.id}`,
              action: 'read',
              subject: 'manuscripts'
            })
          })
        } else if (loadingManuscripts.value) {
          manuscriptChildren.push({
            title: 'Loading manuscripts...',
            icon: { icon: 'bx-loader-alt' },
            action: 'read',
            subject: 'manuscripts'
          })
        } else {
          manuscriptChildren.push({
            title: 'No manuscripts found',
            icon: { icon: 'bx-info-circle' },
            action: 'read',
            subject: 'manuscripts'
          })
        }
        
        translatedItem.children = manuscriptChildren
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
    if (isValid && item.title === 'Select Manuscript') {
      console.log('=== SELECT MANUSCRIPT ITEM FOUND IN FINAL MENU ===', item)
    }
    return isValid
  }) // Type guard to remove null items
})

// Debug final menu (only show manuscript count)
setTimeout(() => {
  const selectManuscriptItem = translatedMenu.value.find(item => 
    item.title === 'Select Manuscript' || item.title?.includes('Select')
  )
  if (selectManuscriptItem && selectManuscriptItem.children) {
    console.log(`📚 Select Manuscript dropdown loaded with ${selectManuscriptItem.children.length} items`)
  }
}, 1000)
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
        <!-- REGULAR MENU ITEMS (no custom flag) -->
        <VListItem
          v-if="!item.children && !item.custom"
          :title="item.title"
          :to="item.to"
          :prepend-icon="item.icon?.icon"
        />
        
        <!-- GROUP MENU ITEMS WITH CHILDREN (including Select Manuscript with manuscripts dropdown) -->
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
        
        <!-- CUSTOM MENU ITEMS (clickable, no navigation) - fallback for items without children -->
        <VListItem
          v-else-if="item.custom"
          :title="item.title"
          :prepend-icon="item.icon?.icon"
          @click.stop="handleMenuItemClick($event, item)"
          style="cursor: pointer;"
          data-test-id="custom-menu-item"
        />
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
