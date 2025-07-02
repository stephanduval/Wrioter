import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useApi } from '@/composables/useApi'

interface Manuscript {
  id: number
  title: string
  manuscript_type: 'standard' | 'scrivener'
  created_at: string
  updated_at: string
  description?: string
  scrivener_uuid?: string
  items?: Item[]
}

interface Item {
  id: number
  manuscript_id: number
  parent_id: number | null
  title: string
  content?: string
  type: 'folder' | 'text' | 'research'
  order_index: number
  scrivener_uuid?: string
  children?: Item[]
}

export const useManuscriptStore = defineStore('manuscript', () => {
  const { api } = useApi()
  
  // State
  const manuscripts = ref<Manuscript[]>([])
  const currentManuscript = ref<Manuscript | null>(null)
  const selectedManuscriptId = ref<number | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const selectedManuscript = computed(() => 
    manuscripts.value.find(m => m.id === selectedManuscriptId.value) || null
  )

  const hasSelectedManuscript = computed(() => 
    selectedManuscriptId.value !== null
  )

  // Actions
  async function fetchManuscripts() {
    loading.value = true
    error.value = null
    
    try {
      const response = await api.get('/manuscripts')
      manuscripts.value = response.data.data
      return manuscripts.value
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch manuscripts'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchManuscript(id: number, withItems = false) {
    loading.value = true
    error.value = null
    
    try {
      const params = withItems ? { with: 'items' } : {}
      const response = await api.get(`/manuscripts/${id}`, { params })
      const manuscript = response.data.data
      
      // Update the manuscript in the list
      const index = manuscripts.value.findIndex(m => m.id === id)
      if (index !== -1) {
        manuscripts.value[index] = manuscript
      } else {
        manuscripts.value.push(manuscript)
      }
      
      if (currentManuscript.value?.id === id) {
        currentManuscript.value = manuscript
      }
      
      return manuscript
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch manuscript'
      throw err
    } finally {
      loading.value = false
    }
  }

  function selectManuscript(manuscript: Manuscript | null) {
    selectedManuscriptId.value = manuscript?.id || null
    if (manuscript) {
      // Ensure the manuscript is in our list
      const exists = manuscripts.value.find(m => m.id === manuscript.id)
      if (!exists) {
        manuscripts.value.push(manuscript)
      }
    }
  }

  function setCurrentManuscript(manuscript: Manuscript | null) {
    currentManuscript.value = manuscript
  }

  function clearSelection() {
    selectedManuscriptId.value = null
  }

  function $reset() {
    manuscripts.value = []
    currentManuscript.value = null
    selectedManuscriptId.value = null
    loading.value = false
    error.value = null
  }

  return {
    // State
    manuscripts,
    currentManuscript,
    selectedManuscriptId,
    loading,
    error,
    
    // Getters
    selectedManuscript,
    hasSelectedManuscript,
    
    // Actions
    fetchManuscripts,
    fetchManuscript,
    selectManuscript,
    setCurrentManuscript,
    clearSelection,
    $reset,
  }
})