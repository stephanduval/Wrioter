<script setup lang="ts">
import { format } from 'date-fns';
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { PerfectScrollbar } from 'vue3-perfect-scrollbar';

const props = defineProps<{
  email: any
  emailMeta: {
    hasPreviousEmail: boolean
    hasNextEmail: boolean
  }
  downloadAttachment?: (attachment: any) => void
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'refresh'): void
  (e: 'navigated', direction: 'previous' | 'next'): void
  (e: 'sendReply', data: { message: string, attachments: File[] }): void
}>()

const { t } = useI18n()

const emailReply = ref('')
const showReplyBox = ref(false)
const showReplyCard = ref(true)
const attachmentsRef = ref<File[]>([])
const attachmentErrors = ref<string[]>([])

const MAX_FILE_SIZE_MB = 25
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024

const formattedDate = (date: string | undefined) => {
  if (!date) return 'N/A'
  return format(new Date(date), 'MMM dd, yyyy')
}

const stripHtml = (html: string) => {
  const tmp = document.createElement('DIV')
  tmp.innerHTML = html
  return tmp.textContent || tmp.innerText || ''
}

const downloadAttachments = async (attachments: any[]) => {
  if (!attachments || attachments.length === 0) return

  // If downloadAttachment prop is provided, use it for each attachment
  if (props.downloadAttachment) {
    for (const attachment of attachments) {
      props.downloadAttachment(attachment)
      // Add a small delay between downloads to prevent browser blocking
      await new Promise(resolve => setTimeout(resolve, 500))
    }
    return
  }

  // Fallback to internal implementation if no prop provided
  if (attachments.length > 1) {
    for (const attachment of attachments) {
      if (attachment?.download_url) {
        window.open(attachment.download_url, '_blank')
        // Add a small delay between downloads to prevent browser blocking
        await new Promise(resolve => setTimeout(resolve, 500))
      }
    }
    return
  }

  // For single attachment, download directly
  if (attachments[0]?.download_url) {
    window.open(attachments[0].download_url, '_blank')
  }
}

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target && target.files) {
    for (let i = 0; i < target.files.length; i++) {
      attachmentsRef.value.push(target.files[i])
    }
  }
}

const removeAttachment = (index: number) => {
  attachmentsRef.value.splice(index, 1)
}

watch(attachmentsRef, (newFiles) => {
  attachmentErrors.value = []
  let totalSize = 0

  newFiles.forEach((file) => {
    totalSize += file.size
    if (file.size > MAX_FILE_SIZE_BYTES) {
      attachmentErrors.value.push(`File "${file.name}" (${(file.size / 1024 / 1024).toFixed(2)} MB) exceeds the ${MAX_FILE_SIZE_MB} MB limit.`)
    }
  })
}, { deep: true })

watch(() => props.email, (newEmail) => {
  if (newEmail) {
    console.log('Email attachments:', newEmail.attachments)
  }
}, { immediate: true })
</script>

