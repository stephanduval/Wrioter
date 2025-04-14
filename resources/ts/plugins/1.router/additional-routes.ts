import type { RouteRecordRaw } from 'vue-router/auto'

const emailRouteComponent = () => import('@/pages/apps/email/index.vue')

// 👉 Redirects
export const redirects: RouteRecordRaw[] = [
  // ℹ️ We are redirecting to different pages based on role.
  // NOTE: Role is just for UI purposes. ACL is based on abilities.
  {
    path: '/',
    name: 'index',
    redirect: to => {
      // TODO: Get type from backend
      // Use explicit typing for the `userData` cookie
      const userData = useCookie<{ role?: string }>('userData').value

      const userRole = userData?.role?.toLowerCase() // Normalize role to lowercase

      console.log('Redirecting based on role:', userRole)

      if (userRole === 'admin')
        return { name: 'dashboards-crm' }
      if (userRole === 'client')
        return { name: 'dashboards-crm' }
      if (userRole === 'manager')
        return { name: 'messages-list' }
      if (userRole === 'user')
        return { name: 'messages-list' }
      
      return { name: 'dashboards-crm', query: to.query }
    },
  },
  {
    path: '/pages/user-profile',
    name: 'pages-user-profile',
    redirect: () => ({ name: 'pages-user-profile-tab', params: { tab: 'profile' } }),
  },
  {
    path: '/pages/account-settings',
    name: 'pages-account-settings',
    redirect: () => ({ name: 'pages-account-settings-tab', params: { tab: 'account' } }),
  },
]

export const routes: RouteRecordRaw[] = [
  // Email filter - Revert Subject
  {
    path: '/apps/email/filter/:filter',
    name: 'apps-email-filter',
    component: emailRouteComponent,
    meta: {
      navActiveLink: 'apps-email',
      layoutWrapperClasses: 'layout-content-height-fixed',
      action: 'read',        
      subject: 'client',   // <<< Revert subject back to 'client'
      requiresAuth: true, 
    },
  },

  // Email label - Revert Subject
  {
    path: '/apps/email/label/:label',
    name: 'apps-email-label',
    component: emailRouteComponent,
    meta: {
      navActiveLink: 'apps-email',
      layoutWrapperClasses: 'layout-content-height-fixed',
      action: 'read',        
      subject: 'client',   // <<< Revert subject back to 'client'
      requiresAuth: true, 
    },
  },

  // RE-ADD Messages List Route for Manager/User
  {
    path: '/messages/list', 
    name: 'messages-list', 
    component: emailRouteComponent, // Points to the same email component
    meta: {
      navActiveLink: 'apps-email', 
      layoutWrapperClasses: 'layout-content-height-fixed', 
      action: 'read',        
      subject: 'user',       // Use 'user' subject (manager & user have this)
      requiresAuth: true,    
    },
  },
  // END RE-ADD

  {
    path: '/dashboards/logistics',
    name: 'dashboards-logistics',
    component: () => import('@/pages/apps/logistics/dashboard.vue'),
  },
  {
    path: '/dashboards/academy',
    name: 'dashboards-academy',
    component: () => import('@/pages/apps/academy/dashboard.vue'),
  },
  {
    path: '/apps/ecommerce/dashboard',
    name: 'apps-ecommerce-dashboard',
    component: () => import('@/pages/dashboards/ecommerce.vue'),
  },
]
