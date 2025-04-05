<script setup lang="ts">
import ComposeDialog from '@/views/apps/email/ComposeDialog.vue'
import EmailLeftSidebarContent from '@/views/apps/email/EmailLeftSidebarContent.vue'
import type { MoveEmailToAction } from '@/views/apps/email/useEmail'
import { useEmail } from '@/views/apps/email/useEmail'
import type { Email, EmailLabel } from '@db/apps/email/types'
import { isRef, type Ref } from 'vue'
import { useRoute } from 'vue-router'
import { PerfectScrollbar } from 'vue3-perfect-scrollbar'

definePage({
  meta: {
    layoutWrapperClasses: 'layout-content-height-fixed',
  },
})

console.log("🚀 Emails page Index.vue is loading!");

const { fetchMessages, sendReplyMessage } = useEmail();
const messages = ref<Email[]>([]); // ✅ Change `emails` to `messages`

// Fetch Messages from API ->
const fetchAllMessages = async () => {  // ✅ Change function name
  try {
    console.log("🔥 Fetching messages...");
    const response: Email[] = await fetchMessages(); // ✅ API returns `messages`

    console.log("✅ Messages Data:", response);

    if (Array.isArray(response)) {
      messages.value = response; // ✅ Change `emails` to `messages`
    } else {
      console.error("❌ Invalid API response format:", response);
      messages.value = [];
    }
  } catch (error) {
    console.error("❌ Error fetching messages:", error);
  }
};

// Change all `emails` references to `messages`
const selectedMessages = ref<Email['id'][]>([]);
const messagesMeta = computed(() => messages.value.length ? messages.value : {});

onMounted(fetchAllMessages); // ✅ Update function name


const { isLeftSidebarOpen } = useResponsiveLeftSidebar()

// Composables
const route = useRoute<'apps-email' | 'apps-email-filter' | 'apps-email-label'>()

const {
  userLabels,
  resolveLabelColor,
  emailMoveToFolderActions,
  shallShowMoveToActionFor,
  moveSelectedEmailTo,
  updateEmails,
  updateEmailLabels,
  deleteMessage,
} = useEmail()

// Compose dialog
const isComposeDialogVisible = ref(false)

// Ref
const q = ref('')

// Add these near where other refs are defined
const showReplyForm = ref(false);
const replyMessage = ref('');

// ------------------------------------------------
// Email Selection
// ------------------------------------------------

// Remove this old useApi call - we are using fetchAllMessages -> fetchMessages now
// const { data: emailData, execute: fetchEmails } = await useApi<any>(createUrl('/apps/email', {
//   query: {
//     q,
//     filter: () => 'filter' in route.params ? route.params.filter : undefined,
//     label: () => 'label' in route.params ? route.params.label : undefined,
//   },
// }))

