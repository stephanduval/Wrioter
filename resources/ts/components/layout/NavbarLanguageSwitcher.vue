<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { locale } = useI18n()

const languages = [
  { code: 'en', name: 'English' },
  { code: 'fr', name: 'Français' },
]

const currentLanguage = ref(languages.find(lang => lang.code === locale.value) || languages[0])

const switchLanguage = (langCode: string) => {
  locale.value = langCode
  currentLanguage.value = languages.find(lang => lang.code === langCode) || languages[0]
}
</script>

<template>
  <VBtn
    variant="text"
    class="language-switcher"
    :class="{ 'active': isOpen }"
    @click="isOpen = !isOpen"
  >
    <VIcon
      icon="bx-globe"
      class="me-1"
    />
    {{ currentLanguage.name }}
  </VBtn>

  <VMenu
    v-model="isOpen"
    :close-on-content-click="false"
    location="bottom end"
    transition="scale-transition"
  >
    <VList>
      <VListItem
        v-for="lang in languages"
        :key="lang.code"
        :value="lang.code"
        @click="switchLanguage(lang.code)"
      >
        <VListItemTitle>
          {{ lang.name }}
        </VListItemTitle>
      </VListItem>
    </VList>
  </VMenu>
</template>

<style scoped>
.language-switcher {
  justify-content: flex-start;
  min-inline-size: 100px;
}

.language-switcher.active {
  background-color: rgb(var(--v-theme-surface-variant));
}
</style> 
