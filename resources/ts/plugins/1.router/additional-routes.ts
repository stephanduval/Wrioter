import type { RouteRecordRaw } from 'vue-router/auto'

const emailRouteComponent = () => import('@/pages/apps/email/index.vue')
const projectsListComponent = () => import('@/pages/apps/projects/list/index.vue')
const projectDetailsComponent = () => import('@/pages/apps/projects/view/[id].vue')

// 👉 Redirects
export const redirects: RouteRecordRaw[] = [
  // ℹ️ We are redirecting to different pages based on role.
  // NOTE: Role is just for UI purposes. ACL is based on abilities.
  {
    path: '/',
    name: 'index',
    redirect: to => {
      // Get user data from localStorage
      const userDataStr = localStorage.getItem('userData')
      const userData = userDataStr ? JSON.parse(userDataStr) : null
      const userRole = userData?.role?.toLowerCase() // Normalize role to lowercase

      console.log('[Redirect] Checking role:', userRole); 

      // Change target for admin/auth
      if (userRole === 'admin' || userRole === 'auth') { 
         console.log('[Redirect] Routing admin/auth to dashboards-analytics');
         return { name: 'dashboards-analytics' };
      }
      
      // Targets for other roles remain the same
      if (userRole === 'client') {
          console.log('[Redirect] Routing client to apps-email');
          return { name: 'apps-email' }; 
      }

      if (userRole === 'manager' || userRole === 'user') {
          console.log('[Redirect] Routing manager/user to /messages/list');
          return { path: '/messages/list' }; 
      }

      // Fallback logic - update default target
      console.log('[Redirect] Role undefined or unexpected, determining fallback...');
      const isLoggedIn = !!(localStorage.getItem('userData') && localStorage.getItem('accessToken'))
      if(!isLoggedIn) {
         console.log('[Redirect] Fallback: Not logged in, routing to login');
         return { name: 'login' }; 
      } else {
         console.log('[Redirect] Fallback: Logged in, role unexpected. Defaulting to dashboards-analytics.');
         return { name: 'dashboards-analytics' }; 
      }
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
  // Project routes
  {
    path: '/apps/projects/list',
    name: 'apps-projects-list',
    component: projectsListComponent,
    meta: {
      layoutWrapperClasses: 'layout-content-height-fixed',
      action: 'read',
      subject: 'projects',
      requiresAuth: true,
    },
  },
  {
    path: '/apps/projects/view/:id',
    name: 'apps-projects-view',
    component: projectDetailsComponent,
    meta: {
      layoutWrapperClasses: 'layout-content-height-fixed',
      action: 'read',
      subject: 'projects',
      requiresAuth: true,
    },
  },
  
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
