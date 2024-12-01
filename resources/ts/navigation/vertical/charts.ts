export default [
  { heading: 'Charts' },
  {
    title: 'Charts',
    icon: { icon: 'bx-chart' },
    action: 'read',
    subject: 'charts',
    children: [
      { title: 'Apex Chart', to: 'charts-apex-chart', action: 'read', subject: 'apex-chart' },
      { title: 'Chartjs', to: 'charts-chartjs', action: 'read', subject: 'chartjs' },
    ],
  },
]
