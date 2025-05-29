<script setup lang="ts">
import ComposeDialog from '@/views/apps/email/ComposeDialog.vue'
import EmailLeftSidebarContent from '@/views/apps/email/EmailLeftSidebarContent.vue'
import type { Email, EmailLabel, MoveEmailToAction } from '@/views/apps/email/types'
import { useEmail } from '@/views/apps/email/useEmail'
import { useResponsiveLeftSidebar } from '@core/composable/useResponsiveSidebar'
import { format, isToday, parseISO } from 'date-fns'
import type { PartialDeep } from 'type-fest'
import type { Ref } from 'vue'
import { computed, isRef, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { PerfectScrollbar } from 'vue3-perfect-scrollbar'

definePage({
  meta: {
    action: 'read',
    subject: 'client',
    layoutWrapperClasses: 'layout-content-height-fixed',
    requiresAuth: true,
  },
})

// console.log("🚀 Emails page Index.vue is loading!");

const emailComposable = useEmail();

// console.log('Available labels:', emailComposable.userLabels);

const searchQuery = ref('')
const messages = ref<Email[]>([]); 

// NEW: Ref for storing summary data of ALL user messages
interface MessageSummary {
  id: number;
  due_date: string | null;
  task_status: 'new' | 'in_process' | 'completed' | null;
}
const allUserMessagesSummary = ref<MessageSummary[]>([]);

const fetchAllMessages = async (searchParams?: string) => {  
  try {
    console.log('📥 Fetching messages with params:', {
      searchParams,
      currentRoute: route.params,
      currentFilter: route.params.filter,
      currentLabel: route.params.label
    })
    
    const response = await emailComposable.fetchMessages(searchParams);
    console.log('📥 Messages response:', {
      messageCount: Array.isArray(response) ? response.length : 0,
      firstMessage: Array.isArray(response) && response.length > 0 ? response[0] : null,
      searchParams
    })
    
    if (Array.isArray(response)) {
      messages.value = response; 
    } else {
      console.error('❌ Invalid API response format:', response)
      messages.value = [];
    }
  } catch (error) {
    console.error('❌ Error fetching messages:', error)
    messages.value = [];
  }
};

// NEW: Fetch summary data for ALL user messages
const fetchAllUserMessagesSummary = async () => {
  try {
    // console.log("🔥 Fetching summary data for ALL user messages...");
    const response = await $api('/messages/summary'); 
    // console.log("✅ Summary Data:", response);
    if (response && Array.isArray(response)) {
      allUserMessagesSummary.value = response;
    } else {
      // console.error("❌ Invalid API response format for summary data:", response);
      allUserMessagesSummary.value = [];
    }
  } catch (error) {
    // console.error("❌ Error fetching summary data:", error);
    allUserMessagesSummary.value = [];
  }
};

const selectedMessages = ref<number[]>([]);
const messagesMeta = computed(() => ({
  inbox: messages.value.filter(m => m.folder === 'inbox' && !m.isArchived && m.status !== 'deleted').length,
  draft: 0,
  spam: 0,
  star: messages.value.filter(m => m.isStarred).length,
  dueToday: dueTodayCount.value
}));

onMounted(async () => {  
  await fetchAllMessages(); // Fetch messages for the initial view
  await fetchAllUserMessagesSummary(); // Fetch summary data for counts
});

const { isLeftSidebarOpen } = useResponsiveLeftSidebar()
const route = useRoute<'apps-email' | 'apps-email-filter' | 'apps-email-label'>()

// Compose dialog
const isComposeDialogVisible = ref(false)

// Ref
const q = ref('')

// Reply state
const showReplyForm = ref(false);
const replyMessage = ref('');

// Add these refs near the other reply-related state
const replyAttachments = ref<File[]>([])
const replyAttachmentInput = ref<HTMLInputElement | null>(null)

// --- Computed Properties for Summary Boxes (Using Summary Data) ---
const dueTodayCount = computed(() => {
  // Count based on ALL user messages summary
  const today = new Date(); 

  const count = allUserMessagesSummary.value.filter(m => {
    if (!m.due_date) return false; // Skip if no due date

    try {
      const dueDateObj = parseISO(m.due_date);

      const isDueToday = isToday(dueDateObj);

      return isDueToday;
    } catch (e) {
      // Log errors during parsing - Keep this one for actual errors
      // console.error(`  Error processing due_date ${m.due_date} for message ${m.id}:`, e);
      return false;
    }
  }).length;

  return count;
});

const newStatusCount = computed(() => {
  // Count based on ALL user messages summary
  return allUserMessagesSummary.value.filter(m => m.task_status === 'new').length;
});

// --- Helper Functions ---
const formatDate = (dateString: string | Date | undefined | null, includeTime = false): string => {
  if (!dateString) return 'N/A';
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
    const formatString = includeTime ? 'yyyy-MM-dd HH:mm' : 'yyyy-MM-dd';
    return format(date, formatString);
  } catch (error) {
    // console.error("Error formatting date:", dateString, error);
    return 'Invalid Date';
  }
};

// New helper for status colors
const resolveStatusColor = (status?: 'new' | 'in_process' | 'completed' | null): string => {
  if (status === 'new') return 'primary'
  if (status === 'in_process') return 'warning'
  if (status === 'completed') return 'success'
  return 'secondary'
}

// Task status options for the dropdown
const taskStatusOptions = [
  { title: 'New', value: 'new' },
  { title: 'In Progress', value: 'in_process' },
  { title: 'Completed', value: 'completed' },
] as const;

// --- Selection Logic ---
const toggleSelectedEmail = (emailId: number) => {
  const emailIndex = selectedMessages.value.indexOf(emailId)
  if (emailIndex === -1)
    selectedMessages.value.push(emailId)
  else selectedMessages.value.splice(emailIndex, 1)
}

