<script setup lang="ts">
import ComposeDialog from '@/views/apps/email/ComposeDialog.vue'
import EmailLeftSidebarContent from '@/views/apps/email/EmailLeftSidebarContent.vue'
import EmailView from '@/views/apps/email/EmailView.vue'
import type { MoveEmailToAction } from '@/views/apps/email/useEmail'
import { useEmail } from '@/views/apps/email/useEmail'
import type { Email, EmailLabel } from '@db/apps/email/types'
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
} = useEmail()

// Compose dialog
const isComposeDialogVisible = ref(false)

// Ref
const q = ref('')

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
  selectedMessages.value = []
  selectedMessages.value = []
  if (!emailIds.length)
    return

  if (action === 'trash')
    await updateEmails(emailIds, { isDeleted: true })
  else if (action === 'spam')
    await updateEmails(emailIds, { folder: 'spam' })
  else if (action === 'unread')
    await updateEmails(emailIds, { isRead: false })
  else if (action === 'read')
    await updateEmails(emailIds, { isRead: true })
  else if (action === 'star')
    await updateEmails(emailIds, { isStarred: true })
  else if (action === 'unstar')
    await updateEmails(emailIds, { isStarred: false })

  if (openedMessage.value)
    refreshOpenedMessage()
  else
    await fetchEmails()
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
  openedMessage.value = message

  await handleActionClick('read', [message.id])
}


// Reset selected emails when filter or label is updated
watch(
  () => route.params,
  () => { selectedMessages.value = [] },
  { deep: true },
)





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
    <EmailView
      :email="openedMessage"
      :email-meta="messageViewMeta"
      @refresh="refreshOpenedMessage"
      @navigated="changeOpenedMessage"
      @close="openedMessage = null"
      @trash="handleActionClick('trash', openedMessage ? [openedMessage.id] : [])"
      @unread="handleActionClick('unread', openedMessage ? [openedMessage.id] : [])"
      @star="handleActionClick('star', openedMessage ? [openedMessage.id] : [])"
      @unstar="handleActionClick('unstar', openedMessage ? [openedMessage.id] : [])"
    />
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
              @click="handleActionClick('trash')"
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

        <!-- Email Content -->
        <div class="flex-grow-1" style="max-inline-size: calc(100% - 200px);">
          <h3 class="text-h6 mb-1 truncate">{{message.subject }}</h3>
          <div class="text-body-2 truncate mb-0" v-html="message.body ? message.body.replace(/<p>/g, '').replace(/<\/p>/g, '') : message.message ? message.message.replace(/<p>/g, '').replace(/<\/p>/g, '') : ''"></div>
        </div>

        <!-- Sender Info -->
        <h6 v-if="message.from?.name" class="text-h6 ms-2">
          {{ message.from.name }}
        </h6>
      </div>
    </div>
  </li>
</PerfectScrollbar>

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
</style>
