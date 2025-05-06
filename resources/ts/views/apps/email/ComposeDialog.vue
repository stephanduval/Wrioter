<script lang="ts" setup>
import { useEmail } from '@/views/apps/email/useEmail';
import { computed, onMounted, ref, watch } from 'vue';

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

// Project information fields
const projectTitle = ref('')
const property = ref('')
const timePreference = ref('anytime')
const serviceType = ref('')
const serviceDescription = ref('')

// Get current user role
const userData = computed(() => {
  try {
    return localStorage.getItem('userData') ? JSON.parse(localStorage.getItem('userData') || '{}') : {}
  } catch (e) {
    console.error('Error parsing userData from localStorage:', e)
    return {}
  }
})

const userRole = computed(() => userData.value?.role || '')
const isClient = computed(() => userRole.value === 'client')

// Admin recipient ID (info@freynet-gagne.com)
const ADMIN_ID = 2 // ID for info@freynet-gagne.com from UserSeeder

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

// Define project data interface
interface ProjectData {
  title: string
  property: string | null
  time_preference: string
  service_type: string | null
  service_description: string | null
  deadline: string | null
}

// Define message payload interface
interface MessagePayload {
  receiver_id: number | null
  company_id: number
  subject: string
  message: string
  due_date: string | null
  attachments: File[]
  project_data?: ProjectData
}

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
    
    // If user is client, filter out other clients and only show admin recipients
    if (isClient.value) {
      // Only include admin users for clients
      users.value = result.data.filter((user: any) => 
        user.email === 'info@freynet-gagne.com' || 
        user.email === 'admin@admin.com' ||
        user.roles?.some((role: any) => role.name === 'admin')
      )
      
      // Auto-select admin recipient (info@freynet-gagne.com)
      const adminUser = users.value.find(user => user.id === ADMIN_ID)
      if (adminUser) {
        to.value = `${adminUser.fullName} <${adminUser.email}>`
      }
      
      // Initialize project form with defaults for client users
      if (!projectTitle.value) projectTitle.value = '';
      if (!property.value) property.value = '';
      if (!timePreference.value) timePreference.value = 'anytime';
      if (!serviceType.value) serviceType.value = '';
      
      // Set a default due date if none provided (7 days from now)
      if (!dueDate.value) {
        const defaultDueDate = new Date();
        defaultDueDate.setDate(defaultDueDate.getDate() + 7);
        dueDate.value = defaultDueDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD
      }
    } else {
      users.value = result.data
    }
    
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
  if (!subject.value || !content.value) {
    console.error('Subject and Message fields are required');
    return;
  }
  
  // For client role, also validate project fields
  if (isClient.value) {
    if (!projectTitle.value) {
      console.error('Project title is required for client messages');
      return;
    }
    if (!property.value) {
      console.error('Property is required for client messages');
      return;
    }
    if (!serviceType.value) {
      console.error('Service type is required for client messages');
      return;
    }
    if (!dueDate.value) {
      console.error('Due date is required for client messages');
      return;
    }
  }
  
  // --- Attachment Validation Check ---
  if (attachmentErrors.value.length > 0) {
    console.error('Cannot send: Attachment validation errors exist.', attachmentErrors.value);
    return;
  }
  
  // Determine receiver ID - Always send to admin for clients
  let receiverId = null;
  
  if (isClient.value) {
    // Clients always send to admin
    receiverId = ADMIN_ID;
  } else {
    // Extract email and find receiver ID for non-clients
    const receiverEmail = to.value.match(/<(.+)>/)?.[1] || to.value;
    const receiver = users.value.find(user => user.email === receiverEmail);
    receiverId = receiver ? receiver.id : null;
    
    if (!receiver && to.value.trim() !== '') {
      console.warn('Recipient not found in user list, sending without specific receiver_id');
    }
  }
  
  // Prepare payload
  const payload: MessagePayload = {
    receiver_id: receiverId, 
    company_id: 1, // Adjust as needed
    subject: subject.value,
    message: content.value,
    due_date: dueDate.value || null,
    attachments: attachmentsRef.value
  };
  
  // Add project data for client role
  if (isClient.value) {
    payload.project_data = {
      title: projectTitle.value,
      property: property.value || null,
      time_preference: timePreference.value,
      service_type: serviceType.value || null,
      service_description: serviceDescription.value || null,
      deadline: dueDate.value || null
    };
  }

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