const selectAllEmailCheckbox = computed(
  () => messages.value.length && messages.value.length === selectedMessages.value.length,
)

const isSelectAllEmailCheckboxIndeterminate = computed(
  () =>
    Boolean(selectedMessages.value.length)
    && messages.value.length !== selectedMessages.value.length,
)

const isAllMarkRead = computed (() => {
  return selectedMessages.value.every(messageId => messages.value.find(message => message.id === messageId)?.isRead)
})

const selectAllCheckboxUpdate = () => {
  selectedMessages.value = !selectAllEmailCheckbox.value
    ? messages.value.map(message => message.id)
    : []
}

// --- Email View Logic ---
const openedMessage = ref<Email | null>(null)
const messageViewMeta = computed(() => {
  const returnValue = {
    hasNextEmail: false,
    hasPreviousEmail: false,
  }

  if (openedMessage.value) {
    const openedMessageIndex = messages.value.findIndex(
      e => e.id === openedMessage.value?.id,
    )

    returnValue.hasNextEmail = !!messages.value[openedMessageIndex + 1]
    returnValue.hasPreviousEmail = !!messages.value[openedMessageIndex - 1]
  }

  return returnValue
})

const refreshOpenedMessage = async () => {
  await fetchAllMessages()

  if (openedMessage.value)
    openedMessage.value = messages.value.find(m => m.id === openedMessage.value?.id)!
}

const changeOpenedMessage = async (dir: 'previous' | 'next') => {
  if (!openedMessage.value) return;

  const openedMessageIndex = messages.value.findIndex(
    e => e.id === openedMessage.value?.id,
  );

  const newMessageIndex = dir === 'previous' ? openedMessageIndex - 1 : openedMessageIndex + 1;

  if (newMessageIndex >= 0 && newMessageIndex < messages.value.length)
    openedMessage.value = messages.value[newMessageIndex];
};

const openMessage = async (message: Email) => {
  // console.log('Opening message:', message);
  
  openedMessage.value = message;
  
  // console.log('openedMessage set to:', openedMessage.value);
  
  if (!message.isRead) {
    try {
      await emailComposable.updateEmails([message.id], { status: 'read', isRead: true }); 
      if (openedMessage.value && openedMessage.value.id === message.id) {
        openedMessage.value.isRead = true;
        openedMessage.value.status = 'read';
      }
      const messageInList = messages.value.find(m => m.id === message.id);
      if (messageInList) {
        messageInList.isRead = true;
        messageInList.status = 'read';
      }
    } catch (error) {
      // console.error('Error marking message as read:', error);
    }
  }
}

// --- Watchers ---
watch(() => route.params, async () => {  
  await fetchAllMessages(); // Refetch view messages on route change
  // Summary data doesn't depend on route, no need to refetch here unless actions modify it broadly
  selectedMessages.value = []; 
}, { deep: true })

// Watch for search query changes
watch(
  () => searchQuery.value,
  async (newQuery) => {
    console.log('🔍 Search query changed:', { 
      newQuery,
      currentRoute: route.params,
      currentFilter: route.params.filter,
      currentLabel: route.params.label
    })
    
    const params = new URLSearchParams()
    if (newQuery) {
      params.append('q', newQuery)
    }
    
    console.log('🔍 Constructed search params:', params.toString())
    await fetchAllMessages(params.toString())
  },
  { immediate: true }
)

// --- Action Handling ---

// Generic action handler (for star/unstar, read/unread - now simplified)
const handleActionClick = async (
  action: 'star' | 'unstar' | 'read' | 'unread',
  emailIds: number[] | Ref<number[]> = selectedMessages,
) => {
  const ids: number[] = isRef(emailIds) ? emailIds.value : emailIds;
  // console.log(`>>> handleActionClick: action=${action}, ids=`, ids);
  if (!ids || ids.length === 0) return;

  let updateData: PartialDeep<Email> = {};

  if (action === 'star') updateData = { isStarred: true };
  else if (action === 'unstar') updateData = { isStarred: false };
  else if (action === 'read') updateData = { status: 'read', isRead: true };
  else if (action === 'unread') updateData = { isRead: false };

  // console.log(`>>> handleActionClick: Prepared updateData:`, updateData);

  try {
    // console.log(`>>> handleActionClick: Calling updateEmails...`);
    await emailComposable.updateEmails(ids, updateData);
    // console.log(`>>> handleActionClick: updateEmails finished. Updating local state...`);
    
    messages.value.forEach(msg => {
      if (ids.includes(msg.id)) {
        // console.log(`  - Updating local message ID ${msg.id}: action=${action}`);
        if (action === 'star') msg.isStarred = true;
        if (action === 'unstar') msg.isStarred = false;
        if (action === 'read') { msg.isRead = true; msg.status = 'read'; }
        if (action === 'unread') { msg.isRead = false; msg.status = 'sent'; }
      }
    });
    if (openedMessage.value && ids.includes(openedMessage.value.id)) {
      // console.log(`  - Updating openedMessage ID ${openedMessage.value.id}: action=${action}`);
      if (action === 'star') openedMessage.value.isStarred = true;
      if (action === 'unstar') openedMessage.value.isStarred = false;
      if (action === 'read') { openedMessage.value.isRead = true; openedMessage.value.status = 'read'; }
      if (action === 'unread') { openedMessage.value.isRead = false; openedMessage.value.status = 'sent'; }
    }
    // console.log(`>>> handleActionClick: Local state update finished.`);
  } catch (error) {
    // console.error('Error performing action:', action, error);
  }
}

