<script setup lang="ts">
import ScrollToTop from '@core/components/ScrollToTop.vue'
import ContextMenuProvider from '@/components/context-menu/ContextMenuProvider.vue'
import AddToCollectionDialog from '@/components/snippet/AddToCollectionDialog.vue'
import CustomizeIconModal from '@/components/manuscript/CustomizeIconModal.vue'
import initCore from '@core/initCore'
import { initConfigStore, useConfigStore } from '@core/stores/config'
import { hexToRgb } from '@core/utils/colorConverter'
import { useTheme } from 'vuetify'

const { global } = useTheme()

// ℹ️ Sync current theme with initial loader theme
initCore()
initConfigStore()

const configStore = useConfigStore()
</script>

<template>
  <VLocaleProvider :rtl="configStore.isAppRTL">
    <!-- ℹ️ This is required to set the background color of active nav link based on currently active global theme's primary -->
    <VApp :style="`--v-global-theme-primary: ${hexToRgb(global.current.value.colors.primary)}`">
      <RouterView />
      <!-- <BuyNow /> -->
      <ScrollToTop />

      <!-- Global Context Menu Provider -->
      <ContextMenuProvider />

      <!-- Global Add to Collection Dialog -->
      <AddToCollectionDialog />

      <!-- Global Customize Icon Modal -->
      <CustomizeIconModal />
    </VApp>
  </VLocaleProvider>
</template>
