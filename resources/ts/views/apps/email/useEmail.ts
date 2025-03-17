import type { Email } from '@db/apps/email/types';
import type { PartialDeep } from 'type-fest';
import { ref } from 'vue';

export type MoveEmailToAction = 'inbox' | 'spam' | 'trash'

export const useEmail = () => {
  const route = useRoute('apps-email-filter')

  const updateEmails = async (ids: Email['id'][], data: PartialDeep<Email>) => {
    await $api('apps/email', {
      method: 'POST',
      body: JSON.stringify({ ids, data }),
    })
  }

  // ✅ Shared state
  const messages = ref<Email[]>([]); 


// ✅ Fetch all messages
const fetchMessages = async (): Promise<Email[]> => {
  try {
    console.log("🔥 Fetching messages from API...");
    const response = await $api('/messages', { method: 'GET' });

    console.log("✅ Raw API Response:", response);

    return response?.messages || []; // ✅ API returns `messages`, so extract `messages`
  } catch (error) {
    console.error("❌ Error fetching messages:", error);
    return [];
  }
};








// ✅ Create a new message
const createMessage = async (subject: string, body: string, companyId: number, attachments: File[] = []) => {
  try {
    const formData = new FormData();
    formData.append('subject', subject);
    formData.append('body', body);
    formData.append('company_id', companyId.toString());

    attachments.forEach(file => formData.append('attachments[]', file));

    const response = await $api('/messages', { method: 'POST', body: formData });
    return response;
  } catch (error) {
    console.error('Error creating message:', error);
  }
};

// ✅ Delete a message
const deleteMessage = async (id: number) => {
  try {
    await $api(`/messages/${id}`, { method: 'DELETE' });
    messages.value = messages.value.filter(message => message.id !== id); // Remove deleted email from UI
  } catch (error) {
    console.error('Error deleting message:', error);
  }
};

  const updateEmailLabels = async (ids: Email['id'][], label: Email['labels'][number]) => {
    await $api('/apps/email', {
      method: 'POST',
      body: { ids, label },
    })
  }

  const emailMoveToFolderActions: { action: MoveEmailToAction; icon: string }[] = [
    { action: 'inbox', icon: 'bx-mail' },
    { action: 'spam', icon: 'bx-error-alt' },
    { action: 'trash', icon: 'bx-trash' },
  ]

  const labels: { title: Email['labels'][number]; color: string }[] = [
    {
      title: 'personal',
      color: 'success',

    },
    {
      title: 'company',
      color: 'primary',

    },
    {
      title: 'important',
      color: 'warning',

    },
    {
      title: 'private',
      color: 'error',

    },
  ]

  const resolveLabelColor = (label: Email['labels'][number]) => {
    if (label === 'personal')
      return 'success'
    if (label === 'company')
      return 'primary'
    if (label === 'important')
      return 'warning'
    if (label === 'private')
      return 'error'

    return 'secondary'
  }

  const shallShowMoveToActionFor = (action: MoveEmailToAction) => {
    if (action === 'trash')
      return route.params.filter !== 'trashed'

    else if (action === 'inbox')
      return !(route.params.filter === undefined || route.params.filter === 'sent' || route.params.filter === 'draft')

    else if (action === 'spam')
      return !(route.params.filter === 'spam' || route.params.filter === 'sent' || route.params.filter === 'draft')

    return false
  }

  const moveSelectedEmailTo = async (action: MoveEmailToAction, selectedEmails: number[]) => {
    const dataToUpdate: PartialDeep<Email> = {}

    if (action === 'inbox') {
      if (route.params.filter === 'trashed')
        dataToUpdate.isDeleted = false
      dataToUpdate.folder = 'inbox'
    }

    else if (action === 'spam') {
      if (route.params.filter === 'trashed')
        dataToUpdate.isDeleted = false
      dataToUpdate.folder = 'spam'
    }

    else if (action === 'trash') {
      dataToUpdate.isDeleted = true
    }

    await updateEmails(selectedEmails, dataToUpdate)
  }

  return {
    labels,
    resolveLabelColor,
    shallShowMoveToActionFor,
    emailMoveToFolderActions,
    moveSelectedEmailTo,
    updateEmails,
    updateEmailLabels,
    messages,
    fetchMessages,
    createMessage,
    deleteMessage,
  }
}
