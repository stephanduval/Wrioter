<script setup lang="ts">
import { VNodeRenderer } from '@layouts/components/VNodeRenderer'
import { themeConfig } from '@themeConfig'
import { useRouter } from 'vue-router'

import authV2ForgotPasswordIllustration from '@images/pages/auth-v2-forgot-password-illustration.png'

const router = useRouter()
// const email = ref('')
// const loading = ref(false)
// const error = ref('')
// const success = ref('')

definePage({
  meta: {
    layout: 'blank',
    unauthenticatedOnly: true,
  },
})

// const handleSubmit = async () => {
//   try {
//     loading.value = true
//     error.value = ''
//     success.value = ''

//     const response = await fetch('/api/auth/forgot-password', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({ email: email.value }),
//     })

//     const data = await response.json()

//     if (response.ok) {
//       success.value = data.message || 'Password reset link has been sent to your email. Please check your spam folder if you don\'t see it in your inbox.'
//       // Optionally redirect after a delay
//       setTimeout(() => {
//         router.push({ name: 'login' })
//       }, 5000)
//     } else {
//       error.value = data.message || 'An error occurred. Please try again.'
//     }
//   } catch (err) {
//     error.value = 'An error occurred. Please try again.'
//     console.error('Password reset request error:', err)
//   } finally {
//     loading.value = false
//   }
// }
</script>

<template>
  <RouterLink to="/">
    <div class="auth-logo d-flex align-center gap-x-2">
      <VNodeRenderer :nodes="themeConfig.app.logo" />
      <h1 class="auth-title">
        {{ themeConfig.app.title }}
      </h1>
    </div>
  </RouterLink>

  <VRow
    class="auth-wrapper bg-surface"
    no-gutters
  >
    <VCol
      md="8"
      class="d-none d-md-flex"
    >
      <div class="position-relative bg-background w-100 pa-8">
        <div class="d-flex align-center justify-center w-100 h-100">
          <VImg
            max-width="700"
            :src="authV2ForgotPasswordIllustration"
            class="auth-illustration"
          />
        </div>
      </div>
    </VCol>

    <VCol
      cols="12"
      md="4"
      class="d-flex align-center justify-center"
    >
      <VCard
        flat
        :max-width="500"
        class="mt-12 mt-sm-0 pa-6"
      >
        <VCardText>
          <h4 class="text-h4 mb-1">
            Forgot Password? 🔒
          </h4>
          <p class="mb-0">
            Please contact your administrator at info@freynet-gagne.com to reset your password
          </p>
        </VCardText>

        <VCardText>
          <!-- Back to login -->
          <RouterLink
            class="d-flex align-center justify-center"
            :to="{ name: 'login' }"
          >
            <VIcon
              icon="bx-chevron-left"
              size="20"
              class="me-1 flip-in-rtl"
            />
            <span>Back to login</span>
          </RouterLink>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
</template>

<style lang="scss">
@use "@core-scss/template/pages/page-auth";
</style>
