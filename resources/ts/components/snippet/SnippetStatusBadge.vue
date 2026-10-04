<template>
  <VChip
    :color="statusConfig.color"
    :variant="statusConfig.variant"
    size="x-small"
    class="snippet-status-badge"
  >
    <VIcon :icon="statusConfig.icon" size="x-small" class="me-1" />
    {{ statusConfig.label }}
  </VChip>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { VChip, VIcon } from 'vuetify/components'

interface Props {
  status: 'active' | 'ghost'
}

const props = defineProps<Props>()

const statusConfig = computed(() => {
  switch (props.status) {
    case 'active':
      return {
        color: 'success',
        variant: 'tonal' as const,
        icon: 'bx-check-circle',
        label: 'Active',
      }
    case 'ghost':
      return {
        color: 'grey',
        variant: 'outlined' as const,
        icon: 'bx-ghost',
        label: 'Ghost',
      }
    default:
      return {
        color: 'grey',
        variant: 'tonal' as const,
        icon: 'bx-question-mark',
        label: 'Unknown',
      }
  }
})
</script>

<style scoped lang="scss">
.snippet-status-badge {
  font-weight: 500;
}
</style>
