<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Project extends Model
{
    use HasFactory;

    protected $fillable = [
        'client_id',
        'title',
        'property',
        'contact_email',
        'date_requested',
        'status',
        'time_preference',
        'deadline',
        'service_type',
        'service_description',
        'latest_completion_date'
    ];

    protected $casts = [
        'deadline' => 'date',
        'date_requested' => 'datetime',
        'latest_completion_date' => 'date'
    ];

    /**
     * Get the client that owns the project.
     */
    public function client()
    {
        return $this->belongsTo(User::class, 'client_id');
    }

    /**
     * Get the messages for the project.
     */
    public function messages()
    {
        return $this->hasMany(Message::class);
    }

    /**
     * Get all attachments for the project via messages.
     */
    public function attachments()
    {
        return $this->hasManyThrough(\App\Models\Attachment::class, \App\Models\Message::class, 'project_id', 'message_id');
    }

    /**
     * Helper to check if project has any attachments.
     */
    public function getHasAttachmentsAttribute()
    {
        return $this->attachments()->exists();
    }
}