// Handle Moving Mails (Trash, Archive, Inbox) - Uses moveSelectedEmailTo composable
const handleMoveMailsTo = async (action: MoveEmailToAction, ids: number[] | Ref<number[]> = selectedMessages) => {
  const actualIds: number[] = isRef(ids) ? ids.value : ids;
  if (!actualIds || actualIds.length === 0) return;
  
  // console.log(`Moving emails ${actualIds} to ${action}`);
  try {
    await emailComposable.moveSelectedEmailTo(action, actualIds);

    if (openedMessage.value && actualIds.includes(openedMessage.value.id)) {
      openedMessage.value = null;
    }
    if (actualIds === selectedMessages.value) {
      selectedMessages.value = [];
    }
    
      await fetchAllMessages();
  } catch (error) {
    // console.error(`Error moving emails to ${action}:`, error);
  }
};

// Handle Labels (ensure payload matches expected type)
const handleEmailLabels = async (labelTitle: EmailLabel, messageIds: number[] | Ref<number[]> = selectedMessages) => {
  const idsToUpdate: number[] = isRef(messageIds) ? messageIds.value : messageIds;
  if (!idsToUpdate || idsToUpdate.length === 0) return;

  try {
    // Update the labels on the server
    await emailComposable.updateEmails(idsToUpdate, { toggleLabel: labelTitle } as PartialDeep<Email>);
    
    // Refresh the labels list
    await emailComposable.fetchUserLabels();

    // If we're updating the opened message
    if (openedMessage.value && idsToUpdate.includes(openedMessage.value.id)) {
      // Fetch the updated message
      const updatedMessage = await emailComposable.fetchMessages();
      const refreshedMessage = updatedMessage.find(m => m.id === openedMessage.value?.id);
      if (refreshedMessage) {
        openedMessage.value = refreshedMessage;
      }
    }

    // Refresh the message list
    await fetchAllMessages();

    // Clear selection if we were updating selected messages
    if (messageIds === selectedMessages) {
      selectedMessages.value = [];
    }
  } catch (error) {
    console.error('Error updating labels:', error);
  }
}

// UPDATED: Handle Task Status Toggle for a single message (cycles through statuses)
const handleTaskStatusToggle = async (message: Email) => {
  let newStatus: 'new' | 'in_process' | 'completed';
  if (message.task_status === 'new') {
    newStatus = 'in_process';
  } else if (message.task_status === 'in_process') {
    newStatus = 'completed';
  } else { // completed or null/undefined
    newStatus = 'new';
  }

  // console.log(`Cycling task status for message ${message.id} to ${newStatus}`);
  try {
    await emailComposable.updateEmails([message.id], { task_status: newStatus } as PartialDeep<Email>);
    message.task_status = newStatus;
    // Refresh summary data after status change
    await fetchAllUserMessagesSummary();
  } catch (error) {
    // console.error(`Error updating task status for message ${message.id}:`, error);
  }
};

// NEW: Handle updating task status for SELECTED messages to a specific status
const handleSelectedTaskStatusUpdate = async (status: 'new' | 'in_process' | 'completed') => {
  const ids = selectedMessages.value;
  if (!ids || ids.length === 0) return;

  // console.log(`Updating task status for selected messages ${ids} to ${status}`);

  try {
    await emailComposable.updateEmails(ids, { task_status: status } as PartialDeep<Email>);

    // Update local state
    messages.value.forEach(msg => {
      if (ids.includes(msg.id)) {
        msg.task_status = status;
      }
    });
    if (openedMessage.value && ids.includes(openedMessage.value.id)) {
      openedMessage.value.task_status = status;
    }

    // Clear selection after action
    selectedMessages.value = [];

    // Refresh summary data after status change
    await fetchAllUserMessagesSummary();

  } catch (error) {
    // console.error(`Error updating task status for selected messages:`, error);
  }
};

// --- Reply Logic ---
const handleReplyAttachmentSelect = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files) {
    replyAttachments.value = [...replyAttachments.value, ...Array.from(input.files)]
  }
  // Reset the input value so the same file can be selected again
  input.value = ''
}

const removeReplyAttachment = (index: number) => {
  replyAttachments.value.splice(index, 1)
}

const sendReply = async () => {
  if (!openedMessage.value || !openedMessage.value.from || !openedMessage.value.from.id || !openedMessage.value.id) { 
    return
  }

  if (!replyMessage.value.trim()) {
    return
  }

  let replySubject = openedMessage.value.subject || '(No Subject)'
  if (!replySubject.toLowerCase().startsWith('re:')) {
    replySubject = `Re: ${replySubject}`
  }

  const currentUserCompanyId = 1

  try {
    const result = await emailComposable.sendReplyMessage({
      receiver_id: openedMessage.value.from.id,
      company_id: currentUserCompanyId,
      subject: replySubject,
      body: replyMessage.value,
      reply_to_id: openedMessage.value.id,
      attachments: replyAttachments.value
    })
    
    if (result && result.message === 'Message sent successfully') {
      showReplyForm.value = false
      replyMessage.value = ''
      replyAttachments.value = [] // Clear attachments
      await fetchAllMessages()
      openedMessage.value = null
    }
  } catch (error) {
    console.error("Error sending reply:", error)
  }
}

const clearReplyForm = () => {
  showReplyForm.value = false
  replyMessage.value = ''
  replyAttachments.value = []
}

// --- Dialog State & Confirmation Logic ---
const isTrashConfirmDialogVisible = ref(false);
const messageIdsToConfirmTrash = ref<number[]>([]);
const isPermanentDeleteConfirmDialogVisible = ref(false);
const messageIdsToConfirmPermanentDelete = ref<number[]>([]);

const initiateTrashConfirmation = (ids: number[] | Ref<number[]>) => {
  const actualIds = isRef(ids) ? ids.value : ids;
  if (!actualIds || actualIds.length === 0) return;
  // console.log('Initiating trash confirmation for IDs:', actualIds);
  messageIdsToConfirmTrash.value = [...actualIds];
  isTrashConfirmDialogVisible.value = true;
};

