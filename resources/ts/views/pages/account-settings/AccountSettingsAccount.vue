<script lang="ts" setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { locale, t } = useI18n()

// Simplified language options without translations for now
const languages = [
  { code: 'en', name: 'English' },
  { code: 'fr', name: 'Français' }
]

const currentLanguage = ref(languages.find(lang => lang.code === locale.value) || languages[0])

const switchLanguage = (langCode: string) => {
  locale.value = langCode
  currentLanguage.value = languages.find(lang => lang.code === langCode) || languages[0]
}
</script>

<template>
  <VRow>
    <VCol cols="12">
      <VCard>
        <VCardText>
          <h2>Settings</h2>
          
          <!-- Simple Language Test Section -->
          <VCard class="mt-4">
            <VCardText>
              <h3 class="text-h6 mb-4">Language Settings</h3>
              
              <!-- Language Display -->
              <div class="mb-4">
                <p>Current Language: {{ currentLanguage.name }}</p>
              </div>
              
              <!-- Language Switcher -->
              <VBtnGroup>
                <VBtn
                  :color="currentLanguage.code === 'en' ? 'primary' : 'default'"
                  @click="switchLanguage('en')"
                >
                  English
                </VBtn>
                <VBtn
                  :color="currentLanguage.code === 'fr' ? 'primary' : 'default'"
                  @click="switchLanguage('fr')"
                >
                  Français
                </VBtn>
              </VBtnGroup>
            </VCardText>
          </VCard>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
</template>
