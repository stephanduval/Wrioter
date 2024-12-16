import type { RouteNamedMap, _RouterTyped } from 'unplugin-vue-router'

export const setupGuards = (router: _RouterTyped<RouteNamedMap & { [key: string]: any }>) => {
  router.beforeEach((to, from, next) => {
    console.log('Navigating from:', from.fullPath)
    console.log('Navigating to:', to.fullPath)

    // Retrieve access token and role from localStorage
    const accessToken = localStorage.getItem('accessToken')
    const userRole = localStorage.getItem('userRole')?.toLowerCase()

    const isLoggedIn = !!accessToken

    console.log('Access Token:', accessToken)
    console.log('User Role:', userRole)
    console.log('Is Logged In:', isLoggedIn)

   // 1. Allow access to public routes (e.g., register, login) without checking login
   if (to.meta.public || to.name === 'register' || to.name === 'login') {
    console.log('Public or unauthenticated route, proceeding...')
    return next()
  }

    // 2. Redirect unauthenticated users to login page
    if (!isLoggedIn) {
      if (to.name !== 'login') {
        console.log('User not logged in, redirecting to login')

        return next({ name: 'login', query: { redirect: to.fullPath } })
      }

      return next()
    }

    // 3. Prevent logged-in users from accessing unauthenticated-only routes
    if (to.meta.unauthenticatedOnly) {
      console.log('Redirecting logged-in user from unauthenticated-only route')

      return next({ name: 'dashboards-crm' })
    }

    // 4. Check role-based access permissions
    if (to.meta.action && to.meta.subject) {
      const ability = useAbility()
      if (!ability.can(to.meta.action, to.meta.subject)) {
        console.log('User does not have permission to navigate to this route')

        return next({ name: 'not-authorized' })
      }
    }

    // If all checks pass, proceed to the requested route
    console.log('User authorized to navigate')
    next()
  })

  router.afterEach(to => {
    console.log('Navigation complete to:', to.fullPath)
  })
}
