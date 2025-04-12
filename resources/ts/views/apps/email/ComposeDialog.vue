<script lang="ts" setup>
import { useEmail } from '@/views/apps/email/useEmail';
import { onMounted, ref, watch } from 'vue';

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'refresh'): void
}>()

const { createMessage } = useEmail();

const content = ref('')

const to = ref('')
const subject = ref('')
const message = ref('')
const dueDate = ref<string | null>(null);

// Ref for attachments
const attachmentsRef = ref<File[]>([]); // Use VFileInput's multiple capability
const attachmentErrors = ref<string[]>([]); // To store validation errors

const cc = ref('')
const bcc = ref('')
const isEmailCc = ref(false)
const isEmailBcc = ref(false)

// Add user data for autocomplete
const users = ref<Array<{ id: number, fullName: string, email: string }>>([])
const loading = ref(false)
const searchQuery = ref('')

// For filtered users in dropdown
const filteredToUsers = ref<Array<{ id: number, fullName: string, email: string }>>([])
const filteredCcUsers = ref<Array<{ id: number, fullName: string, email: string }>>([])
const filteredBccUsers = ref<Array<{ id: number, fullName: string, email: string }>>([])

// Fetch users on component mount
onMounted(async () => {
  try {
    loading.value = true
    const response = await fetch('/api/users?itemsPerPage=100', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
    })

    if (!response.ok)
      throw new Error('Failed to fetch users')

    const result = await response.json()
    users.value = result.data
    loading.value = false
  }
  catch (error) {
    console.error('Error fetching users:', error)
    loading.value = false
  }
})

// Filter users based on input
const filterUsers = (query: string, field: 'to' | 'cc' | 'bcc') => {
  if (!query) {
    if (field === 'to') filteredToUsers.value = []
    else if (field === 'cc') filteredCcUsers.value = []
    else filteredBccUsers.value = []
    return
  }

  const filtered = users.value.filter(user => 
    user.fullName.toLowerCase().includes(query.toLowerCase()) || 
    user.email.toLowerCase().includes(query.toLowerCase())
  )

  if (field === 'to') filteredToUsers.value = filtered
  else if (field === 'cc') filteredCcUsers.value = filtered
  else filteredBccUsers.value = filtered
}

// Handle user selection
const selectUser = (user: { id: number, fullName: string, email: string }, field: 'to' | 'cc' | 'bcc') => {
  const formattedEmail = `${user.fullName} <${user.email}>`
  
  if (field === 'to') {
    to.value = formattedEmail
    filteredToUsers.value = []
  } else if (field === 'cc') {
    cc.value = formattedEmail
    filteredCcUsers.value = []
  } else {
    bcc.value = formattedEmail
    filteredBccUsers.value = []
  }
}

// Watch for input changes
const onInputChange = (value: string, field: 'to' | 'cc' | 'bcc') => {
  filterUsers(value, field)
}

// --- Attachment Handling & Validation ---
const MAX_FILE_SIZE_MB = 25;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

// NEW: Manual file handling instead of v-model
const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target && target.files) {
    // Append new files to the existing array
    for (let i = 0; i < target.files.length; i++) {
      attachmentsRef.value.push(target.files[i]);
    }
    // Trigger validation watch manually if needed (it should still trigger)
    // console.log('Appended files:', attachmentsRef.value);
  }
};

// NEW: Function to remove attachment by index
const removeAttachment = (index: number) => {
  attachmentsRef.value.splice(index, 1);
};

watch(attachmentsRef, (newFiles) => {
  attachmentErrors.value = []; // Clear previous errors
  let totalSize = 0;

  newFiles.forEach((file, index) => {
    totalSize += file.size;
    if (file.size > MAX_FILE_SIZE_BYTES) {
      attachmentErrors.value.push(`File "${file.name}" (${(file.size / 1024 / 1024).toFixed(2)} MB) exceeds the ${MAX_FILE_SIZE_MB} MB limit.`);
    }
  });

  // Optional: Check total size limit if needed
  // const MAX_TOTAL_SIZE_MB = 100;
  // const MAX_TOTAL_SIZE_BYTES = MAX_TOTAL_SIZE_MB * 1024 * 1024;
  // if (totalSize > MAX_TOTAL_SIZE_BYTES) {
  //   attachmentErrors.value.push(`Total attachment size (${(totalSize / 1024 / 1024).toFixed(2)} MB) exceeds the ${MAX_TOTAL_SIZE_MB} MB limit.`);
  // }
}, { deep: true });

