<?php

namespace App\Http\Controllers;

use App\Models\Message;
use App\Models\Attachment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class MessageController extends Controller
{
    /**
     * Create a new message with optional attachments.
     */
    public function store(Request $request)
{
    try {
        $validated = $request->validate([
            'sender_id' => 'required|exists:users,id',
            'company_id' => 'required|exists:companies,id',
            'assignment_id' => 'nullable|exists:assignments,id',
            'project_id' => 'nullable|exists:projects,id',
            'subject' => 'required|string|max:255',
            'body' => 'required|string',
            'attachments.*' => 'file|max:10240' // Max 10MB
        ]);

        \Log::info('Validated Data:', $validated);

        // Ensure optional fields are explicitly set to null if not provided
        $message = Message::create([
            'sender_id' => $validated['sender_id'],
            'company_id' => $validated['company_id'],
            'assignment_id' => $validated['assignment_id'] ?? null,
            'project_id' => $validated['project_id'] ?? null, // Explicitly set to null if not provided
            'subject' => $validated['subject'],
            'body' => $validated['body'],
        ]);

        return response()->json(['message' => 'Message created successfully', 'data' => $message], 201);

    } catch (\Illuminate\Validation\ValidationException $e) {
        \Log::error('Validation Failed:', ['errors' => $e->errors()]);
        return response()->json(['error' => 'Validation Failed', 'details' => $e->errors()], 422);
    } catch (\Exception $e) {
        \Log::error('Error creating message:', ['message' => $e->getMessage()]);
        return response()->json(['error' => 'Server Error', 'details' => $e->getMessage()], 500);
    }
}


    /**
     * Delete a message and its attachments.
     */
    public function destroy($id)
    {
        try {
            $message = Message::findOrFail($id);

            // Delete associated attachments
            foreach ($message->attachments as $attachment) {
                Storage::delete($attachment->path);
                $attachment->delete();
            }

            $message->delete();

            return response()->json(['message' => 'Message deleted successfully']);
        } catch (\Exception $e) {
            \Log::error('Error deleting message:', ['message' => $e->getMessage()]);
            return response()->json(['error' => 'Server Error', 'details' => $e->getMessage()], 500);
        }
    }
}
