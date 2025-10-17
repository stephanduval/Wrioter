<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\URL;

class ProjectResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        // Eager load relationships if they aren't already
        $this->resource->loadMissing(['client', 'messages.attachments']);

        // Get all attachments from messages related to this project
        $allAttachments = $this->messages->flatMap(function ($message) {
            return $message->attachments->map(function ($attachment) use ($message) {
                return [
                    'id' => $attachment->id,
                    'message_id' => $message->id,
                    'filename' => $attachment->filename,
                    'mime_type' => $attachment->mime_type,
                    'size' => $attachment->size,
                    'created_at' => $attachment->created_at->toISOString(),
                    'download_url' => URL::temporarySignedRoute(
                        'attachments.download',
                        now()->addMinutes(60),
                        ['attachment' => $attachment->id]
                    ),
                    'message_subject' => $message->subject,
                    'message_date' => $message->created_at->toISOString(),
                ];
            });
        })->unique('id')->values();

        return [
            'id' => $this->id,
            'title' => $this->title,
            'property' => $this->property,
            'contact_email' => $this->contact_email,
            'status' => $this->status,
            'time_preference' => $this->time_preference,
            'deadline' => $this->deadline?->toDateString(),
            'service_type' => $this->service_type,
            'service_description' => $this->service_description,
            'latest_completion_date' => $this->latest_completion_date?->toDateString(),
            'date_requested' => $this->date_requested?->toISOString(),
            'created_at' => $this->created_at->toISOString(),
            'updated_at' => $this->updated_at->toISOString(),
            
            // Client information
            'client' => $this->whenLoaded('client', function() {
                return [
                    'id' => $this->client->id,
                    'name' => $this->client->name,
                    'email' => $this->client->email,
                ];
            }),

            // Company information if available
            'company' => $this->whenLoaded('company', function() {
                return [
                    'id' => $this->company->id,
                    'name' => $this->company->name,
                ];
            }),

            // Messages with their basic information
            'messages' => $this->whenLoaded('messages', function() {
                return $this->messages->map(function ($message) {
                    return [
                        'id' => $message->id,
                        'subject' => $message->subject,
                        'created_at' => $message->created_at->toISOString(),
                        'status' => $message->status,
                        'has_attachments' => $message->attachments->isNotEmpty(),
                    ];
                });
            }),

            // All attachments from all messages
            'attachments' => $allAttachments,

            // Summary counts
            'message_count' => $this->messages->count(),
            'attachment_count' => $allAttachments->count(),
            'has_attachments' => $allAttachments->isNotEmpty(),
        ];
    }
} 