const toggleSelectedEmail = (emailId: Email['id']) => {
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




// Email View
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



// const changeOpenedMessage = (dir: 'previous' | 'next') => {
//   if (!openedMessage.value)
//     return;

//   const openedMessageIndex = messages.value.findIndex(
//     m => m.id === openedMessage.value?.id,
//   );

//   const newMessageIndex = dir === 'previous' ? openedMessageIndex - 1 : openedMessageIndex + 1;

//   if (newMessageIndex >= 0 && newMessageIndex < messages.value.length)
//     openedMessage.value = messages.value[newMessageIndex];
// };



/*
  ℹ️ You can optimize it so it doesn't fetch emails on each action.
    Currently, if you just star the email, two API calls will get fired.
      1. star the email
      2. Fetch all latest emails

    You can limit this to single API call by:
      - making API to star the email
      - modify the state (set that email's isStarred property to true/false) in the store instead of making API for fetching emails

  😊 For simplicity of the code and possible of modification, we kept it simple.
*/

const handleActionClick = async (
  action: 'trash' | 'unread' | 'read' | 'spam' | 'star' | 'unstar',
  emailIds: Email['id'][] = selectedMessages.value,
) => {
  if (!emailIds.length)
    return

  try {
    // Since some actions need to go through an API that's not implemented yet, 
    // we'll do these operations optimistically on the local data
    if (action === 'trash') {
      // First update local data
      const messagesToUpdate = messages.value.filter(msg => emailIds.includes(msg.id));
      messagesToUpdate.forEach(msg => {
        msg.isDeleted = true;
      });
      
      // Try API call, but don't block on it
      try {
        await updateEmails(emailIds, { isDeleted: true });
      } catch (error) {
        console.warn('API error when trashing messages:', error);
      }
    }
    else if (action === 'spam') {
      try {
        await updateEmails(emailIds, { folder: 'spam' });
      } catch (error) {
        console.warn('API error when marking messages as spam:', error);
      }
    }
    else if (action === 'unread') {
      // Update local data
      const messagesToUpdate = messages.value.filter(msg => emailIds.includes(msg.id));
      messagesToUpdate.forEach(msg => {
        msg.isRead = false;
      });
      
      try {
        await updateEmails(emailIds, { isRead: false });
      } catch (error) {
        console.warn('API error when marking messages as unread:', error);
      }
    }
    else if (action === 'read') {
      // Update local data
      const messagesToUpdate = messages.value.filter(msg => emailIds.includes(msg.id));
      messagesToUpdate.forEach(msg => {
        msg.isRead = true;
      });
      
      try {
        await updateEmails(emailIds, { isRead: true });
      } catch (error) {
        console.warn('API error when marking messages as read:', error);
      }
    }
    else if (action === 'star') {
      // Update local data
      const messagesToUpdate = messages.value.filter(msg => emailIds.includes(msg.id));
      messagesToUpdate.forEach(msg => {
        msg.isStarred = true;
      });
      
      try {
        await updateEmails(emailIds, { isStarred: true });
      } catch (error) {
        console.warn('API error when starring messages:', error);
      }
    }
    else if (action === 'unstar') {
      // Update local data
      const messagesToUpdate = messages.value.filter(msg => emailIds.includes(msg.id));
      messagesToUpdate.forEach(msg => {
        msg.isStarred = false;
      });
      
      try {
        await updateEmails(emailIds, { isStarred: false });
      } catch (error) {
        console.warn('API error when unstarring messages:', error);
      }
    }

    // Clear selected messages after the action is complete
    selectedMessages.value = [];
    
    if (openedMessage.value)
      refreshOpenedMessage();
    else
      await fetchAllMessages();
  } catch (error) {
    console.error('Error performing action:', action, error);
  }
}

// Email actions
const handleMoveMailsTo = async (action: MoveEmailToAction) => {
  await moveSelectedEmailTo(action, selectedMessages.value)
  await fetchAllMessages()
}

// Handle Email Labels
const handleEmailLabels = async (labelTitle: EmailLabel, messageIds: Email['id'][] | Ref<Email['id'][]> = selectedMessages) => {
  const idsToUpdate = isRef(messageIds) ? messageIds.value : messageIds;
  if (!idsToUpdate || idsToUpdate.length === 0) return;

  await updateEmailLabels(idsToUpdate, labelTitle)

  // Refresh data
  if (openedMessage.value && idsToUpdate.includes(openedMessage.value.id)) {
    // If the currently opened message was affected, refresh it specifically
    await refreshOpenedMessage(); 
  } else if (idsToUpdate === selectedMessages.value) {
    // If we updated based on selection, clear selection and refresh list
    selectedMessages.value = [];
    await fetchAllMessages();
  } else {
    // Otherwise just refresh the main list (e.g., if called from detail view)
    await fetchAllMessages();
  }
}

// Email view
const changeOpenedMessage = async (dir: 'previous' | 'next') => {
  if (!openedMessage.value) return;

  const openedMessageIndex = messages.value.findIndex(
    e => e.id === openedMessage.value?.id,
  );

  const newMessageIndex = dir === 'previous' ? openedMessageIndex - 1 : openedMessageIndex + 1;

  if (newMessageIndex >= 0 && newMessageIndex < messages.value.length)
    openedMessage.value = messages.value[newMessageIndex];
};


// const openMessage = async (message: Email) => {
//   openedMessage.value = message

//   if (newMessageIndex >= 0 && newMessageIndex < messages.value.length)
//     openedMessage.value = messages.value[newMessageIndex]
// }

const openMessage = async (message: Email) => {
  console.log('Opening message:', message);
  
  // Ensure the message object matches the expected Email structure
  // Use properties defined in the updated Email type
  openedMessage.value = {
    ...message,
    // Ensure required fields exist, using defaults if necessary
    from: message.from || { 
      name: 'Unknown Sender', 
      email: 'unknown@example.com', 
      avatar: '/images/avatars/avatar-1.png' 
    },
    time: message.time || new Date().toISOString(), // Use message.time directly
    labels: message.labels || [],
    attachments: message.attachments || [],
    // Ensure other required Email fields have defaults if not provided by API
    to: message.to || [],
    subject: message.subject || '(No Subject)',
    message: message.message || '', // Use message.message directly
    folder: message.folder || 'inbox', // Default folder if needed
    isRead: message.isRead !== undefined ? message.isRead : true, // Default to read
    isStarred: message.isStarred !== undefined ? message.isStarred : false,
    isDeleted: message.isDeleted !== undefined ? message.isDeleted : false,
    // cc, bcc, replies are optional
  };
  
  console.log('openedMessage set to:', openedMessage.value);
  
  // Mark the message as read
  if (!message.isRead) { // Only mark if currently unread
    try {
      await handleActionClick('read', [message.id]);
      // Update the local state immediately for responsiveness
      if (openedMessage.value) openedMessage.value.isRead = true;
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  }
}


// Reset selected emails and fetch messages when filter or label is updated
watch(
  () => route.params,
  () => {
    selectedMessages.value = []
    // Fetch messages whenever the route params change
    fetchAllMessages()
  },
  { deep: true },
)

// Handle message deletion
const handleDeleteMessage = async (messageIds: Email['id'][] | Ref<Email['id'][]>) => {
  // Extract array from ref if needed
  const idsToDelete = isRef(messageIds) ? messageIds.value : messageIds;
  
  console.log('Delete button clicked');
  console.log('messageIds:', messageIds);
  console.log('idsToDelete:', idsToDelete);
  
  if (!idsToDelete || !idsToDelete.length) {
    console.log('No IDs to delete, returning');
    return;
  }
  
  try {
    console.log('Attempting to delete these IDs:', idsToDelete);
    // Delete each message
    for (const id of idsToDelete) {
      console.log('Deleting message ID:', id);
      await deleteMessage(id);
    }
    
    // Close opened message if it was deleted
    if (openedMessage.value && idsToDelete.includes(openedMessage.value.id)) {
      console.log('Closing opened message as it was deleted');
      openedMessage.value = null;
    }
    
    // Refresh the messages list
    console.log('Refreshing messages list');
    await fetchAllMessages();
  } catch (error) {
    console.error('Error deleting messages:', error);
  }
}

// Function to handle sending the reply
const sendReply = async () => {
  console.log("index.vue: sendReply function started."); 

  // Linter error fixed by adding 'id' to EmailFrom type
  if (!openedMessage.value || !openedMessage.value.from || !openedMessage.value.from.id || !openedMessage.value.id) { 
    console.error('Cannot send reply: Original message, sender, or IDs missing.');
    return;
  }

  if (!replyMessage.value.trim()) {
    console.error('Cannot send reply: Message body is empty.');
    // TODO: Show user feedback
    return;
  }

  // Prepare subject
  let replySubject = openedMessage.value.subject || '(No Subject)';
  if (!replySubject.toLowerCase().startsWith('re:')) {
    replySubject = `Re: ${replySubject}`;
  }

  const currentUserCompanyId = 1; // Placeholder

  const payload = {
    receiver_id: openedMessage.value.from.id, // Original sender's ID
    subject: replySubject,
    body: replyMessage.value, // Use 'body' key for replies
    reply_to_id: openedMessage.value.id, // Original message ID
    company_id: currentUserCompanyId, 
  };

  console.log("index.vue: Sending reply with payload:", payload); 

  try {
    // Call the NEW reply function
    const result = await sendReplyMessage(payload); 
    console.log("index.vue: sendReplyMessage call completed. Result:", result); 

    if (result && result.message === 'Message sent successfully') { 
      console.log("Reply sent successfully:", result.data);
      showReplyForm.value = false;
      replyMessage.value = '';
      await fetchAllMessages(); 
      openedMessage.value = null; // <-- Close the detail view
    } else {
      console.error("Failed to send reply, API returned error or unexpected response:", result);
       // TODO: Show error feedback to user
    }
  } catch (error) {
    console.error("Error sending reply:", error);
     // TODO: Show error feedback to user
  }
  console.log("index.vue: sendReply function finished."); 
};

// --- Dialog State ---
const isTrashConfirmDialogVisible = ref(false);
const messageIdsToConfirmTrash = ref<number[]>([]);
const isPermanentDeleteConfirmDialogVisible = ref(false);
const messageIdsToConfirmPermanentDelete = ref<number[]>([]);
// --- End Dialog State ---

// --- Trash Confirmation Logic ---
const initiateTrashConfirmation = (ids: number[] | Ref<number[]>) => {
  const actualIds = isRef(ids) ? ids.value : ids;
  if (!actualIds || actualIds.length === 0) return;
  console.log('Initiating trash confirmation for IDs:', actualIds);
  messageIdsToConfirmTrash.value = [...actualIds]; // Store a copy
  isTrashConfirmDialogVisible.value = true;
};

const confirmTrashMessages = async () => {
  if (!messageIdsToConfirmTrash.value.length) return;

  console.log('Confirming move to trash for IDs:', messageIdsToConfirmTrash.value);
  try {
    // Use moveSelectedEmailTo for consistency
    await moveSelectedEmailTo('trash', messageIdsToConfirmTrash.value); 

    // Close opened message if it was trashed
    if (openedMessage.value && messageIdsToConfirmTrash.value.includes(openedMessage.value.id)) {
        openedMessage.value = null;
    }
    
    // Clear selection if it matches the trashed items
    if (selectedMessages.value.length > 0 && messageIdsToConfirmTrash.value.every(id => selectedMessages.value.includes(id)) && messageIdsToConfirmTrash.value.length === selectedMessages.value.length) {
         selectedMessages.value = [];
    }
    
    await fetchAllMessages(); // Refresh list
  } catch (error) {
    console.error('Error moving messages to trash:', error);
    // TODO: Show error notification to user
  } finally {
    isTrashConfirmDialogVisible.value = false;
    messageIdsToConfirmTrash.value = [];
  }
};
// --- End Trash Confirmation Logic ---


// --- Permanent Delete Confirmation Logic ---
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
    // Call deleteMessage for each ID
    for (const id of messageIdsToConfirmPermanentDelete.value) {
        await deleteMessage(id); // Call the permanent delete function
    }

    // Close opened message if it was deleted
    if (openedMessage.value && messageIdsToConfirmPermanentDelete.value.includes(openedMessage.value.id)) {
        openedMessage.value = null;
    }
     
    // Clear selection if it matches the deleted items
    if (selectedMessages.value.length > 0 && messageIdsToConfirmPermanentDelete.value.every(id => selectedMessages.value.includes(id)) && messageIdsToConfirmPermanentDelete.value.length === selectedMessages.value.length) {
         selectedMessages.value = [];
    }

    await fetchAllMessages(); // Refresh list
  } catch (error) {
    console.error('Error permanently deleting messages:', error);
    // TODO: Show error notification to user
  } finally {
    isPermanentDeleteConfirmDialogVisible.value = false;
    messageIdsToConfirmPermanentDelete.value = [];
  }
};
// --- End Permanent Delete Confirmation Logic ---

