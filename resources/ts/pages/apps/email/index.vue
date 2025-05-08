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

console.log("🚀 Emails page Index.vue is loading!");

const { 
    fetchMessages, 
    sendReplyMessage,
    userLabels,
    resolveLabelColor,
    emailMoveToFolderActions,
    shallShowMoveToActionFor,
    moveSelectedEmailTo,
    updateEmails,
    deleteMessage,
 } = useEmail();

const messages = ref<Email[]>([]); 

// NEW: Ref for storing summary data of ALL user messages
interface MessageSummary {
  id: number;
  due_date: string | null;
  task_status: 'new' | 'in_process' | 'completed' | null;
}
const allUserMessagesSummary = ref<MessageSummary[]>([]);

const fetchAllMessages = async () => {  
  try {
    console.log("🔥 Fetching messages for current view...");
    const response = await fetchMessages(); // This should resolve to Email[] from the view types
    console.log("✅ View Messages Data:", response);
    if (Array.isArray(response)) {
      messages.value = response; 
    } else {
      console.error("❌ Invalid API response format for view messages:", response);
      messages.value = [];
    }
  } catch (error) {
    console.error("❌ Error fetching view messages:", error);
    messages.value = [];
  }
};

// NEW: Fetch summary data for ALL user messages
const fetchAllUserMessagesSummary = async () => {
  try {
    console.log("🔥 Fetching summary data for ALL user messages...");
    const response = await $api('/messages/summary'); 
    console.log("✅ Summary Data:", response);
    if (response && Array.isArray(response)) {
      allUserMessagesSummary.value = response;
    } else {
      console.error("❌ Invalid API response format for summary data:", response);
      allUserMessagesSummary.value = [];
    }
  } catch (error) {
    console.error("❌ Error fetching summary data:", error);
    allUserMessagesSummary.value = [];
  }
};

