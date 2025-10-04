# Context Menu Implementation Plan

> **Status**: ✅ IMPLEMENTED
>
> See [Context Menu Usage Guide](./context-menu-usage-guide.md) for how to use and extend the system.

## Overview
Implementation of a flexible, adaptive context menu system for Vue.js that works seamlessly across desktop and mobile devices.

## Architecture: Unified Approach - Adaptive Context Menu
Combining Vue 3 composables with Pinia state management for a hybrid solution that adapts to the device.

## Core Implementation

### 1. Main Composable - `composables/useContextMenu.ts`
```typescript
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useDisplay } from 'vuetify'

interface MenuItem {
  id: string
  label: string
  icon?: string
  action: () => void
  disabled?: boolean | (() => boolean)
  hidden?: boolean | (() => boolean)
  separator?: boolean
  children?: MenuItem[]
}

interface ContextMenuConfig {
  items: MenuItem[]
  context?: any // Additional context data
}

export const useContextMenu = () => {
  // Core state
  const isVisible = ref(false)
  const position = ref({ x: 0, y: 0 })
  const currentConfig = ref<ContextMenuConfig | null>(null)

  // Mobile detection
  const { mobile, lgAndUp } = useDisplay()
  const showBottomSheet = ref(false)

  // Timers for long press
  let longPressTimer: NodeJS.Timeout | null = null

  // Display strategy based on device
  const displayMode = computed(() =>
    mobile.value ? 'bottomSheet' : 'floatingMenu'
  )

  // Core show method - works for both desktop and mobile
  const show = (event: MouseEvent | TouchEvent, config: ContextMenuConfig) => {
    event.preventDefault()
    currentConfig.value = config

    if (displayMode.value === 'floatingMenu') {
      // Desktop behavior
      if ('clientX' in event) {
        position.value = { x: event.clientX, y: event.clientY }
      } else if ('touches' in event) {
        const touch = event.touches[0]
        position.value = { x: touch.clientX, y: touch.clientY }
      }
      isVisible.value = true
    } else {
      // Mobile behavior
      if ('vibrate' in navigator) {
        navigator.vibrate(50) // Haptic feedback
      }
      showBottomSheet.value = true
    }
  }

  // Hide method for both modes
  const hide = () => {
    isVisible.value = false
    showBottomSheet.value = false
    currentConfig.value = null
  }

  // Touch handlers for mobile long press
  const handleTouchStart = (event: TouchEvent, config: ContextMenuConfig) => {
    longPressTimer = setTimeout(() => {
      show(event, config)
    }, 500)
  }

  const handleTouchEnd = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer)
      longPressTimer = null
    }
  }

  // Initialize context menu on element
  const initContextMenu = (element: HTMLElement, config: ContextMenuConfig) => {
    const cleanup: (() => void)[] = []

    if (lgAndUp.value) {
      // Desktop: right-click
      const handleContext = (e: MouseEvent) => show(e, config)
      element.addEventListener('contextmenu', handleContext)
      cleanup.push(() => element.removeEventListener('contextmenu', handleContext))
    } else {
      // Mobile: long press
      const touchStart = (e: TouchEvent) => handleTouchStart(e, config)
      const touchEnd = () => handleTouchEnd()

      element.addEventListener('touchstart', touchStart)
      element.addEventListener('touchend', touchEnd)
      element.addEventListener('touchmove', touchEnd) // Cancel on move

      cleanup.push(() => {
        element.removeEventListener('touchstart', touchStart)
        element.removeEventListener('touchend', touchEnd)
        element.removeEventListener('touchmove', touchEnd)
      })
    }

    // Return cleanup function
    return () => cleanup.forEach(fn => fn())
  }

  // Global click/touch outside handler
  onMounted(() => {
    const handleClickOutside = () => hide()
    document.addEventListener('click', handleClickOutside)
    document.addEventListener('touchstart', handleClickOutside)

    onUnmounted(() => {
      document.removeEventListener('click', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
    })
  })

  return {
    // State
    isVisible,
    position,
    currentConfig,
    showBottomSheet,
    displayMode,

    // Methods
    show,
    hide,
    initContextMenu,
    handleTouchStart,
    handleTouchEnd
  }
}
```

