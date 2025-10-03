<template>
  <VBottomSheet v-model="model" max-height="70vh">
    <VCard>
      <VCardTitle class="text-center pb-1">
        <span class="text-subtitle-1">Actions</span>
        <VBtn
          icon="bx-x"
          size="x-small"
          variant="text"
          class="position-absolute"
          style="right: 8px; top: 8px"
          @click="model = false"
        />
      </VCardTitle>
      <VDivider />
      <VList density="comfortable">
        <template v-for="item in visibleItems" :key="item.id || `separator-${Math.random()}`">
          <VDivider v-if="item.separator" class="my-1" />
          <VListItem
            v-else
            :disabled="isDisabled(item)"
            @click="handleClick(item)"
            :class="{ 'text-error': item.danger }"
          >
            <template #prepend>
              <VIcon
                :icon="item.icon"
                :color="item.danger ? 'error' : undefined"
                size="20"
              />
            </template>
            <VListItemTitle>{{ item.label }}</VListItemTitle>
            <template v-if="item.children" #append>
              <VIcon icon="bx-chevron-right" size="18" />
            </template>
          </VListItem>
        </template>
      </VList>
    </VCard>
  </VBottomSheet>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { MenuItem } from '@/composables/useContextMenu'

interface Props {
  modelValue: boolean
  items?: MenuItem[]
}

const props = defineProps<Props>()
const emit = defineEmits(['update:modelValue', 'close', 'select'])

const model = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const visibleItems = computed(() =>
  props.items?.filter(item => {
    if (typeof item.hidden === 'function') {
      return !item.hidden()
    }
    return !item.hidden
  }) || []
)

const isDisabled = (item: MenuItem) =>
  typeof item.disabled === 'function' ? item.disabled() : item.disabled

const handleClick = async (item: MenuItem) => {
  if (!isDisabled(item) && !item.children) {
    try {
      await item.action()
      model.value = false
      emit('close')
    } catch (error) {
      console.error('Error executing menu action:', error)
    }
  } else if (item.children) {
    console.log('Submenu not yet implemented for mobile')
  }
}
</script>

<style scoped lang="scss">
.v-list-item {
  &:active:not(.v-list-item--disabled) {
    background-color: rgb(var(--v-theme-primary) / 12%);
  }
}
</style>