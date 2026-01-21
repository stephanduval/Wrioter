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
            class="mb-2 manuscript-card"
            @click="selectManuscript(manuscript)"
          >
            <VCardText>
              <div class="d-flex align-center justify-space-between mb-2">
                <h2 class="text-h5">
                  {{ manuscript.title }}
                </h2>
                <VChip
                  :color="manuscript.manuscript_type === 'scrivener' ? 'primary' : 'secondary'"
                  size="small"
                >
                  {{ manuscript.manuscript_type }}
                </VChip>
              </div>
              <p class="text-body-1 mb-4">
                {{ manuscript.description || 'No description available' }}
              </p>
              <div class="text-caption">
                Created: {{ new Date(manuscript.created_at).toLocaleDateString() }}
              </div>
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
import { useRouter } from 'vue-router'
import { useManuscriptStore } from '@/stores/manuscript'

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
  description?: string
  manuscript_type: 'standard' | 'scrivener'
  created_at: string
  updated_at: string
  user_id: number
}

const router = useRouter()
const manuscriptStore = useManuscriptStore()

const manuscripts = ref<Manuscript[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

const fetchManuscripts = async () => {
  try {
    loading.value = true
    console.log('Fetching manuscripts...')
    const response = await axiosInstance.get('/manuscripts')
    console.log('API Response:', response.data)

    // Handle the response structure from the Laravel API
    if (response.data && response.data.data) {
      manuscripts.value = response.data.data
    } else if (Array.isArray(response.data)) {
      manuscripts.value = response.data
    } else {
      manuscripts.value = []
    }

    console.log('Manuscripts loaded:', manuscripts.value)
  } catch (e) {
    error.value = 'Failed to load manuscripts'
    console.error('Error loading manuscripts:', e)
  } finally {
    loading.value = false
  }
}

const selectManuscript = async (manuscript: Manuscript) => {
  try {
    // Store the selected manuscript
    manuscriptStore.selectManuscript(manuscript)

    // Fetch manuscript with items for navigation
    await manuscriptStore.fetchManuscript(manuscript.id, true)

    // Navigate to manuscript view
    router.push(`/manuscripts/${manuscript.id}`)
  } catch (e) {
    console.error('Error selecting manuscript:', e)
    error.value = 'Failed to load manuscript'
  }
}

onMounted(() => {
  fetchManuscripts()
})
</script>

<style scoped>
.manuscript-card {
  cursor: pointer;
  transition: all 0.3s ease;
}

.manuscript-card:hover {
  box-shadow: 0 8px 16px rgba(0, 0, 0, 15%);
  transform: translateY(-2px);
}
</style> 