### 2. Menu Configuration System

#### `config/contextMenus/index.ts`
```typescript
export * from './manuscriptMenus'
export * from './itemMenus'
export * from './editorMenus'
```

#### `config/contextMenus/manuscriptMenus.ts`
```typescript
import { MenuItem } from '@/composables/useContextMenu'
import router from '@/router'

export const getManuscriptMenuItems = (manuscript: Manuscript): MenuItem[] => [
  {
    id: 'edit',
    label: 'Edit Manuscript',
    icon: 'bx-edit',
    action: () => router.push(`/manuscripts/${manuscript.id}/edit`)
  },
  {
    id: 'duplicate',
    label: 'Duplicate',
    icon: 'bx-copy',
    action: () => duplicateManuscript(manuscript)
  },
  { separator: true },
  {
    id: 'delete',
    label: 'Delete',
    icon: 'bx-trash',
    action: () => deleteManuscript(manuscript),
    disabled: () => !canDelete(manuscript)
  }
]

export const getItemMenuItems = (item: ManuscriptItem): MenuItem[] => [
  {
    id: 'edit',
    label: 'Edit Item',
    icon: 'bx-edit',
    action: () => router.push(`/manuscripts/${item.manuscript_id}/items/${item.id}/edit`)
  },
  {
    id: 'move',
    label: 'Move Item',
    icon: 'bx-move',
    action: () => openMoveDialog(item),
    children: [
      {
        id: 'move-up',
        label: 'Move Up',
        action: () => moveItem(item, 'up'),
        disabled: () => !canMoveUp(item)
      },
      {
        id: 'move-down',
        label: 'Move Down',
        action: () => moveItem(item, 'down'),
        disabled: () => !canMoveDown(item)
      }
    ]
  }
]
```

### 3. Context Detection Service

#### `services/contextDetection.ts`
```typescript
export interface ContextData {
  type: 'manuscript' | 'item' | 'editor' | 'default'
  manuscriptId?: string
  itemId?: string
  selection?: string
  element: HTMLElement
}

export class ContextDetectionService {
  static getContextFromElement(element: HTMLElement): ContextData['type'] {
    if (element.closest('[data-manuscript-id]')) return 'manuscript'
    if (element.closest('[data-item-id]')) return 'item'
    if (element.closest('.editor-content')) return 'editor'
    return 'default'
  }

  static getContextData(element: HTMLElement): ContextData {
    const manuscriptEl = element.closest('[data-manuscript-id]')
    const itemEl = element.closest('[data-item-id]')

    return {
      type: this.getContextFromElement(element),
      manuscriptId: manuscriptEl?.getAttribute('data-manuscript-id') || undefined,
      itemId: itemEl?.getAttribute('data-item-id') || undefined,
      selection: window.getSelection()?.toString() || undefined,
      element
    }
  }

  static getMenuItemsForContext(context: ContextData): MenuItem[] {
    switch (context.type) {
      case 'manuscript':
        // Fetch manuscript and return menu items
        if (context.manuscriptId) {
          const manuscript = getManuscriptById(context.manuscriptId)
          return getManuscriptMenuItems(manuscript)
        }
        break
      case 'item':
        // Fetch item and return menu items
        if (context.itemId) {
          const item = getItemById(context.itemId)
          return getItemMenuItems(item)
        }
        break
      case 'editor':
        return getEditorMenuItems(context.selection)
      default:
        return getDefaultMenuItems()
    }
    return []
  }
}
```

### 4. Component Implementation

