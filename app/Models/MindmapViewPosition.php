<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MindmapViewPosition extends Model
{
    use HasFactory;

    protected $fillable = [
        'saved_view_id',
        'item_id',
        'position',
        'size',
        'style',
        'is_collapsed',
        'z_index',
    ];

    protected $casts = [
        'position' => 'array',
        'size' => 'array',
        'style' => 'array',
        'is_collapsed' => 'boolean',
    ];

    public function savedView(): BelongsTo
    {
        return $this->belongsTo(MindmapSavedView::class, 'saved_view_id');
    }

    public function item(): BelongsTo
    {
        return $this->belongsTo(Item::class);
    }
}