// Update sendMessage to use composable and include due date
const sendMessage = async () => {
  console.log("ComposeDialog: sendMessage called");
  // Basic validation
  if (!to.value || !subject.value || !content.value) {
    console.error('To, Subject, and Message fields are required');
    // TODO: Add user feedback (e.g., toast notification)
    return;
  }
  
  // --- Attachment Validation Check ---
  if (attachmentErrors.value.length > 0) {
    console.error('Cannot send: Attachment validation errors exist.', attachmentErrors.value);
    // TODO: Show user-friendly error (e.g., toast)
    return;
  }
  
  // Extract email and find receiver ID (keep existing logic)
  const receiverEmail = to.value.match(/<(.+)>/)?.[1] || to.value;
  const receiver = users.value.find(user => user.email === receiverEmail);
  const receiverId = receiver ? receiver.id : null; // Get ID or null

  if (!receiver && to.value.trim() !== '') { // Allow sending without recipient? If so, receiverId should be null. Adjust logic if recipient is mandatory.
      console.warn('Recipient not found in user list, sending without specific receiver_id');
      // If recipient email *must* match a user, add error handling here:
      // console.error('Recipient not found');
      // return;
  }
  
  // Prepare payload for the composable function
  const payload = {
    receiver_id: receiverId, 
    company_id: 1, // Adjust as needed
    subject: subject.value,
    message: content.value, // Use 'content' which is bound to TiptapEditor
    due_date: dueDate.value || null, // Pass due date (or null)
    attachments: attachmentsRef.value // Pass the validated files
    // attachments: [] // Add attachment handling if needed later
  };

  console.log("ComposeDialog: Sending payload:", payload);

  try {
    // Call the composable's createMessage function
    const result = await createMessage(payload); 

    if (result && result.message === 'Message sent successfully') {
      console.log('ComposeDialog: Message sent successfully');
      resetValues(); // Reset form fields
      content.value = ''; // Clear editor content specifically
      emit('close');
      emit('refresh');
    } else {
      console.error('ComposeDialog: Failed to send message, API returned error or unexpected response:', result);
      // TODO: Show error feedback
    }
  } catch (error) {
    console.error('ComposeDialog: Error sending message:', error);
     // TODO: Show error feedback
  }
}

// Update resetValues to include dueDate
const resetValues = () => {
  to.value = subject.value = '';
  content.value = ''; // Ensure Tiptap content is also reset
  cc.value = bcc.value = '';
  filteredToUsers.value = filteredCcUsers.value = filteredBccUsers.value = [];
  dueDate.value = null; // Reset due date
  attachmentsRef.value = []; // Clear attachments
  attachmentErrors.value = []; // Clear errors
}
</script>

