<script setup lang="ts">
import { useEmail } from '@/views/apps/email/useEmail';
import { computed, defineEmits, defineProps, ref, watch } from 'vue';
import type { RouteLocationRaw } from 'vue-router';
import { PerfectScrollbar } from 'vue3-perfect-scrollbar';

defineOptions({
  inheritAttrs: false,
})

console.log ("WTF sidebar");

const props = defineProps<Props>()

defineEmits<{ (e: 'toggleComposeDialogVisibility'): void }>()

interface EmailLabelData {
  id: number;
  title: string;
  color: string;
}

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
  resolveLabelColor,
  deleteLabel: deleteApiLabel,
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
    to: { name: 'apps-email' } as RouteLocationRaw,
    badge: { content: inboxEmails.value, color: 'primary' },
  },
  {
    title: 'Sent',
    prependIcon: 'bx-paper-plane',
    to: { name: 'apps-email-filter', params: { filter: 'sent' } } as RouteLocationRaw,
  },
  {
    title: 'All Mail',
    prependIcon: 'bx-bxs-inbox',
    to: { name: 'apps-email-filter', params: { filter: 'all' } } as RouteLocationRaw,
  },
  {
    title: 'Archive',
    prependIcon: 'bx-archive',
    to: { name: 'apps-email-filter', params: { filter: 'archive' } } as RouteLocationRaw,
  },
  {
    title: 'Trash',
    prependIcon: 'bx-trash',
    to: { name: 'apps-email-filter', params: { filter: 'trash' } } as RouteLocationRaw,
  },
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

// --- Label Deletion State & Logic ---
const isDeleteDialogOpen = ref(false);
const labelToDelete = ref<EmailLabelData | null>(null);

const initiateLabelDelete = (label: EmailLabelData) => {
  console.log("Initiating delete for label:", label);
  labelToDelete.value = label;
  isDeleteDialogOpen.value = true;
};

const confirmLabelDelete = async () => {
  if (!labelToDelete.value) return;

  console.log("Confirming delete for label ID:", labelToDelete.value.id);
  const success = await deleteApiLabel(labelToDelete.value.id);

  if (success) {
    console.log("Label deleted successfully.");
    // The useEmail composable's deleteLabel already refreshes the list
  } else {
    console.error("Failed to delete label.");
    // Optional: Show error feedback to user
  }

  isDeleteDialogOpen.value = false;
  labelToDelete.value = null;
};
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
            :to="folder.to as any"
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

        <!-- Label List -->
        <ul class="email-labels mt-4" v-if="userLabels.length > 0">
          <li
            v-for="label in userLabels"
            :key="label.id"
          >
            <RouterLink
              v-slot="{ isActive, navigate }"
              :to="{ name: 'apps-email-label', params: { label: label.title.toLowerCase() } } as any"
              custom
            >
              <div
                class="d-flex align-center justify-space-between email-label-item"
                :class="{ 'email-label-active': isActive }"
                @click="navigate"
              >
                <div class="d-flex align-center">
                  <VIcon
                    icon="bx-bxs-circle"
                    :color="resolveLabelColor(label.title)"
                    size="20"
                    class="me-2"
                  />
                  <span class="text-body-11">{{ label.title }}</span>
                </div>
                <IconBtn
                  size="x-small"
                  variant="text"
                  color="disabled"
                  class="delete-label-btn"
                  @click.stop="initiateLabelDelete(label)"
                >
                  <VIcon icon="bx-trash" size="25"/>
                </IconBtn>
              </div>
            </RouterLink>
          </li>
        </ul>
      </div>
    </PerfectScrollbar>

    <!-- Delete Confirmation Dialog -->
    <VDialog v-model="isDeleteDialogOpen" max-width="500px">
      <VCard>
        <VCardTitle>Confirm Delete Label</VCardTitle>
        <VCardText>
          Are you sure you want to delete the label "<strong>{{ labelToDelete?.title }}</strong>"?
          This will remove the label from all associated messages. This action cannot be undone.
        </VCardText>
        <VCardActions>
          <VSpacer />
          <VBtn color="secondary" @click="isDeleteDialogOpen = false">Cancel</VBtn>
          <VBtn color="error" @click="confirmLabelDelete">Delete</VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
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
  padding: 0;

  > li {
    padding: 0;

    &:not(:last-child) {
      margin-block-end: 2px;
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

.email-label-item {
  position: relative;
  border-radius: var(--v-border-radius);
  cursor: pointer;
  margin-inline: 8px;
  padding-block: 4px;
  padding-inline: 24px;

  .delete-label-btn {
    opacity: 0;
    transition: opacity 0.2s ease-in-out;
  }

  &:hover {
    background-color: rgba(var(--v-theme-on-surface), var(--v-hover-opacity));

    .delete-label-btn {
      opacity: 1;
    }
  }

  &.email-label-active {
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
</style>
