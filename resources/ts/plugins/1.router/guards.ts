import type { RouteNamedMap, _RouterTyped } from 'unplugin-vue-router'

export const setupGuards = (router: _RouterTyped<RouteNamedMap & { [key: string]: any }>) => {
  router.beforeEach(async to => {
    console.log('Navigating to:', to.fullPath)

    // Public routes are accessible to everyone
    if (to.meta.public) {
      console.log('Public route, proceeding...')

      return
    }

    // Check cookies for login state
    const userDataCookie = useCookie<{ role?: string }>('userData')
    const accessTokenCookie = useCookie('accessToken')

    const isLoggedIn = !!(userDataCookie.value && accessTokenCookie.value)
    const userRole = userDataCookie.value?.role?.toLowerCase()

    console.log('User role:', userRole)

    // If logged in but accessing unauthenticated-only routes, redirect to dashboard
    if (to.meta.unauthenticatedOnly) {
      if (isLoggedIn) {
        console.log('Redirecting logged-in user from unauthenticated-only route')

        return { name: 'dashboards-crm' }
      }

      return undefined
    }

    // If not logged in and trying to access protected routes, redirect to login
    // if (!isLoggedIn) {
    //   console.log('User not logged in, redirecting to login')

    //   return {
    //     name: 'login',
    //     query: { redirect: to.fullPath },
    //   }
    // }

    // Handle role-based permissions
    if (to.meta.action && to.meta.subject) {
      const ability = useAbility()
      if (!ability.can(to.meta.action, to.meta.subject)) {
        console.log('User does not have permission to navigate to this route')

        return { name: 'not-authorized' }
      }
    }

    // console.log('User is authorized to navigate')
  })

  // Ensure redirects after login are handled properly
  router.afterEach(to => {
    const userDataCookie = useCookie<{ role?: string }>('userData')
    const accessTokenCookie = useCookie('accessToken')
    const isLoggedIn = !!(userDataCookie.value && accessTokenCookie.value)

    if (to.name === 'login' && isLoggedIn) {
      console.log('Redirecting logged-in user to dashboard from login page')

      return { name: 'dashboards-crm' }
    }
  })
}
