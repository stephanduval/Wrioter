<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WritingItemLink extends Model
{
    protected $fillable = [
        'source_item_id',
        'target_item_id',
        'relationship_type',
        'description',
        'metadata'
    ];

    protected $casts = [
        'metadata' => 'array'
    ];

    /**
     * Get the source item.
     */
    public function sourceItem(): BelongsTo
    {
        return $this->belongsTo(Item::class, 'source_item_id');
    }

    /**
     * Get the target item.
     */
    public function targetItem(): BelongsTo
    {
        return $this->belongsTo(Item::class, 'target_item_id');
    }

    /**
     * Scope a query to only include links of a specific relationship type.
     */
    public function scopeOfType($query, $type)
    {
        return $query->where('relationship_type', $type);
    }

    /**
     * Scope a query to only include links from a specific source item.
     */
    public function scopeFromSource($query, $sourceId)
    {
        return $query->where('source_item_id', $sourceId);
    }

    /**
     * Scope a query to only include links to a specific target item.
     */
    public function scopeToTarget($query, $targetId)
    {
        return $query->where('target_item_id', $targetId);
    }
} 
