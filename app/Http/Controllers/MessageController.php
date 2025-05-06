<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Message;
use App\Models\Label;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use App\Http\Resources\MessageResource;
use Illuminate\Support\Facades\Storage;
use App\Models\Attachment;
use Illuminate\Support\Str;

class MessageController extends Controller
{
    // Fetch messages for the logged-in user
    // public function index()
    // {
    //     $userId = Auth::id();

    //     $messages = Message::where('receiver_id', $userId)
    //         ->with('sender:id,name')
    //         ->orderBy('created_at', 'desc')
    //         ->get();

    //     return response()->json(['messages' => $messages]);
    // }

    public function index(Request $request)
    {
        Log::info("Fetching messages with relationships.");
        $userId = Auth::id();

        // Start building the query with base visibility
        $query = Message::with(['sender', 'receiver', 'labels', 'attachments'])
                      ->where(function ($q) use ($userId) {
                          $q->where('receiver_id', $userId)
                            ->orWhere('sender_id', $userId);
                      });

        // Apply filters based on request parameters
        $filter = $request->query('filter');
        $label = $request->query('label');

        Log::info("Request parameters:", ['filter' => $filter, 'label' => $label]);

        // --- Apply Specific Filters ---
        if ($filter) {
            Log::info("Applying filter: {$filter}");
            switch ($filter) {
                case 'all':
                    // No additional filters needed, base query already includes sender/receiver
                    // We want everything, including archived and deleted (trash)
                    Log::info("Filter 'all' selected. Showing all messages.");
                    break;
                case 'archive':
                    // Restore original logic
                    $query->where('is_archived', true);
                    break;
                case 'starred':
                    // Starred assumes non-archived, non-deleted unless explicitly in those folders
                    $query->where('is_starred', true)
                          ->where('is_archived', false) // Exclude archived from starred view
                          ->where('status', '!=', 'deleted'); // Exclude trashed from starred view
                    break;
                case 'sent':
                    // Sent items are from the sender, exclude archived/deleted
                    $query->where('sender_id', $userId)
                          // ->where('status', 'sent') // Can likely remove this if sender_id implies sent
                          ->where('is_archived', false)
                          ->where('status', '!=', 'deleted');
                     break;
                 case 'trash':
                     $query->where('status', 'deleted');
                    // Trash view ignores archive status (can un-delete to inbox/archive)
                     break;
                 // Add other filters like 'spam', 'draft' if needed

                // Default case (treat any other filter value like inbox? Or ignore?)
                // Let's assume unknown filters default to inbox logic (below)
                default:
                     Log::info("Filter '{$filter}' not explicitly handled, defaulting to inbox logic."); // Corrected variable name here
                     // Fall through to the default inbox logic
                    $query->where('receiver_id', $userId)
                           ->where('is_archived', false)
                           ->whereNotIn('status', ['deleted', 'draft', 'spam']); // Inbox excludes these
                     break;
            }
        } elseif ($label) {
            Log::info("Applying label filter: {$label}");
            // Labels apply to non-archived, non-deleted received mail
             $query->whereHas('labels', function ($labelQuery) use ($label, $userId) {
                 $labelQuery->where('label_name', $label)
                            ->where('user_id', $userId); 
             })
             ->where('receiver_id', $userId)
             ->where('is_archived', false)
             ->where('status', '!=', 'deleted');
        } else { // Default view: INBOX
             Log::info("Defaulting to Inbox view (no filter specified)");
            $query->where('receiver_id', $userId)
                    ->where('is_archived', false) 
                    ->whereNotIn('status', ['deleted', 'draft', 'spam']); // Inbox excludes these
        }
        // --- End Specific Filters ---

        $messages = $query->orderBy('created_at', 'desc')->get();

        Log::info("Retrieved messages count: " . $messages->count());
        // Avoid logging potentially large arrays in production
        // Log::debug("Retrieved messages after filtering:", $messages->toArray());

        return MessageResource::collection($messages);
    }

