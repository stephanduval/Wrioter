import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useDisplay } from 'vuetify'
import type { MenuItem, ContextMenuConfig } from '@/composables/useContextMenu'

export const useContextMenuStore = defineStore('contextMenu', () => {
  const isVisible = ref(false)
  const showBottomSheet = ref(false)
  const position = ref({ x: 0, y: 0 })
  const currentConfig = ref<ContextMenuConfig | null>(null)

  const { mobile } = useDisplay()

  const displayMode = computed(() =>
    mobile.value ? 'bottomSheet' : 'floatingMenu'
  )

  const visibleItems = computed(() => {
    if (!currentConfig.value) return []

    return currentConfig.value.items.filter(item => {
      if (typeof item.hidden === 'function') {
        return !item.hidden()
      }
      return !item.hidden
    })
  })

  const setConfig = (config: ContextMenuConfig) => {
    currentConfig.value = config
  }

  const showAtPosition = (x: number, y: number) => {
    position.value = { x, y }
    isVisible.value = true
    showBottomSheet.value = false
  }

  const showBottomSheetMenu = () => {
    isVisible.value = false
    showBottomSheet.value = true
  }

  const hide = () => {
    isVisible.value = false
    showBottomSheet.value = false
    currentConfig.value = null
  }

  const executeAction = async (item: MenuItem) => {
    const isDisabled = typeof item.disabled === 'function' ? item.disabled() : item.disabled

    if (!isDisabled && !item.children && item.action) {
      try {
        await item.action()
        hide()
      } catch (error) {
        console.error('Error executing menu action:', error)
      }
    }
  }

  return {
    isVisible,
    showBottomSheet,
    position,
    currentConfig,
    displayMode,
    visibleItems,
    setConfig,
    showAtPosition,
    showBottomSheetMenu,
    hide,
    executeAction
  }
})