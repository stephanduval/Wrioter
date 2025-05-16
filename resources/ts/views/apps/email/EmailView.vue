<script setup lang="ts">
import SharedEmailView from '@/components/SharedEmailView.vue';
import { watch } from 'vue';
import { useEmail } from './useEmail';

const {
  selectedEmail,
  previousEmail,
  nextEmail,
  handleEmailClose,
  handleEmailRefresh,
  handleEmailNavigate,
  handleSendReply,
} = useEmail()

// Add downloadAttachment function
const downloadAttachment = (attachment: any) => {
  console.log('Download attachment called with:', attachment)
  
  // Check if attachment exists and has required properties
  if (!attachment || typeof attachment !== 'object') {
    console.error('Invalid attachment object:', attachment)
    return
  }

  // Log the full attachment object for debugging
  console.log('Full attachment object:', JSON.stringify(attachment, null, 2))

  // Check for download_url specifically
  if (!attachment.download_url) {
    console.error('No download URL found in attachment:', attachment)
    return
  }

  try {
    // Create a temporary anchor element to handle the download
    const link = document.createElement('a')
    link.href = attachment.download_url
    link.target = '_blank' // Open in new tab
    link.rel = 'noopener noreferrer' // Security best practice
    link.click() // Trigger the download
  } catch (error) {
    console.error('Error downloading attachment:', error)
  }
}

// Add downloadAttachments function for multiple attachments
const downloadAttachments = async (attachments: any[]) => {
  if (!attachments || attachments.length === 0) return

  // If there are multiple attachments, download them sequentially
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

const emit = defineEmits<{
  (e: 'refresh'): void
  (e: 'navigated', direction: 'previous' | 'next'): void
  (e: 'close'): void
}>()

// Watch for changes in selectedEmail and update navigation state
watch(() => selectedEmail.value, (newEmail) => {
  if (newEmail) {
    console.log('Email attachments:', newEmail.attachments)
  }
}, { immediate: true })
</script>

<template>
  <SharedEmailView
    :email="selectedEmail"
    :email-meta="{
      hasPreviousEmail: !!previousEmail,
      hasNextEmail: !!nextEmail
    }"
    @close="handleEmailClose"
    @refresh="handleEmailRefresh"
    @navigated="handleEmailNavigate"
    @send-reply="handleSendReply"
    :download-attachment="downloadAttachment"
  />
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
}
</style>
