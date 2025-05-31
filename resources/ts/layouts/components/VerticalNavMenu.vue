<script setup lang="ts">
import menu from '@/navigation/vertical/Freynet-Gagné-menu'
import manuscriptMenu from '@/navigation/vertical/ManuscriptMenu'
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

// Create a computed property for the translated menu
const translatedMenu = computed(() => {
  // Combine both menus
  const combinedMenu: MenuItem[] = [...menu, ...manuscriptMenu]
  
  return combinedMenu.map(item => {
    if ('heading' in item && item.heading) {
      return { ...item, heading: t(item.heading) }
    }
    if ('title' in item && item.title) {
      const translatedItem: MenuItem = { ...item, title: t(item.title) }
      if ('children' in item && item.children) {
        translatedItem.children = item.children.map(child => ({
          ...child,
          title: child.title ? t(child.title) : undefined
        }))
      }
      return translatedItem
    }
    return item
  })
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
      <VListItem
        v-else
        :title="item.title"
        :to="item.to"
        :prepend-icon="item.icon?.icon"
      />
    </template>
  </VList>
</template> 
