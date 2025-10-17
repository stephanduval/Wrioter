<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class WritingMindmap extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'writing_item_id',
        'user_id',
        'title',
        'settings',
        'format',
        'is_archived'
    ];

    protected $casts = [
        'settings' => 'array',
        'is_archived' => 'boolean',
        'archived_at' => 'datetime'
    ];

    /**
     * Get the writing item that owns the mindmap.
     */
    public function writingItem(): BelongsTo
    {
        return $this->belongsTo(Item::class, 'writing_item_id');
    }

    /**
     * Get the user that owns the mindmap.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the nodes for this mindmap.
     */
    public function nodes(): HasMany
    {
        return $this->hasMany(WritingMindmapNode::class, 'mindmap_id');
    }

    /**
     * Scope a query to only include active mindmaps.
     */
    public function scopeActive($query)
    {
        return $query->where('is_archived', false);
    }

    /**
     * Scope a query to only include archived mindmaps.
     */
    public function scopeArchived($query)
    {
        return $query->where('is_archived', true);
    }
} 
