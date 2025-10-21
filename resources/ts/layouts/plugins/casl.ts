import type { RouteLocationNormalized, RouteRecordRaw } from 'vue-router'
import { ability } from '@/plugins/casl/ability'

export const canNavigate = (to: RouteLocationNormalized) => {
  // Use global ability instance instead of injected one to work outside component context
  
  // console.log('Navigation Check:', {
  //   path: to.path,
  //   meta: to.meta,
  //   currentRules: ability.rules,
  //   ability: ability,
  // })
  
  const canAccess = to.matched.some((route: RouteRecordRaw) => {
    const action = route.meta?.action as string | undefined
    const subject = route.meta?.subject as string | undefined
    
    if (!action || !subject) {
      // console.log('Route missing required meta:', { action, subject })
      return false
    }
    
    const can = ability.can(action.toLowerCase(), subject.toLowerCase())
    // console.log('Route Check:', {
    //   path: route.path,
    //   action,
    //   subject,
    //   can,
    //   actionLower: action.toLowerCase(),
    //   subjectLower: subject.toLowerCase(),
    // })
    return can
  })
  
  // console.log('Final Navigation Result:', canAccess)
  return canAccess
} 