<template>
  <VCard
    class="email-compose-dialog"
    max-width="30vw"
  >
    <VCardText
      class="py-3 px-6"
      style="background-color: rgba(var(--v-theme-on-surface), var(--v-hover-opacity));"
    >
      <div class="d-flex align-center">
        <h5 class="text-h5 text-medium-emphasis">
          Compose Mail
        </h5>
        <VSpacer />

        <div class="d-flex align-center gap-x-2">
          <IconBtn
            size="small"
            icon="bx-minus"
            @click="$emit('close')"
          />
          <IconBtn
            size="small"
            icon="bx-x"
            @click="$emit('close'); resetValues()"
          />
        </div>
      </div>
    </VCardText>

    <div class="px-1 pe-6 py-1 position-relative">
      <VTextField
        v-model="to"
        density="compact"
        @input="onInputChange(to, 'to')"
      >
        <template #prepend-inner>
          <div class="text-base font-weight-medium text-disabled">
            To:
          </div>
        </template>
        <template #append>
          <span class="cursor-pointer text-body-1">
            <span @click="isEmailCc = !isEmailCc">Cc</span>
            <span> | </span>
            <span @click="isEmailBcc = !isEmailBcc">Bcc</span>
          </span>
        </template>
      </VTextField>
      
      <!-- To field autocomplete dropdown -->
      <VCard
        v-if="filteredToUsers.length > 0"
        class="autocomplete-dropdown"
        elevation="4"
      >
        <VList density="compact">
          <VListItem
            v-for="user in filteredToUsers"
            :key="user.id"
            @click="selectUser(user, 'to')"
          >
            <VListItemTitle>{{ user.fullName }}</VListItemTitle>
            <VListItemSubtitle>{{ user.email }}</VListItemSubtitle>
          </VListItem>
        </VList>
      </VCard>
    </div>

    <VExpandTransition>
      <div v-if="isEmailCc" class="position-relative">
        <VDivider />

        <div class="px-1 pe-6 py-1">
          <VTextField
            v-model="cc"
            density="compact"
            @input="onInputChange(cc, 'cc')"
          >
            <template #prepend-inner>
              <div class="text-disabled font-weight-medium">
                Cc:
              </div>
            </template>
          </VTextField>
          
          <!-- Cc field autocomplete dropdown -->
          <VCard
            v-if="filteredCcUsers.length > 0"
            class="autocomplete-dropdown"
            elevation="4"
          >
            <VList density="compact">
              <VListItem
                v-for="user in filteredCcUsers"
                :key="user.id"
                @click="selectUser(user, 'cc')"
              >
                <VListItemTitle>{{ user.fullName }}</VListItemTitle>
                <VListItemSubtitle>{{ user.email }}</VListItemSubtitle>
              </VListItem>
            </VList>
          </VCard>
        </div>
      </div>
    </VExpandTransition>

    <VExpandTransition>
      <div v-if="isEmailBcc" class="position-relative">
        <VDivider />

        <div class="px-1 pe-6 py-1">
          <VTextField
            v-model="bcc"
            density="compact"
            @input="onInputChange(bcc, 'bcc')"
          >
            <template #prepend-inner>
              <div class="text-disabled font-weight-medium">
                Bcc:
              </div>
            </template>
          </VTextField>
          
          <!-- Bcc field autocomplete dropdown -->
          <VCard
            v-if="filteredBccUsers.length > 0"
            class="autocomplete-dropdown"
            elevation="4"
          >
            <VList density="compact">
              <VListItem
                v-for="user in filteredBccUsers"
                :key="user.id"
                @click="selectUser(user, 'bcc')"
              >
                <VListItemTitle>{{ user.fullName }}</VListItemTitle>
                <VListItemSubtitle>{{ user.email }}</VListItemSubtitle>
              </VListItem>
            </VList>
          </VCard>
        </div>
      </div>
    </VExpandTransition>

    <VDivider />
    <div class="px-1 pe-6 py-1">
      <VTextField
        v-model="subject"
        density="compact"
      >
        <template #prepend-inner>
          <div class="text-base font-weight-medium text-disabled">
            Subject:
          </div>
        </template>
      </VTextField>
    </div>

    <VDivider />
    <div class="px-1 pe-6 py-1">
      <VTextField 
        v-model="dueDate" 
        density="compact" 
        type="date"  
        placeholder="YYYY-MM-DD"
        clearable 
      >
        <template #prepend-inner>
          <div class="text-base font-weight-medium text-disabled">
            Due Date:
          </div>
        </template>
      </VTextField>
    </div>

    <VDivider />

    <!-- 👉 Tiptap Editor  -->
    <TiptapEditor
      v-model="content"
      placeholder="Message"
    />

    <!-- Attachment Section -->
    <VDivider />
    <div class="px-6 py-2">
      <VFileInput
        :model-value="attachmentsRef"
        multiple
        label="Attachments"
        placeholder="Select your files"
        prepend-icon="bx-paperclip"
        density="compact"
        :error-messages="attachmentErrors"
        @change="handleFileChange"
        @click:clear="attachmentsRef = []"
      >
        <!-- REMOVED #selection slot -->
        <template #selection="{ fileNames }">
          <!-- This slot is no longer used for display -->
        </template>
      </VFileInput>

      <!-- NEW: Manual Chip Display Area -->
      <div v-if="attachmentsRef.length > 0" class="mt-2 d-flex flex-wrap gap-2">
        <VChip
          v-for="(file, index) in attachmentsRef"
          :key="index + '-' + file.name" 
          label
          closable
          size="small"
          color="primary"
          @click:close="removeAttachment(index)"
        >
          {{ file.name }} ({{ (file.size / 1024 / 1024).toFixed(2) }} MB)
        </VChip>
      </div>
    </div>

    <div class="d-flex align-center px-6 py-4">
      <VBtn
        color="primary"
        class="me-4"
        append-icon="bx-paper-plane"
        :disabled="!subject || !content || attachmentErrors.length > 0"
        @click="sendMessage"
      >
        send
      </VBtn>

      <VSpacer />

      <IconBtn
        size="small"
        class="me-2"
      >
        <VIcon icon="bx-dots-vertical-rounded" />
      </IconBtn>

      <IconBtn
        size="small"
        @click="$emit('close'); resetValues(); content = ''"
      >
        <VIcon icon="bx-trash" />
      </IconBtn>
    </div>
  </VCard>
</template>

<style lang="scss">
@use "@core-scss/base/mixins";

.v-card.email-compose-dialog {
  z-index: 910 !important;

  @include mixins.elevation(10);

  .v-field--prepended {
    padding-inline-start: 20px;
  }

  .v-field__prepend-inner {
    align-items: center;
    padding: 0;
  }

  .v-textarea .v-field {
    --v-field-padding-start: 20px;
  }

  .v-field__outline {
    display: none;
  }

  .v-input {
    .v-field__prepend-inner {
      display: flex;
      align-items: center;
      padding-block-start: 0;
    }
  }

  .app-text-field {
    .v-field__input {
      padding-block-start: 6px;
    }

    .v-field--focused {
      box-shadow: none !important;
    }
  }
}

.email-compose-dialog {
  .ProseMirror {
    p {
      margin-block-end: 0;
    }

    padding: 1.5rem;
    block-size: 100px;
    overflow-y: auto;
    padding-block: 0.5rem;

    &:focus-visible {
      outline: none;
    }

    p.is-editor-empty:first-child::before {
      block-size: 0;
      color: #adb5bd;
      content: attr(data-placeholder);
      float: inline-start;
      pointer-events: none;
    }

    ul,
    ol {
      padding-inline: 1.125rem;
    }

    &-focused {
      outline: none;
    }
  }

  // Add styles for autocomplete dropdown
  .autocomplete-dropdown {
    position: absolute;
    z-index: 999;
    inline-size: 100%;
    max-block-size: 200px;
    overflow-y: auto;
  }

  .position-relative {
    position: relative;
  }
}
</style>
