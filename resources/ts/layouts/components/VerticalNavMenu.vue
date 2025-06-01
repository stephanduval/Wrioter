<script setup lang="ts">
import DynamicManuscriptMenu from '@/components/DynamicManuscriptMenu.vue'
import menu from '@/navigation/vertical/Freynet-Gagné-menu'
import { can } from '@layouts/plugins/casl'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

interface MenuItem {
  heading?: string
  title?: string
  icon?: { icon: string }
  to?: string
  action?: string
  subject?: string
  children?: MenuItem[]
}

const { t } = useI18n()

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
          :to="item.to"
          :prepend-icon="item.icon?.icon"
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

    <!-- Dynamic Manuscript Menu -->
    <DynamicManuscriptMenu />
  </VList>
</template> 
