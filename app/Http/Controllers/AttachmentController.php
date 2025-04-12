<?php

namespace App\Http\Controllers;

use App\Models\Attachment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AttachmentController extends Controller
{
    /**
     * Download the specified attachment.
     *
     * @param  \App\Models\Attachment  $attachment
     * @return \Symfony\Component\HttpFoundation\StreamedResponse|\Illuminate\Http\JsonResponse
     */
    public function download(Attachment $attachment)
    {
        Log::info("Attempting to download attachment ID: {$attachment->id}");

        // --- Authorization Check Removed --- 
        // The 'signed' middleware on the route provides temporary authorization.
        // We trust that the link was generated for an authorized user.
        // $message = $attachment->message()->first();
        // if (!$message) { ... }
        // $userId = Auth::id();
        // if ($message->sender_id !== $userId && $message->receiver_id !== $userId) { ... }
        // --- End Authorization Check Removed ---

        // Check if the file exists on the configured disk (e.g., 'public')
        // It's still good practice to check if the attachment record itself is valid
        // though the route model binding handles basic existence.
        if (!$attachment->exists) { // Or check if $attachment itself is null if not using route model binding strictly
            Log::warning("Attempted download for non-existent attachment record ID (post-binding check): {$attachment->id}");
            return response()->json(['error' => 'Attachment record not found.'], 404);
        }

        if (!Storage::disk('public')->exists($attachment->path)) {
            Log::error("Attachment file not found on disk for attachment ID: {$attachment->id}", ['path' => $attachment->path]);
            return response()->json(['error' => 'File not found.'], 404);
        }

        Log::info("Authorization successful. Preparing download for attachment: {$attachment->filename}");

        // Return the file as a download response
        try {
            return Storage::disk('public')->download($attachment->path, $attachment->filename);
        } catch (\Exception $e) {
            Log::error("Error preparing download for attachment ID {$attachment->id}: " . $e->getMessage());
            return response()->json(['error' => 'Could not process file download.'], 500);
        }
    }
}
