<script setup lang="ts">
import { useEmail } from '@/views/apps/email/useEmail';
import { computed, defineEmits, defineProps, ref, watch } from 'vue';
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

const { 
  userLabels,
  addLabel: addApiLabel,
  resolveLabelColor
} = useEmail();

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
  // {
  //   title: 'Draft',
  //   prependIcon: 'bx-edit',
  //   to: { name: 'apps-email-filter', params: { filter: 'draft' } },
  //   badge: { content: draftEmails.value, color: 'warning' },
  // },
  {
    title: 'Starred',
    prependIcon: 'bx-star',
    to: { name: 'apps-email-filter', params: { filter: 'starred' } },
    badge: { content: starredEmails.value, color: 'success' },
  },
  {
    title: 'Trash',
    prependIcon: 'bx-trash',
    to: { name: 'apps-email-filter', params: { filter: 'trash' } },
  },
  // {
  //   title: 'Spam',
  //   prependIcon: 'bx-error-alt',
  //   to: { name: 'apps-email-filter', params: { filter: 'spam' } },
  //   badge: { content: spamEmails.value, color: 'error' },
  // },
])

// Local state for the add label form
const showAddLabelForm = ref(false)
const newLabelName = ref('')
const selectedColour = ref<string>('primary')
const availableColours = ['primary', 'success', 'error', 'warning', 'info']

const handleAddLabel = async () => {
  if (!newLabelName.value.trim()) {
    console.error('Label name cannot be empty')
    return
  }

  const success = await addApiLabel({
    label_name: newLabelName.value,
    colour: selectedColour.value,
  })

  if (success) {
    newLabelName.value = ''
    selectedColour.value = 'primary'
    showAddLabelForm.value = false
  }
}
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
                v-if="folder.badge?.content"
                :color="folder.badge.color"
              >
                {{ folder.badge.content }}
              </VChip>
            </div>
          </RouterLink>
        </li>
      </ul>

      <div v-if="userLabels.length > 0 || showAddLabelForm">
        <div class="text-caption text-disabled d-flex align-center justify-space-between px-6">
          <span>LABELS</span>
          <IconBtn size="small" @click="showAddLabelForm = !showAddLabelForm">
            <VIcon :icon="showAddLabelForm ? 'bx-chevron-up' : 'bx-plus'" />
          </IconBtn>
        </div>

        <!-- Add Label Form -->
        <VExpandTransition>
          <div v-show="showAddLabelForm" class="px-6 pb-4">
            <VTextField
              v-model="newLabelName"
              label="New Label Name"
              density="compact"
              hide-details="auto"
              class="mb-2"
            />
            <div class="d-flex gap-1 mb-2">
              <span class="text-caption align-self-center">Colour:</span>
              <VChip
                v-for="colour in availableColours"
                :key="colour"
                :color="colour"
                size="small"
                :value="colour"
                @click="selectedColour = colour"
                class="cursor-pointer"
                :style="selectedColour === colour ? 'border: 2px solid grey;' : ''"
              >
                &nbsp;
              </VChip>
            </div>
            <VBtn size="small" block @click="handleAddLabel">Add</VBtn>
          </div>
        </VExpandTransition>

        <ul class="email-labels" v-if="userLabels.length > 0">
          <li
            v-for="label in userLabels"
            :key="label.title"
          >
            <RouterLink
              v-slot="{ isActive, navigate }"
              :to="{ name: 'apps-email-label', params: { label: label.title.toLowerCase() } }"
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
