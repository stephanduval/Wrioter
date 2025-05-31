<template>
  <VCard>
    <VCardText>
      <h1 class="text-h4 mb-4">Manuscripts</h1>

      <VProgressLinear
        v-if="loading"
        indeterminate
        color="primary"
      />

      <VAlert
        v-else-if="error"
        type="error"
        class="mb-4"
      >
        {{ error }}
      </VAlert>

      <template v-else>
        <div
          v-for="manuscript in manuscripts"
          :key="manuscript.id"
          class="mb-6"
        >
          <VCard
            variant="outlined"
            class="mb-2"
          >
            <VCardText>
              <div class="d-flex align-center justify-space-between mb-2">
                <h2 class="text-h5">
                  {{ manuscript.title }}
                </h2>
                <VChip
                  :color="manuscript.status === 'completed' ? 'success' : manuscript.status === 'in_progress' ? 'warning' : 'info'"
                  size="small"
                >
                  {{ manuscript.status }}
                </VChip>
              </div>
              <p class="text-body-1 mb-4">
                {{ manuscript.description }}
              </p>
            </VCardText>
          </VCard>
        </div>

        <VAlert
          v-if="manuscripts.length === 0"
          type="info"
        >
          No manuscripts found. Create your first manuscript to get started!
        </VAlert>
      </template>
    </VCardText>
  </VCard>
</template>

<script setup lang="ts">
import axios from 'axios'
import { onMounted, ref } from 'vue'

// Configure axios
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api'

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
})

// Add request interceptor to include token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Add response interceptor to handle auth errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('userData')
      localStorage.removeItem('abilityRules')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

interface Manuscript {
  id: number
  title: string
  description: string
  status: string
}

const manuscripts = ref<Manuscript[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

const fetchManuscripts = async () => {
  try {
    loading.value = true
    const response = await axiosInstance.get('/manuscripts')
    manuscripts.value = response.data
  } catch (e) {
    error.value = 'Failed to load manuscripts'
    console.error('Error loading manuscripts:', e)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchManuscripts()
})
</script>

<style scoped>
</style> 
