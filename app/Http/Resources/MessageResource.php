<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Models\User; // Import User model if not already imported

class MessageResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        // Eager load relationships if they aren't already
        $this->resource->loadMissing(['sender', 'receiver', 'labels', 'attachments']);

        // Determine folder based on status
        $folder = 'inbox'; // Default to inbox
        if ($this->status === 'draft') {
            $folder = 'draft';
        } elseif ($this->status === 'deleted') {
            $folder = 'trash';
        } elseif ($this->status === 'archived') {
            $folder = 'archived'; // Assuming frontend handles this
        } // 'sent' and 'read' remain 'inbox'
        

        return [
            'id' => $this->id,
            'from' => [
                'fullName' => $this->whenLoaded('sender', fn() => $this->sender->name ?? 'Unknown Sender'),
                'email' => $this->whenLoaded('sender', fn() => $this->sender->email ?? 'unknown@example.com'),
                'avatar' => $this->whenLoaded('sender', fn() => $this->sender->avatar ?? '/images/avatars/avatar-1.png'), // Adjust default avatar path as needed
            ],
            'to' => $this->whenLoaded('receiver', function () {
                 return $this->receiver ? [ // Check if receiver exists
                    [
                        'name' => $this->receiver->name ?? 'Unknown Receiver',
                        'email' => $this->receiver->email ?? 'unknown@example.com',
                    ]
                 ] : []; // Return empty array if no receiver
            }),
            'subject' => $this->subject,
            'message' => $this->body, // Map body to message
            'time' => $this->created_at->toISOString(), // Map created_at to time
            'labels' => $this->whenLoaded('labels', fn() => $this->labels->pluck('label_name')->toArray() ?? []),
            'attachments' => $this->whenLoaded('attachments', function() {
                return $this->attachments->map(function ($attachment) {
                    // Basic mapping, adjust thumbnail/url logic as needed based on your Attachment model/storage
                    return [
                        'fileName' => $attachment->filename,
                        'thumbnail' => '/images/icons/file-icons/doc.png', // Placeholder, adjust logic
                        'url' => $attachment->path, // Assuming path is the URL or can derive it
                        'size' => $attachment->size . ' bytes', // Format size as needed
                    ];
                })->toArray() ?? [];
            }),
            'isRead' => $this->status === 'read',
            'isStarred' => false, // Default as not supported by schema
            'isDeleted' => $this->status === 'deleted',
            'folder' => $folder,

            // Include original fields if needed for debugging or specific logic
            // 'sender_id' => $this->sender_id,
            // 'receiver_id' => $this->receiver_id,
            // 'status' => $this->status,
            // 'created_at' => $this->created_at,
            // 'updated_at' => $this->updated_at,
        ];
    }
}
