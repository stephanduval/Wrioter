<script setup lang="ts">
import ComposeDialog from '@/views/apps/email/ComposeDialog.vue'
import EmailLeftSidebarContent from '@/views/apps/email/EmailLeftSidebarContent.vue'
import type { MoveEmailToAction } from '@/views/apps/email/useEmail'
import { useEmail } from '@/views/apps/email/useEmail'
import type { Email, EmailLabel } from '@db/apps/email/types'
import { isRef, type Ref } from 'vue'
import { PerfectScrollbar } from 'vue3-perfect-scrollbar'

definePage({
  meta: {
    layoutWrapperClasses: 'layout-content-height-fixed',
  },
})

console.log("🚀 Emails page Index.vue is loading!");

const { fetchMessages } = useEmail();
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
const route = useRoute<'apps-email-filter' | 'apps-email-label'>()

const {
  labels,
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

// Fetch Emails
const { data: emailData, execute: fetchEmails } = await useApi<any>(createUrl('/apps/email', {
  query: {
    q,
    filter: () => 'filter' in route.params ? route.params.filter : undefined,
    label: () => 'label' in route.params ? route.params.label : undefined,
  },
}))


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
  await fetchEmails()

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
  await fetchEmails()
}

// Handle Email Labels
const handleEmailLabels = async (labelTitle: EmailLabel) => {
  await updateEmailLabels(selectedMessages.value, labelTitle)
  await fetchMessages()
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
  
  // Make sure we're getting a full message object with proper structure for the email view
  openedMessage.value = {
    ...message,
    // Add default properties if missing to match expected Email structure
    from: message.from || {
      name: message.sender_name || 'Unknown Sender',
      email: message.sender_email || 'unknown@example.com',
      avatar: '/images/avatars/avatar-1.png'
    },
    time: message.created_at || message.time || new Date().toISOString(),
    labels: message.labels || [],
    attachments: message.attachments || []
  };
  
  console.log('openedMessage set to:', openedMessage.value);
  
  // Mark the message as read, but handle API errors gracefully
  try {
    await handleActionClick('read', [message.id]);
  } catch (error) {
    console.error('Error marking message as read:', error);
    // Continue even if this fails - it's not critical
  }
}


// Reset selected emails when filter or label is updated
watch(
  () => route.params,
  () => { selectedMessages.value = [] },
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
            <!-- Trash -->
            <IconBtn
              v-show="('filter' in route.params ? route.params.filter !== 'trashed' : true)"
                @click="handleDeleteMessage(selectedMessages)"
            >
              <VIcon
                icon="bx-trash"
                size="22"
              />
              <VTooltip
                activator="parent"
                location="top"
              >
                Delete Mail
              </VTooltip>
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
                    v-for="label in labels"
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
          <IconBtn @click="fetchEmails">
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
          :color="message.isStarred ? 'warning' : 'default'"
                    @click.stop="handleActionClick(message.isStarred ? 'unstar' : 'star', [message.id])"
        >
          <VIcon
            icon="bx-star"
            size="22"
          />
        </IconBtn>
                  
                  <!-- Delete Button -->
                  <IconBtn
                    @click.stop="handleDeleteMessage([message.id])"
                    color="error"
                  >
                    <VIcon
                      icon="bx-trash"
            size="22"
          />
        </IconBtn>

        <!-- Email Content -->
        <div class="flex-grow-1" style="max-inline-size: calc(100% - 200px);">
          <h3 class="text-h6 mb-1 truncate">{{message.subject }}</h3>
                    <div class="text-body-2 truncate mb-0" v-html="message.message ? message.message.replace(/<p>/g, '').replace(/<\/p>/g, '') : ''"></div>
        </div>

        <!-- Sender Info -->
        <h6 v-if="message.from?.name" class="text-h6 ms-2">
          {{ message.from.name }}
        </h6>
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
              <!-- Trash -->
              <IconBtn
                @click="handleDeleteMessage([openedMessage.id]); openedMessage = null"
              >
                <VIcon
                  icon="bx-trash"
                  size="22"
                />
                <VTooltip
                  activator="parent"
                  location="top"
                >
                  Delete Mail
                </VTooltip>
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

              <VSpacer />

              <div class="d-flex align-center gap-x-1">
                <!-- Star/Unstar -->
                <IconBtn
                  :color="openedMessage.isStarred ? 'warning' : 'default'"
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
                      :alt="openedMessage.from?.name || 'User'"
                    />
                  </VAvatar>

                  <div class="d-flex flex-wrap flex-grow-1 overflow-hidden">
                    <div class="text-truncate">
                      <div class="text-body-1 font-weight-medium text-high-emphasis text-truncate">
                        {{ openedMessage.from?.name || openedMessage.sender_name || 'Unknown Sender' }}
                      </div>
                      <div class="text-sm">
                        {{ openedMessage.from?.email || openedMessage.sender_email || 'no-email@example.com' }}
                      </div>
                    </div>

                    <VSpacer />

                    <div class="d-flex align-center gap-x-4">
                      <div class="text-disabled text-base">
                        {{ new Date(openedMessage.time || openedMessage.created_at || Date.now()).toDateString() }}
                      </div>
                    </div>
                  </div>
                </div>

                <VDivider />

                <VCardText>
                  <!-- eslint-disable vue/no-v-html -->
                  <div class="text-body-1 font-weight-medium text-truncate mb-4">
                    {{ openedMessage.from?.name || openedMessage.sender_name || 'Unknown Sender' }},
                  </div>
                  <div
                    class="text-base"
                    v-html="openedMessage.message || openedMessage.body || ''"
                  />
                  <!-- eslint-enable -->
                </VCardText>

                <template v-if="openedMessage.attachments && openedMessage.attachments.length">
                  <VDivider />

                  <VCardText class="d-flex flex-column gap-y-4 pt-4">
                    <span>{{ openedMessage.attachments.length }} Attachments</span>
                    <div
                      v-for="attachment in openedMessage.attachments"
                      :key="attachment.fileName || attachment.name || 'file'"
                      class="d-flex align-center"
                    >
                      <VImg
                        :src="attachment.thumbnail || '/images/icons/file-icons/pdf.png'"
                        :alt="attachment.fileName || attachment.name || 'file'"
                        aspect-ratio="1"
                        max-height="24"
                        max-width="24"
                        class="me-2"
                      />
                      <span>{{ attachment.fileName || attachment.name || 'Attachment' }}</span>
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
                    </span> or <span 
                      class="text-primary cursor-pointer"
                    >
                      Forward
                    </span>
                  </div>
                </VCardText>
              </VCard>

              <!-- Reply Form -->
              <VCard v-if="showReplyForm" class="mt-4">
                <VCardText>
                  <div class="text-body-1 text-high-emphasis mb-6">
                    Reply to {{ openedMessage.from?.name || openedMessage.sender_name || 'User' }}
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
                    <VBtn append-icon="bx-paper-plane">
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
</style>
