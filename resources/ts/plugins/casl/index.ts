import type { App } from 'vue'

import { createMongoAbility } from '@casl/ability'
import { abilitiesPlugin } from '@casl/vue'
import type { Rule } from './ability'

export default function (app: App) {
  // 1. Reads the rules from the cookie
  const userAbilityRules = useCookie<Rule[]>('userAbilityRules')

  // 2. Creates an ability instance with the rules found in the cookie (or empty if no cookie)
  const initialAbility = createMongoAbility(userAbilityRules.value ?? [])

  // 3. Registers the CASL plugin with Vue, providing the loaded abilities
  app.use(abilitiesPlugin, initialAbility, {
    useGlobalProperties: true,
  })
}