const confirmTrashMessages = async () => {
  if (!messageIdsToConfirmTrash.value.length) return;

  // console.log('Confirming move to trash for IDs:', messageIdsToConfirmTrash.value);
  await handleMoveMailsTo('trash', messageIdsToConfirmTrash.value); 
  isTrashConfirmDialogVisible.value = false;
  messageIdsToConfirmTrash.value = [];
};

const initiatePermanentDeleteConfirmation = (ids: number[] | Ref<number[]>) => {
  const actualIds = isRef(ids) ? ids.value : ids;
  if (!actualIds || actualIds.length === 0) return;
  // console.log('Initiating permanent delete confirmation for IDs:', actualIds);
  messageIdsToConfirmPermanentDelete.value = [...actualIds];
  isPermanentDeleteConfirmDialogVisible.value = true;
};

const confirmPermanentDeleteMessages = async () => {
  if (!messageIdsToConfirmPermanentDelete.value.length) return;

  // console.log('Confirming permanent delete for IDs:', messageIdsToConfirmPermanentDelete.value);
  try {
    for (const id of messageIdsToConfirmPermanentDelete.value) {
      await emailComposable.deleteMessage(id);
    }
    if (openedMessage.value && messageIdsToConfirmPermanentDelete.value.includes(openedMessage.value.id)) {
      openedMessage.value = null;
    }
    if (selectedMessages.value.length > 0 && messageIdsToConfirmPermanentDelete.value.every(id => selectedMessages.value.includes(id)) && messageIdsToConfirmPermanentDelete.value.length === selectedMessages.value.length) {
      selectedMessages.value = [];
    }
    await fetchAllMessages();
  } catch (error) {
    // console.error('Error permanently deleting messages:', error);
  } finally {
    isPermanentDeleteConfirmDialogVisible.value = false;
    messageIdsToConfirmPermanentDelete.value = [];
  }
};

const { t } = useI18n();

// Headers
const headers = [
  { title: t('headers.emails.projectSubject'), key: 'subject' },
  { title: t('headers.emails.from'), key: 'from' },
  { title: t('headers.emails.date'), key: 'date' },
  { title: t('headers.emails.status'), key: 'status' },
  { title: t('headers.emails.actions'), key: 'actions', sortable: false },
];

// --- Download Attachment Functions ---
const downloadAttachment = (attachment: any) => {
  if (!attachment || typeof attachment !== 'object') {
    // console.error('Invalid attachment object:', attachment)
    return
  }
  if (!attachment.download_url) {
    // console.error('No download URL found in attachment:', attachment)
    return
  }
  try {
    const link = document.createElement('a')
    link.href = attachment.download_url
    link.target = '_blank'
    link.rel = 'noopener noreferrer'
    link.click()
  } catch (error) {
    // console.error('Error downloading attachment:', error)
  }
}

const downloadAttachments = async (attachments: any[]) => {
  if (!attachments || attachments.length === 0) return
  if (attachments.length > 1) {
    for (const attachment of attachments) {
      if (attachment?.download_url) {
        window.open(attachment.download_url, '_blank')
        await new Promise(resolve => setTimeout(resolve, 500))
      }
    }
    return
  }
  if (attachments[0]?.download_url) {
    window.open(attachments[0].download_url, '_blank')
  }
}

const closeEmailView = () => {
  openedMessage.value = null
  showReplyForm.value = false
  replyMessage.value = ''
}

</script>