</script>

<template v-if="messages && messages.length">
  <VLayout
    style="min-block-size: 100%;"
    class="email-app-layout"
  >
    <VNavigationDrawer
      v-model="isLeftSidebarOpen"
      absolute
      touchless
      location="start"
      :temporary="$vuetify.display.mdAndDown"
    >
      <EmailLeftSidebarContent
        :messages-meta="messagesMeta"
        @toggle-compose-dialog-visibility="isComposeDialogVisible = !isComposeDialogVisible"
      />
    </VNavigationDrawer>
    <VMain>
      <VCard
        flat
        class="email-content-list h-100 d-flex flex-column"
      >
        <div class="d-flex align-center">
          <IconBtn
            class="d-lg-none ms-3"
            @click="isLeftSidebarOpen = true"
          >
            <VIcon icon="bx-menu" />
          </IconBtn>

          <!-- 👉 Search -->
          <VTextField
            v-model="q"
            density="default"
            class="email-search px-sm-2 flex-grow-1 py-1"
            placeholder="Search mail"
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
        <!-- 👉 Action bar -->
        <div class="py-2 px-4 d-flex align-center d-flex gap-x-1">
          <!-- TODO: Make checkbox primary on indeterminate state -->
          <VCheckbox
            :model-value="selectAllEmailCheckbox"
            :indeterminate="isSelectAllEmailCheckboxIndeterminate"
            class="d-flex"
            @update:model-value="selectAllCheckboxUpdate"
          />
          <div
            class="w-100 d-flex align-center action-bar-actions gap-x-1"
          >
            <!-- Trash Button (Move to Trash) -->
            <!-- Show unless in trash view -->
            <IconBtn
              v-if="route.params.filter !== 'trash'" 
              v-show="selectedMessages.length > 0" 
              @click="initiateTrashConfirmation(selectedMessages)" 
            >
              <VIcon icon="bx-trash" size="22" />
              <VTooltip activator="parent" location="top"> Move to Trash </VTooltip>
            </IconBtn>

            <!-- Delete Forever Button -->
            <!-- Show ONLY in trash view -->
            <IconBtn
              v-if="route.params.filter === 'trash'" 
              v-show="selectedMessages.length > 0"
              color="error"
              @click="initiatePermanentDeleteConfirmation(selectedMessages)"
            >
              <VIcon icon="bxs-trash" size="22" /> <!-- Use filled icon -->
              <VTooltip activator="parent" location="top"> Delete Forever </VTooltip>
            </IconBtn>

            <!-- Mark unread/read -->
            <IconBtn @click="isAllMarkRead ? handleActionClick('unread') : handleActionClick('read') ">
              <VIcon
                :icon="isAllMarkRead ? 'bx-envelope' : 'bx-envelope-open'"
                size="22"
              />
              <VTooltip
                activator="parent"
                location="top"
              >
                {{ isAllMarkRead ? 'Mark as Unread' : 'Mark as Read' }}
              </VTooltip>
            </IconBtn>
            <!-- Move to folder -->
            <IconBtn>
              <VIcon
                icon="bx-folder"
                size="22"
              />
              <VTooltip
                activator="parent"
                location="top"
              >
                Folder
              </VTooltip>
              <VMenu activator="parent">
                <VList density="compact">
                  <template
                    v-for="moveTo in emailMoveToFolderActions"
                    :key="moveTo.title"
                  >
                    <VListItem
                      :class="shallShowMoveToActionFor(moveTo.action) ? 'd-flex' : 'd-none'"
                      href="#"
                      class="items-center"
                      @click="handleMoveMailsTo(moveTo.action)"
                    >
                      <template #prepend>
                        <VIcon
                          :icon="moveTo.icon"
                          class="me-2"
                          size="20"
                        />
                      </template>
                      <VListItemTitle class="text-capitalize">
                        {{ moveTo.action }}
                      </VListItemTitle>
                    </VListItem>
                  </template>
                </VList>
              </VMenu>
            </IconBtn>
            <!-- Update labels -->
            <IconBtn>
              <VIcon
                icon="bx-label"
                size="22"
              />
              <VTooltip
                activator="parent"
                location="top"
              >
                Label
              </VTooltip>
              <VMenu activator="parent">
                <VList density="compact">
                  <VListItem
                    v-for="label in userLabels"
                    :key="label.title"
                    href="#"
                    @click="handleEmailLabels(label.title)"
                  >
                    <template #prepend>
                      <VBadge
                        inline
                        :color="resolveLabelColor(label.title)"
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
            <VIcon
              icon="bx-refresh"
              size="22"
            />
          </IconBtn>
          <IconBtn>
            <VIcon
              icon="bx-dots-vertical-rounded"
              size="22"
            />
          </IconBtn>
        </div>
        <VDivider />
        <!-- 👉 Emails list -->
