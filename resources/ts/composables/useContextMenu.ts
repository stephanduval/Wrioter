import { computed, onMounted, onUnmounted } from 'vue'
import { useDisplay } from 'vuetify'
import { useContextMenuStore } from '@/stores/contextMenu'

export interface MenuItemAction {
  id: string
  label: string
  icon?: string
  action: () => void | Promise<void>
  disabled?: boolean | (() => boolean)
  hidden?: boolean | (() => boolean)
  separator?: false
  children?: MenuItem[]
  danger?: boolean
}

export interface MenuItemSeparator {
  id: string
  separator: true
  hidden?: boolean | (() => boolean)
}

export type MenuItem = MenuItemAction | MenuItemSeparator

export interface ContextMenuConfig {
  items: MenuItem[]
  context?: any
}

export const useContextMenu = () => {
  const contextMenuStore = useContextMenuStore()
  const { mobile, lgAndUp } = useDisplay()

  let longPressTimer: NodeJS.Timeout | null = null

  const show = (event: MouseEvent | TouchEvent, config: ContextMenuConfig) => {
    event.preventDefault()
    event.stopPropagation()

    contextMenuStore.setConfig(config)

    if (contextMenuStore.displayMode === 'floatingMenu') {
      let x = 0, y = 0

      if ('clientX' in event) {
        x = event.clientX
        y = event.clientY
      } else if ('touches' in event && event.touches.length > 0) {
        const touch = event.touches[0]
        x = touch.clientX
        y = touch.clientY
      }

      contextMenuStore.showAtPosition(x, y)
    } else {
      if ('vibrate' in navigator) {
        navigator.vibrate(50)
      }
      contextMenuStore.showBottomSheetMenu()
    }
  }

  const hide = () => {
    contextMenuStore.hide()
  }

  const handleTouchStart = (event: TouchEvent, config: ContextMenuConfig) => {
    const touch = event.touches[0]
    const startX = touch.clientX
    const startY = touch.clientY

    longPressTimer = setTimeout(() => {
      const currentTouch = event.touches[0]
      const deltaX = Math.abs(currentTouch.clientX - startX)
      const deltaY = Math.abs(currentTouch.clientY - startY)

      if (deltaX < 10 && deltaY < 10) {
        show(event, config)
      }
    }, 500)
  }

  const handleTouchEnd = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer)
      longPressTimer = null
    }
  }

  const handleTouchMove = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer)
      longPressTimer = null
    }
  }

  const initContextMenu = (element: HTMLElement, config: ContextMenuConfig | (() => ContextMenuConfig)) => {
    const cleanup: (() => void)[] = []

    const getConfig = () => {
      return typeof config === 'function' ? config() : config
    }

    if (lgAndUp.value) {
      const handleContext = (e: MouseEvent) => {
        e.preventDefault()
        show(e, getConfig())
      }
      element.addEventListener('contextmenu', handleContext)
      cleanup.push(() => element.removeEventListener('contextmenu', handleContext))
    } else {
      const touchStart = (e: TouchEvent) => handleTouchStart(e, getConfig())
      const touchEnd = () => handleTouchEnd()
      const touchMove = () => handleTouchMove()

      element.addEventListener('touchstart', touchStart, { passive: false })
      element.addEventListener('touchend', touchEnd)
      element.addEventListener('touchmove', touchMove)

      cleanup.push(() => {
        element.removeEventListener('touchstart', touchStart)
        element.removeEventListener('touchend', touchEnd)
        element.removeEventListener('touchmove', touchMove)
      })
    }

    return () => cleanup.forEach(fn => fn())
  }

  onMounted(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as HTMLElement

      if (!target.closest('.context-menu') && !target.closest('.v-bottom-sheet')) {
        hide()
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && contextMenuStore.isVisible) {
        hide()
      }
    }

    document.addEventListener('click', handleClickOutside)
    document.addEventListener('touchstart', handleClickOutside)
    document.addEventListener('keydown', handleEscape)

    onUnmounted(() => {
      document.removeEventListener('click', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
      if (longPressTimer) {
        clearTimeout(longPressTimer)
      }
    })
  })

  return {
    isVisible: computed(() => contextMenuStore.isVisible),
    position: computed(() => contextMenuStore.position),
    currentConfig: computed(() => contextMenuStore.currentConfig),
    showBottomSheet: computed(() => contextMenuStore.showBottomSheet),
    displayMode: computed(() => contextMenuStore.displayMode),
    show,
    hide,
    initContextMenu,
    handleTouchStart,
    handleTouchEnd,
    handleTouchMove
  }
}