<template>
  <VLayout style="min-block-size: 100%;" class="email-app-layout">
    <VNavigationDrawer v-model="isLeftSidebarOpen" absolute touchless location="start" :temporary="$vuetify.display.mdAndDown">
      <EmailLeftSidebarContent 
        :messages-meta="messagesMeta" 
        :user-labels="emailComposable.userLabels.value" 
        :fetch-user-labels="emailComposable.fetchUserLabels"
        :add-label="emailComposable.addLabel"
        :resolve-label-color="emailComposable.resolveLabelColor"
        :delete-label="emailComposable.deleteLabel"
        @toggle-compose-dialog-visibility="isComposeDialogVisible = !isComposeDialogVisible"
        @folder-selected="closeEmailView"
      />
    </VNavigationDrawer>
    <VMain>
      <VCard flat class="email-content-list h-100 d-flex flex-column">
        <div class="d-flex align-center">
          <IconBtn class="d-lg-none ms-3" @click="isLeftSidebarOpen = true">
            <VIcon icon="bx-menu" />
          </IconBtn>

          <VTextField
            v-model="searchQuery"
            density="default"
            class="email-search px-sm-2 flex-grow-1 py-1"
            :placeholder="t('emails.actions.search')"
            @update:model-value="() => { fetchAllMessages() }"
          >
            <template #prepend-inner>
              <VIcon
                icon="bx-search"
                size="22"
                class="me-2 text-medium-emphasis"
              />
            </template>
          </VTextField>
        </div>
        <VDivider />
        
        <template v-if="!openedMessage">
          <div class="py-2 px-4 d-flex align-center gap-x-1">
            <VCheckbox :model-value="selectAllEmailCheckbox" :indeterminate="isSelectAllEmailCheckboxIndeterminate" class="d-flex" @update:model-value="selectAllCheckboxUpdate"/>
          <div
            class="w-100 d-flex align-center action-bar-actions gap-x-1"
          >
              <IconBtn v-if="emailComposable.shallShowMoveToActionFor('archive')" @click="handleMoveMailsTo('archive')">
                <VIcon icon="bx-archive" size="22" />
                <VTooltip activator="parent" location="top">{{ t('emails.actions.archive') }}</VTooltip>
              </IconBtn>
              <IconBtn v-if="emailComposable.shallShowMoveToActionFor('inbox')" @click="handleMoveMailsTo('inbox')">
                <VIcon icon="bx-envelope" size="22" />
                <VTooltip activator="parent" location="top">{{ t('emails.actions.moveToInbox') }}</VTooltip>
              </IconBtn>
              <IconBtn v-if="emailComposable.shallShowMoveToActionFor('trash')" @click="initiateTrashConfirmation(selectedMessages)">
                <VIcon icon="bx-trash" size="22" />
                <VTooltip activator="parent" location="top">{{ t('emails.actions.moveToTrash') }}</VTooltip>
              </IconBtn>
              <IconBtn v-if="route.params.filter === 'trash'" color="error" @click="initiatePermanentDeleteConfirmation(selectedMessages)">
                <VIcon icon="bxs-trash" size="22" />
                <VTooltip activator="parent" location="top">{{ t('emails.actions.deleteForever') }}</VTooltip>
              </IconBtn>
              <IconBtn @click="handleActionClick(isAllMarkRead ? 'unread' : 'read')">
                <VIcon :icon="isAllMarkRead ? 'bx-envelope' : 'bx-envelope-open'" size="22"/>
                <VTooltip activator="parent" location="top">{{ isAllMarkRead ? t('emails.actions.markAsUnread') : t('emails.actions.markAsRead') }}</VTooltip>
              </IconBtn>
              <IconBtn :disabled="!selectedMessages.length">
                <VIcon icon="bx-comment-check" size="22"/>
                <VTooltip activator="parent" location="top">{{ t('emails.actions.changeTaskStatus') }}</VTooltip>
                <VMenu activator="parent">
                  <VList density="compact">
                    <VListItem
                      v-for="statusOption in taskStatusOptions" 
                      :key="statusOption.value" 
                      href="#"
                      @click="handleSelectedTaskStatusUpdate(statusOption.value)"
                    >
                      <template #prepend>
                        <VBadge inline :color="resolveStatusColor(statusOption.value)" dot/>
                      </template>
                      <VListItemTitle class="ms-2">{{ t(`emails.status.${statusOption.value}`) }}</VListItemTitle>
                    </VListItem>
                  </VList>
                </VMenu>
              </IconBtn>
              <IconBtn :disabled="!selectedMessages.length">
                <VIcon icon="bx-label" size="22"/>
                <VTooltip activator="parent" location="top">{{ t('emails.actions.label') }}</VTooltip>
                <VMenu activator="parent">
                  <VList density="compact">
                    <VListItem 
                      v-for="label in emailComposable.userLabels.value" 
                      :key="label.title" 
                      href="#" 
                      @click="handleEmailLabels(label.title)"
                    >
                      <template #prepend>
                        <VBadge 
                          inline 
                          :color="emailComposable.resolveLabelColor(label.title)" 
                          dot
                        />
                      </template>
                      <VListItemTitle class="ms-2 text-capitalize">
                        {{ label.title }}
                      </VListItemTitle>
                    </VListItem>
                  </VList>
                </VMenu>
              </IconBtn>
          </div>
          <VSpacer />
            <IconBtn @click="fetchAllMessages">
              <VIcon icon="bx-refresh" size="22" />
              <VTooltip activator="parent" location="top">{{ t('emails.actions.refresh') }}</VTooltip>
            </IconBtn>
        </div>
        <VDivider />
          
          <!-- START: Summary Boxes (Always Visible) -->
          <div class="px-4 py-2 d-flex gap-4">
            <VChip color="warning" label size="small">
              Due Today: {{ dueTodayCount }}
            </VChip>
            <VChip color="primary" label size="small">
              New Tasks: {{ newStatusCount }}
            </VChip>
          </div>
          <VDivider />
          <!-- END: Summary Boxes -->

          <!-- START: Column Headers -->
          <div class="email-list-header d-none d-md-flex align-center px-3 py-2 gap-2 text-caption text-disabled">
            <!-- Checkbox column (20px) -->
            <span style="inline-size: 20px; min-inline-size: 20px;" class="me-1"></span>
            
            <!-- Star icon column (38px) -->
            <span style="inline-size: 38px; min-inline-size: 38px;"></span>
            
            <!-- Read/Unread icon column (38px) -->
            <span style="inline-size: 38px; min-inline-size: 38px;"></span>
            
            <!-- Status column (180px) -->
            <span class="font-weight-semibold flex-shrink-0 ws-no-wrap text-truncate" style="inline-size: 180px; min-inline-size: 180px;">
              {{ t('headers.emails.status') }}
            </span>
            
            <!-- From/To column (200px) -->
            <span class="font-weight-semibold flex-shrink-0 ws-no-wrap text-truncate" style="inline-size: 200px; min-inline-size: 200px;">
              From/<span class="font-weight-bold">To</span>
            </span>
            
            <!-- Project-Subject column (250px) -->
            <span class="font-weight-semibold flex-shrink-0 ws-no-wrap text-truncate" style="inline-size: 250px; min-inline-size: 250px;">
              {{ t('headers.emails.project') }}
            </span>
            
            <!-- Message column (flex-grow) -->
            <span class="font-weight-semibold flex-grow-1 ws-no-wrap ms-2">
              {{ t('headers.emails.message') }}
            </span>
          </div>
          <VDivider class="d-none d-md-block"/>
          <!-- END: Column Headers -->
        
  <PerfectScrollbar v-if="messages.length" tag="ul" class="Message-list">
    <li
      v-for="message in messages"
      :key="message.id"
      class="email-item d-flex align-center pa-3 gap-1 cursor-pointer"
      :class="[{ 'message-read': message.isRead }]"
      @click="openMessage(message)"
    >
      <div class="d-flex align-center flex-grow-1 gap-2">
        <!-- Checkbox -->
        <VCheckbox
          :model-value="selectedMessages.includes(message.id)"
          class="checkbox-column"
          @update:model-value="toggleSelectedEmail(message.id)"
          @click.stop
        />
        
        <!-- Star icon -->
        <IconBtn
          :class="{ 'starred-button': message.isStarred }"
          class="star-column"
          @click.stop="handleActionClick(message.isStarred ? 'unstar' : 'star', [message.id])"
        >
          <VIcon :icon="message.isStarred ? 'bxs-star' : 'bx-star'" size="22" />
        </IconBtn>
        
        <!-- Read/Unread icon -->
        <IconBtn 
          class="read-column"
          @click.stop="handleActionClick(message.isRead ? 'unread' : 'read', [message.id])"
        >
          <VIcon :icon="message.isRead ? 'bx-envelope-open' : 'bx-envelope'" size="22" />
        </IconBtn>
        
        <!-- Status Column (includes task status and labels) -->
        <div class="status-column d-flex flex-column gap-1">
          <!-- Task Status -->
          <VChip
            v-if="message.task_status"
            :color="resolveStatusColor(message.task_status)"
            size="small"
            class="ws-no-wrap text-capitalize"
          >
            {{ message.task_status }}
          </VChip>
          <span v-else class="text-caption text-disabled ws-no-wrap">No Status</span>
          
          <!-- Labels -->
          <div class="d-flex flex-wrap gap-1">
            <VChip
              v-for="label in message.labels"
              :key="label"
              :color="emailComposable.resolveLabelColor(label)"
              size="x-small"
              class="text-capitalize"
            >
              {{ label }}
            </VChip>
            <span v-if="!message.labels?.length" class="text-caption text-disabled ws-no-wrap">
              {{ t('emails.messages.noLabels') }}
            </span>
          </div>
        </div>
        
        <!-- Participants Column (From and To) -->
        <div class="participants-column d-flex flex-column">
          <div class="text-caption font-weight-medium text-truncate">
            {{ message.from?.fullName || t('emails.messages.unknown') }}
          </div>
          <div class="text-caption text-medium-emphasis text-truncate">
            {{ message.to?.[0]?.fullName || message.to?.[0]?.email || 'N/A' }}
          </div>
        </div>
        
        <!-- Project Column -->
        <div class="project-subject-column d-flex flex-column">
          <div class="text-subtitle-2 font-weight-bold text-primary text-truncate">
            {{ message.project?.title }}
          </div>
          <div class="text-body-2 text-truncate">
            {{ message.subject }}
            <VIcon v-if="message.attachments?.length" icon="bx-paperclip" size="18" class="ms-1 text-disabled" />
          </div>
        </div>
        
        <!-- Message Column -->
        <div class="message-column flex-grow-1">
          <div class="text-body-2 text-medium-emphasis" v-html="message.message ? message.message.replace(/<p>|<\/p>/g, '') : ''"></div>
        </div>
      </div>
    </li>
  </PerfectScrollbar>
        </template>
        
        <template v-else>
          <div class="email-detail-view">
            <div class="email-view-header d-flex align-center px-6 py-4">
              <IconBtn
                class="me-2"
                @click="openedMessage = null; showReplyForm = false; replyMessage = ''"
        >
          <VIcon
            size="22"
                  icon="bx-chevron-left"
                  class="flip-in-rtl text-medium-emphasis"
          />
        </IconBtn>

              <div class="d-flex align-center flex-wrap flex-grow-1 overflow-hidden gap-2">
                <div class="text-body-1 text-high-emphasis text-truncate">
                  {{ openedMessage.subject || 'No Subject' }}
        </div>

                <div v-if="openedMessage.labels && openedMessage.labels.length" class="d-flex flex-wrap gap-2">
                  <VChip
                    v-for="label in openedMessage.labels"
                    :key="label"
                    :color="emailComposable.resolveLabelColor(label)"
                    class="text-capitalize flex-shrink-0"
                    size="small"
                  >
                    {{ label }}
                  </VChip>
      </div>
    </div>

              <div>
                <div class="d-flex align-center gap-1">
                  <IconBtn
                    :disabled="!messageViewMeta.hasPreviousEmail"
                    @click="changeOpenedMessage('previous')"
                  >
                    <VIcon
                      icon="bx-chevron-left"
                      class="flip-in-rtl text-medium-emphasis"
                    />
                  </IconBtn>

                  <IconBtn
                    :disabled="!messageViewMeta.hasNextEmail"
                    @click="changeOpenedMessage('next')"
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

            <div class="email-view-action-bar d-flex align-center text-medium-emphasis ps-6 pe-4 gap-x-1">
              <IconBtn v-if="!openedMessage.isArchived && openedMessage.status !== 'deleted'" @click="handleMoveMailsTo('archive', [openedMessage.id]); openedMessage = null">
                <VIcon icon="bx-archive" size="22" />
                <VTooltip activator="parent" location="top">{{ t('emails.actions.archive') }}</VTooltip>
              </IconBtn>
              <IconBtn v-if="openedMessage.isArchived" @click="handleMoveMailsTo('inbox', [openedMessage.id]); openedMessage = null">
                <VIcon icon="bx-envelope" size="22" />
                <VTooltip activator="parent" location="top">{{ t('emails.actions.moveToInbox') }}</VTooltip>
              </IconBtn>
              <IconBtn v-if="openedMessage.status !== 'deleted'" @click="initiateTrashConfirmation([openedMessage.id]); openedMessage = null">
                <VIcon icon="bx-trash" size="22" />
                <VTooltip activator="parent" location="top">{{ t('emails.actions.moveToTrash') }}</VTooltip>
              </IconBtn>
              <IconBtn v-if="openedMessage.status === 'deleted'" color="error" @click="initiatePermanentDeleteConfirmation([openedMessage.id]); openedMessage = null">
                <VIcon icon="bxs-trash" size="22" />
                <VTooltip activator="parent" location="top">{{ t('emails.actions.deleteForever') }}</VTooltip>
              </IconBtn>
              <IconBtn @click="handleActionClick('unread', [openedMessage.id]); openedMessage = null">
                <VIcon icon="bx-envelope" size="22" />
                <VTooltip activator="parent" location="top">{{ t('emails.actions.markAsUnread') }}</VTooltip>
              </IconBtn>
              <IconBtn @click="handleTaskStatusToggle(openedMessage)">
                <VIcon icon="bx-comment-check" size="22"/>
                <VTooltip activator="parent" location="top">{{ t('emails.actions.changeTaskStatus') }}</VTooltip>
              </IconBtn>
              <IconBtn>
                <VIcon icon="bx-label" size="22" />
                <VTooltip activator="parent" location="top">{{ t('emails.actions.label') }}</VTooltip>
                <VMenu activator="parent">
                  <VList density="compact">
                    <VListItem 
                      v-for="label in emailComposable.userLabels.value" 
                      :key="label.title" 
                      href="#" 
                      @click="handleEmailLabels(label.title)"
                    >
                      <template #prepend>
                        <VBadge 
                          inline 
                          :color="emailComposable.resolveLabelColor(label.title)" 
                          dot
                        />
                      </template>
                      <VListItemTitle class="ms-2 text-capitalize">
                        {{ label.title }}
                      </VListItemTitle>
                    </VListItem>
                  </VList>
                </VMenu>
              </IconBtn>
              <VSpacer />
              <div class="d-flex align-center gap-x-1">
                <IconBtn :class="{ 'starred-button': openedMessage.isStarred }" @click="handleActionClick(openedMessage.isStarred ? 'unstar' : 'star', [openedMessage.id])">
                  <VIcon :icon="openedMessage.isStarred ? 'bxs-star' : 'bx-star'" size="22" />
                </IconBtn>
              </div>
            </div>

            <VDivider />

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
                        {{ openedMessage.from?.fullName || t('emails.messages.unknown') }}
                      </div>
                      <div class="text-sm">
                        {{ openedMessage.from?.email || t('emails.messages.noEmail') }}
                      </div>
                    </div>

                    <VSpacer />

                    <div class="d-flex align-center gap-x-4">
                      <div class="text-disabled text-base">
                        {{ new Date(openedMessage.time || Date.now()).toDateString() }}
                      </div>
                      <IconBtn 
                        v-if="openedMessage.attachments?.length" 
                        @click.stop="downloadAttachments(openedMessage.attachments)"
                      >
                        <VIcon
                          icon="bx-paperclip"
                          size="22"
                        />
                        <VTooltip
                          activator="parent"
                          location="top"
                        >
                          {{ t('emails.messages.attachmentsCount', { count: openedMessage.attachments.length }) }}
                        </VTooltip>
                      </IconBtn>
                    </div>
                  </div>
                </div>

                <VDivider />

                <VCardText>
                  <div class="text-body-1 font-weight-medium text-truncate mb-4">
                    {{ openedMessage.from?.fullName || t('emails.messages.unknown') }},
                  </div>
                  <div class="text-base" v-html="openedMessage.message || ''" />
                </VCardText>

                <template v-if="openedMessage.attachments && openedMessage.attachments.length">
                  <VDivider />

                  <VCardText class="d-flex flex-column gap-y-4 pt-4">
                    <span>{{ t('emails.messages.attachmentsCount', { count: openedMessage.attachments.length }) }}</span>
                    <div
                      v-for="attachment in openedMessage.attachments"
                      :key="attachment.id || attachment.fileName || 'file'"
                      class="d-flex align-center justify-space-between"
                    >
                      <div class="d-flex align-center gap-2">
                        <VIcon
                          icon="bx-file"
                          size="20"
                          color="primary"
                        />
                        <span>{{ attachment.fileName || 'Attachment' }}</span>
                      </div>
                      <VBtn
                        variant="text"
                        color="primary"
                        size="small"
                        @click.stop="downloadAttachment(attachment)"
                      >
                        <VIcon
                          icon="bx-download"
                          size="20"
                          class="me-1"
                        />
                        {{ t('emails.actions.download') }}
                      </VBtn>
                    </div>
                  </VCardText>
                </template>
              </VCard>

              <VCard v-if="!showReplyForm">
                <VCardText class="font-weight-medium text-high-emphasis">
                  <div class="text-base">
                    {{ t('emails.messages.clickToReply') }} <span
                      class="text-primary cursor-pointer"
                      @click="showReplyForm = true"
                    >
                      {{ t('emails.actions.reply') }}
                    </span>
                  </div>
                </VCardText>
              </VCard>

              <VCard v-if="showReplyForm" class="mt-4">
                <VCardText>
                  <div class="text-body-1 text-high-emphasis mb-6">
                    Reply to {{ openedMessage.from?.fullName || openedMessage.from?.email || 'User' }}
                  </div>
                  <VTextarea
                    v-model="replyMessage"
                    placeholder="Write your message..."
                    rows="4"
                    hide-details
                    class="mb-4"
                  ></VTextarea>

                  <!-- Attachment List -->
                  <div v-if="replyAttachments.length > 0" class="mb-4">
                    <div class="text-caption mb-2">Attachments:</div>
                    <div v-for="(file, index) in replyAttachments" :key="index" class="d-flex align-center gap-2 mb-2">
                      <VIcon icon="bx-file" size="20" color="primary" />
                      <span class="text-truncate">{{ file.name }}</span>
                      <VBtn
                        icon
                        variant="text"
                        size="small"
                        color="error"
                        @click="removeReplyAttachment(index)"
                      >
                        <VIcon icon="bx-x" size="20" />
                      </VBtn>
                    </div>
                  </div>

                  <div class="d-flex justify-end gap-4 pt-2 flex-wrap">
                    <IconBtn
                      icon="bx-trash"
                      @click="clearReplyForm"
                    />
                    <input
                      ref="replyAttachmentInput"
                      type="file"
                      multiple
                      class="d-none"
                      @change="handleReplyAttachmentSelect"
                    />
                    <VBtn
                      variant="text"
                      color="secondary"
                      @click="replyAttachmentInput?.click()"
                    >
                      <template #prepend>
                        <VIcon
                          icon="bx-paperclip"
                          color="secondary"
                          size="16"
                        />
                      </template>
                      {{ replyAttachments.length ? `${replyAttachments.length} Attachments` : 'Add Attachments' }}
                    </VBtn>
                    <VBtn 
                      append-icon="bx-paper-plane" 
                      @click="sendReply"
                    >
                      Send
                    </VBtn>
                  </div>
                </VCardText>
              </VCard>
            </PerfectScrollbar>
          </div>
        </template>
      </VCard>
      <ComposeDialog
        v-if="isComposeDialogVisible"
        @close="isComposeDialogVisible = false"
        @refresh="fetchAllMessages"
      />
      
      <VDialog v-model="isTrashConfirmDialogVisible" max-width="500px">
        <VCard>
          <VCardTitle>{{ t('emails.confirmations.trash.title') }}</VCardTitle>
          <VCardText>
            {{ t('emails.confirmations.trash.message') }}
          </VCardText>
          <VCardActions>
            <VSpacer />
            <VBtn color="secondary" @click="isTrashConfirmDialogVisible = false">{{ t('emails.confirmations.trash.cancel') }}</VBtn>
            <VBtn color="error" @click="confirmTrashMessages">{{ t('emails.confirmations.trash.confirm') }}</VBtn>
          </VCardActions>
        </VCard>
      </VDialog>

      <VDialog v-model="isPermanentDeleteConfirmDialogVisible" max-width="500px">
        <VCard>
          <VCardTitle class="text-h5 error--text">{{ t('emails.confirmations.delete.title') }}</VCardTitle>
          <VCardText>
            <VAlert type="warning" dense outlined class="mb-3">
              {{ t('emails.confirmations.delete.warning') }}
            </VAlert>
            {{ t('emails.confirmations.delete.message') }}
          </VCardText>
          <VCardActions>
            <VSpacer />
            <VBtn color="secondary" @click="isPermanentDeleteConfirmDialogVisible = false">{{ t('emails.confirmations.delete.cancel') }}</VBtn>
            <VBtn color="error" @click="confirmPermanentDeleteMessages">{{ t('emails.confirmations.delete.confirm') }}</VBtn>
          </VCardActions>
        </VCard>
      </VDialog>
    </VMain>
  </VLayout>
