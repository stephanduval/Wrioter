<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WritingMindmapNodeLink extends Model
{
    protected $fillable = [
        'mindmap_node_id',
        'writing_item_id',
        'relationship_type',
        'description',
        'metadata'
    ];

    protected $casts = [
        'metadata' => 'array'
    ];

    /**
     * Get the mindmap node.
     */
    public function mindmapNode(): BelongsTo
    {
        return $this->belongsTo(WritingMindmapNode::class, 'mindmap_node_id');
    }

    /**
     * Get the writing item.
     */
    public function writingItem(): BelongsTo
    {
        return $this->belongsTo(Item::class, 'writing_item_id');
    }

    /**
     * Scope a query to only include links of a specific relationship type.
     */
    public function scopeOfType($query, $type)
    {
        return $query->where('relationship_type', $type);
    }
} 