const selectedMessages = ref<number[]>([]);
const messagesMeta = computed(() => ({
  inbox: messages.value.filter(m => m.folder === 'inbox' && !m.isArchived && m.status !== 'deleted').length,
  sent: messages.value.filter(m => m.folder === 'sent').length,
  archive: messages.value.filter(m => m.isArchived).length,
  trash: messages.value.filter(m => m.status === 'deleted').length,
  starred: messages.value.filter(m => m.isStarred).length,
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
      console.error(`  Error processing due_date ${m.due_date} for message ${m.id}:`, e);
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
    console.error("Error formatting date:", dateString, error);
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
const taskStatusOptions: { title: string, value: 'new' | 'in_process' | 'completed' }[] = [
  { title: 'New', value: 'new' },
  { title: 'In Progress', value: 'in_process' },
  { title: 'Completed', value: 'completed' },
];

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
  console.log('Opening message:', message);
  
  openedMessage.value = message;
  
  console.log('openedMessage set to:', openedMessage.value);
  
  if (!message.isRead) {
    try {
      await updateEmails([message.id], { status: 'read', isRead: true }); 
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
      console.error('Error marking message as read:', error);
    }
  }
}

// --- Watchers ---
watch(() => route.params, async () => {  
  await fetchAllMessages(); // Refetch view messages on route change
  // Summary data doesn't depend on route, no need to refetch here unless actions modify it broadly
  selectedMessages.value = []; 
}, { deep: true })


// --- Action Handling ---

// Generic action handler (for star/unstar, read/unread - now simplified)
const handleActionClick = async (
  action: 'star' | 'unstar' | 'read' | 'unread',
  emailIds: number[] | Ref<number[]> = selectedMessages,
) => {
  const ids: number[] = isRef(emailIds) ? emailIds.value : emailIds;
  console.log(`>>> handleActionClick: action=${action}, ids=`, ids);
  if (!ids || ids.length === 0) return;

  let updateData: PartialDeep<Email> = {};

  if (action === 'star') updateData = { isStarred: true };
  else if (action === 'unstar') updateData = { isStarred: false };
  else if (action === 'read') updateData = { status: 'read', isRead: true };
  else if (action === 'unread') updateData = { isRead: false };

  console.log(`>>> handleActionClick: Prepared updateData:`, updateData);

  try {
    console.log(`>>> handleActionClick: Calling updateEmails...`);
    await updateEmails(ids, updateData);
    console.log(`>>> handleActionClick: updateEmails finished. Updating local state...`);
    
    messages.value.forEach(msg => {
      if (ids.includes(msg.id)) {
        console.log(`  - Updating local message ID ${msg.id}: action=${action}`);
        if (action === 'star') msg.isStarred = true;
        if (action === 'unstar') msg.isStarred = false;
        if (action === 'read') { msg.isRead = true; msg.status = 'read'; }
        if (action === 'unread') { msg.isRead = false; msg.status = 'sent'; }
      }
    });
    if (openedMessage.value && ids.includes(openedMessage.value.id)) {
      console.log(`  - Updating openedMessage ID ${openedMessage.value.id}: action=${action}`);
      if (action === 'star') openedMessage.value.isStarred = true;
      if (action === 'unstar') openedMessage.value.isStarred = false;
      if (action === 'read') { openedMessage.value.isRead = true; openedMessage.value.status = 'read'; }
      if (action === 'unread') { openedMessage.value.isRead = false; openedMessage.value.status = 'sent'; }
    }
    console.log(`>>> handleActionClick: Local state update finished.`);
  } catch (error) {
    console.error('Error performing action:', action, error);
  }
}

// Handle Moving Mails (Trash, Archive, Inbox) - Uses moveSelectedEmailTo composable
const handleMoveMailsTo = async (action: MoveEmailToAction, ids: number[] | Ref<number[]> = selectedMessages) => {
  const actualIds: number[] = isRef(ids) ? ids.value : ids;
  if (!actualIds || actualIds.length === 0) return;
  
  console.log(`Moving emails ${actualIds} to ${action}`);
  try {
    await moveSelectedEmailTo(action, actualIds);

    if (openedMessage.value && actualIds.includes(openedMessage.value.id)) {
      openedMessage.value = null;
    }
    if (actualIds === selectedMessages.value) {
      selectedMessages.value = [];
    }
    
      await fetchAllMessages();
  } catch (error) {
    console.error(`Error moving emails to ${action}:`, error);
  }
};

// Handle Labels (ensure payload matches expected type)
const handleEmailLabels = async (labelTitle: EmailLabel, messageIds: number[] | Ref<number[]> = selectedMessages) => {
  const idsToUpdate: number[] = isRef(messageIds) ? messageIds.value : messageIds;
  if (!idsToUpdate || idsToUpdate.length === 0) return;

  await updateEmails(idsToUpdate, { toggleLabel: labelTitle } as PartialDeep<Email>);

  if (openedMessage.value && idsToUpdate.includes(openedMessage.value.id)) {
    await refreshOpenedMessage(); 
  } else if (messageIds === selectedMessages) {
    selectedMessages.value = [];
    await fetchAllMessages();
  } else {
    await fetchAllMessages();
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

  console.log(`Cycling task status for message ${message.id} to ${newStatus}`);
  try {
    await updateEmails([message.id], { task_status: newStatus } as PartialDeep<Email>);
    message.task_status = newStatus;
    // Refresh summary data after status change
    await fetchAllUserMessagesSummary();
  } catch (error) {
    console.error(`Error updating task status for message ${message.id}:`, error);
  }
};

// NEW: Handle updating task status for SELECTED messages to a specific status
const handleSelectedTaskStatusUpdate = async (status: 'new' | 'in_process' | 'completed') => {
  const ids = selectedMessages.value;
  if (!ids || ids.length === 0) return;

  console.log(`Updating task status for selected messages ${ids} to ${status}`);

  try {
    await updateEmails(ids, { task_status: status } as PartialDeep<Email>);

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
    console.error(`Error updating task status for selected messages:`, error);
  }
};

// --- Reply Logic ---
const sendReply = async () => {
  console.log("index.vue: sendReply function started."); 

  if (!openedMessage.value || !openedMessage.value.from || !openedMessage.value.from.id || !openedMessage.value.id) { 
    console.error('Cannot send reply: Original message, sender, or IDs missing.');
    return;
  }

  if (!replyMessage.value.trim()) {
    console.error('Cannot send reply: Message body is empty.');
    return;
  }

  let replySubject = openedMessage.value.subject || '(No Subject)';
  if (!replySubject.toLowerCase().startsWith('re:')) {
    replySubject = `Re: ${replySubject}`;
  }

  const currentUserCompanyId = 1;

  const payload = {
    receiver_id: openedMessage.value.from.id,
    subject: replySubject,
    body: replyMessage.value,
    reply_to_id: openedMessage.value.id,
    company_id: currentUserCompanyId, 
  };

  console.log("index.vue: Sending reply with payload:", payload); 

  try {
    const result = await sendReplyMessage(payload); 
    console.log("index.vue: sendReplyMessage call completed. Result:", result); 

    if (result && result.message === 'Message sent successfully') { 
      console.log("Reply sent successfully:", result.data);
      showReplyForm.value = false;
      replyMessage.value = '';
    await fetchAllMessages();
      openedMessage.value = null;
    } else {
      console.error("Failed to send reply, API returned error or unexpected response:", result);
    }
  } catch (error) {
    console.error("Error sending reply:", error);
  }
  console.log("index.vue: sendReply function finished."); 
};

// --- Dialog State & Confirmation Logic ---
const isTrashConfirmDialogVisible = ref(false);
const messageIdsToConfirmTrash = ref<number[]>([]);
const isPermanentDeleteConfirmDialogVisible = ref(false);
const messageIdsToConfirmPermanentDelete = ref<number[]>([]);

const initiateTrashConfirmation = (ids: number[] | Ref<number[]>) => {
  const actualIds = isRef(ids) ? ids.value : ids;
  if (!actualIds || actualIds.length === 0) return;
  console.log('Initiating trash confirmation for IDs:', actualIds);
  messageIdsToConfirmTrash.value = [...actualIds];
  isTrashConfirmDialogVisible.value = true;
};

const confirmTrashMessages = async () => {
  if (!messageIdsToConfirmTrash.value.length) return;

  console.log('Confirming move to trash for IDs:', messageIdsToConfirmTrash.value);
  await handleMoveMailsTo('trash', messageIdsToConfirmTrash.value); 
  isTrashConfirmDialogVisible.value = false;
  messageIdsToConfirmTrash.value = [];
};

const initiatePermanentDeleteConfirmation = (ids: number[] | Ref<number[]>) => {
  const actualIds = isRef(ids) ? ids.value : ids;
  if (!actualIds || actualIds.length === 0) return;
  console.log('Initiating permanent delete confirmation for IDs:', actualIds);
  messageIdsToConfirmPermanentDelete.value = [...actualIds];
  isPermanentDeleteConfirmDialogVisible.value = true;
};

const confirmPermanentDeleteMessages = async () => {
  if (!messageIdsToConfirmPermanentDelete.value.length) return;

  console.log('Confirming permanent delete for IDs:', messageIdsToConfirmPermanentDelete.value);
  try {
    for (const id of messageIdsToConfirmPermanentDelete.value) {
      await deleteMessage(id);
    }
    if (openedMessage.value && messageIdsToConfirmPermanentDelete.value.includes(openedMessage.value.id)) {
      openedMessage.value = null;
    }
    if (selectedMessages.value.length > 0 && messageIdsToConfirmPermanentDelete.value.every(id => selectedMessages.value.includes(id)) && messageIdsToConfirmPermanentDelete.value.length === selectedMessages.value.length) {
      selectedMessages.value = [];
    }
    await fetchAllMessages();
  } catch (error) {
    console.error('Error permanently deleting messages:', error);
  } finally {
    isPermanentDeleteConfirmDialogVisible.value = false;
    messageIdsToConfirmPermanentDelete.value = [];
  }
};

const { t } = useI18n();

// Headers
const headers = [
  { title: t('headers.emails.subject'), key: 'subject' },
  { title: t('headers.emails.from'), key: 'from' },
  { title: t('headers.emails.date'), key: 'date' },
  { title: t('headers.emails.status'), key: 'status' },
  { title: t('headers.emails.actions'), key: 'actions', sortable: false },
];

</script>

<template v-if="messages && messages.length">
  <VLayout style="min-block-size: 100%;" class="email-app-layout">
    <VNavigationDrawer v-model="isLeftSidebarOpen" absolute touchless location="start" :temporary="$vuetify.display.mdAndDown">
      <EmailLeftSidebarContent :messages-meta="messagesMeta" @toggle-compose-dialog-visibility="isComposeDialogVisible = !isComposeDialogVisible" />
    </VNavigationDrawer>
    <VMain>
      <VCard flat class="email-content-list h-100 d-flex flex-column">
        <div class="d-flex align-center">
          <IconBtn class="d-lg-none ms-3" @click="isLeftSidebarOpen = true">
            <VIcon icon="bx-menu" />
          </IconBtn>

          <VTextField
            v-model="q"
            density="default"
            class="email-search px-sm-2 flex-grow-1 py-1"
            :placeholder="t('emails.actions.search')"
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
              <IconBtn v-if="shallShowMoveToActionFor('archive')" @click="handleMoveMailsTo('archive')">
                <VIcon icon="bx-archive" size="22" />
                <VTooltip activator="parent" location="top">{{ t('emails.actions.archive') }}</VTooltip>
            </IconBtn>
              <IconBtn v-if="shallShowMoveToActionFor('inbox')" @click="handleMoveMailsTo('inbox')">
                <VIcon icon="bx-envelope" size="22" />
                <VTooltip activator="parent" location="top">{{ t('emails.actions.moveToInbox') }}</VTooltip>
            </IconBtn>
              <IconBtn v-if="shallShowMoveToActionFor('trash')" @click="initiateTrashConfirmation(selectedMessages)">
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
                    <VListItem v-for="label in userLabels" :key="label.title" href="#" @click="handleEmailLabels(label.title)">
                      <template #prepend><VBadge inline :color="resolveLabelColor(label.title)" dot/></template>
                      <VListItemTitle class="ms-2 text-capitalize">{{ label.title }}</VListItemTitle>
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
            <!-- Placeholders to align with Checkbox and Star -->
            <span style="max-inline-size: 20px; min-inline-size: 20px;" class="me-1"></span>
            <span style="max-inline-size: 38px; min-inline-size: 38px;"></span> 
            <!-- Headers matching list item styles -->
            <span class="font-weight-semibold flex-shrink-0 ws-no-wrap text-truncate" style="max-inline-size: 90px; min-inline-size: 90px;">{{ t('headers.emails.status') }}</span>
            <span class="font-weight-semibold flex-shrink-0 ws-no-wrap ms-2" style="min-inline-size: 80px;">{{ t('headers.emails.dueDate') }}</span>
            <span class="font-weight-semibold flex-shrink-0 ws-no-wrap text-truncate" style="max-inline-size: 180px;min-inline-size: 120px;">{{ t('headers.emails.from') }}</span>
            <span class="font-weight-semibold flex-shrink-0 ws-no-wrap text-truncate" style="max-inline-size: 180px;min-inline-size: 120px;">{{ t('headers.emails.to') }}</span>
            <span class="font-weight-semibold flex-grow-1 ws-no-wrap ms-2">{{ t('headers.emails.subject') }}</span>
          </div>
          <VDivider class="d-none d-md-block"/>
          <!-- END: Column Headers -->
        
<PerfectScrollbar v-if="messages.length" tag="ul" class="Message-list">
  <li
    v-for="message in messages"
    :key="message.id"
    class="email-item d-flex align-center pa-3 gap-1 cursor-pointer"
              :class="[{ 'message-read': message.isRead } ]"
    @click="openMessage(message)"
  >
              <div class="d-flex align-center flex-grow-1 gap-2"> 
        <VCheckbox
          :model-value="selectedMessages.includes(message.id)"
                  class="flex-shrink-0 me-1" 
                    @update:model-value="toggleSelectedEmail(message.id)"
          @click.stop
        />
        <IconBtn
          :class="{ 'starred-button': message.isStarred }"
                  class="flex-shrink-0"
          @click.stop="handleActionClick(message.isStarred ? 'unstar' : 'star', [message.id])"
        >
                  <VIcon :icon="message.isStarred ? 'bxs-star' : 'bx-star'" size="22" />
        </IconBtn>
        <!-- Read/Unread Toggle Icon -->
        <IconBtn 
           @click.stop="handleActionClick(message.isRead ? 'unread' : 'read', [message.id])"
           class="ms-1 me-1" >
           <VIcon :icon="message.isRead ? 'bx-envelope-open' : 'bx-envelope'" size="22" />
           <VTooltip activator="parent" location="top">
             {{ message.isRead ? 'Mark as Unread' : 'Mark as Read' }}
           </VTooltip>
        </IconBtn>

                 <VChip
                     v-if="message.task_status"
                     :color="resolveStatusColor(message.task_status)"
                     size="small"
                     class="flex-shrink-0 ws-no-wrap text-capitalize ms-2"
                     style=" max-inline-size: 90px;min-inline-size: 90px;"
                 >
                  {{ message.task_status }}
                 </VChip>
                 <span
                    v-else
                    class="text-caption text-disabled flex-shrink-0 ws-no-wrap ms-2"
                    style=" max-inline-size: 90px;min-inline-size: 90px;"
                 >
                    N/A
                 </span>
                <span
                  v-if="message.dueDate"
                  class="text-caption text-medium-emphasis flex-shrink-0 ws-no-wrap ms-2"
                  style="min-inline-size: 80px;"
                >
                  {{ formatDate(message.dueDate) }}
                </span>
                <span
                  v-else
                  class="text-caption text-disabled flex-shrink-0 ws-no-wrap ms-2"
                  style="min-inline-size: 80px;"
                >
                  N/A
                </span>
        <h6
          v-if="message.from?.fullName"
                  class="text-h6 font-weight-semibold flex-shrink-0 ws-no-wrap text-truncate"
                  style="max-inline-size: 180px; min-inline-size: 120px;"
        >
          {{ message.from.fullName }}
        </h6>
                <div 
                  v-if="message.to && message.to.length > 0" 
                  class="text-caption text-medium-emphasis flex-shrink-0 ws-no-wrap text-truncate"
                  style="max-inline-size: 180px; min-inline-size: 120px;"
                >
                  To: {{ message.to[0]?.fullName || message.to[0]?.email || 'N/A' }}
        </div>
                <div class="flex-grow-1 overflow-hidden ms-2">
                  <h6 class="text-h6 font-weight-regular ws-no-wrap text-truncate mb-0">
                    {{ message.subject }}
                    <VIcon v-if="message.attachments && message.attachments.length > 0" icon="bx-paperclip" size="18" class="ms-1 text-disabled align-self-center" />
          </h6>
                  <div class="text-body-2 text-medium-emphasis text-truncate" v-html="message.message ? message.message.replace(/<p>|<\/p>/g, '') : ''"></div>
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
                    :color="resolveLabelColor(label)"
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
                    <VListItem v-for="label in userLabels" :key="label.title" href="#" @click="handleEmailLabels(label.title, [openedMessage.id])">
                      <template #prepend><VBadge inline :color="resolveLabelColor(label.title)" dot /></template>
                      <VListItemTitle class="ms-2 text-capitalize">{{ label.title }}</VListItemTitle>
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
                  <VAvatar size="38">
                    <VImg
                      :src="openedMessage.from?.avatar || '/images/avatars/avatar-1.png'"
                      :alt="openedMessage.from?.fullName || 'User'"
                    />
                  </VAvatar>

                  <div class="d-flex flex-wrap flex-grow-1 overflow-hidden">
                    <div class="text-truncate">
                      <div class="text-body-1 font-weight-medium text-high-emphasis text-truncate">
                        {{ openedMessage.from?.fullName || 'Unknown Sender' }}
                      </div>
                      <div class="text-sm">
                        {{ openedMessage.from?.email || 'no-email@example.com' }}
                      </div>
                    </div>

                    <VSpacer />

                    <div class="d-flex align-center gap-x-4">
                      <div class="text-disabled text-base">
                        {{ new Date(openedMessage.time || Date.now()).toDateString() }}
                      </div>
                    </div>
                  </div>
                </div>

                <VDivider />

                <VCardText>
                  <div class="text-base" v-html="openedMessage.message || ''" />
                </VCardText>

                <template v-if="openedMessage.attachments && openedMessage.attachments.length">
                  <VDivider />

                  <VCardText class="d-flex flex-column gap-y-4 pt-4">
                    <span>{{ openedMessage.attachments.length }} Attachments</span>
                    <div
                      v-for="attachment in openedMessage.attachments"
                      :key="attachment.id || attachment.fileName || 'file'"
                      class="d-flex align-center"
                    >
                      <a 
                        :href="attachment.download_url" 
                        target="_blank" 
                        class="d-flex align-center text-decoration-none"
                        @click.stop
                      >
                        <VImg
                          :src="attachment.thumbnail || '/images/icons/file-icons/doc.png'"
                          :alt="attachment.fileName || 'file'"
                          aspect-ratio="1"
                          max-height="24"
                          max-width="24"
                          class="me-2"
                        />
                        <span class="text-body-1 text-high-emphasis">{{ attachment.fileName || 'Attachment' }}</span>
                      </a>
                    </div>
                  </VCardText>
                </template>
              </VCard>

              <VCard v-if="!showReplyForm">
                <VCardText class="font-weight-medium text-high-emphasis">
                  <div class="text-base">
                    Click here to <span
                      class="text-primary cursor-pointer"
                      @click="showReplyForm = true"
                    >
                      Reply
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
                  <div class="d-flex justify-end gap-4 pt-2 flex-wrap">
                    <IconBtn
                      icon="bx-trash"
                      @click="showReplyForm = false; replyMessage = ''"
                    />
                    <VBtn
                      variant="text"
                      color="secondary"
                    >
                      <template #prepend>
                        <VIcon
                          icon="bx-paperclip"
                          color="secondary"
                          size="16"
                        />
                      </template>
                      Attachments
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

  .email-item .email-meta {
    display: flex;
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
</style>
