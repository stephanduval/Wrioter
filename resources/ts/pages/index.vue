<template>
  <div>
    <!-- Debug Test Button (Dev Server Only) -->
    <VCard
      v-if="isDevelopment"
      class="mb-6 bg-warning"
      title="🧪 Mobile Error Testing (Dev Server Only)"
    >
      <VCardText>
        <p class="mb-4">Use these buttons to test error logging on mobile:</p>
        <div class="d-flex gap-2 flex-wrap">
          <VBtn
            color="error"
            @click="testErrors.jsError"
          >
            Test JS Error
          </VBtn>
          <VBtn
            color="error"
            @click="testErrors.undefined"
          >
            Test Undefined Error
          </VBtn>
          <VBtn
            color="error"
            @click="testErrors.promiseRejection"
          >
            Test Promise Rejection
          </VBtn>
          <VBtn
            color="error"
            @click="testErrors.vueError"
          >
            Test Vue Error
          </VBtn>
          <VBtn
            color="error"
            @click="testErrors.networkError"
          >
            Test Network Error
          </VBtn>
        </div>
        <p class="mt-4 text-caption">
          Check server logs to verify errors are being captured:
          <code>ssh sduval@192.168.1.252 "tail -f '/home/sduval/Code/Wrioter/storage/logs/laravel.log' | grep CLIENT_ERROR"</code>
        </p>
      </VCardText>
    </VCard>

    <VCard
      class="mb-6"
      title="Kick start your project 🚀"
    >
      <VCardText>All the best for your new project.</VCardText>
      <VCardText>
        Please make sure to read our <a
          href="https://demos.themeselection.com/sneat-vuetify-vuejs-admin-template/documentation/"
          target="_blank"
          rel="noopener noreferrer"
          class="text-decoration-none"
        >
          Template Documentation
        </a> to understand where to go from here and how to use our template.
      </VCardText>
    </VCard>

    <VCard title="Want to integrate JWT? 🔒">
      <VCardText>We carefully crafted JWT flow so you can implement JWT with ease and with minimum efforts.</VCardText>
      <VCardText>Please read our JWT Documentation to get more out of JWT authentication.</VCardText>
    </VCard>
  </div>
</template>

<script setup lang="ts">
// Check if we're on dev server
const isDevelopment = import.meta.env.DEV ||
  window.location.hostname === '192.168.1.252' ||
  window.location.hostname === 'localhost' ||
  window.location.hostname.includes('127.0.0.1')

// Get test functions from window
const testErrors = (window as any).testErrors || {
  jsError: () => alert('Test functions not loaded'),
  undefined: () => alert('Test functions not loaded'),
  promiseRejection: () => alert('Test functions not loaded'),
  vueError: () => alert('Test functions not loaded'),
  networkError: () => alert('Test functions not loaded'),
}
</script>
