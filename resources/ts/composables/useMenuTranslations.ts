import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

export function useMenuTranslations() {
  const { t } = useI18n()

  const menuItems = computed(() => [
    { heading: 'Freynet-Gagné' },
    {
      title: t('menu.userManagement'),
      icon: { icon: 'bx-user' },
      to: 'apps-user-list',
    },
    {
      title: t('menu.companyList'),
      icon: { icon: 'bx-briefcase' },
      to: 'apps-companies-list'
    },
    {
      title: t('menu.projects'),
      icon: { icon: 'bx-check-double' },
      to: 'apps-projects-list',
    },
    {
      title: t('menu.messages'),
      icon: { icon: 'bx-envelope' },
      to: 'apps-email',
    },
  ])

  return {
    menuItems
  }
} 
