<script lang="ts" setup>
definePage({
  meta: {
    action: 'read',
    subject: 'admin',
  },
})

const user = {
  action: 'read' as const,
  subject: 'admin' as const,
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
