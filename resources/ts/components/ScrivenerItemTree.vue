<template>
  <div class="scrivener-item-tree">
    <div v-if="items.length === 0" class="text-body-2 text-medium-emphasis pa-4">
      No items found
    </div>
    <div v-else>
      <ScrivenerTreeItem
        v-for="item in rootItems"
        :key="item.id"
        :item="item"
        :children="getChildren(item)"
        :detailed="detailed"
        :level="0"
        :manuscript-items="manuscriptItems"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import ScrivenerTreeItem from './ScrivenerTreeItem.vue'

interface Props {
  items: any[]
  detailed?: boolean
  manuscriptItems?: any[]
}

const props = withDefaults(defineProps<Props>(), {
  detailed: false,
  manuscriptItems: () => []
})

// Computed properties
const rootItems = computed(() => {
  // Items without a parent or with parent not in the current items list
  const itemIds = new Set(props.items.map(item => item.id))
  return props.items.filter(item => {
    return !item.parent_id || !itemIds.has(item.parent_id)
  })
})

// Helper functions
const getChildren = (parentItem: any): any[] => {
  return props.items.filter(item => item.parent_id === parentItem.id)
}
</script>

<style scoped>
.scrivener-item-tree {
  font-family: 'Roboto Mono', monospace;
}
</style>