<PerfectScrollbar v-if="messages.length" tag="ul" class="Message-list">
  <li
    v-for="message in messages"
    :key="message.id"
    class="email-item d-flex align-center pa-3 gap-1 cursor-pointer"
    :class="[{ 'message-read': message.isRead }]"
    @click="openMessage(message)"
  >
    <!-- Left Section: Icons and Checkbox -->
    <div class="d-flex flex-row flex-grow-1">
      <div class="d-flex align-center gap-2">
        <VCheckbox
          :model-value="selectedMessages.includes(message.id)"
          class="flex-shrink-0"
                    @update:model-value="toggleSelectedEmail(message.id)"
          @click.stop
        />
        <IconBtn
          :class="{ 'starred-button': message.isStarred }"
          @click.stop="handleActionClick(message.isStarred ? 'unstar' : 'star', [message.id])"
        >
          <VIcon
            :icon="message.isStarred ? 'bxs-star' : 'bx-star'"
            size="22"
          />
        </IconBtn>
                  
                  <!-- Trash/Delete Button (Conditional) -->
                  <IconBtn
                     v-if="route.params.filter !== 'trash'" 
                     @click.stop="initiateTrashConfirmation([message.id])" 
                     color="default" 
                  >
                    <VIcon icon="bx-trash" size="22" />
                    <VTooltip activator="parent" location="top"> Move to Trash </VTooltip>
        </IconBtn>

        <IconBtn
                     v-else 
                     @click.stop="initiatePermanentDeleteConfirmation([message.id])" 
                     color="error" 
                  >
                    <VIcon icon="bxs-trash" size="22" />
                    <VTooltip activator="parent" location="top"> Delete Forever </VTooltip>
        </IconBtn>

        <!-- Sender Name First -->
        <h6 v-if="message.from?.fullName" class="text-h6 ms-2 me-4 font-weight-bold flex-shrink-0" style=" max-inline-size: 180px;min-inline-size: 120px;">
          {{ message.from.fullName }}
        </h6>

        <!-- Email Content -->
        <div class="flex-grow-1 overflow-hidden">
          <h3 class="text-h6 mb-1 truncate">{{ message.subject }}</h3>
          <div class="text-body-2 truncate mb-0" v-html="message.message ? message.message.replace(/<p>/g, '').replace(/<\/p>/g, '') : ''"></div>
        </div>
      </div>
    </div>
  </li>
