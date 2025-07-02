<script lang="ts" setup>
import { layoutConfig } from '@layouts'
import { can } from '@layouts/plugins/casl'
import { useLayoutConfigStore } from '@layouts/stores/config'
import type { NavLink } from '@layouts/types'
import { getComputedNavLinkToProp, getDynamicI18nProps, isNavLinkActive } from '@layouts/utils'

const props = defineProps<{
  item: NavLink & { custom?: boolean }
}>()

const configStore = useLayoutConfigStore()
const hideTitleAndBadge = configStore.isVerticalNavMini()

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
</script>

<template>
  <li
    v-if="item.custom || can(item.action, item.subject)"
    class="nav-link"
    :class="{ disabled: item.disable }"
  >
    <Component
      :is="item.to ? 'RouterLink' : 'a'"
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
  </li>
</template>

<style lang="scss">
.layout-vertical-nav {
  .nav-link a {
    display: flex;
    align-items: center;
  }
}
</style>
