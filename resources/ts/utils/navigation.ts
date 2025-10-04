/**
 * Navigation utilities
 *
 * This file provides navigation functions that can be used outside of Vue component setup context.
 * We export a singleton router instance that can be imported anywhere.
 */

import type { Router } from 'vue-router'

// Store router instance globally
let routerInstance: Router | null = null

/**
 * Initialize the router instance
 * Should be called once when the router is created
 */
export function setRouter(router: Router) {
  routerInstance = router
}

/**
 * Get the router instance
 */
export function getRouter(): Router | null {
  return routerInstance
}

/**
 * Navigate to a route
 * Can be used outside of component setup context
 */
export function navigateTo(path: string | { name: string; params?: any; query?: any }) {
  if (!routerInstance) {
    console.error('Router not initialized. Call setRouter() first.')
    // Fallback to window.location
    if (typeof path === 'string') {
      window.location.href = path
    }
    return
  }

  if (typeof path === 'string') {
    routerInstance.push(path)
  } else {
    routerInstance.push(path)
  }
}
