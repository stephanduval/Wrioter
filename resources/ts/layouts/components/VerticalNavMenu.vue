<script setup lang="ts">
import menu from '@/navigation/vertical/Freynet-Gagné-menu'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

// Create a computed property for the translated menu
const translatedMenu = computed(() => {
  return menu.map(item => {
    if ('heading' in item) {
      return { ...item, heading: t(item.heading) }
    }
    if ('title' in item) {
      return { ...item, title: t(item.title) }
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
