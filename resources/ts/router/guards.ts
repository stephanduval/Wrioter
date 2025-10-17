import { useAbility } from '@casl/vue'

const ability = useAbility()
console.log('Navigation Guard - Current Ability:', ability.rules.value)
console.log('Navigation Guard - Route Meta:', to.meta) 
