<script setup lang="ts">
import { $api, clearAuthData, setAuthData } from '@/utils/api'
import AuthProvider from '@/views/pages/authentication/AuthProvider.vue'
import authV2LoginIllustration from '@images/pages/auth-v2-login-illustration.png'
import { layoutConfig } from '@layouts'
import { VNodeRenderer } from '@layouts/components/VNodeRenderer'
import { RouteLocationRaw, useRouter } from 'vue-router'
import { VForm } from 'vuetify/components/VForm'

definePage({
  meta: {
    layout: 'blank',
    unauthenticatedOnly: true,
  },
})

const isPasswordVisible = ref(false)

// const route = useRoute()
const router = useRouter()

// const allRoutes = router.getRoutes()

// console.log(allRoutes)

const ability = useAbility()

const errors = ref<Record<string, string | undefined>>({
  email: undefined,
  password: undefined,
  general: undefined,
})

const refVForm = ref<VForm>()

const credentials = ref({
  email: 'email',
  password: 'password',
})

const isAuthenticated = () => {
  const accessToken = document.cookie.split('; ').find(row => row.startsWith('accessToken='))

  return !!accessToken
}

if (isAuthenticated())
  router.replace({ name: 'dashboards-analytics' }) // Redirect to home if already logged in

const rememberMe = ref(false)

// Only show demo alert in development environment
const isDevelopment = computed(() => {
  return import.meta.env.DEV || import.meta.env.VITE_APP_ENV === 'development'
})

const login = async () => {
  try {
    const { accessToken, userData, abilityRules } = await $api('/auth/login', {
      method: 'POST',
      body: {
        email: credentials.value.email,
        password: credentials.value.password,
        remember_me: rememberMe.value,
      },
    })

    // Enhanced debugging
    console.log('Login Response:', {
      accessToken: accessToken ? 'Token received' : 'No token',
      userData: userData ? {
        id: userData.id,
        role: userData.role,
        email: userData.email,
      } : 'No user data',
      abilityRules: abilityRules ? abilityRules : 'No rules',
    })

    if (!accessToken || !userData || !abilityRules) {
      throw new Error('Invalid login response - missing required data')
    }

    // Update ability with enhanced debugging
    const mappedRules = abilityRules.map((rule: { action: string; subject: string }) => {
      const mappedRule = {
        action: rule.action.toLowerCase(),
        subject: rule.subject.toLowerCase(),
      }
      console.log('Mapping rule:', { 
        original: rule, 
        mapped: mappedRule,
        canReadProjects: mappedRule.action === 'read' && mappedRule.subject === 'projects'
      })
      return mappedRule
    })
    console.log('Final Mapped Ability Rules:', mappedRules)
    
    ability.update(mappedRules)

    // Verify ability was updated with specific project check
    console.log('Current Ability Rules:', ability.rules)
    console.log('Can read projects?', ability.can('read', 'projects'))
    console.log('Can manage all?', ability.can('manage', 'all'))

    // Use the enhanced setAuthData utility
    try {
      setAuthData({ accessToken, userData, abilityRules })
      console.log('Auth data stored successfully')
    } catch (error) {
      console.error('Failed to store auth data:', error)
      throw new Error('Failed to store authentication data')
    }

    // --- Direct Role-Based Redirect ---
    const userRole = userData.role?.toLowerCase() || 'User';
    let targetRoute: RouteLocationRaw;

    console.log(`[DEBUG] Determining redirect target for role: ${userRole}`);

    if (userRole === 'admin' || userRole === 'auth') {
        targetRoute = { name: 'dashboards-analytics' };
        console.log(`[DEBUG] Target set for admin/auth:`, targetRoute);
    } else if (userRole === 'client') {
        targetRoute = { name: 'apps-email' };
        console.log(`[DEBUG] Target set for client:`, targetRoute);
    } else if (userRole === 'manager' || userRole === 'user') {
        targetRoute = { path: '/messages/list' };
        console.log(`[DEBUG] Target set for manager/user:`, targetRoute);
    } else {
        console.warn(`[DEBUG] Unexpected role "${userRole}", defaulting to dashboards-analytics`);
        targetRoute = { name: 'dashboards-analytics' };
    }

    console.log(`[DEBUG] Attempting router.replace with:`, targetRoute);
    await router.replace(targetRoute);

  } catch (err: any) {
    console.error('Login error:', err)
    errors.value.general = err.data?.message || err.message || 'An error occurred during login. Please try again.'
    
    // Clear any partial auth data on error
    clearAuthData()
  }
}

