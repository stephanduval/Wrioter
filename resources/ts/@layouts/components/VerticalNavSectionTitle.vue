<script lang="ts" setup>
import { inject, ref } from 'vue'
import { layoutConfig } from '@layouts'
import { can } from '@layouts/plugins/casl'
import { useLayoutConfigStore } from '@layouts/stores/config'
import { injectionKeyIsVerticalNavHovered } from '@layouts/symbols'
import type { NavSectionTitle } from '@layouts/types'
import { getDynamicI18nProps } from '@layouts/utils'

defineProps<{
  item: NavSectionTitle
}>()

const configStore = useLayoutConfigStore()

// Inject hover state from parent VerticalNav
const isVerticalNavHovered = inject(injectionKeyIsVerticalNavHovered, ref(false))

// Pass hover state to isVerticalNavMini so it responds to hover
const shallRenderIcon = configStore.isVerticalNavMini(isVerticalNavHovered)
</script>

<template>
  <li
    v-if="can(item.action, item.subject)"
    class="nav-section-title"
  >
    <div class="title-wrapper">
      <Transition
        name="vertical-nav-section-title"
        mode="out-in"
      >
        <Component
          :is="shallRenderIcon ? layoutConfig.app.iconRenderer : layoutConfig.app.i18n.enable ? 'i18n-t' : 'span'"
          :key="shallRenderIcon"
          :class="shallRenderIcon ? 'placeholder-icon' : 'title-text'"
          v-bind="{ ...layoutConfig.icons.sectionTitlePlaceholder, ...getDynamicI18nProps(item.heading, 'span') }"
        >
          {{ !shallRenderIcon ? item.heading : null }}
        </Component>
      </Transition>
    </div>
  </li>
</template>