</template>

<style lang="scss">
@use "@styles/variables/vuetify";
@use "@core-scss/base/mixins";

.email-search {
  .v-field__outline {
    display: none;
  }

  .v-field__field {
    .v-field__input {
      font-size: 0.9375rem !important;
      line-height: 1.375rem !important;
    }
  }
}

.email-app-layout {
  border-radius: vuetify.$card-border-radius;

  @include mixins.elevation(vuetify.$card-elevation);

  $sel-email-app-layout: &;

  @at-root {
    .skin--bordered {
      @include mixins.bordered-skin($sel-email-app-layout);
    }
  }
}

.email-content-list {
  border-end-start-radius: 0;
  border-start-start-radius: 0;
}

.email-item {
  .d-flex.align-center {
    align-items: flex-start !important; // Align content to top
    gap: 0.5rem;
    min-block-size: 64px; // Reduced to two lines
    padding-block: 0.75rem; // Add some vertical padding

    .checkbox-column {
      inline-size: 20px;
      margin-block-start: 0.25rem; // Align checkbox with text
      min-inline-size: 20px;
    }

    .star-column {
      inline-size: 38px;
      margin-block-start: 0.25rem; // Align star icon with text
      min-inline-size: 38px;
    }

    .read-column {
      inline-size: 38px;
      margin-block-start: 0.25rem; // Align read icon with text
      min-inline-size: 38px;
    }

    .status-column {
      inline-size: 180px;
      min-inline-size: 180px;
    }

    .participants-column {
      inline-size: 200px;
      min-inline-size: 200px;
    }

    .project-subject-column {
      inline-size: 250px;
      min-inline-size: 250px;
    }

    .message-column {
      display: -webkit-box;
      overflow: hidden;
      flex-grow: 1;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2; // Show only 2 lines
    }
  }
}

