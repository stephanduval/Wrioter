<template>
  <Teleport to="body">
    <div
      v-if="visible"
      class="context-menu"
      :style="menuStyle"
      @click.stop
    >
      <template v-for="item in visibleItems" :key="item.id || `separator-${Math.random()}`">
        <div v-if="item.separator" class="menu-separator" />
        <div
          v-else
          class="menu-item"
          :class="{
            disabled: isDisabled(item),
            'has-children': !!item.children,
            'is-danger': item.danger
          }"
          @click="handleClick(item)"
          @mouseenter="item.children && showSubmenu(item)"
        >
          <VIcon v-if="item.icon" :icon="item.icon" size="small" class="menu-icon" />
          <span class="menu-label">{{ item.label }}</span>
          <VIcon v-if="item.children" icon="bx-chevron-right" size="small" class="menu-chevron" />
        </div>
      </template>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { MenuItem } from '@/composables/useContextMenu'

interface Props {
  visible: boolean
  position: { x: number; y: number }
  items?: MenuItem[]
}

const props = defineProps<Props>()
const emit = defineEmits(['close', 'select'])

const submenuItem = ref<MenuItem | null>(null)

const menuStyle = computed(() => {
  const padding = 10
  const estimatedMenuWidth = Math.max(180, (visibleItems.value.reduce((max, item) => {
    if (item.separator) return max
    return Math.max(max, item.label.length * 8 + 60) // Rough estimate: char width + icon + padding
  }, 180)))

  const estimatedMenuHeight = visibleItems.value.length * 40 + 20 // Rough estimate: item height + padding

  let x = props.position.x + 5 // Small offset from cursor
  let y = props.position.y

  // If menu would go off right edge, position to the left of cursor
  if (x + estimatedMenuWidth > window.innerWidth - padding) {
    x = props.position.x - estimatedMenuWidth - 5
  }

  // If still off screen (very left edge), clamp to screen
  x = Math.max(padding, Math.min(x, window.innerWidth - estimatedMenuWidth - padding))

  // If menu would go off bottom edge, position above cursor
  if (y + estimatedMenuHeight > window.innerHeight - padding) {
    y = props.position.y - estimatedMenuHeight
  }

  // Clamp Y to screen bounds
  y = Math.max(padding, Math.min(y, window.innerHeight - estimatedMenuHeight - padding))

  return {
    left: `${x}px`,
    top: `${y}px`,
    minWidth: `${Math.min(estimatedMenuWidth, 280)}px`
  }
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
      emit('close')
    } catch (error) {
      console.error('Error executing menu action:', error)
    }
  }
}

const showSubmenu = (item: MenuItem) => {
  submenuItem.value = item
}

watch(() => props.visible, (newVal) => {
  if (!newVal) {
    submenuItem.value = null
  }
})
</script>

<style scoped lang="scss">
.context-menu {
  position: fixed;
  background: rgb(var(--v-theme-surface));
  border-radius: 6px;
  box-shadow: 0 3px 14px 0 rgb(0 0 0 / 15%), 0 0 0 1px rgb(0 0 0 / 5%);
  padding: 6px 0;
  min-width: 180px;
  max-width: 280px;
  z-index: 9999;
  animation: fadeIn 0.15s ease-out;

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  .menu-separator {
    height: 1px;
    margin: 6px 0;
    background: rgb(var(--v-theme-on-surface) / 12%);
  }

  .menu-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 14px;
    cursor: pointer;
    transition: background-color 0.15s;
    font-size: 14px;
    color: rgb(var(--v-theme-on-surface));

    &:hover:not(.disabled) {
      background: rgb(var(--v-theme-primary) / 8%);
    }

    &.disabled {
      opacity: 0.5;
      cursor: not-allowed;
      pointer-events: none;
    }

    &.is-danger {
      .menu-label {
        color: rgb(var(--v-theme-error));
      }

      .menu-icon {
        color: rgb(var(--v-theme-error));
      }

      &:hover:not(.disabled) {
        background: rgb(var(--v-theme-error) / 8%);
      }
    }

    .menu-icon {
      flex-shrink: 0;
      margin-inline-start: 2px;
    }

    .menu-label {
      flex: 1;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .menu-chevron {
      flex-shrink: 0;
      margin-inline-start: auto;
      opacity: 0.6;
    }
  }
}
</style>