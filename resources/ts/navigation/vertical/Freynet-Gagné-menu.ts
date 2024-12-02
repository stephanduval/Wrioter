export default [
  { heading: 'Freynet-Gagné' },
  {
    title: 'User Management',
    icon: { icon: 'bx-user' },
    children: [
      {
        title: 'User List',
        to: 'apps-user-list',
      },

    ],
  },
  {
    title: 'Company Management',
    icon: { icon: 'bx-briefcase' },
    children: [
      { title: 'Dashboard', to: 'apps-academy-dashboard' },
      { title: 'My Course', to: 'apps-academy-my-course' },
      { title: 'Course Details', to: 'apps-academy-course-details' },
    ],
  },
  {
    title: 'Project Management',
    icon: { icon: 'bx-check-double' },
    children: [
      { title: 'Dashboard', to: 'apps-logistics-dashboard' },
      { title: 'Fleet', to: 'apps-logistics-fleet' },
    ],
  },
  {
    title: 'Messages',
    icon: { icon: 'bx-envelope' },
    to: 'apps-email',
  },

]
