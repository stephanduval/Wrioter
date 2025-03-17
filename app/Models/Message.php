<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Message extends Model
{
    use HasFactory;

    protected $fillable = [
        'sender_id',
        'company_id',
        'subject',
        'body',
        'status',
    ];

    // ✅ Relationship: Message belongs to a sender (User)
    public function sender()
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    // ✅ Relationship: Message has many attachments
    public function attachments()
    {
        return $this->hasMany(Attachment::class);
    }
}
