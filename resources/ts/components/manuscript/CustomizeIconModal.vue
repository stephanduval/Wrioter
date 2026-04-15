<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useManuscriptStore } from '@/stores/manuscript'
import { eventBus, type CustomizeIconEvent } from '@/services/eventBus'
import { ICON_CATEGORIES, DEFAULT_COLOR_PALETTE } from '@/plugins/iconify/custom-icons'

const manuscriptStore = useManuscriptStore()

const isOpen = ref(false)
const payload = ref<CustomizeIconEvent | null>(null)

const selectedIcon = ref<string>('')
const selectedColor = ref<string>('#2196F3')
const activeCategory = ref<string>(ICON_CATEGORIES[0].id)
const searchQuery = ref('')
const saving = ref(false)

const filteredIcons = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  if (query) {
    // Flat search across all categories
    return ICON_CATEGORIES.flatMap(c => c.icons).filter(name =>
      name.toLowerCase().includes(query),
    )
  }
  const cat = ICON_CATEGORIES.find(c => c.id === activeCategory.value)
  return cat ? cat.icons : []
})

const previewIcon = computed(() => selectedIcon.value || payload.value?.defaultIcon || 'bx-file')
const previewColor = computed(() => selectedColor.value || '#9E9E9E')

eventBus.on('item:customize-icon', (event) => {
  payload.value = event
  selectedIcon.value = event.currentIconName || event.defaultIcon
  selectedColor.value = event.currentIconColor || '#2196F3'
  activeCategory.value = ICON_CATEGORIES[0].id
  searchQuery.value = ''
  isOpen.value = true
})

watch(isOpen, (open) => {
  if (!open) {
    payload.value = null
    saving.value = false
  }
})

const save = async () => {
  if (!payload.value) return
  saving.value = true
  try {
    await manuscriptStore.updateItemAppearance(
      payload.value.manuscriptId,
      payload.value.itemId,
      {
        icon_name: selectedIcon.value,
        icon_color: selectedColor.value,
        use_custom_icon: true,
      },
    )
    isOpen.value = false
  } catch (err) {
    console.error('Failed to save icon customization:', err)
    alert('Failed to save icon. Please try again.')
  } finally {
    saving.value = false
  }
}

const resetToDefault = async () => {
  if (!payload.value) return
  saving.value = true
  try {
    await manuscriptStore.updateItemAppearance(
      payload.value.manuscriptId,
      payload.value.itemId,
      {
        icon_name: null,
        icon_color: null,
        use_custom_icon: false,
      },
    )
    isOpen.value = false
  } catch (err) {
    console.error('Failed to reset icon:', err)
    alert('Failed to reset icon. Please try again.')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <VDialog v-model="isOpen" max-width="900" persistent>
    <VCard>
      <VCardTitle class="d-flex align-center pa-4">
        <VIcon :icon="previewIcon" :color="previewColor" size="28" class="me-3" />
        <div class="flex-grow-1">
          <div class="text-h6">Customize Icon</div>
          <div v-if="payload" class="text-caption text-medium-emphasis">
            {{ payload.title }}
          </div>
        </div>
        <VBtn icon="bx-x" variant="text" size="small" @click="isOpen = false" />
      </VCardTitle>

      <VDivider />

      <VCardText class="pa-0">
        <div class="d-flex" style="min-height: 460px;">
          <!-- LEFT: Icon picker -->
          <div class="flex-grow-1 pa-4" style="border-inline-end: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));">
            <VTextField
              v-model="searchQuery"
              prepend-inner-icon="bx-search"
              placeholder="Search icons..."
              density="compact"
              variant="outlined"
              hide-details
              clearable
              class="mb-3"
            />

            <VChipGroup
              v-if="!searchQuery"
              v-model="activeCategory"
              mandatory
              selected-class="text-primary"
              class="mb-3"
            >
              <VChip
                v-for="category in ICON_CATEGORIES"
                :key="category.id"
                :value="category.id"
                size="small"
                variant="outlined"
              >
                {{ category.label }}
              </VChip>
            </VChipGroup>

            <div class="icon-grid">
              <button
                v-for="iconName in filteredIcons"
                :key="iconName"
                type="button"
                class="icon-cell"
                :class="{ 'icon-cell--selected': selectedIcon === iconName }"
                :title="iconName"
                @click="selectedIcon = iconName"
              >
                <VIcon :icon="iconName" size="22" :color="selectedIcon === iconName ? previewColor : undefined" />
              </button>
              <div v-if="filteredIcons.length === 0" class="text-center text-medium-emphasis pa-6 w-100">
                No icons match "{{ searchQuery }}"
              </div>
            </div>
          </div>

          <!-- RIGHT: Color picker -->
          <div class="pa-4" style="width: 320px;">
            <div class="text-subtitle-2 mb-2">Color</div>
            <VColorPicker
              v-model="selectedColor"
              mode="hex"
              hide-inputs
              hide-mode-switch
              show-swatches
              :swatches="[
                DEFAULT_COLOR_PALETTE.slice(0, 5),
                DEFAULT_COLOR_PALETTE.slice(5, 10),
                DEFAULT_COLOR_PALETTE.slice(10, 15),
                DEFAULT_COLOR_PALETTE.slice(15, 20),
              ]"
              swatches-max-height="120"
              width="280"
            />
            <VTextField
              v-model="selectedColor"
              label="Hex"
              prepend-inner-icon="bx-palette"
              density="compact"
              variant="outlined"
              hide-details
              class="mt-3"
              maxlength="7"
            />
          </div>
        </div>
      </VCardText>

      <VDivider />

      <VCardActions class="pa-3">
        <VBtn
          color="error"
          variant="text"
          prepend-icon="bx-reset"
          :disabled="saving"
          @click="resetToDefault"
        >
          Reset to Default
        </VBtn>
        <VSpacer />
        <VBtn variant="text" :disabled="saving" @click="isOpen = false">
          Cancel
        </VBtn>
        <VBtn
          color="primary"
          variant="elevated"
          :loading="saving"
          prepend-icon="bx-check"
          @click="save"
        >
          Save
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<style scoped>
.icon-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(44px, 1fr));
  gap: 4px;
  max-height: 340px;
  overflow-y: auto;
  padding-inline-end: 4px;
}

.icon-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border: 1px solid transparent;
  border-radius: 8px;
  background: transparent;
  cursor: pointer;
  transition: background-color 0.12s ease, border-color 0.12s ease;
}

.icon-cell:hover {
  background-color: rgba(var(--v-theme-on-surface), 0.06);
}

.icon-cell--selected {
  border-color: rgb(var(--v-theme-primary));
  background-color: rgba(var(--v-theme-primary), 0.08);
}
</style>
