export default [
  // Main Menu Section
  { heading: 'menu.heading' },
  
  // User Management Section
  {
    title: 'menu.userManagement',
    icon: { icon: 'bx-user' },
    to: 'apps-user-list',
    action: 'read',
    subject: 'admin',
  },
  {
    title: 'menu.companyList',
    icon: { icon: 'bx-briefcase' },
    to: 'apps-companies-list',
    action: 'read',
    subject: 'admin',
  },
  {
    title: 'menu.projects',
    icon: { icon: 'bx-check-double' },
    to: 'apps-projects-list',
    action: 'read',
    subject: 'projects',
  },
  {
    title: 'menu.messages',
    icon: { icon: 'bx-envelope' },
    to: 'apps-email',
    action: 'read',
    subject: 'messages',
  },

  // Manuscript Section
  { heading: 'menu.manuscripts' },
  
  {
    title: 'menu.manuscripts.new',
    icon: { icon: 'bx-plus' },
    to: 'manuscripts-new',
    action: 'create',
    subject: 'manuscripts',
  },
  {
    title: 'menu.manuscripts.list',
    icon: { icon: 'bx-book' },
    to: 'manuscripts-list',
    action: 'read',
    subject: 'manuscripts',
  },
  // Dynamic manuscript items will be added here by the component
]
