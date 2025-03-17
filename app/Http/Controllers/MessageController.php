<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Message;
use App\Models\Attachment;
use Illuminate\Support\Facades\Auth;

class MessageController extends Controller
{
    // ✅ 1. Fetch all messages
    public function index(Request $request)
{
    try {
        \Log::info('Fetching all messages...');

        $messages = Message::with(['sender', 'attachments'])
            ->orderBy('created_at', 'desc')
            ->get();

        \Log::info('Messages Retrieved:', ['messages' => $messages]);
        return response()->json(['emails' => $messages]);
    } catch (\Exception $e) {
        \Log::error('Error fetching messages: ' . $e->getMessage());
        return response()->json(['error' => 'Server error'], 500);
    }
}

    // ✅ 2. Create a new message
    public function store(Request $request)
    {
        $validated = $request->validate([
            'subject' => 'required|string|max:255',
            'body' => 'required|string',
            'company_id' => 'required|exists:companies,id',
            'attachments.*' => 'file|max:10240', // Optional file attachments (10MB max)
        ]);

        $message = Message::create([
            'sender_id' => Auth::id(), // Authenticated user
            'company_id' => $validated['company_id'],
            'subject' => $validated['subject'],
            'body' => $validated['body'],
            'status' => 'inbox',
        ]);

        if ($request->hasFile('attachments')) {
            foreach ($request->file('attachments') as $file) {
                $path = $file->store('attachments');
                Attachment::create([
                    'message_id' => $message->id,
                    'filename' => $file->getClientOriginalName(),
                    'path' => $path,
                    'mime_type' => $file->getMimeType(),
                    'size' => $file->getSize(),
                ]);
            }
        }

        return response()->json(['message' => 'Message created successfully', 'data' => $message], 201);
    }

    // ✅ 3. Delete a message
    public function destroy($id)
    {
        $message = Message::findOrFail($id);
        $message->delete();

        return response()->json(['message' => 'Message deleted successfully']);
    }
}

