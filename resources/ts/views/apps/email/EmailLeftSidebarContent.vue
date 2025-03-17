<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { PerfectScrollbar } from 'vue3-perfect-scrollbar';

defineOptions({
  inheritAttrs: false,
})

console.log ("WTF sidebar");

const props = defineProps<Props>()

defineEmits<{ (e: 'toggleComposeDialogVisibility'): void }>()

interface EmailsMeta {
  inbox: number
  draft: number
  spam: number
  star: number
}

interface Props {
  emailsMeta?: EmailsMeta
}

// Reactive email counts with defaults
const inboxEmails = ref(0)
const draftEmails = ref(0)
const spamEmails = ref(0)
const starredEmails = ref(0)

// Watch props and update counts
watch(
  () => props.emailsMeta,
  emailsMeta => {
    inboxEmails.value = emailsMeta?.inbox ?? 0
    draftEmails.value = emailsMeta?.draft ?? 0
    spamEmails.value = emailsMeta?.spam ?? 0
    starredEmails.value = emailsMeta?.star ?? 0
  },
  { immediate: true, deep: true },
)

// Folders list
const folders = computed(() => [
  {
    title: 'Inbox',
    prependIcon: 'bx-envelope',
    to: { name: 'apps-email' },
    badge: { content: inboxEmails.value, color: 'primary' },
  },
  {
    title: 'Draft',
    prependIcon: 'bx-edit',
    to: { name: 'apps-email-filter', params: { filter: 'draft' } },
    badge: { content: draftEmails.value, color: 'warning' },
  },
  {
    title: 'Starred',
    prependIcon: 'bx-star',
    to: { name: 'apps-email-filter', params: { filter: 'starred' } },
    badge: { content: starredEmails.value, color: 'success' },
  },
  {
    title: 'Spam',
    prependIcon: 'bx-error-alt',
    to: { name: 'apps-email-filter', params: { filter: 'spam' } },
    badge: { content: spamEmails.value, color: 'error' },
  },
])

// Labels list
const labels = ref([
  { title: 'Personal', color: 'success', to: { name: 'apps-email-label', params: { label: 'personal' } } },
  { title: 'Company', color: 'primary', to: { name: 'apps-email-label', params: { label: 'company' } } },
  { title: 'Important', color: 'warning', to: { name: 'apps-email-label', params: { label: 'important' } } },
  { title: 'Private', color: 'error', to: { name: 'apps-email-label', params: { label: 'private' } } },
])
</script>

<template>
  <div class="d-flex flex-column h-100">
    <div class="pa-6">
      <VBtn
        block
        @click="$emit('toggleComposeDialogVisibility')"
      >
        Compose
      </VBtn>
    </div>

    <PerfectScrollbar
      class="h-100"
      :options="{ wheelPropagation: false }"
    >
      <ul class="email-filters py-4">
        <li
          v-for="folder in folders"
          :key="folder.title"
        >
          <RouterLink
            v-slot="{ isActive, navigate }"
            :to="folder.to"
            custom
          >
            <div
              :class="{ 'email-filter-active': isActive }"
              @click="navigate"
            >
              <VIcon :icon="folder.prependIcon" />
              {{ folder.title }}
              <VChip
                v-if="folder.badge.content"
                :color="folder.badge.color"
              >
                {{ folder.badge.content }}
              </VChip>
            </div>
          </RouterLink>
        </li>
      </ul>

      <div v-if="labels.length">
        <div class="text-caption text-disabled">
          LABELS
        </div>
        <ul class="email-labels">
          <li
            v-for="label in labels"
            :key="label.title"
          >
            <RouterLink
              v-slot="{ isActive, navigate }"
              :to="label.to"
              custom
            >
              <div
                :class="{ 'email-label-active': isActive }"
                @click="navigate"
              >
                <VIcon
                  icon="bx-bxs-circle"
                  :color="label.color"
                />
                {{ label.title }}
              </div>
            </RouterLink>
          </li>
        </ul>
      </div>
    </PerfectScrollbar>
  </div>
</template>

<style lang="scss">
.email-filters,
.email-labels {
  .email-filter-active,
  .email-label-active {
    &::after {
      position: absolute;
      background: currentcolor;
      block-size: 100%;
      content: "";
      inline-size: 3px;
      inset-block-start: 0;
      inset-inline-start: 0;
    }
  }
}

.email-labels {
  > li {
    position: relative;
    padding-inline: 24px;

    &:not(:last-child) {
      margin-block-end: 0.75rem;
    }
  }
}

.email-filters {
  /* stylelint-disable-next-line no-descending-specificity */
  > li {
    position: relative;
    padding-block: 4px;
    padding-inline: 24px;

    &:not(:last-child) {
      margin-block-end: 4px;
    }
  }
}
</style>
