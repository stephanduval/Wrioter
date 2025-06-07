<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WritingMindmapNodeVersion extends Model
{
    protected $fillable = [
        'mindmap_node_id',
        'user_id',
        'name',
        'title',
        'content',
        'position',
        'style',
        'change_description'
    ];

    protected $casts = [
        'position' => 'array',
        'style' => 'array'
    ];

    /**
     * Get the mindmap node that owns this version.
     */
    public function mindmapNode(): BelongsTo
    {
        return $this->belongsTo(WritingMindmapNode::class, 'mindmap_node_id');
    }

    /**
     * Get the user who created this version.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope a query to order versions by creation date.
     */
    public function scopeLatest($query)
    {
        return $query->orderBy('created_at', 'desc');
    }
} 
