<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MindmapItemPosition extends Model
{
    use HasFactory;

    protected $fillable = [
        'mindmap_id',
        'item_id',
        'position',
        'size',
        'style',
        'is_visible',
        'is_collapsed',
        'z_index',
    ];

    protected $casts = [
        'position' => 'array',
        'size' => 'array',
        'style' => 'array',
        'is_visible' => 'boolean',
        'is_collapsed' => 'boolean',
        'z_index' => 'integer',
    ];

    /**
     * Get the mindmap that owns this position.
     */
    public function mindmap(): BelongsTo
    {
        return $this->belongsTo(WritingMindmap::class, 'mindmap_id');
    }

    /**
     * Get the item for this position.
     */
    public function item(): BelongsTo
    {
        return $this->belongsTo(Item::class);
    }
}
