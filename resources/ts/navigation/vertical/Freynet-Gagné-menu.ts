export default [
  { heading: 'menu.heading' },
  
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
]
