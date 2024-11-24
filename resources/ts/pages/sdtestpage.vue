<script lang="ts" setup>
definePage({
  meta: {
    action: 'read',
    subject: 'AclDemo',
  },
})

const user = {
  action: 'read' as const,

  // `subject` property type is `Subjects` ("src/plugins/casl/AppAbility.ts")
  subject: 'Admin' as const,
}
</script>

<template>
  <p v-if="$can(user.action, user.subject)">
    We have earned 50k more compared to previous week
  </p>
  <p v-else>
    You don't have enough permission to view the finance data
  </p>
</template>
