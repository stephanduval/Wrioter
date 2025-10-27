import { createApp } from 'vue'

// import axios from '../js/axios' // Importe the configured Axios instance
import App from '@/App.vue'
import { registerPlugins } from '@core/utils/plugins'

// Styles
import '@core-scss/template/index.scss'
import '@styles/styles.scss'

// Create vue app
const app = createApp(App)

// ============================================
// Client-Side Error Logging for Mobile Testing
// ============================================

// Determine if we should log errors verbosely
const isDevelopment = import.meta.env.DEV ||
  window.location.hostname === '192.168.1.252' ||
  window.location.hostname === 'localhost' ||
  window.location.hostname.includes('127.0.0.1')

// Debounce errors to prevent spam
const errorCache = new Map<string, number>()
const isErrorDuplicate = (errorKey: string): boolean => {
  const lastSeen = errorCache.get(errorKey) ?? 0
  const now = Date.now()

  // If same error seen within last 2 seconds, skip it
  if (now - lastSeen < 2000) {
    return true
  }

  errorCache.set(errorKey, now)

  // Clean up old entries after 10 seconds
  if (errorCache.size > 100) {
    for (const [key, time] of errorCache.entries()) {
      if (now - time > 10000) {
        errorCache.delete(key)
      }
    }
  }

  return false
}

// Send error to server
const logErrorToServer = async (errorData: {
  message: string
  stack?: string
  url?: string
  userAgent?: string
  componentName?: string
  timestamp?: number
}) => {
  try {
    // Only log on dev server to avoid spamming production
    if (!isDevelopment) return

    await fetch('/api/log-client-error', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
      body: JSON.stringify({
        ...errorData,
        timestamp: errorData.timestamp || Date.now(),
        url: errorData.url || window.location.href,
        userAgent: errorData.userAgent || navigator.userAgent,
      }),
    }).catch(() => {
      // Silently fail if server isn't available
    })
  } catch (err) {
    // Silently fail
  }
}

// Global error handler for uncaught JavaScript errors
window.addEventListener('error', (event: ErrorEvent) => {
  const errorKey = `${event.message}-${event.filename}-${event.lineno}`

  if (isErrorDuplicate(errorKey)) return

  console.error('[CLIENT ERROR]', event.error)

  logErrorToServer({
    message: event.message || 'Unknown error',
    stack: event.error?.stack || event.error?.toString(),
    url: event.filename || window.location.href,
    componentName: 'Global',
  })
})

// Global handler for unhandled promise rejections
window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
  const errorMsg = event.reason?.message || String(event.reason) || 'Unknown promise rejection'
  const errorKey = `promise-${errorMsg}`

  if (isErrorDuplicate(errorKey)) return

  console.error('[UNHANDLED PROMISE]', event.reason)

  logErrorToServer({
    message: `Unhandled Promise: ${errorMsg}`,
    stack: event.reason?.stack || String(event.reason),
    componentName: 'Promise',
  })
})

// Vue error handler
app.config.errorHandler = (err: any, instance: any, info: string) => {
  const errorMsg = err?.message || String(err) || 'Unknown Vue error'
  const componentName = instance?.$options?.name || instance?.$options?.__name || 'Unknown Component'
  const errorKey = `vue-${componentName}-${errorMsg}`

  if (isErrorDuplicate(errorKey)) return

  console.error('[VUE ERROR]', err, info)

  logErrorToServer({
    message: `Vue Error: ${errorMsg}`,
    stack: err?.stack || String(err),
    componentName: `${componentName} (${info})`,
  })
}

// Suppress Suspense experimental warning
app.config.warnHandler = (msg) => {
  if (msg.includes('Suspense') && msg.includes('experimental'))
    return
  console.warn(msg)
}

// Register plugins
registerPlugins(app)

// Mount vue app
app.mount('#app')

// ============================================
// Testing Functions (Dev Server Only)
// ============================================
// Expose test functions globally for debugging
if (isDevelopment) {
  ;(window as any).testErrors = {
    // Test 1: Simple JavaScript error
    jsError: () => {
      throw new Error('[TEST] JavaScript Error - Simple test error')
    },

    // Test 2: Undefined property access
    undefined: () => {
      const obj: any = null
      return obj.property.nested // Will throw TypeError
    },

    // Test 3: Promise rejection
    promiseRejection: () => {
      Promise.reject(new Error('[TEST] Unhandled Promise Rejection'))
    },

    // Test 4: Vue error (simulated)
    vueError: () => {
      throw new Error('[TEST] Vue Component Error')
    },

    // Test 5: Network-like error
    networkError: () => {
      throw new Error('[TEST] Network timeout: Failed to fetch resource')
    },

    // Info function
    info: () => {
      console.log('Available test functions:')
      console.log('  testErrors.jsError() - Simple JS error')
      console.log('  testErrors.undefined() - TypeError from undefined')
      console.log('  testErrors.promiseRejection() - Promise rejection')
      console.log('  testErrors.vueError() - Vue error')
      console.log('  testErrors.networkError() - Network error simulation')
      console.log('  testErrors.info() - Show this help message')
    }
  }

  // Log that test functions are available
  console.log('%c[WRIOTER DEBUG] Test functions available!', 'color: blue; font-weight: bold')
  console.log('Type: testErrors.info() to see available functions')
}

// console.log(axios.defaults.baseURL)
