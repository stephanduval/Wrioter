export default [
  { heading: 'Others' },
  {
    title: 'Access Control',
    icon: { icon: 'bx-command' },
    to: 'access-control',
    action: 'read',
    subject: 'access-control',
  },
  {
    title: 'Nav Levels',
    icon: { icon: 'bx-menu' },
    action: 'read',
    subject: 'nav-levels',
    children: [
      {
        title: 'Level 2.1',
        to: null,
        action: 'read',
        subject: 'level-2.1',
      },
      {
        title: 'Level 2.2',
        children: [
          {
            title: 'Level 3.1',
            to: null,
          },
          {
            title: 'Level 3.2',
            to: null,
          },
        ],
      },
    ],
  },
  {
    title: 'Disabled Menu',
    to: null,
    icon: { icon: 'bx-hide' },
    disable: true,
  },
  {
    title: 'Raise Support',
    href: 'https://themeselection.com/support/',
    icon: { icon: 'bx-phone' },
    target: '_blank',
    action: 'read',
    subject: 'support',
  },
  {
    title: 'Documentation',
    href: 'https://demos.themeselection.com/sneat-vuetify-vuejs-admin-template/documentation/guide/laravel-integration/folder-structure.html',
    icon: { icon: 'bx-file' },
    target: '_blank',
    action: 'read',
    subject: 'documentation',
  },
]
