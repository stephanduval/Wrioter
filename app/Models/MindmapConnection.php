<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MindmapConnection extends Model
{
    use HasFactory;

    protected $fillable = [
        'mindmap_id',
        'from_item_id',
        'to_item_id',
        'connection_type',
        'relationship_type',
        'label',
        'style',
        'path_data',
    ];

    protected $casts = [
        'style' => 'array',
        'path_data' => 'array',
    ];

    /**
     * Get the mindmap that owns this connection.
     */
    public function mindmap(): BelongsTo
    {
        return $this->belongsTo(WritingMindmap::class, 'mindmap_id');
    }

    /**
     * Get the source item.
     */
    public function fromItem(): BelongsTo
    {
        return $this->belongsTo(Item::class, 'from_item_id');
    }

    /**
     * Get the target item.
     */
    public function toItem(): BelongsTo
    {
        return $this->belongsTo(Item::class, 'to_item_id');
    }
}
