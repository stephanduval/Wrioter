<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Message extends Model
{
    use HasFactory;

    protected $fillable = [
        'sender_id',
        'receiver_id',
        'company_id',
        'assignment_id',
        'project_id',
        'subject',
        'body',
        'reply_to_id',
        'status',
        'is_starred',
    ];

    protected $casts = [
        'status' => 'string', // ENUM values are stored as strings
        'is_starred' => 'boolean',
    ];

    public function sender(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    public function receiver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'receiver_id');
    }

    public function labels(): BelongsToMany
    {
        return $this->belongsToMany(Label::class, 'message_labels');
    }

    public function attachments(): HasMany
    {
        return $this->hasMany(Attachment::class);
    }
}
