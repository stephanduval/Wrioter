<template>
  <div>
    <VCard>
      <VCardTitle>
        {{ $t('menu.mindMapCreate') }}
      </VCardTitle>

      <VCardText>
        <VForm ref="form" @submit.prevent="createMindmap">
          <VRow>
            <VCol cols="12">
              <VTextField
                v-model="formData.title"
                :label="$t('Title')"
                :rules="[requiredRule]"
                variant="outlined"
              />
            </VCol>

            <VCol cols="12">
              <VTextarea
                v-model="formData.description"
                :label="$t('Description')"
                variant="outlined"
                rows="3"
              />
            </VCol>

            <VCol cols="12" md="6">
              <VSelect
                v-model="formData.template"
                label="Start from template"
                :items="templates"
                item-title="name"
                item-value="id"
                variant="outlined"
                clearable
              />
            </VCol>

            <VCol cols="12" md="6">
              <VCheckbox
                v-model="formData.is_template"
                label="Save as template for future use"
              />
            </VCol>
          </VRow>

          <div class="d-flex justify-end gap-2 mt-4">
            <VBtn
              variant="text"
              @click="cancel"
            >
              Cancel
            </VBtn>
            <VBtn
              type="submit"
              color="primary"
              variant="flat"
            >
              Create Mind Map
            </VBtn>
          </div>
        </VForm>
      </VCardText>
    </VCard>

    <!-- Template Preview -->
    <VCard v-if="selectedTemplate" class="mt-4">
      <VCardTitle>Template Preview</VCardTitle>
      <VCardText>
        <div class="template-preview">
          <!-- TODO: Show template preview -->
          <p>{{ selectedTemplate.description }}</p>
        </div>
      </VCardText>
    </VCard>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMindmapStore as useMindMapStore } from '@/stores/mindmap'
import { useToast } from 'vue-toastification'

const router = useRouter()
const mindmapStore = useMindMapStore()
const toast = useToast()

// Refs
const form = ref(null)

// Data
const formData = ref({
  title: '',
  description: '',
  template: null,
  is_template: false,
})

const templates = ref([
  { id: 'blank', name: 'Blank Mind Map', description: 'Start with an empty canvas' },
  { id: 'story-arc', name: 'Story Arc', description: 'Three-act structure template' },
  { id: 'character-web', name: 'Character Relationships', description: 'Character interaction template' },
  { id: 'world-building', name: 'World Building', description: 'Location and setting template' },
  { id: 'plot-threads', name: 'Plot Threads', description: 'Multiple storyline template' },
])

// Computed
const selectedTemplate = computed(() => {
  if (!formData.value.template) return null
  return templates.value.find(t => t.id === formData.value.template)
})

// Methods
const createMindmap = async () => {
  const { valid } = await form.value.validate()
  if (!valid) return

  try {
    const data = {
      title: formData.value.title,
      description: formData.value.description,
      is_template: formData.value.is_template,
      settings: {
        template: formData.value.template,
      },
    }

    const newMindmap = await mindmapStore.createMindmap(data)

    toast.success('Mind map created successfully')

    // If template was selected, apply it
    if (formData.value.template && formData.value.template !== 'blank') {
      await applyTemplate(newMindmap.id, formData.value.template)
    }

    // Navigate to the new mindmap
    router.push({ name: 'mindmap-view', params: { id: newMindmap.id } })
  } catch (error) {
    console.error('Error creating mindmap:', error)
    toast.error('Failed to create mind map')
  }
}

const applyTemplate = async (mindmapId: number, templateId: string) => {
  // TODO: Apply template structure to the new mindmap
  console.log('Applying template:', templateId, 'to mindmap:', mindmapId)

  // Template structures
  const templateStructures = {
    'story-arc': {
      nodes: [
        { id: 1, content: 'Act 1: Setup', position: { x: -200, y: 0 }, type: 'folder' },
        { id: 2, content: 'Act 2: Confrontation', position: { x: 0, y: 0 }, type: 'folder' },
        { id: 3, content: 'Act 3: Resolution', position: { x: 200, y: 0 }, type: 'folder' },
        { id: 4, content: 'Inciting Incident', position: { x: -100, y: 100 }, type: 'text' },
        { id: 5, content: 'Climax', position: { x: 100, y: 100 }, type: 'text' },
      ],
      connections: [
        { from: 1, to: 2, type: 'leads-to' },
        { from: 2, to: 3, type: 'leads-to' },
        { from: 1, to: 4, type: 'contains' },
        { from: 3, to: 5, type: 'contains' },
      ],
    },
    'character-web': {
      nodes: [
        { id: 1, content: 'Protagonist', position: { x: 0, y: 0 }, type: 'character' },
        { id: 2, content: 'Antagonist', position: { x: 200, y: 0 }, type: 'character' },
        { id: 3, content: 'Mentor', position: { x: -200, y: 0 }, type: 'character' },
        { id: 4, content: 'Ally', position: { x: 0, y: 150 }, type: 'character' },
      ],
      connections: [
        { from: 1, to: 2, type: 'conflicts-with' },
        { from: 1, to: 3, type: 'learns-from' },
        { from: 1, to: 4, type: 'allies-with' },
      ],
    },
  }

  // TODO: Call API to create nodes and connections based on template
}

const cancel = () => {
  router.back()
}

const requiredRule = (v: any) => !!v || 'This field is required'

// Load user templates
const loadUserTemplates = async () => {
  try {
    // TODO: Load user-created templates
  } catch (error) {
    console.error('Error loading templates:', error)
  }
}

// Lifecycle
onMounted(() => {
  loadUserTemplates()
})
</script>

<style scoped>
.template-preview {
  min-height: 200px;
  border: 1px dashed rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 4px;
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>