// Update resetValues to include project fields
const resetValues = () => {
  to.value = subject.value = '';
  content.value = ''; // Ensure Tiptap content is also reset
  cc.value = bcc.value = '';
  filteredToUsers.value = filteredCcUsers.value = filteredBccUsers.value = [];
  dueDate.value = null; // Reset due date
  attachmentsRef.value = []; // Clear attachments
  attachmentErrors.value = []; // Clear errors
  
  // Reset project fields
  projectTitle.value = '';
  property.value = '';
  timePreference.value = 'anytime';
  serviceType.value = '';
  serviceDescription.value = '';
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
      <VCardText>
        <VRow>
          <VCol cols="12">
            <VTextField
              v-model="to"
              label="To"
              autofocus
              :rules="[(value: string) => !!value || 'This field is required']"
              :disabled="isClient"
              v-if="!isClient"
            />
            <VTextField
              v-model="to"
              label="To"
              autofocus
              :rules="[(value: string) => !!value || 'This field is required']"
              disabled
              v-if="isClient"
            />
          </VCol>
        </VRow>
      </VCardText>
      
      <!-- To field autocomplete dropdown -->
      <VCard
        v-if="filteredToUsers.length > 0 && !isClient"
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
      <div v-if="isEmailCc && !isClient" class="position-relative">
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
      <div v-if="isEmailBcc && !isClient" class="position-relative">
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

    <!-- Project Fields - Only for clients -->
    <div v-if="isClient">
      <div class="px-1 pe-6 py-1">
        <VTextField
          v-model="projectTitle"
          density="compact"
          label="Project Title"
          placeholder="Enter project title"
          :rules="[(v: string) => !!v || 'Project title is required']"
        >
          <template #prepend-inner>
            <div class="text-base font-weight-medium text-disabled">
              Project Title:
            </div>
          </template>
        </VTextField>
      </div>

      <VDivider />

      <div class="px-1 pe-6 py-1">
        <VTextField
          v-model="property"
          density="compact"
          label="Property"
          placeholder="Enter property details"
          :rules="[(v: string) => !!v || 'Property is required']"
        >
          <template #prepend-inner>
            <div class="text-base font-weight-medium text-disabled">
              Property:
            </div>
          </template>
        </VTextField>
      </div>

      <VDivider />

      <div class="px-1 pe-6 py-1">
        <VSelect
          v-model="serviceType"
          density="compact"
          label="Service Type"
          :rules="[(v: string) => !!v || 'Service type is required']"
          :items="[
            { title: 'Translation', value: 'translation' },
            { title: 'Revision', value: 'revision' },
            { title: 'Modifications', value: 'modifications' },
            { title: 'Transcription', value: 'transcription' },
            { title: 'Voice Over', value: 'voice_over' },
            { title: 'Other', value: 'other' }
          ]"
        >
          <template #prepend-inner>
            <div class="text-base font-weight-medium text-disabled">
              Service Type:
            </div>
          </template>
        </VSelect>
      </div>

      <VDivider />

      <div class="px-1 pe-6 py-1">
        <VSelect
          v-model="timePreference"
          density="compact"
          label="Time Preference"
          :items="[
            { title: 'Before Noon', value: 'before_noon' },
            { title: 'Before 4pm', value: 'before_4pm' },
            { title: 'Anytime', value: 'anytime' }
          ]"
        >
          <template #prepend-inner>
            <div class="text-base font-weight-medium text-disabled">
              Time Preference:
            </div>
          </template>
        </VSelect>
      </div>

      <VDivider />

      <div class="px-1 pe-6 py-1">
        <VTextarea
          v-model="serviceDescription"
          density="compact"
          label="Service Description"
          placeholder="Describe the service you need"
          rows="2"
          auto-grow
        >
          <template #prepend-inner>
            <div class="text-base font-weight-medium text-disabled pt-2">
              Description:
            </div>
          </template>
        </VTextarea>
      </div>

      <VDivider />
    </div>

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
        :rules="[(v: string) => (isClient ? !!v || 'Due date is required' : true)]"
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
        :disabled="(isClient && (!projectTitle || !property || !serviceType || !dueDate)) || !subject || !content || attachmentErrors.length > 0"
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
