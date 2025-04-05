import type { Email, EmailLabel, MoveEmailToAction } from '@db/apps/email/types';
import type { PartialDeep } from 'type-fest';
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
// Import toast if you want notifications
// import { useToast } from 'vue-toastification'; 

export const useEmail = () => {
  const route = useRoute<'apps-email' | 'apps-email-filter' | 'apps-email-label'>()
  // const toast = useToast(); // Optional: for notifications

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
  const userLabels = ref<{ title: EmailLabel; color: string }[]>([]);

  // ✅ Fetch user-specific labels from the API
  const fetchUserLabels = async () => {
    try {
      console.log("useEmail: Fetching user labels...");
      // Ensure this endpoint returns labels for the authenticated user
      const response = await $api('/labels'); 
      console.log("useEmail: Labels received:", response);
      if (response && Array.isArray(response)) {
        // Map API response (label_name, colour) to frontend structure (title, color)
        userLabels.value = response.map((label: { label_name: string; colour: string | null }) => ({
          title: label.label_name as EmailLabel,
          // Provide a default color if backend returns null or empty string
          color: label.colour || 'secondary', 
        }));
        console.log("useEmail: Mapped user labels:", userLabels.value);
      } else {
        console.error('useEmail: Invalid label data received:', response);
        userLabels.value = []; // Clear labels on error
      }
    } catch (error) {
      console.error('useEmail: Error fetching user labels:', error);
      userLabels.value = []; // Clear labels on error
    }
  };

  // Fetch labels when the composable is first used
  onMounted(fetchUserLabels);

  // ✅ Add new label via API and refresh the list
  const addLabel = async (labelData: { label_name: string; colour: string }) => {
    console.log("useEmail: Adding label:", labelData);
    try {
        const response = await $api('/labels', {
          method: 'POST',
          body: labelData,
        });
        console.log('useEmail: Label added successfully:', response);
        await fetchUserLabels(); // Refresh the labels list
        // toast.success("Label added successfully!"); // Optional notification
        return true; // Indicate success
    } catch (error: any) {
      console.error('useEmail: Error adding label:', error);
      // Handle specific errors like conflict (409)
      if (error?.response?.status === 409 || error?.message?.includes('409')) {
        console.warn('useEmail: Label already exists.');
        // toast.warning("Label already exists."); // Optional notification
      } else {
        // toast.error("Failed to add label."); // Optional notification
      }
      return false; // Indicate failure
    }
  }

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
    console.log(`useEmail: Attempting permanent delete for message ID: ${id}`);
    try {
      await $api(`/messages/${id}`, { method: 'DELETE' });
      console.log(`useEmail: Successfully permanently deleted message ID: ${id}`);
      // Optimistically remove from local state if needed, or rely on refresh
      messages.value = messages.value.filter(message => message.id !== id);
    } catch (error) {
      console.error(`useEmail: Error permanently deleting message ${id}:`, error);
      throw error; // Re-throw to signal failure
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

  const shallShowMoveToActionFor = (action: MoveEmailToAction) => {
    const currentFilter = route.params && 'filter' in route.params ? route.params.filter : undefined;
    
    // Never show move to trash if already in trash
    if (action === 'trash')
      return currentFilter !== 'trash'; // Changed from 'trashed' to 'trash'

    // Show move to inbox ONLY if NOT in inbox, sent, or draft
    else if (action === 'inbox')
      return currentFilter !== undefined && currentFilter !== 'sent' && currentFilter !== 'draft';

    // Show move to spam ONLY if NOT in spam, sent, or draft
    else if (action === 'spam')
      return currentFilter !== 'spam' && currentFilter !== 'sent' && currentFilter !== 'draft';

    return false; // Default case
  }

  const moveSelectedEmailTo = async (action: MoveEmailToAction, selectedEmails: number[]) => {
    // Assuming Email type now includes 'status'
    const dataToUpdate: PartialDeep<Email> = {} 

    if (action === 'inbox') {
      dataToUpdate.status = 'unread'; 
      // dataToUpdate.folder = 'inbox'; // Folder might be redundant if status drives filtering
    }
    else if (action === 'spam') {
       dataToUpdate.status = 'spam'; 
       // dataToUpdate.folder = 'spam';
    }
    else if (action === 'trash') {
      dataToUpdate.status = 'deleted'; 
      // dataToUpdate.folder = 'trash';
    }

    await updateEmails(selectedEmails, dataToUpdate); 
  }

  // ✅ Update resolveLabelColor to use the reactive userLabels ref
  const resolveLabelColor = (labelTitle: string) => {
    const foundLabel = userLabels.value.find(l => l.title === labelTitle);
    return foundLabel ? foundLabel.color : 'secondary'; // Return default if not found
  }

  return {
    userLabels, // <-- Export reactive userLabels
    resolveLabelColor, // Export updated function
    fetchUserLabels, // Export fetch function if needed elsewhere
    addLabel, // Export add function
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