#### `components/ContextMenu.vue` - Desktop Floating Menu
```vue
<template>
  <Teleport to="body">
    <div
      v-if="visible"
      class="context-menu"
      :style="menuStyle"
      @click.stop
    >
      <template v-for="item in visibleItems" :key="item.id || 'separator'">
        <div v-if="item.separator" class="menu-separator" />
        <div
          v-else
          class="menu-item"
          :class="{
            disabled: isDisabled(item),
            'has-children': !!item.children
          }"
          @click="handleClick(item)"
          @mouseenter="item.children && showSubmenu(item)"
        >
          <VIcon v-if="item.icon" :icon="item.icon" size="small" />
          <span class="menu-label">{{ item.label }}</span>
          <VIcon v-if="item.children" icon="bx-chevron-right" size="small" />
        </div>
      </template>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { MenuItem } from '@/composables/useContextMenu'

interface Props {
  visible: boolean
  position: { x: number, y: number }
  items?: MenuItem[]
}

const props = defineProps<Props>()
const emit = defineEmits(['close', 'select'])

const menuStyle = computed(() => {
  // Ensure menu stays within viewport
  const x = Math.min(props.position.x, window.innerWidth - 200)
  const y = Math.min(props.position.y, window.innerHeight - 300)

  return {
    left: `${x}px`,
    top: `${y}px`
  }
})

const visibleItems = computed(() =>
  props.items?.filter(item => !item.hidden?.()) || []
)

const isDisabled = (item: MenuItem) =>
  typeof item.disabled === 'function' ? item.disabled() : item.disabled

const handleClick = (item: MenuItem) => {
  if (!isDisabled(item) && !item.children) {
    item.action()
    emit('close')
  }
}
</script>

<style scoped lang="scss">
.context-menu {
  position: fixed;
  background: rgb(var(--v-theme-surface));
  border-radius: 6px;
  box-shadow: 0 3px 14px 0 rgb(0 0 0 / 10%);
  padding: 8px 0;
  min-width: 180px;
  z-index: 9999;

  .menu-separator {
    height: 1px;
    margin: 8px 0;
    background: rgb(var(--v-theme-on-surface) / 12%);
  }

  .menu-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 16px;
    cursor: pointer;
    transition: background-color 0.15s;

    &:hover:not(.disabled) {
      background: rgb(var(--v-theme-primary) / 8%);
    }

    &.disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .menu-label {
      flex: 1;
    }
  }
}
</style>
```

#### `components/MobileBottomSheet.vue` - Mobile Bottom Sheet
```vue
<template>
  <VBottomSheet v-model="model" max-height="70vh">
    <VCard>
      <VCardTitle class="text-center">
        Actions
      </VCardTitle>
      <VList>
        <template v-for="item in items" :key="item.id || 'separator'">
          <VDivider v-if="item.separator" />
          <VListItem
            v-else
            :disabled="isDisabled(item)"
            @click="handleClick(item)"
          >
            <template #prepend>
              <VIcon :icon="item.icon" />
            </template>
            <VListItemTitle>{{ item.label }}</VListItemTitle>
            <template v-if="item.children" #append>
              <VIcon icon="bx-chevron-right" />
            </template>
          </VListItem>
        </template>
      </VList>
    </VCard>
  </VBottomSheet>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { MenuItem } from '@/composables/useContextMenu'

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

const isDisabled = (item: MenuItem) =>
  typeof item.disabled === 'function' ? item.disabled() : item.disabled

const handleClick = (item: MenuItem) => {
  if (!isDisabled(item) && !item.children) {
    item.action()
    model.value = false
    emit('close')
  }
}
</script>
```

### 5. Usage Example