.email-list {
  white-space: nowrap;

  .email-item {
    block-size: 4.375rem;
    transition: all 0.2s ease-in-out;
    will-change: transform, box-shadow;

    &.email-read {
      background-color: rgba(var(--v-theme-on-surface), var(--v-hover-opacity));
    }

    & + .email-item {
      border-block-start: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
    }
  }

  .email-item:hover {
    transform: translateY(-2px);

    @include mixins.elevation(4);

    @media screen and (min-width: 1280px) {
      .email-actions {
        display: block !important;
      }

      .email-meta {
        display: none;
      }
    }

    + .email-item {
      border-color: transparent;
    }

    @media screen and (max-width: 600px) {
      .email-actions {
        display: none !important;
      }
    }
  }
}

.email-compose-dialog {
  position: absolute;
  inset-block-end: 0;
  inset-inline-end: 0;
  min-inline-size: 100%;

  @media only screen and (min-width: 800px) {
    inset-block-end: 25px;
    inset-inline-end: 15px;
    min-inline-size: 712px;
  }
}

.email-detail-view {
  display: flex;
  flex-direction: column;
  animation: slide-in 0.3s ease-out;
  block-size: 100%;
}

@keyframes slide-in {
  from {
    opacity: 0;
    transform: translateX(100%);
  }

  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.email-view-header {
  background-color: var(--v-theme-background);
}

.email-view-action-bar {
  min-block-size: 54px;
}

.mail-content-container {
  flex-grow: 1;
  background-color: rgb(var(--v-theme-on-surface), var(--v-hover-opacity));
  overflow-y: auto;
}

.starred-button {
  background-color: rgba(var(--v-theme-primary), 0.1);
}

.ws-no-wrap {
  white-space: nowrap;
}

.email-list-header {
  .ws-no-wrap {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
</style>

