<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MindmapGhost extends Model
{
    use HasFactory;

    protected $fillable = [
        'mindmap_id',
        'original_item_id',
        'label',
        'position',
        'size',
        'style',
        'z_index',
        'item_type',
        'deleted_at',
    ];

    protected $casts = [
        'position' => 'array',
        'size' => 'array',
        'style' => 'array',
        'z_index' => 'integer',
        'deleted_at' => 'datetime',
    ];

    /**
     * Get the mindmap that owns this ghost.
     */
    public function mindmap(): BelongsTo
    {
        return $this->belongsTo(WritingMindmap::class, 'mindmap_id');
    }
}