    // Send a new message or reply
    public function store(Request $request)
    {
        Log::info('MessageController::store - Received request data:', $request->all());

        // --- DYNAMIC VALIDATION based on presence of reply_to_id ---
        $isReply = $request->has('reply_to_id') && $request->filled('reply_to_id');
        
        $rules = [
            'company_id' => 'required|exists:companies,id',
            'subject' => 'required|string|max:255',
            'due_date' => 'nullable|date_format:Y-m-d', // Validate due_date
            'project_data' => 'nullable|array', // Add validation for project_data
        ];

        if ($isReply) {
            // Validation for REPLY
            $rules['body'] = 'required|string'; // Expect 'body' for replies
            $rules['receiver_id'] = 'required|exists:users,id'; // Receiver is required for reply (original sender)
            $rules['reply_to_id'] = 'required|exists:messages,id'; 
        } else {
            // Validation for NEW MESSAGE (Backward compatibility)
            $rules['message'] = 'required|string'; // Expect 'message' for new compose
            $rules['receiver_id'] = 'nullable|exists:users,id'; // Receiver is optional/nullable for new
        }
        
        // Project data validation rules
        if ($request->has('project_data')) {
            $rules['project_data.title'] = 'required|string|max:255';
            $rules['project_data.property'] = 'required|string|max:255';
            $rules['project_data.time_preference'] = 'required|in:before_noon,before_4pm,anytime';
            $rules['project_data.service_type'] = 'required|in:translation,revision,modifications,transcription,voice_over,other';
            $rules['project_data.service_description'] = 'nullable|string';
            $rules['project_data.deadline'] = 'required|date_format:Y-m-d';
        }
        
        // Add validation for attachments (optional array, each file max 10MB)
        $rules['attachments'] = 'sometimes|array';
        $rules['attachments.*'] = 'file|max:25600'; // Max 25MB (25 * 1024) per file

        $validated = $request->validate($rules);
        // --- End Dynamic Validation ---

        Log::info('MessageController::store - Validation passed. Validated data:', $validated); 

        // Project creation logic for client users
        $project_id = null;
        $user = Auth::user();
        $userRole = $user->roles->first()?->name;
        
        if ($userRole === 'client' && isset($validated['project_data'])) {
            try {
                $projectData = [
                    'client_id' => $user->id,
                    'title' => $validated['project_data']['title'],
                    'property' => $validated['project_data']['property'],
                    'contact_email' => $user->email,
                    'date_requested' => now(),
                    'status' => 'received',
                    'time_preference' => $validated['project_data']['time_preference'],
                    'deadline' => $validated['project_data']['deadline'] ?? $validated['due_date'],
                    'service_type' => $validated['project_data']['service_type'],
                    'service_description' => $validated['project_data']['service_description'] ?? null,
                ];
                
                Log::info('MessageController::store - Creating project with data:', $projectData);
                
                $project = \App\Models\Project::create($projectData);
                $project_id = $project->id;
                
                Log::info('MessageController::store - Project created successfully with ID: ' . $project_id);
            } catch (\Exception $e) {
                Log::error('MessageController::store - Error creating project: ' . $e->getMessage());
                // Continue with message creation even if project creation fails
            }
        }

        $createData = [
            'sender_id' => Auth::id(),
            'receiver_id' => $validated['receiver_id'] ?? null,
            'company_id' => $validated['company_id'],
            'subject' => $validated['subject'],
            // Use 'body' if it's a reply, otherwise use 'message'
            'body' => $isReply ? $validated['body'] : $validated['message'], 
            'reply_to_id' => $isReply ? $validated['reply_to_id'] : null, 
            'status' => 'sent',
            'task_status' => 'new',     // Default task status
            'due_date' => $validated['due_date'] ?? null, // Add due date
            'is_archived' => false,    // Default archive status
            'project_id' => $project_id, // Assign the project ID if a project was created
        ];

        Log::info('MessageController::store - Attempting to create message with:', $createData); 

        try {
            $message = Message::create($createData);
            Log::info('MessageController::store - Message created successfully.', ['message_id' => $message->id]); 

            // Handle Attachments
            if ($request->hasFile('attachments')) {
                Log::info('Processing attachments for message: ' . $message->id);
                foreach ($request->file('attachments') as $file) {
                    if ($file->isValid()) {
                        $originalName = $file->getClientOriginalName();
                        $mimeType = $file->getMimeType();
                        $size = $file->getSize();
                        // Generate a unique path, e.g., attachments/user_id/message_id/unique_id_filename.ext
                        $path = $file->store('attachments/' . Auth::id() . '/' . $message->id, 'public');
                        
                        if ($path) {
                            Attachment::create([
                                'message_id' => $message->id,
                                'filename' => $originalName,
                                'path' => $path, // Store the path returned by store()
                                'mime_type' => $mimeType,
                                'size' => $size,
                            ]);
                            Log::info('Saved attachment:', ['path' => $path, 'original_name' => $originalName]);
                        } else {
                            Log::warning('Failed to store attachment:', ['original_name' => $originalName]);
                        }
                    } else {
                        Log::warning('Invalid file uploaded:', ['error' => $file->getErrorMessage()]);
                    }
                }
            }

            // Return full resource on success
            return response()->json([
                'message' => 'Message sent successfully', 
                'data' => new MessageResource($message->load(['sender', 'receiver', 'labels', 'attachments', 'project']))
            ], 201);
        } catch (\Exception $e) {
            Log::error('MessageController::store - Error creating message:', [
                'error' => $e->getMessage(),
            ]);
            return response()->json(['message' => 'Failed to send message due to server error.'], 500);
        }
    }

