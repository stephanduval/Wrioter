<template>
  <Teleport to="body">
    <div
      v-if="visible"
      class="context-menu"
      :style="menuStyle"
      @click.stop
    >
      <template v-for="item in visibleItems" :key="item.id">
        <div v-if="item.separator" class="menu-separator" />
        <div
          v-else
          class="menu-item"
          :class="{
            disabled: isDisabled(item),
            'has-children': !!item.children,
            'is-danger': item.danger,
            'is-active': item.children && submenuItem?.id === item.id
          }"
          @click="handleClick(item)"
          :data-menu-id="item.id"
          @mouseenter="handleMouseEnter($event, item)"
          @mouseleave="handleMouseLeave"
        >
          <VIcon v-if="item.icon" :icon="item.icon" size="small" class="menu-icon" />
          <span class="menu-label">{{ item.label }}</span>
          <VIcon v-if="item.children" icon="bx-chevron-right" size="small" class="menu-chevron" />
        </div>
      </template>
    </div>

    <!-- Flyout submenu -->
    <div
      v-if="visible && submenuItem?.children?.length"
      class="context-menu context-submenu"
      :style="submenuStyle"
      @click.stop
      @mouseenter="cancelSubmenuClose"
      @mouseleave="scheduleSubmenuClose"
    >
      <template v-for="child in submenuChildren" :key="child.id">
        <div v-if="child.separator" class="menu-separator" />
        <div
          v-else
          class="menu-item"
          :class="{
            disabled: isDisabled(child),
            'is-danger': child.danger
          }"
          @click="handleClick(child)"
        >
          <VIcon v-if="child.icon" :icon="child.icon" size="small" class="menu-icon" />
          <span class="menu-label">{{ child.label }}</span>
        </div>
      </template>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import type { MenuItem } from '@/composables/useContextMenu';
import { computed, ref, watch } from 'vue';

interface Props {
  visible: boolean
  position: { x: number; y: number }
  items?: MenuItem[]
}

const props = defineProps<Props>()
const emit = defineEmits(['close', 'select'])

const submenuItem = ref<MenuItem | null>(null)
const submenuParentRect = ref<{ x: number; y: number; width: number; height: number } | null>(null)
let submenuCloseTimer: ReturnType<typeof setTimeout> | null = null

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

const submenuChildren = computed(() => {
  if (!submenuItem.value?.children) return []
  return submenuItem.value.children.filter(item => {
    if (typeof item.hidden === 'function') return !item.hidden()
    return !item.hidden
  })
})

const submenuStyle = computed(() => {
  if (!submenuParentRect.value) return { display: 'none' }

  const padding = 10
  const parentRight = submenuParentRect.value.x + submenuParentRect.value.width
  const parentY = submenuParentRect.value.y

  // Estimate submenu width from children labels
  const estimatedWidth = Math.max(160, submenuChildren.value.reduce((max, item) => {
    if (item.separator) return max
    return Math.max(max, item.label.length * 8 + 60)
  }, 160))

  const estimatedHeight = submenuChildren.value.length * 40 + 20

  // Position to the right of the parent item
  let x = parentRight + 2
  let y = parentY

  // If flyout goes off right edge, flip to the left
  if (x + estimatedWidth > window.innerWidth - padding) {
    x = submenuParentRect.value.x - estimatedWidth - 2
  }

  // Clamp Y
  if (y + estimatedHeight > window.innerHeight - padding) {
    y = window.innerHeight - estimatedHeight - padding
  }
  y = Math.max(padding, y)

  return {
    left: `${x}px`,
    top: `${y}px`,
    minWidth: `${Math.min(estimatedWidth, 260)}px`
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

const handleMouseEnter = (event: MouseEvent, item: MenuItem) => {
  cancelSubmenuClose()
  if (item.children?.length) {
    const el = event.currentTarget as HTMLElement
    const rect = el.getBoundingClientRect()
    submenuParentRect.value = { x: rect.left, y: rect.top, width: rect.width, height: rect.height }
    submenuItem.value = item
  } else {
    submenuItem.value = null
    submenuParentRect.value = null
  }
}

const handleMouseLeave = () => {
  scheduleSubmenuClose()
}

const scheduleSubmenuClose = () => {
  cancelSubmenuClose()
  submenuCloseTimer = setTimeout(() => {
    submenuItem.value = null
    submenuParentRect.value = null
  }, 200)
}

const cancelSubmenuClose = () => {
  if (submenuCloseTimer) {
    clearTimeout(submenuCloseTimer)
    submenuCloseTimer = null
  }
}

watch(() => props.visible, (newVal) => {
  if (!newVal) {
    submenuItem.value = null
    submenuParentRect.value = null
    cancelSubmenuClose()
  }
})
</script>

<style scoped lang="scss">
.context-menu {
  position: fixed;
  z-index: 9999;
  border-radius: 6px;
  animation: fadeIn 0.15s ease-out;
  background: rgb(var(--v-theme-surface));
  box-shadow: 0 3px 14px 0 rgb(0 0 0 / 15%), 0 0 0 1px rgb(0 0 0 / 5%);
  max-inline-size: 280px;
  min-inline-size: 180px;
  padding-block: 6px;
  padding-inline: 0;

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
    background: rgb(var(--v-theme-on-surface) / 12%);
    block-size: 1px;
    margin-block: 6px;
    margin-inline: 0;
  }

  .menu-item {
    display: flex;
    align-items: center;
    color: rgb(var(--v-theme-on-surface));
    cursor: pointer;
    font-size: 14px;
    gap: 10px;
    padding-block: 8px;
    padding-inline: 14px;
    transition: background-color 0.15s;

    &:hover:not(.disabled) {
      background: rgb(var(--v-theme-primary) / 8%);
    }

    &.is-active {
      background: rgb(var(--v-theme-primary) / 8%);
    }

    &.disabled {
      cursor: not-allowed;
      opacity: 0.5;
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
      overflow: hidden;
      flex: 1;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .menu-chevron {
      flex-shrink: 0;
      margin-inline-start: auto;
      opacity: 0.6;
    }
  }
}

.context-submenu {
  z-index: 10000;
  max-inline-size: 260px;
}
</style>
