<script setup lang="ts">
const shortcuts = [
  {
    icon: 'bx-tachometer',
    title: 'Admin Dashboard',
    subtitle: 'Admin Console',
    to: { name: 'admin-dashboard' },
  },
  {
    icon: 'bx-user',
    title: 'Users',
    subtitle: 'Manage Users',
    to: { name: 'apps-user-list' },
  },
  {
    icon: 'bx-briefcase',
    title: 'Companies',
    subtitle: 'Company List',
    to: { name: 'apps-companies-list' },
  },
  {
    icon: 'bx-check-double',
    title: 'Projects',
    subtitle: 'Project Management',
    to: { name: 'apps-projects-list' },
  },
  {
    icon: 'bx-envelope',
    title: 'Messages',
    subtitle: 'Email Management',
    to: { name: 'apps-email' },
  },
  {
    icon: 'bx-book',
    title: 'Manuscripts',
    subtitle: 'Manuscript List',
    to: { name: 'manuscripts-list' },
  },
  {
    icon: 'bx-plus',
    title: 'New Manuscript',
    subtitle: 'Create Manuscript',
    to: { name: 'manuscripts-new' },
  },
  {
    icon: 'bx-navigation',
    title: 'Select Manuscript',
    subtitle: 'Choose Manuscript',
    to: { name: 'select-manuscript' },
  },
  {
    icon: 'bx-import',
    title: 'Scrivener Import',
    subtitle: 'Import from Scrivener',
    to: { name: 'scrivener-import' },
  },
  {
    icon: 'bx-pie-chart-alt-2',
    title: 'Dashboard',
    subtitle: 'Dashboard Analytics',
    to: { name: 'dashboards-analytics' },
  },
]
</script>

<template>
  <Shortcuts :shortcuts="shortcuts" />
</template>
