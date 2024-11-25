<script lang="ts" setup>
definePage({
  meta: {
    action: 'read',
    subject: 'Admin',
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
    >Welcome to the Admin Reports page.
  </p>
  <p v-else>
    You don't have enough permission to view this page
  </p>
</template>