<template>
  <VNavigationDrawer
    temporary
    :model-value="!!props.email"
    location="right"
    :scrim="false"
    floating
    class="email-view"
  >
    <template v-if="props.email">
      <!-- Header -->
      <div class="email-view-header d-flex align-center px-6 py-4">
        <IconBtn
          class="me-2"
          @click="$emit('close'); showReplyBox = false; showReplyCard = true; emailReply = ''"
        >
          <VIcon
            size="22"
            icon="bx-chevron-left"
            class="flip-in-rtl text-medium-emphasis"
          />
        </IconBtn>

        <div class="d-flex align-center flex-wrap flex-grow-1 overflow-hidden gap-2">
          <div class="text-body-1 text-high-emphasis text-truncate">
            {{ props.email.subject }}
          </div>
        </div>

        <div>
          <div class="d-flex align-center gap-1">
            <IconBtn
              :disabled="!props.emailMeta.hasPreviousEmail"
              @click="$emit('navigated', 'previous')"
            >
              <VIcon
                icon="bx-chevron-left"
                class="flip-in-rtl text-medium-emphasis"
              />
            </IconBtn>

            <IconBtn
              :disabled="!props.emailMeta.hasNextEmail"
              @click="$emit('navigated', 'next')"
            >
              <VIcon
                icon="bx-chevron-right"
                class="flip-in-rtl text-medium-emphasis"
              />
            </IconBtn>
          </div>
        </div>
      </div>

      <VDivider />

      <!-- Mail Content -->
      <PerfectScrollbar
        tag="div"
        class="mail-content-container flex-grow-1 pa-sm-12 pa-6"
        :options="{ wheelPropagation: false }"
      >
        <VCard class="mb-4">
          <div class="d-flex align-start align-sm-center pa-6 gap-x-4">
            <div class="d-flex flex-wrap flex-grow-1 overflow-hidden">
              <div class="text-truncate">
                <div class="text-body-1 font-weight-medium text-high-emphasis text-truncate">
                  {{ props.email.from.fullName }}
                </div>
                <div class="text-sm">
                  {{ props.email.from.email }}
                </div>
              </div>

              <VSpacer />

              <div class="d-flex align-center gap-x-4">
                <div class="text-disabled text-base">
                  {{ formattedDate(props.email.time) }}
                </div>
                <div>
                  <IconBtn 
                    v-if="props.email.attachments?.length" 
                    @click.stop="downloadAttachments(props.email.attachments)"
                  >
                    <VIcon
                      icon="bx-paperclip"
                      size="22"
                    />
                    <VTooltip
                      activator="parent"
                      location="top"
                    >
                      {{ t('emails.messages.attachmentsCount', { count: props.email.attachments.length }) }}
                    </VTooltip>
                  </IconBtn>
                </div>
              </div>
            </div>
          </div>

          <VDivider />

          <VCardText>
            <div class="text-body-1 font-weight-medium text-truncate mb-4">
              {{ props.email.from.fullName || t('emails.messages.unknown') }},
            </div>
            <div
              class="text-base"
              v-html="props.email.message"
            />
          </VCardText>

          <!-- Attachments Section -->
          <template v-if="props.email.attachments?.length">
            <VDivider />

            <VCardText class="d-flex flex-column gap-y-4 pt-4">
              <span>{{ t('emails.messages.attachmentsCount', { count: props.email.attachments.length }) }}</span>
              <div
                v-for="attachment in props.email.attachments"
                :key="attachment.fileName"
                class="d-flex align-center justify-space-between"
              >
                <div class="d-flex align-center gap-2">
                  <VIcon
                    icon="bx-file"
                    size="20"
                    color="primary"
                  />
                  <span>{{ attachment.fileName }}</span>
                </div>
                <VBtn
                  variant="text"
                  color="primary"
                  size="small"
                  @click.stop="props.downloadAttachment?.(attachment)"
                  :disabled="!attachment?.download_url || !props.downloadAttachment"
                >
                  <VIcon
                    icon="bx-download"
                    size="20"
                    class="me-1"
                  />
                  {{ t('emails.actions.download') }}
                  <VTooltip
                    v-if="!attachment?.download_url || !props.downloadAttachment"
                    activator="parent"
                    location="top"
                  >
                    {{ !props.downloadAttachment ? t('emails.messages.downloadNotAvailable') : t('emails.messages.noDownloadUrl') }}
                  </VTooltip>
                </VBtn>
              </div>
            </VCardText>
          </template>
        </VCard>

        <!-- Reply Card -->
        <VCard v-show="showReplyCard">
          <VCardText class="font-weight-medium text-high-emphasis">
            <div class="text-base">
              {{ t('emails.messages.clickToReply') }} <span
                class="text-primary cursor-pointer"
                @click="showReplyBox = !showReplyBox; showReplyCard = !showReplyCard"
              >
                {{ t('emails.actions.reply') }}
              </span>
            </div>
          </VCardText>
        </VCard>

        <!-- Reply Box -->
        <VCard v-if="showReplyBox">
          <VCardText>
            <div class="text-body-1 text-high-emphasis mb-6">
              {{ t('emails.messages.replyTo', { name: props.email?.from.fullName || t('emails.messages.unknown') }) }}
            </div>
            <TiptapEditor
              v-model="emailReply"
              :placeholder="t('emails.compose.message')"
              :is-divider="false"
            />
            
            <!-- Attachment Section -->
            <div class="mt-4">
              <VFileInput
                :model-value="attachmentsRef"
                multiple
                :label="t('emails.compose.attachments')"
                :placeholder="t('emails.compose.selectFiles')"
                prepend-icon="bx-paperclip"
                density="compact"
                :error-messages="attachmentErrors"
                @change="handleFileChange"
                @click:clear="attachmentsRef = []"
              />

              <!-- Project-style Attachment List -->
              <div v-if="attachmentsRef.length > 0" class="mt-2 d-flex flex-column gap-2">
                <div
                  v-for="(file, index) in attachmentsRef"
                  :key="index + '-' + file.name"
                  class="d-flex align-center justify-space-between"
                >
                  <div class="d-flex align-center gap-2">
                    <VIcon icon="bx-file" size="20" color="primary" />
                    <span>{{ file.name }}</span>
                    <span class="text-caption text-disabled ms-2">({{ (file.size / 1024 / 1024).toFixed(2) }} MB)</span>
                  </div>
                  <VBtn
                    icon
                    variant="text"
                    color="error"
                    size="small"
                    @click="removeAttachment(index)"
                  >
                    <VIcon icon="bx-trash" size="20" />
                  </VBtn>
                </div>
              </div>
            </div>

            <div class="d-flex justify-end gap-4 pt-4">
              <VBtn
                variant="text"
                color="secondary"
                @click="showReplyBox = false; showReplyCard = true; emailReply = ''; attachmentsRef = []"
              >
                {{ t('buttons.cancel') }}
              </VBtn>
              <VBtn
                color="primary"
                append-icon="bx-paper-plane"
                :disabled="!emailReply.trim() || attachmentErrors.length > 0"
                @click="$emit('sendReply', { message: emailReply, attachments: attachmentsRef })"
              >
                {{ t('emails.compose.send') }}
              </VBtn>
            </div>
          </VCardText>
        </VCard>
      </PerfectScrollbar>
    </template>
  </VNavigationDrawer>
</template>

<style lang="scss">
.email-view {
  &:not(.v-navigation-drawer--active) {
    transform: translateX(110%) !important;
  }

  inline-size: 100% !important;

  @media only screen and (min-width: 1280px) {
    inline-size: calc(100% - 256px) !important;
  }

  .v-navigation-drawer__content {
    display: flex;
    flex-direction: column;
  }

  .editor {
    padding-block-start: 0 !important;
    padding-inline: 0 !important;
  }

  .ProseMirror {
    padding: 0.5rem;
    block-size: 100px;
    overflow-y: auto;
    padding-block: 0.5rem;
  }
}

.mail-content-container {
  background-color: rgb(var(--v-theme-on-surface), var(--v-hover-opacity));
}
</style> 
