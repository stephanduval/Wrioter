<script lang="ts" setup>
import { layoutConfig } from '@layouts'
import { can } from '@layouts/plugins/casl'
import { useLayoutConfigStore } from '@layouts/stores/config'
import type { NavLink } from '@layouts/types'
import { getComputedNavLinkToProp, getDynamicI18nProps, isNavLinkActive } from '@layouts/utils'
import { ref, nextTick, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps<{
  item: NavLink & { custom?: boolean, editable?: boolean }
}>()

const emit = defineEmits<{
  (e: 'rename', itemId: string, newTitle: string): void
}>()

const configStore = useLayoutConfigStore()
const hideTitleAndBadge = configStore.isVerticalNavMini()

// In-place editing state
const isEditing = ref(false)
const editingTitle = ref('')
const inputRef = ref<HTMLInputElement>()
const navLinkRef = ref<HTMLElement>()

// Start editing mode
const startEditing = (event?: Event) => {
  if (!props.item.editable) {
    console.log('Item not editable:', props.item.title, 'editable:', props.item.editable)
    return
  }

  if (event) {
    event.preventDefault()
    event.stopPropagation()
  }

  console.log('Starting edit for:', props.item.title)
  isEditing.value = true
  editingTitle.value = props.item.title

  nextTick(() => {
    inputRef.value?.focus()
    inputRef.value?.select()
  })
}

// Save the edited title
const saveEdit = () => {
  const trimmedTitle = editingTitle.value.trim()

  if (trimmedTitle && trimmedTitle !== props.item.title) {
    // Emit rename event to parent component
    emit('rename', props.item.to || props.item.title, trimmedTitle)
  }

  isEditing.value = false
}

// Cancel editing
const cancelEdit = () => {
  isEditing.value = false
  editingTitle.value = ''
}

// Handle Enter and Escape keys
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter') {
    event.preventDefault()
    saveEdit()
  } else if (event.key === 'Escape') {
    event.preventDefault()
    cancelEdit()
  }
}

// Track hover state
const isHovered = ref(false)

// Handle F2 key for rename
const handleGlobalKeydown = (event: KeyboardEvent) => {
  // Check if F2 was pressed and this nav link is focused or hovered
  if (event.key === 'F2' && props.item.editable) {
    const activeElement = document.activeElement
    const navElement = navLinkRef.value

    console.log('F2 pressed, editable:', props.item.editable, 'hovered:', isHovered.value, 'element:', navElement)

    // Check if this nav link is focused or if the mouse is over it
    if (navElement && (navElement.contains(activeElement) || isHovered.value)) {
      event.preventDefault()
      startEditing()
    }
  }
}

// Handle double click - needs to prevent navigation
const handleDoubleClick = (event: Event) => {
  console.log('Double click detected')
  startEditing(event)
}

// Handle custom navigation items
const handleCustomClick = (event: Event) => {
  console.log('🖱️ Custom nav item clicked:', props.item.title)
  event.preventDefault()
  event.stopPropagation()

  // Add your custom click handling logic here
  if (props.item.title === 'menu.selectManuscript') {
    console.log('🚀 Select Manuscript clicked!')
    alert('Select Manuscript clicked! This is a custom navigation item.')
    // Here you would emit an event or call a function to open the manuscript drawer
  }
}

// Setup global F2 listener
onMounted(() => {
  document.addEventListener('keydown', handleGlobalKeydown)
  console.log('VerticalNavLink mounted:', props.item.title, 'editable:', props.item.editable)
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleGlobalKeydown)
})
</script>

<template>
  <li
    v-if="item.custom || can(item.action, item.subject)"
    ref="navLinkRef"
    class="nav-link"
    :class="{ disabled: item.disable }"
    :data-editable="item.editable"
    tabindex="0"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
    @dblclick="handleDoubleClick"
  >
    <Component
      :is="item.to ? 'RouterLink' : 'a'"
      v-if="!isEditing"
      v-bind="item.custom ? {} : getComputedNavLinkToProp(item)"
      :class="{ 'router-link-active router-link-exact-active': !item.custom && isNavLinkActive(item, $router) }"
      @click="item.custom ? handleCustomClick : undefined"
      :style="item.custom ? 'cursor: pointer; background: lightgreen !important; border: 2px solid red !important;' : undefined"
    >
      <Component
        :is="layoutConfig.app.iconRenderer || 'div'"
        v-bind="item.icon || layoutConfig.verticalNav.defaultNavItemIconProps"
        class="nav-item-icon"
      />
      <TransitionGroup name="transition-slide-x">
        <!-- 👉 Title -->
        <Component
          :is="layoutConfig.app.i18n.enable ? 'i18n-t' : 'span'"
          v-show="!hideTitleAndBadge"
          key="title"
          class="nav-item-title"
          v-bind="getDynamicI18nProps(item.title, 'span')"
        >
          {{ item.title }}
        </Component>

        <!-- 👉 Badge -->
        <Component
          :is="layoutConfig.app.i18n.enable ? 'i18n-t' : 'span'"
          v-if="item.badgeContent"
          v-show="!hideTitleAndBadge"
          key="badge"
          class="nav-item-badge"
          :class="item.badgeClass"
          v-bind="getDynamicI18nProps(item.badgeContent, 'span')"
        >
          {{ item.badgeContent }}
        </Component>
      </TransitionGroup>
    </Component>

    <!-- In-place editing input -->
    <div v-else class="nav-link-edit-container">
      <Component
        :is="layoutConfig.app.iconRenderer || 'div'"
        v-bind="item.icon || layoutConfig.verticalNav.defaultNavItemIconProps"
        class="nav-item-icon"
      />
      <input
        ref="inputRef"
        v-model="editingTitle"
        type="text"
        class="nav-link-edit-input"
        @keydown="handleKeydown"
        @blur="saveEdit"
        @click.stop
      />
    </div>
  </li>
</template>

<style lang="scss">
.layout-vertical-nav {
  .nav-link {
    a {
      display: flex;
      align-items: center;
    }

    .nav-link-edit-container {
      display: flex;
      align-items: center;
      padding-block: 0.5rem;
      padding-inline: 1rem;

      .nav-link-edit-input {
        flex: 1;
        border: 1px solid rgb(var(--v-theme-primary));
        border-radius: 4px;
        background: transparent;
        color: inherit;
        font-family: inherit;
        font-size: inherit;
        margin-inline-start: 0.5rem;
        outline: none;
        padding-block: 0.25rem;
        padding-inline: 0.5rem;

        &:focus {
          background: rgba(var(--v-theme-primary), 0.05);
        }
      }
    }

    // Show editable indicator on hover (only for editable items)
    &[data-editable="true"]:hover {
      .nav-item-title::after {
        content: ' ✎';
        opacity: 0.5;
        font-size: 0.85em;
        margin-inline-start: 0.25rem;
      }
    }
  }
}
</style>
