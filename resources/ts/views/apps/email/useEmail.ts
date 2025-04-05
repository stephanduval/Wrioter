import type { Email, EmailLabel } from '@db/apps/email/types';
import type { PartialDeep } from 'type-fest';
import { ref } from 'vue';
import { useRoute } from 'vue-router';

export type MoveEmailToAction = 'inbox' | 'spam' | 'trash'

export const useEmail = () => {
  const route = useRoute('apps-email-filter')

  const updateEmails = async (ids: Email['id'][], data: PartialDeep<Email>) => {
    try {
      // For each ID, update it individually using the messages API endpoint
      for (const id of ids) {
        await $api(`/messages/${id}`, {
          method: 'PUT',
          body: JSON.stringify(data),
        });
      }
      console.log('Successfully updated emails:', ids);
    } catch (error) {
      console.error('Error updating emails:', error);
      throw error;
    }
  }

  // ✅ Shared state
  const messages = ref<Email[]>([]); 


// ✅ Fetch messages, now including filter/label parameters
const fetchMessages = async (): Promise<Email[]> => {
  try {
    console.log("🔥 Fetching messages from API...");

    // Prepare query parameters
    const queryParams = new URLSearchParams();
    const currentFilter = 'filter' in route.params ? route.params.filter as string : undefined;
    const currentLabel = 'label' in route.params ? route.params.label as string : undefined;

    if (currentFilter) {
      queryParams.append('filter', currentFilter);
      console.log(`🔍 Fetching with filter: ${currentFilter}`);
    } else if (currentLabel) {
      queryParams.append('label', currentLabel);
      console.log(`🔍 Fetching with label: ${currentLabel}`);
    }

    // Construct API URL with parameters if they exist
    const queryString = queryParams.toString();
    const apiUrl = `/messages${queryString ? '?' + queryString : ''}`;
    console.log(`📞 Calling API: ${apiUrl}`);

    const response = await $api(apiUrl, { method: 'GET' });

    console.log("✅ Raw API Response:", response);

    return response?.data || []; // API returns { data: [...] }
  } catch (error) {
    console.error("❌ Error fetching messages:", error);
    return [];
  }
};








// ✅ Restore original createMessage (Assuming it used $api and 'message' key)
//    Verify this matches how ComposeDialog was calling it when it worked.
const createMessage = async (payload: {
    receiver_id: number | null; // ID looked up by ComposeDialog
    company_id: number;
    subject: string;
    message: string; // Original key expected by backend for non-replies
    attachments?: File[];
}) => {
    console.log(">>> EXECUTING OLD createMessage <<<", payload); // Debug log
    try {
        // Assuming the original used FormData and $api worked for it
        const formData = new FormData();
        formData.append('subject', payload.subject);
        formData.append('message', payload.message); // Send 'message' key
        formData.append('company_id', payload.company_id.toString());
        if (payload.receiver_id !== null && payload.receiver_id !== undefined) {
            formData.append('receiver_id', payload.receiver_id.toString());
        }
        if (payload.attachments) {
            payload.attachments.forEach(file => formData.append('attachments[]', file));
        }

        // Use $api if it was working before for this call, otherwise use fetch
        const response = await $api('/messages', { 
            method: 'POST', 
            body: formData 
            // $api might handle content-type correctly for FormData, or it might need adjusting
        });
        console.log(">>> createMessage response:", response);
        // Add proper response checking based on how $api behaves
        if(response && response.message === 'Message sent successfully') { // Example check
           return response;
        } else {
           console.error("createMessage failed:", response);
           return undefined;
        }
    } catch (error) {
        console.error('Error creating message:', error);
        return undefined;
    }
};

// ✅ NEW function specifically for sending replies
const sendReplyMessage = async (payload: { 
  receiver_id: number; // Original sender's ID - REQUIRED for reply
  company_id: number; 
  subject: string; 
  body: string; // Use 'body' key for replies
  reply_to_id: number; // Original message ID - REQUIRED for reply
  attachments?: File[] 
}): Promise<any | undefined> => { 
  console.log("***** EXECUTING sendReplyMessage in useEmail.ts *****", payload); 
  try {
    const formData = new FormData();

    // Append fields for REPLY format
    formData.append('subject', payload.subject);
    formData.append('body', payload.body); // Send 'body' key
    formData.append('company_id', payload.company_id.toString());
    formData.append('receiver_id', payload.receiver_id.toString()); // Original sender
    formData.append('reply_to_id', payload.reply_to_id.toString()); // Original message

    // Append attachments
    if (payload.attachments && payload.attachments.length > 0) {
      payload.attachments.forEach(file => formData.append('attachments[]', file));
    }
    
    // --- Using fetch directly for reliability ---
    const accessToken = localStorage.getItem('accessToken'); 
    if (!accessToken) {
        console.error('No access token found for reply.');
        return undefined;
    }

    console.log('>>> reply formData type before fetch:', formData instanceof FormData); 
    console.log('>>> reply formData entries:', Array.from(formData.entries())); 

    const response = await fetch('/api/messages', { 
      method: 'POST',
      body: formData, 
      headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json', 
      },
    });
    // --- End fetch ---

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to parse error response.' }));
      console.error(`Error sending reply: ${response.status} ${response.statusText}`, errorData);
      return undefined; 
    }

    const responseData = await response.json(); 
    console.log(">>> sendReplyMessage response:", responseData);
    return responseData; 

  } catch (error) {
    console.error('Network or other error sending reply:', error);
    return undefined; 
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

  const updateEmailLabels = async (ids: Email['id'][], label: EmailLabel) => {
    console.log(`Attempting to toggle label '${label}' for messages:`, ids);
    try {
      // Call the updated PUT endpoint for each message ID
      for (const id of ids) {
        await $api(`/messages/${id}`, {
          method: 'PUT',
          body: JSON.stringify({ toggleLabel: label }),
        });
      }
      console.log(`Successfully toggled label '${label}' for messages:`, ids);
    } catch (error) {
      console.error(`Error toggling label '${label}':`, error);
      throw error;
    }
  }

  const emailMoveToFolderActions: { action: MoveEmailToAction; icon: string }[] = [
    { action: 'inbox', icon: 'bx-mail' },
    { action: 'spam', icon: 'bx-error-alt' },
    { action: 'trash', icon: 'bx-trash' },
  ]

  const labels: { title: EmailLabel; color: string }[] = [
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

  const resolveLabelColor = (label: string) => {
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
    sendReplyMessage,
    deleteMessage,
  }
}
