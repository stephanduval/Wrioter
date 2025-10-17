<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useApi } from '@/composables/useApi'

interface Manuscript {
  id: number
  title: string
  manuscript_type: 'standard' | 'scrivener'
  created_at: string
  updated_at: string
  description?: string
}

const router = useRouter()
const { api } = useApi()

// State
const manuscripts = ref<Manuscript[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

// Methods
const fetchManuscripts = async () => {
  loading.value = true
  error.value = null

  try {
    console.log('Attempting to fetch manuscripts...')
    const response = await api.get('/manuscripts')
    console.log('Manuscripts API response:', response)
    console.log('Manuscripts API response.data:', response.data)

    if (response.data && Array.isArray(response.data.data)) {
      manuscripts.value = response.data.data
      console.log('Set manuscripts from response.data.data:', manuscripts.value)
    } else if (Array.isArray(response.data)) {
      manuscripts.value = response.data
      console.log('Set manuscripts from response.data:', manuscripts.value)
    } else {
      manuscripts.value = []
      console.log('No valid manuscripts data found, set empty array')
    }

    console.log('Final manuscripts array:', manuscripts.value)
    console.log('Manuscripts count:', manuscripts.value.length)
  } catch (err: any) {
    console.error('Failed to fetch manuscripts:', err)
    console.error('Error details:', err.message)
    error.value = err.message || 'Failed to load manuscripts'
  } finally {
    loading.value = false
  }
}

const selectManuscript = (manuscript: Manuscript) => {
  router.push(`/manuscripts/${manuscript.id}`)
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString()
}

const getTypeColor = (type: string) => {
  return type === 'scrivener' ? 'primary' : 'secondary'
}

// Lifecycle
onMounted(async () => {
  await fetchManuscripts()
})
</script>

<template>
  <VContainer>
    <VRow>
      <VCol cols="12">
        <VCard>
          <VCardTitle class="d-flex align-center">
            <VIcon icon="bx-book" class="me-3" />
            Manuscripts
            <VSpacer />
            <VBtn
              color="primary"
              prepend-icon="bx-plus"
              @click="router.push('/manuscripts/create')"
            >
              New Manuscript
            </VBtn>
          </VCardTitle>

          <VCardText>
            <!-- Loading State -->
            <div v-if="loading" class="text-center py-8">
              <VProgressCircular indeterminate color="primary" />
              <div class="mt-4">Loading manuscripts...</div>
            </div>

            <!-- Error State -->
            <VAlert
              v-else-if="error"
              type="error"
              class="mb-4"
            >
              <div><strong>Error:</strong> {{ error }}</div>
              <div class="text-caption mt-2">Check browser console for more details</div>
              <VBtn
                color="error"
                variant="text"
                @click="fetchManuscripts"
                class="mt-2"
              >
                Retry
              </VBtn>
            </VAlert>

            <!-- Debug Info -->
            <VAlert
              v-if="!loading && !error"
              type="info"
              class="mb-4"
            >
              <div><strong>Debug:</strong> Found {{ manuscripts.length }} manuscripts</div>
              <div class="text-caption">Check browser console for API response details</div>
            </VAlert>

            <!-- Empty State -->
            <div v-if="!loading && !error && manuscripts.length === 0" class="text-center py-8">
              <VIcon
                icon="bx-book-open"
                size="64"
                color="grey-lighten-1"
                class="mb-4"
              />
              <h3 class="text-h5 mb-2">No manuscripts yet</h3>
              <p class="text-body-1 mb-4">Create your first manuscript to get started.</p>
              <VBtn
                color="primary"
                prepend-icon="bx-plus"
                @click="router.push('/manuscripts/create')"
              >
                Create Manuscript
              </VBtn>
            </div>

            <!-- Manuscripts List -->
            <VRow v-if="!loading && !error && manuscripts.length > 0">
              <VCol
                v-for="manuscript in manuscripts"
                :key="manuscript.id"
                cols="12"
                md="6"
                lg="4"
              >
                <VCard
                  class="h-100 cursor-pointer"
                  hover
                  @click="selectManuscript(manuscript)"
                >
                  <VCardTitle class="d-flex align-center">
                    <VIcon
                      :icon="manuscript.manuscript_type === 'scrivener' ? 'bx-book-bookmark' : 'bx-book'"
                      class="me-2"
                    />
                    {{ manuscript.title }}
                  </VCardTitle>

                  <VCardText>
                    <div v-if="manuscript.description" class="mb-3">
                      {{ manuscript.description }}
                    </div>

                    <div class="d-flex align-center mb-2">
                      <VChip
                        :color="getTypeColor(manuscript.manuscript_type)"
                        size="small"
                        class="me-2"
                      >
                        {{ manuscript.manuscript_type }}
                      </VChip>
                    </div>

                    <div class="text-caption text-medium-emphasis">
                      Created: {{ formatDate(manuscript.created_at) }}
                    </div>
                    <div class="text-caption text-medium-emphasis">
                      Updated: {{ formatDate(manuscript.updated_at) }}
                    </div>
                  </VCardText>

                  <VCardActions>
                    <VBtn
                      color="primary"
                      variant="text"
                      @click.stop="selectManuscript(manuscript)"
                    >
                      Open
                    </VBtn>
                    <VBtn
                      color="secondary"
                      variant="text"
                      @click.stop="router.push(`/manuscripts/${manuscript.id}/edit`)"
                    >
                      Edit
                    </VBtn>
                  </VCardActions>
                </VCard>
              </VCol>
            </VRow>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>
  </VContainer>
</template>