  // Send message notification
  const sendMessageNotification = async () => {
    try {
      const response = await axios.get('/api/send-message-notification')
      console.log('Message notification response:', response.data)
      alert('Message notification sent successfully!')
    } catch (error) {
      console.error('Error sending message notification:', error)
      alert('Error sending message notification. See console for details.')
    }
  } 

  const sendMessage = async () => {
    console.log("ComposeDialog: sendMessage called");
    
    // Basic validation
    if (!subject.value || !content.value) {
      console.error('Subject and Message fields are required');
      return;
    }
    
    // For client role, validate required project fields
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
      if (!isDeadlineValid.value) {
        console.error('Due date must be today or later');
        return;
      }
      if (!latestCompletionDate.value) {
        console.error('Latest completion date is required for client messages');
        return;
      }
      if (!isLatestCompletionDateValid.value) {
        console.error('Latest completion date must be after or equal to the due date');
        return;
      }
      if (!timePreference.value) {
        console.error('Time preference is required for client messages');
        return;
      }
    }
    
    // --- Attachment Validation Check ---
    if (attachmentErrors.value.length > 0) {
      console.error('Cannot send: Attachment validation errors exist.', attachmentErrors.value);
      return;
    }
    
    // Always send to admin
    const receiverId = 1; // ID for info@freynet-gagne.com from UserSeeder (first user created)
    
    // Prepare payload
    const payload: MessagePayload = {
      receiver_id: receiverId,
      company_id: 1, // Adjust as needed
      subject: subject.value,
      message: content.value,
      due_date: dueDate.value,
      attachments: attachmentsRef.value
    };
    
    // Add project data if any project fields are filled out
    if (projectTitle.value || property.value || serviceType.value || timePreference.value || serviceDescription.value || dueDate.value || latestCompletionDate.value) {
      payload.project_data = {
        title: projectTitle.value || '',
        property: property.value || '',
        time_preference: timePreference.value || 'anytime',
        service_type: serviceType.value || '',
        service_description: serviceDescription.value || null,
        deadline: dueDate.value || null,
        latest_completion_date: latestCompletionDate.value || null
      };
    }

    console.log("ComposeDialog: Sending payload:", payload);

    try {
      const result = await createMessage(payload);
      console.log('ComposeDialog: API response:', result);

      if (result && result.message === 'Message sent successfully') {
        console.log('ComposeDialog: Message sent successfully');
        // Send notification using the renamed function
        await sendMessageNotification();
        resetValues();
        content.value = '';
        emit('close');
        emit('refresh');
      } else {
        console.error('ComposeDialog: Failed to send message, API returned:', result);
        throw new Error('Failed to send message');
      }
    } catch (error) {
      console.error('ComposeDialog: Error sending message:', error);
      // You might want to show this error to the user
    }
  } 