    // Mark message as read
    public function markAsRead($id)
    {
        $message = Message::where('id', $id)
            ->where('receiver_id', Auth::id())
            ->firstOrFail();

        $message->update(['status' => 'read']);

        return response()->json(['message' => 'Message marked as read']);
    }

    // Update message (e.g., status, labels, starred)
    public function update(Request $request, $id)
    {
        $message = Message::where('id', $id)
                    ->where(function ($query) {
                        $query->where('sender_id', Auth::id())
                              ->orWhere('receiver_id', Auth::id());
                    })
                    ->firstOrFail();

        // Validate the incoming data first
        $validatedData = $request->validate([
            'status' => 'sometimes|string|in:read,deleted', // REMOVED unread
            'task_status' => 'sometimes|string|in:new,in_process,completed', // Added 'in_process'
            'due_date' => 'sometimes|nullable|date_format:Y-m-d', // Allow updating/clearing due date
            'is_archived' => 'sometimes|boolean', // Allow updating archive status
            'isStarred' => 'sometimes|boolean',
            'folder' => 'sometimes|string|in:inbox,trash,archive', // Updated allowed folders
            'isDeleted' => 'sometimes|boolean', // Keep for potential backward compat/alternative trash trigger
            'toggleLabel' => 'sometimes|string|max:191',
        ]);

        Log::info("Updating message {$id} with validated input:", $validatedData);

        $userId = Auth::id();

        // --- Handle Label Toggling ---
        if (isset($validatedData['toggleLabel'])) {
            $labelName = $validatedData['toggleLabel'];
            Log::info("Attempting to toggle label '{$labelName}' for user {$userId} on message {$id}");

            // Find or create the label specific to the user
            $label = Label::firstOrCreate(
                ['label_name' => $labelName, 'user_id' => $userId]
            );

            // Toggle the label association for the message
            // `toggle` returns an array of attached/detached IDs
            $syncResult = $message->labels()->toggle($label->id);
            Log::info("Label toggle result for label ID {$label->id}:", $syncResult);

            // If ONLY toggling label, we can potentially return early
            // Check if other fields were also sent
            if (count(array_diff_key($validatedData, array_flip(['toggleLabel']))) === 0) {
                 $message->touch(); // Update timestamps even if only label changed
                 return new MessageResource($message->load('labels')); // Reload labels before returning
            }
        }
        // --- End Handle Label Toggling ---

        // --- Handle Status, Archive, Task Status, Due Date Updates ---

        // 1. Archive Status (explicit is_archived flag takes precedence)
        if (isset($validatedData['is_archived'])) {
            $archiveValue = $validatedData['is_archived'];
            
            // ONLY perform direct update and immediate return when ARCHIVING (true)
            if ($archiveValue === true) {
                Log::info("Attempting direct DB update for is_archived on message {$id} to: true");
                try {
                    $affectedRows = Message::where('id', $id)
                                            // Add user check for security
                                            ->where(function ($query) use ($userId) {
                                                $query->where('sender_id', $userId)
                                                      ->orWhere('receiver_id', $userId);
                                            })
                                            ->update(['is_archived' => true]);

                    Log::info("Direct DB update affected rows for is_archived on message {$id}: {$affectedRows}");
                    
                    if ($affectedRows > 0) {
                        // Return immediately after successful direct update
                        return new MessageResource(Message::findOrFail($id)->loadMissing('labels'));
                    } else {
                        Log::warning("Direct DB update for is_archived affected 0 rows for message {$id}.");
                        // Fall through to standard logic if direct update failed?
                    }
                } catch (\Exception $e) {
                    Log::error("Error during direct DB update for is_archived on message {$id}: {$e->getMessage()}");
                    throw $e; // Rethrow
                }
            } else {
                 // If is_archived is explicitly false (e.g., trash, unarchive)
                 // Set it on the model but let the standard save() handle it later
                 Log::info("Setting is_archived to false on model for message {$id}, will save later.");
                 $message->is_archived = false;
            }

            // Remove from validated data so it's not processed by the final fill()
            unset($validatedData['is_archived']);
        }
        // Archive Status (via folder property) - Let this use the standard save for now
        elseif (isset($validatedData['folder']) && $validatedData['folder'] === 'archive') {
             if (!$message->is_archived) { 
                 Log::info("Archiving message {$id} via folder property.");
                 $message->is_archived = true;
                 // We'll rely on the later save() for this path
             }
             // We still need to handle the status change if moving from trash
             if ($message->status === 'deleted') { 
                 $message->status = 'read';
             }
             unset($validatedData['folder']); // Remove folder so it's not processed again
        }
         // Unarchive Status (via folder property = inbox) - Let this use standard save
         elseif (isset($validatedData['folder']) && $validatedData['folder'] === 'inbox') {
            if ($message->is_archived) { 
                Log::info("Unarchiving message {$id} via folder property.");
                $message->is_archived = false;
                 // Rely on later save()
            }
            unset($validatedData['folder']);
         }

        // 2. Trash Status (Explicit status=deleted or folder=trash or isDeleted=true)
        // Important: Check this *before* read/unread
        $isBeingTrashed = (isset($validatedData['status']) && $validatedData['status'] === 'deleted') || 
                          (isset($validatedData['folder']) && $validatedData['folder'] === 'trash') || 
                          (isset($validatedData['isDeleted']) && $validatedData['isDeleted'] === true);

        if ($isBeingTrashed) {
             if ($message->status !== 'deleted') { // Only log/update if changing
                 Log::info("Marking message {$id} as deleted (moving to trash).");
                 $message->status = 'deleted'; 
                 $message->is_archived = false; // Cannot be archived and trashed simultaneously
             }
        } 
        // 3. Read/Unread Status (only apply if not being trashed or archived in this request)
        elseif (isset($validatedData['status']) && in_array($validatedData['status'], ['read', 'unread'])) {
            // Ensure not being archived at the same time (handled by folder logic)
            $isBeingArchived = (isset($validatedData['folder']) && $validatedData['folder'] === 'archive') || (isset($validatedData['is_archived']) && $validatedData['is_archived'] === true);

            if (!$isBeingTrashed && !$isBeingArchived) {
                $newStatus = $validatedData['status'];
                // *** Critical Fix: Convert 'unread' to a valid ENUM value ***
                if ($newStatus === 'unread') {
                    // Option 1: Revert to 'sent'. Assumes message was sent or read before.
                    // $actualDbStatus = 'sent'; 
                    // Option 2: Revert to a default non-read status like 'draft' if applicable?
                    // Option 3: If your ENUM supports it, use that. Assuming 'sent' is the best fallback.
                    $actualDbStatus = 'sent'; 
                    Log::info("Received status 'unread', mapping to DB status: {$actualDbStatus}");
                } else { // status is 'read'
                    $actualDbStatus = 'read';
                }

                if ($message->status !== $actualDbStatus) { // Only log/update if changing
                    Log::info("Setting message {$id} status to: " . $actualDbStatus);
                    $message->status = $actualDbStatus;
                }
            }
        } 
        // --- Remove the explicit isRead handling block as status now covers it --- 
        // // Handle isRead boolean input -> maps to status
        // if (array_key_exists('isRead', $input)) { ... }

        // 4. Task Status
        if (isset($validatedData['task_status'])) {
             if ($message->task_status !== $validatedData['task_status']) {
                Log::info("Setting task status to: " . $validatedData['task_status']);
                $message->task_status = $validatedData['task_status'];
             }
        }
        
        // 5. Due Date (allow setting or clearing)
        if (array_key_exists('due_date', $validatedData)) { // Check if key exists (even if null)
             if ($message->due_date != $validatedData['due_date']) { // Use loose comparison for dates/null
                Log::info("Setting due date to: " . ($validatedData['due_date'] ?? 'null'));
                $message->due_date = $validatedData['due_date'];
             }
        }

        // 6. Starred Status
        if (isset($validatedData['isStarred'])) {
             if ($message->is_starred != $validatedData['isStarred']) {
                $message->is_starred = $validatedData['isStarred'];
             }
        }
        
        // --- End Status/Folder Updates ---

        // Fill and Save any *other* remaining changes 
        $message->fill(array_diff_key($validatedData, array_flip(['toggleLabel', 'is_archived']))); // Exclude toggleLabel & is_archived 

        if ($message->isDirty()) { 
           Log::info("Saving remaining dirty attributes for message {$id}. Dirty: " . json_encode($message->getDirty()));
        $message->save();
        } else {
            Log::info("No remaining dirty attributes to save for message {$id}.");
        }

        Log::info("Message {$id} update process completed.");

        // Ensure labels are loaded if they were potentially modified
        $message->loadMissing('labels'); 

        return new MessageResource($message); // Return the potentially modified $message instance
    }

    // Fetch summary data (due date, task status) for ALL user messages
    public function summary(Request $request)
    {
        $userId = Auth::id();
        Log::info("Fetching message summary for user {$userId}");

        $summaryData = Message::where(function ($query) use ($userId) {
            $query->where('sender_id', $userId)
                  ->orWhere('receiver_id', $userId);
        })
        ->select('id', 'due_date', 'task_status') // Select only needed fields
        ->get();

        Log::info("Retrieved " . $summaryData->count() . " messages for summary count for user {$userId}.");

        // Return the raw data - frontend will compute counts
        return response()->json($summaryData);
    }

    // Delete a message PERMANENTLY
    public function destroy($id)
    {
        Log::info("Attempting to permanently delete message {$id}.");
        $message = Message::where('id', $id)
            ->where(function ($query) {
                $query->where('sender_id', Auth::id())
                      ->orWhere('receiver_id', Auth::id());
            })
            // Optionally ensure it's already in 'deleted' status before permanent deletion
            // ->where('status', 'deleted') 
            ->firstOrFail();

        $message->delete(); // This performs the actual delete

        Log::info("Message {$id} permanently deleted successfully.");
        return response()->json(['message' => 'Message permanently deleted successfully']);
    }
}


