<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Message;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

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

    public function index()
{
    Log::info("Fetching all messages (no filtering).");

    $messages = Message::with(['sender:id,name']) // ✅ No filtering applied
        ->orderBy('created_at', 'desc')
        ->get();

    Log::info("Retrieved messages:", $messages->toArray());

    return response()->json(['messages' => $messages]);
}






    // Send a new message
    public function store(Request $request)
    {
        $validated = $request->validate([
            'receiver_id' => 'required|exists:users,id',
            'message' => 'required|string',
        ]);

        $message = Message::create([
            'sender_id' => Auth::id(),
            'receiver_id' => $validated['receiver_id'],
            'message' => $validated['message'],
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


