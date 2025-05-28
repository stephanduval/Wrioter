<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Models\User; // Import User model if not already imported
use Illuminate\Support\Facades\URL; // Add this import for URL facade

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
        $this->resource->loadMissing(['sender', 'receiver', 'labels', 'attachments', 'project']);

        // Determine folder based on status AND archive flag
        $folder = 'inbox'; // Default
        if ($this->is_archived) {
            $folder = 'archive';
        } elseif ($this->status === 'deleted') {
            $folder = 'trash';
        } elseif ($this->status === 'draft') { // Assuming sender perspective for draft/sent
            $folder = 'draft';
        } elseif ($this->status === 'sent') { // Assuming sender perspective for draft/sent
             // Sent items usually appear in inbox for receiver, but maybe 'sent' folder for sender view?
             // Let's keep it simple: if receiver sees it, it's inbox unless archived/deleted.
             // If sender is viewing 'sent' filter, the controller handles that.
             // So, resource doesn't need complex folder logic based on viewer.
        }
        

        return [
            'id' => $this->id,
            'from' => [
                'id' => $this->whenLoaded('sender', fn() => $this->sender->id ?? null),
                'fullName' => $this->whenLoaded('sender', fn() => $this->sender->name ?? 'Unknown Sender'),
                'email' => $this->whenLoaded('sender', fn() => $this->sender->email ?? 'unknown@example.com'),
                'avatar' => $this->whenLoaded('sender', fn() => $this->sender->avatar ?? '/images/avatars/avatar-1.png'), // Adjust default avatar path as needed
            ],
            'to' => $this->whenLoaded('receiver', function () {
                 return $this->receiver ? [ // Check if receiver exists
                    [
                        'fullName' => $this->receiver->name ?? 'Unknown Receiver',
                        'email' => $this->receiver->email ?? 'unknown@example.com',
                    ]
                 ] : []; // Return empty array if no receiver
            }),
            'subject' => $this->subject,
            'message' => $this->body, // Map body to message
            'time' => $this->created_at->toISOString(), // Map created_at to time
            'requestedDate' => $this->created_at->toISOString(), // Add requestedDate mapping
            'dueDate' => $this->due_date?->toDateString(), // Format Y-m-d, handle null
            'labels' => $this->whenLoaded('labels', fn() => $this->labels->pluck('label_name')->toArray() ?? []),
            'attachments' => $this->whenLoaded('attachments', function() {
                return $this->attachments->map(function ($attachment) {
                    // Basic mapping, adjust thumbnail/url logic as needed based on your Attachment model/storage
                    return [
                        'id' => $attachment->id,
                        'fileName' => $attachment->filename,
                        'thumbnail' => '/images/icons/file-icons/doc.png', // Placeholder, adjust logic
                        'url' => $attachment->path, // Assuming path is the URL or can derive it
                        'size' => $attachment->size . ' bytes', // Format size as needed
                        'download_url' => URL::temporarySignedRoute(
                            'attachments.download',
                            now()->addMinutes(60), // URL valid for 60 minutes
                            ['attachment' => $attachment->id]
                        ),
                    ];
                })->toArray() ?? [];
            }),
            'isRead' => $this->status === 'read',
            'isStarred' => (bool) $this->is_starred, // Use the actual value from the model
            'isArchived' => (bool) $this->is_archived, // Add archive flag
            'folder' => $folder, // Calculated folder
            'status' => $this->status, // Existing status (read/unread/deleted)
            'task_status' => $this->task_status, // New task status ('new'/'completed')
            'due_date' => $this->due_date?->toDateString(),
            'company_id' => $this->company_id,
            'project' => $this->whenLoaded('project', function() {
                return $this->project ? [
                    'id' => $this->project->id,
                    'title' => $this->project->title,
                    'property' => $this->project->property,
                    'service_type' => $this->project->service_type,
                    'deadline' => $this->project->deadline?->toDateString(),
                ] : null;
            }),

            // Include original fields if needed for debugging or specific logic
            // 'sender_id' => $this->sender_id,
            // 'receiver_id' => $this->receiver_id,
            // 'created_at' => $this->created_at,
            // 'updated_at' => $this->updated_at,
        ];
    }
}
