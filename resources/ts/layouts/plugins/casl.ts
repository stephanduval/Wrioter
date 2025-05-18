import { useAbility } from '@casl/vue'
import type { RouteLocationNormalized, RouteRecordRaw } from 'vue-router'

export const canNavigate = (to: RouteLocationNormalized) => {
  const ability = useAbility()
  
  console.log('Navigation Check:', {
    path: to.path,
    meta: to.meta,
    currentRules: ability.rules,
  })
  
  const canAccess = to.matched.some((route: RouteRecordRaw) => {
    const action = route.meta?.action as string | undefined
    const subject = route.meta?.subject as string | undefined
    
    if (!action || !subject) {
      console.log('Route missing required meta:', { action, subject })
      return false
    }
    
    const can = ability.can(action, subject)
    console.log('Route Check:', {
      path: route.path,
      action,
      subject,
      can,
    })
    return can
  })
  
  console.log('Final Navigation Result:', canAccess)
  return canAccess
} 
