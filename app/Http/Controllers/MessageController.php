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

        // Basic filtering logic - adjust based on your needs
        // This assumes messages are primarily filtered for the receiver (logged-in user)
        // Modify if sender should also see messages in inbox/starred etc.
        $query->where(function ($q) use ($userId) {
            $q->where('receiver_id', $userId)
              ->orWhere('sender_id', $userId); // Allow sender to see their sent messages if needed
        });

        if ($filter) {
            Log::info("Applying filter: {$filter}");
            switch ($filter) {
                case 'starred':
                    $query->where('is_starred', true);
                    break;
                case 'draft':
                    $query->where('status', 'draft')->where('sender_id', $userId); // Drafts only for sender
                    break;
                case 'sent':
                    $query->where('status', 'sent')->where('sender_id', $userId); // Sent only for sender
                    break;
                case 'spam':
                     $query->where('status', 'spam'); // Or folder column if you have one
                     break;
                 case 'trash':
                     $query->where('status', 'deleted');
                     break;
                // Default case (inbox) - filter non-archived/deleted/spam for receiver
                default:
                    $query->where('receiver_id', $userId)
                          ->whereNotIn('status', ['archived', 'deleted', 'spam', 'draft']);
            }
        } elseif ($label) {
            Log::info("Applying label filter: {$label}");
            // Filter by label using the relationship
            $query->whereHas('labels', function ($labelQuery) use ($label) {
                $labelQuery->where('label_name', $label);
            });
        } else {
            // Default to Inbox view if no filter or label
            Log::info("Defaulting to Inbox view");
            $query->where('receiver_id', $userId)
                   ->whereNotIn('status', ['archived', 'deleted', 'spam', 'draft']);
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
            'status' => 'sometimes|string|in:read,unread,sent,draft,archived,deleted,spam',
            'isStarred' => 'sometimes|boolean',
            'folder' => 'sometimes|string',
            'isDeleted' => 'sometimes|boolean',
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

        // --- Handle Status and Folder Updates ---

        // Explicitly check for moving to trash via folder or isDeleted flag
        if ( (isset($validatedData['folder']) && $validatedData['folder'] === 'trash') || (isset($validatedData['isDeleted']) && $validatedData['isDeleted'] === true) ) {
             Log::info("Marking message {$id} as deleted (moving to trash).");
             $message->status = 'deleted'; // Set status to 'deleted'
        } 
        // Handle other status updates if not moving to trash
        elseif (isset($validatedData['status']) && in_array($validatedData['status'], ['read', 'unread', 'sent', 'draft', 'archived', 'spam'])) {
            Log::info("Setting message {$id} status to: " . $validatedData['status']);
            $message->status = $validatedData['status'];
        }
        // Also handle moving to spam via folder property
        elseif (isset($validatedData['folder']) && $validatedData['folder'] === 'spam') {
             Log::info("Marking message {$id} as spam.");
             $message->status = 'spam'; 
        }
        
        // Handle is_starred update if the field exists in the request input
        if (isset($validatedData['isStarred'])) {
            $message->is_starred = $validatedData['isStarred'];
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


