<template>
  <VDialog
    v-model="isOpen"
    max-width="560"
    @update:model-value="(v) => !v && handleClose()"
  >
    <VCard>
      <VCardTitle class="d-flex align-center gap-2">
        <VIcon icon="bx-bot" color="primary" />
        <span>AI Summary</span>
        <VSpacer />
        <VBtn icon size="small" variant="text" @click="handleClose">
          <VIcon icon="bx-x" />
        </VBtn>
      </VCardTitle>

      <VDivider />

      <VCardText>
        <!-- Original selection preview -->
        <p class="text-caption text-medium-emphasis mb-1">Selected text</p>
        <blockquote class="selected-text-preview mb-4">
          {{ truncatedSource }}
        </blockquote>

        <!-- Loading -->
        <div v-if="loading" class="d-flex align-center gap-3 py-4">
          <VProgressCircular indeterminate size="22" color="primary" />
          <span class="text-medium-emphasis">Summarizing…</span>
        </div>

        <!-- Error -->
        <VAlert v-else-if="error" type="error" variant="tonal" class="mb-0">
          {{ error }}
        </VAlert>

        <!-- Result -->
        <template v-else-if="summary">
          <p class="text-caption text-medium-emphasis mb-1">Summary</p>
          <p class="summary-text">{{ summary }}</p>
        </template>
      </VCardText>

      <VDivider v-if="summary && !loading" />

      <VCardActions v-if="summary && !loading">
        <VSpacer />
        <VBtn variant="text" prepend-icon="bx-copy" @click="copySummary">
          {{ copied ? 'Copied!' : 'Copy' }}
        </VBtn>
        <VBtn color="primary" variant="tonal" @click="handleClose">Close</VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { aiApi } from '@/api/ai'
import { eventBus, type SummarizeTextEvent } from '@/services/eventBus'

const isOpen = ref(false)
const sourceText = ref('')
const summary = ref('')
const loading = ref(false)
const error = ref<string | null>(null)
const copied = ref(false)

const truncatedSource = computed(() =>
  sourceText.value.length > 280
    ? `${sourceText.value.slice(0, 280)}…`
    : sourceText.value,
)

const handleOpen = async (event: SummarizeTextEvent) => {
  sourceText.value = event.selectedText
  summary.value = ''
  error.value = null
  copied.value = false
  isOpen.value = true
  loading.value = true

  try {
    summary.value = await aiApi.summarize(event.selectedText)
  } catch (err: any) {
    const status = err?.status ?? err?.response?.status

    if (status === 429) {
      error.value = 'You’re summarizing too quickly. Please wait a moment and try again.'
    } else if (status === 422) {
      // Validation error (e.g. selection too large) — surface the field message.
      const fieldError = err?.data?.errors
        ? Object.values(err.data.errors).flat()[0]
        : null
      error.value =
        (fieldError as string) ||
        err?.data?.message ||
        'That selection can’t be summarized (it may be too long).'
    } else {
      error.value =
        err?.data?.message ||
        err?.message ||
        'Failed to summarize. Please try again.'
    }
  } finally {
    loading.value = false
  }
}

const handleClose = () => {
  isOpen.value = false
}

const copySummary = async () => {
  try {
    await navigator.clipboard.writeText(summary.value)
    copied.value = true
    setTimeout(() => (copied.value = false), 1500)
  } catch {
    // Clipboard may be unavailable; ignore silently.
  }
}

onMounted(() => {
  eventBus.on('ai:summarize', handleOpen)
})

onUnmounted(() => {
  eventBus.off('ai:summarize', handleOpen)
})
</script>

<style scoped lang="scss">
.selected-text-preview {
  padding: 12px 16px;
  margin: 0;
  font-style: italic;
  line-height: 1.5;
  background-color: rgba(var(--v-theme-surface-variant), 0.5);
  border-radius: 6px;
  border-inline-start: 3px solid rgba(var(--v-theme-primary), 0.5);
}

.summary-text {
  margin: 0;
  line-height: 1.6;
  white-space: pre-wrap;
}
</style>