```vue
<!-- pages/manuscripts/ManuscriptItem.vue -->
<template>
  <div
    ref="itemEl"
    class="manuscript-item"
    :data-manuscript-id="manuscript.id"
  >
    <div class="item-content">
      {{ manuscript.title }}
    </div>

    <!-- Optional: Explicit mobile action button -->
    <VBtn
      v-if="mobile"
      icon="bx-dots-vertical"
      size="small"
      variant="text"
      @click="showMenu"
    />
  </div>

  <!-- Context Menu Component handles both display modes -->
  <ContextMenu
    v-if="displayMode === 'floatingMenu'"
    :visible="isVisible"
    :position="position"
    :items="currentConfig?.items"
    @close="hide"
  />

  <MobileBottomSheet
    v-else
    v-model="showBottomSheet"
    :items="currentConfig?.items"
    @close="hide"
  />
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useContextMenu } from '@/composables/useContextMenu'
import { getManuscriptMenuItems } from '@/config/contextMenus'
import { useDisplay } from 'vuetify'

const props = defineProps<{
  manuscript: Manuscript
}>()

const itemEl = ref<HTMLElement>()
const { mobile } = useDisplay()

const {
  isVisible,
  position,
  currentConfig,
  showBottomSheet,
  displayMode,
  show,
  hide,
  initContextMenu
} = useContextMenu()

// Menu configuration
const menuConfig = computed(() => ({
  items: getManuscriptMenuItems(props.manuscript)
}))

// Initialize adaptive context menu
let cleanup: (() => void) | undefined

onMounted(() => {
  if (itemEl.value) {
    cleanup = initContextMenu(itemEl.value, menuConfig.value)
  }
})

onUnmounted(() => {
  cleanup?.()
})

// For explicit button click (mobile)
const showMenu = (event: MouseEvent) => {
  show(event, menuConfig.value)
}
</script>
```

## Implementation Steps

1. **Create Core Files**
   - [ ] `composables/useContextMenu.ts` - Main composable
   - [ ] `stores/contextMenuStore.ts` - Optional Pinia store for global state
   - [ ] `components/ContextMenu.vue` - Desktop floating menu component
   - [ ] `components/MobileBottomSheet.vue` - Mobile bottom sheet component

2. **Create Menu Configurations**
   - [ ] `config/contextMenus/index.ts` - Export barrel
   - [ ] `config/contextMenus/manuscriptMenus.ts` - Manuscript-specific menus
   - [ ] `config/contextMenus/itemMenus.ts` - Item-specific menus
   - [ ] `config/contextMenus/editorMenus.ts` - Editor text selection menus

3. **Create Services**
   - [ ] `services/contextDetection.ts` - Context detection logic
   - [ ] `services/menuRegistry.ts` - Optional menu registry system

4. **Integration**
   - [ ] Add to manuscript list components
   - [ ] Add to item navigation tree
   - [ ] Add to editor for text operations
   - [ ] Add data attributes to components for context detection

## Key Features

- **Adaptive UI**: Automatically switches between floating menu (desktop) and bottom sheet (mobile)
- **Touch Support**: Long press for mobile, right-click for desktop
- **Haptic Feedback**: Vibration on mobile when menu triggers
- **Context Awareness**: Different menus based on what was clicked
- **Dynamic Items**: Menu items can be hidden/disabled based on state
- **Nested Menus**: Support for submenu items (desktop)
- **Keyboard Navigation**: Arrow keys and escape key support
- **Click Outside**: Automatically closes when clicking elsewhere
- **Viewport Awareness**: Menu positioning adjusts to stay on screen
- **Type Safety**: Full TypeScript support with interfaces

## Best Practices

1. **DRY Principle**: Menu configurations are centralized and reusable
2. **Separation of Concerns**: Logic (composables), UI (components), and config (menu definitions) are separated
3. **Progressive Enhancement**: Desktop gets full features, mobile gets appropriate alternatives
4. **Accessibility**: Touch targets meet mobile guidelines (44x44px minimum)
5. **Performance**: Event listeners are properly cleaned up to prevent memory leaks

## Mobile Considerations

- **Long Press Duration**: 500ms to trigger menu
- **Touch Cancellation**: Moving finger cancels the long press
- **Visual Feedback**: Optional highlight or ripple effect
- **Haptic Feedback**: 50ms vibration when menu opens
- **Bottom Sheet**: More natural for mobile than floating menus
- **Action Buttons**: Alternative explicit trigger for accessibility

## Notes

- This implementation uses Vuetify components (VBottomSheet, VList, etc.) which are already in the project
- The `useDisplay()` hook from Vuetify is used for responsive breakpoint detection
- Menu items support async actions and can return promises
- Consider adding animations/transitions for better UX
- Can be extended with keyboard shortcuts for power users