const onSubmit = () => {
  refVForm.value?.validate()
    .then(({ valid: isValid }) => {
      if (isValid)
        login()
    })
}
</script>

<template>
  <RouterLink to="/">
    <div class="auth-logo d-flex align-center gap-x-2">
      <VNodeRenderer :nodes="layoutConfig.app.logo" />
      <h1 class="auth-title">
        {{ layoutConfig.app.title }}
      </h1>
    </div>
  </RouterLink>

  <VRow
    no-gutters
    class="auth-wrapper bg-surface"
  >
    <VCol
      md="8"
      class="d-none d-md-flex"
    >
      <div class="position-relative bg-background w-100 pa-8">
        <div class="d-flex align-center justify-center w-100 h-100">
          <VImg
            max-width="700"
            :src="authV2LoginIllustration"
            class="auth-illustration"
          />
        </div>
      </div>
    </VCol>

    <VCol
      cols="12"
      md="4"
      class="auth-card-v2 d-flex align-center justify-center"
    >
      <VCard
        flat
        :max-width="500"
        class="mt-12 mt-sm-0 pa-6"
      >
        <VCardText>
          <h4 class="text-h4 mb-1">
            Welcome to <span class="text-capitalize"> {{ layoutConfig.app.title }} </span>! ��🏻
          </h4>
          <p class="mb-0">
            Please sign-in to your account and start the adventure
          </p>
        </VCardText>
        <VCardText>
          <!-- General Error Alert -->
          <VAlert
            v-if="errors.general"
            :value="!!errors.general"
            color="error"
            variant="tonal"
            class="mb-4"
          >
            {{ errors.general }}
          </VAlert>

          <!-- Demo credentials removed for security -->
          <VAlert
            color="info"
            variant="tonal"
            v-if="isDevelopment"
          >
            <p class="text-sm mb-0">
              Demo mode enabled. Contact your administrator for login credentials.
            </p>
          </VAlert>
        </VCardText>
        <VCardText>
          <VForm
            ref="refVForm"
            @submit.prevent="onSubmit"
          >
            <VRow>
              <!-- email -->
              <VCol cols="12">
                <AppTextField
                  v-model="credentials.email"
                  label="Email"
                  placeholder="johndoe@email.com"
                  type="email"
                  autofocus
                  :rules="[requiredValidator, emailValidator]"
                />
              </VCol>

              <!-- password -->
              <VCol cols="12">
                <AppTextField
                  v-model="credentials.password"
                  label="Password"
                  placeholder="············"
                  :rules="[requiredValidator]"
                  :type="isPasswordVisible ? 'text' : 'password'"
                  :error-messages="errors.password"
                  :append-inner-icon="isPasswordVisible ? 'bx-hide' : 'bx-show'"
                  @click:append-inner="isPasswordVisible = !isPasswordVisible"
                />

                <div class="d-flex align-center flex-wrap justify-space-between my-6">
                  <VCheckbox
                    v-model="rememberMe"
                    label="Remember me"
                  />
                  <RouterLink
                    class="text-primary"
                    :to="{ name: 'forgot-password' }"
                  >
                    Forgot Password?
                  </RouterLink>
                </div>

                <VBtn
                  block
                  type="submit"
                >
                  Login
                </VBtn>
              </VCol>

              <!-- create account -->
              <VCol
                cols="12"
                class="text-body-1 text-center"
              >
                <span class="d-inline-block">
                  New on our platform?
                </span>
                <RouterLink
                  class="text-primary ms-1 d-inline-block text-body-1"
                  :to="{ name: 'register' }"
                >
                  Create an account
                </RouterLink>
              </VCol>
              <VCol
                cols="12"
                class="d-flex align-center"
              >
                <VDivider />
                <span class="mx-4">or</span>
                <VDivider />
              </VCol>

              <!-- auth providers -->
              <VCol
                cols="12"
                class="text-center"
              >
                <AuthProvider />
              </VCol>
            </VRow>
          </VForm>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
</template>

<style lang="scss">
@use "@core-scss/template/pages/page-auth";
</style>
