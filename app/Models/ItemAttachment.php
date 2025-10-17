<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ItemAttachment extends Model
{
    use HasFactory;

    protected $fillable = [
        'item_id',
        'file_type',
        'file_name',
        'file_content',
        'raw_content',
        'file_size',
        'mime_type',
        'scrivener_path',
        'metadata',
    ];

    protected $casts = [
        'metadata' => 'array',
    ];

    /**
     * Get the item that owns the attachment.
     */
    public function item(): BelongsTo
    {
        return $this->belongsTo(Item::class);
    }

    /**
     * Check if this is a binary file type
     */
    public function isBinary(): bool
    {
        return in_array($this->file_type, ['pdf', 'jpg', 'jpeg', 'png', 'gif', 'wav', 'mp3', 'mp4']);
    }

    /**
     * Get decoded file content for binary files
     */
    public function getDecodedContent(): string
    {
        if ($this->isBinary()) {
            return base64_decode($this->file_content);
        }
        return $this->file_content;
    }
}
