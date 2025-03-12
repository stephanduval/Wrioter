<?php 

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Message extends Model
{
    use HasFactory;

    protected $fillable = ['sender_id', 'company_id', 'assignment_id', 'project_id', 'subject', 'body', 'reply_to_id', 'status'];

    /**
     * Attachments relationship.
     */
    public function attachments(): HasMany
    {
        return $this->hasMany(Attachment::class);
    }
}
