<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class WritingMindmapNode extends Model
{
    protected $fillable = [
        'mindmap_id',
        'parent_id',
        'title',
        'content',
        'position',
        'style',
        'order',
        'is_collapsed'
    ];

    protected $casts = [
        'position' => 'array',
        'style' => 'array',
        'is_collapsed' => 'boolean',
        'order' => 'integer'
    ];

    /**
     * Get the mindmap that owns the node.
     */
    public function mindmap(): BelongsTo
    {
        return $this->belongsTo(WritingMindmap::class, 'mindmap_id');
    }

    /**
     * Get the parent node.
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(WritingMindmapNode::class, 'parent_id');
    }

    /**
     * Get the child nodes.
     */
    public function children(): HasMany
    {
        return $this->hasMany(WritingMindmapNode::class, 'parent_id');
    }

    /**
     * Get the versions of this node.
     */
    public function versions(): HasMany
    {
        return $this->hasMany(WritingMindmapNodeVersion::class, 'mindmap_node_id');
    }

    /**
     * Get the linked items.
     */
    public function linkedItems(): BelongsToMany
    {
        return $this->belongsToMany(Item::class, 'writing_mindmap_node_links', 'mindmap_node_id', 'writing_item_id')
            ->withPivot(['relationship_type', 'description', 'metadata'])
            ->withTimestamps();
    }

    /**
     * Scope a query to only include root nodes (no parent).
     */
    public function scopeRoot($query)
    {
        return $query->whereNull('parent_id');
    }

    /**
     * Scope a query to only include collapsed nodes.
     */
    public function scopeCollapsed($query)
    {
        return $query->where('is_collapsed', true);
    }

    /**
     * Scope a query to only include expanded nodes.
     */
    public function scopeExpanded($query)
    {
        return $query->where('is_collapsed', false);
    }
} 
