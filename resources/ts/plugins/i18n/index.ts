import { cookieRef } from '@layouts/stores/config'
import { themeConfig } from '@themeConfig'
import type { App } from 'vue'
import { createI18n } from 'vue-i18n'
import vuetifyMessages from './messages/en'

const localeMessages = Object.fromEntries(
  Object.entries(
    import.meta.glob<{ default: any }>('./locales/*.json', { eager: true }))
    .map(([key, value]) => [key.slice(10, -5), value.default]),
)

// Merge Vuetify messages with locale messages
const messages = {
  en: {
    ...localeMessages.en,
    $vuetify: {
      ...vuetifyMessages.$vuetify,
    },
  },
  fr: {
    ...localeMessages.fr,
    $vuetify: {
      ...vuetifyMessages.$vuetify,
    },
  },
}

let _i18n: any = null

export const getI18n = () => {
  if (_i18n === null) {
    _i18n = createI18n({
      legacy: false,
      locale: cookieRef('language', themeConfig.app.i18n.defaultLocale).value,
      fallbackLocale: 'en',
      messages,
    })
  }

  return _i18n
}

export default function (app: App) {
  app.use(getI18n())
}
