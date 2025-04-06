<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Message;
use App\Models\Label;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use App\Http\Resources\MessageResource;

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
        $userId = Auth::id(); // Get the authenticated user's ID

        // Start building the query
        $query = Message::with(['sender', 'receiver', 'labels', 'attachments']);

        // Apply filters based on request parameters
        $filter = $request->query('filter');
        $label = $request->query('label');

        Log::info("Request parameters:", ['filter' => $filter, 'label' => $label]);

        // --- Initial Query based on Role (Sender/Receiver) ---
        // Adjust this part if you have more complex visibility rules
        $query->where(function ($q) use ($userId) {
            $q->where('receiver_id', $userId) // User is receiver
              ->orWhere('sender_id', $userId); // User is sender
        });
        // --- End Initial Query ---

        // --- Apply Archive Filter First ---
        // By default, exclude archived unless specifically requested
        if ($filter === 'archive') {
            Log::info("Applying filter: archive");
            $query->where('is_archived', true);
        } else {
            // For all other views (inbox, sent, starred, trash, labels, default), exclude archived
            $query->where('is_archived', false); 
        }
        // --- End Archive Filter ---

        if ($filter && $filter !== 'archive') { // Process other filters only if not archive
            Log::info("Applying filter: {$filter}");
            switch ($filter) {
                case 'starred':
                    // Starred can be from sender or receiver perspective, assuming receiver here primarily
                    $query->where('is_starred', true)->where('receiver_id', $userId); // Or adjust if sender's starred matters
                    break;
                case 'sent': 
                    // Sent items are only relevant to the sender
                    $query->where('status', 'sent')->where('sender_id', $userId); 
                    break; 
                case 'trash':
                     // Trash can contain items user received or sent
                     $query->where('status', 'deleted'); // Applies to both sender/receiver owned items in trash
                     break;
                // Default case (inbox) 
                default: // Handles 'inbox' or any other filter value not explicitly caught
                    $query->where('receiver_id', $userId)
                          ->whereNotIn('status', ['deleted', 'draft', 'spam']); // Keep existing non-deleted/draft logic for inbox
            }
        } elseif ($label) {
            Log::info("Applying label filter: {$label}");
            // Ensure label filtering considers user ownership if labels are user-specific
             $query->whereHas('labels', function ($labelQuery) use ($label, $userId) {
                 $labelQuery->where('label_name', $label)
                            ->where('user_id', $userId); // Assuming labels belong to users
             })->where('receiver_id', $userId); // Typically labels apply to received mail
        } elseif (!$filter) { // This is the default inbox view (no filter param)
             Log::info("Defaulting to Inbox view (no filter specified)");
             $query->where('receiver_id', $userId)
                    ->where('is_archived', false) // Ensure inbox excludes archived
                    ->whereNotIn('status', ['deleted', 'draft', 'spam']);
        }

        // Execute the query
        $messages = $query->orderBy('created_at', 'desc')->get();

        Log::info("Retrieved messages count: " . $messages->count());
        Log::info("Retrieved messages after filtering and transformation:", $messages->toArray());

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
        
        $validated = $request->validate($rules);
        // --- End Dynamic Validation ---

        Log::info('MessageController::store - Validation passed. Validated data:', $validated); 

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
        ];

        Log::info('MessageController::store - Attempting to create message with:', $createData); 

        try {
            $message = Message::create($createData);
            Log::info('MessageController::store - Message created successfully.', ['message_id' => $message->id]); 
            // Return full resource on success
            return response()->json([
                'message' => 'Message sent successfully', 
                'data' => new MessageResource($message->load(['sender', 'receiver', 'labels', 'attachments']))
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
            'status' => 'sometimes|string|in:read,unread,deleted', // Removed sent, draft, spam, archived from here
            'task_status' => 'sometimes|string|in:new,completed', // Validate new task status
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
            $message->is_archived = $validatedData['is_archived'];
            Log::info("Setting archive status to: " . ($message->is_archived ? 'true' : 'false'));
            // If archiving, potentially clear 'deleted' status if moving from trash
            if ($message->is_archived && $message->status === 'deleted') {
                 $message->status = 'read'; // Or 'unread' based on previous state? Defaulting to read.
            }
        }
        // Archive Status (via folder property)
        elseif (isset($validatedData['folder']) && $validatedData['folder'] === 'archive') {
             if (!$message->is_archived) { // Only log/update if changing
                 Log::info("Archiving message {$id} via folder property.");
                 $message->is_archived = true;
                 if ($message->status === 'deleted') { $message->status = 'read'; } // Clear deleted status
             }
        }
         // Unarchive Status (via folder property = inbox)
         elseif (isset($validatedData['folder']) && $validatedData['folder'] === 'inbox') {
            if ($message->is_archived) { // Only log/update if changing
                Log::info("Unarchiving message {$id} via folder property.");
                $message->is_archived = false;
            }
         }

        // 2. Trash Status (explicit status=deleted or folder=trash or isDeleted=true)
        if ( (isset($validatedData['status']) && $validatedData['status'] === 'deleted') || (isset($validatedData['folder']) && $validatedData['folder'] === 'trash') || (isset($validatedData['isDeleted']) && $validatedData['isDeleted'] === true) ) {
             if ($message->status !== 'deleted') { // Only log/update if changing
                 Log::info("Marking message {$id} as deleted (moving to trash).");
                 $message->status = 'deleted'; 
                 $message->is_archived = false; // Cannot be archived and trashed simultaneously
             }
        } 
        // 3. Read/Unread Status (only if not being deleted/archived in the same request)
        elseif (isset($validatedData['status']) && in_array($validatedData['status'], ['read', 'unread']) && $message->status !== 'deleted' && !$message->is_archived) {
             if ($message->status !== $validatedData['status']) { // Only log/update if changing
                 Log::info("Setting message {$id} status to: " . $validatedData['status']);
                 $message->status = $validatedData['status'];
             }
        }

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

        $message->save();

        Log::info("Message {$id} updated successfully.");

        // Ensure labels are loaded if they were potentially modified
        $message->load('labels');

        return new MessageResource($message);
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


