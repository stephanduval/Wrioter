<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Message;
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

    // Send a new message
    public function store(Request $request)
    {
        $validated = $request->validate([
            'receiver_id' => 'nullable|exists:users,id',
            'company_id' => 'required|exists:companies,id',
            'subject' => 'required|string|max:255',
            'message' => 'required|string',
        ]);

        $message = Message::create([
            'sender_id' => Auth::id(),
            'receiver_id' => $validated['receiver_id'] ?? null,
            'company_id' => $validated['company_id'],
            'subject' => $validated['subject'],
            'body' => $validated['message'],
            'status' => 'sent',
        ]);

        return response()->json(['message' => 'Message sent successfully', 'data' => $message], 201);
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
        $request->validate([
            'status' => 'sometimes|string|in:read,unread,sent,draft,archived,deleted,spam',
            'is_starred' => 'sometimes|boolean',
            'folder' => 'sometimes|string',
            'isDeleted' => 'sometimes|boolean',
        ]);

        // Get all input after validation passed
        $input = $request->all();
        Log::info("Updating message {$id} with input:", $input);

        // Handle is_starred update if the field exists in the request input
        if (isset($input['isStarred'])) {
            $message->is_starred = $input['isStarred'];
        }

        // Handle explicit deletion flag if sent separately
        if (isset($input['isDeleted']) && $input['isDeleted'] === true) {
            $message->status = 'deleted';
        }

        // Handle read/unread status update (if needed as part of update)
        if (isset($input['status']) && in_array($input['status'], ['read', 'unread', 'sent', 'draft', 'archived', 'deleted', 'spam'])) {
            $message->status = $input['status'];
        }

        $message->save();

        Log::info("Message {$id} updated successfully.");

        return new MessageResource($message);
    }

    // Delete a message
    public function destroy($id)
    {
        $message = Message::where('id', $id)
            ->where(function ($query) {
                $query->where('sender_id', Auth::id())
                      ->orWhere('receiver_id', Auth::id());
            })
            ->firstOrFail();

        $message->delete();

        return response()->json(['message' => 'Message deleted successfully']);
    }
}


