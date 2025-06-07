<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WritingComment extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'writing_item_id',
        'user_id',
        'content',
        'position',
        'is_resolved',
        'resolved_at',
        'metadata'
    ];

    protected $casts = [
        'position' => 'array',
        'is_resolved' => 'boolean',
        'resolved_at' => 'datetime',
        'metadata' => 'array'
    ];

    /**
     * Get the writing item that owns the comment.
     */
    public function writingItem(): BelongsTo
    {
        return $this->belongsTo(Item::class, 'writing_item_id');
    }

    /**
     * Get the user who created the comment.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope a query to only include resolved comments.
     */
    public function scopeResolved($query)
    {
        return $query->where('is_resolved', true);
    }

    /**
     * Scope a query to only include unresolved comments.
     */
    public function scopeUnresolved($query)
    {
        return $query->where('is_resolved', false);
    }

    /**
     * Mark the comment as resolved.
     */
    public function resolve(): void
    {
        $this->update([
            'is_resolved' => true,
            'resolved_at' => now()
        ]);
    }

    /**
     * Mark the comment as unresolved.
     */
    public function unresolve(): void
    {
        $this->update([
            'is_resolved' => false,
            'resolved_at' => null
        ]);
    }
} 