</PerfectScrollbar>
        </template>
        
        <template v-else>
          <!-- Email View Content -->
          <div class="email-detail-view">
            <!-- 👉 header -->
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

            <!-- 👉 Action bar -->
            <div class="email-view-action-bar d-flex align-center text-medium-emphasis ps-6 pe-4 gap-x-1">
              <!-- Trash Button (Move to Trash) -->
              <!-- Show unless already in trash -->
              <IconBtn
                 v-if="openedMessage.folder !== 'trash'" 
                 @click="initiateTrashConfirmation([openedMessage.id]); openedMessage = null"
              >
                <VIcon icon="bx-trash" size="22" />
                <VTooltip activator="parent" location="top"> Move to Trash </VTooltip>
              </IconBtn>

              <!-- Delete Forever Button -->
              <!-- Show ONLY if message is in trash -->
               <IconBtn
                 v-if="openedMessage.folder === 'trash'" 
                 color="error"
                 @click="initiatePermanentDeleteConfirmation([openedMessage.id]); openedMessage = null"
               >
                 <VIcon icon="bxs-trash" size="22" />
                 <VTooltip activator="parent" location="top"> Delete Forever </VTooltip>
              </IconBtn>

              <!-- Read/Unread -->
              <IconBtn @click="handleActionClick('unread', [openedMessage.id]); openedMessage = null">
                <VIcon
                  icon="bx-envelope"
                  size="22"
                />
                <VTooltip
                  activator="parent"
                  location="top"
                >
                  Mark as Unread
                </VTooltip>
              </IconBtn>

              <!-- Label Dropdown -->
              <IconBtn>
                <VIcon
                  icon="bx-label"
                  size="22"
                />
                <VTooltip
                  activator="parent"
                  location="top"
                >
                  Label
                </VTooltip>
                <VMenu activator="parent">
                  <VList density="compact">
                    <VListItem
                      v-for="label in userLabels"
                      :key="label.title"
                      href="#"
                      @click="handleEmailLabels(label.title, [openedMessage.id])" 
                    >
                      <template #prepend>
                        <VBadge
                          inline
                          :color="resolveLabelColor(label.title)"
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
              <!-- End Label Dropdown -->

              <VSpacer />

              <div class="d-flex align-center gap-x-1">
                <!-- Star/Unstar -->
                <IconBtn
                  :class="{ 'starred-button': openedMessage.isStarred }"
                  @click="openedMessage.isStarred ? handleActionClick('unstar', [openedMessage.id]) : handleActionClick('star', [openedMessage.id]); refreshOpenedMessage()"
                >
                  <VIcon
                    :icon="openedMessage.isStarred ? 'bx-bxs-star' : 'bx-star'"
                    size="22"
                  />
                </IconBtn>
                <IconBtn>
                  <VIcon
                    icon="bx-dots-vertical-rounded"
                    size="22"
                  />
                </IconBtn>
              </div>
            </div>

            <VDivider />

            <!-- 👉 Mail Content -->
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
                  <!-- eslint-disable vue/no-v-html -->
                  <div class="text-body-1 font-weight-medium text-truncate mb-4">
                    {{ openedMessage.from?.fullName || 'Unknown Sender' }},
                  </div>
                  <div
                    class="text-base"
                    v-html="openedMessage.message || ''"
                  />
                  <!-- eslint-enable -->
                </VCardText>

                <template v-if="openedMessage.attachments && openedMessage.attachments.length">
                  <VDivider />

                  <VCardText class="d-flex flex-column gap-y-4 pt-4">
                    <span>{{ openedMessage.attachments.length }} Attachments</span>
                    <div
                      v-for="attachment in openedMessage.attachments"
                      :key="attachment.filename || 'file'"
                      class="d-flex align-center"
                    >
                      <VImg
                        :src="attachment.thumbnail || '/images/icons/file-icons/pdf.png'"
                        :alt="attachment.filename || 'file'"
                        aspect-ratio="1"
                        max-height="24"
                        max-width="24"
                        class="me-2"
                      />
                      <span>{{ attachment.filename || 'Attachment' }}</span>
                    </div>
                  </VCardText>
                </template>
              </VCard>

              <!-- Reply or Forward -->
              <VCard>
                <VCardText class="font-weight-medium text-high-emphasis">
                  <div class="text-base">
                    Click here to <span
                      class="text-primary cursor-pointer"
                      @click="showReplyForm = !showReplyForm"
                    >
                      Reply
                    </span>
                  </div>
                </VCardText>
              </VCard>

              <!-- Reply Form -->
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
      
       <!-- Move to Trash Confirmation Dialog -->
        <VDialog v-model="isTrashConfirmDialogVisible" max-width="500px">
          <VCard>
            <VCardTitle>Confirm Move to Trash</VCardTitle>
            <VCardText>
              Are you sure you want to move the selected message(s) to the trash?
            </VCardText>
            <VCardActions>
              <VSpacer />
              <VBtn color="secondary" @click="isTrashConfirmDialogVisible = false">Cancel</VBtn>
              <VBtn color="error" @click="confirmTrashMessages">Move to Trash</VBtn>
            </VCardActions>
          </VCard>
        </VDialog>

        <!-- Permanent Delete Confirmation Dialog -->
        <VDialog v-model="isPermanentDeleteConfirmDialogVisible" max-width="500px">
          <VCard>
            <VCardTitle class="text-h5 error--text">Confirm Permanent Deletion</VCardTitle>
            <VCardText>
              <VAlert type="warning" dense outlined class="mb-3">
                This action cannot be undone.
              </VAlert>
              Are you sure you want to permanently delete the selected message(s)?
            </VCardText>
            <VCardActions>
              <VSpacer />
              <VBtn color="secondary" @click="isPermanentDeleteConfirmDialogVisible = false">Cancel</VBtn>
              <VBtn color="error" @click="confirmPermanentDeleteMessages">Delete Forever</VBtn>
            </VCardActions>
          </VCard>
        </VDialog>
    </VMain>
  </VLayout>
</template>

<style lang="scss">
@use "@styles/variables/vuetify";
@use "@core-scss/base/mixins";

// ℹ️ Remove border. Using variant plain cause UI issue, caret isn't align in center
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

    // ℹ️ Don't show actions on hover on mobile & tablet devices
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

/* Email detail view styles */
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
</style>
