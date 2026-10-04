<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MindmapSavedView extends Model
{
    use HasFactory;

    protected $fillable = [
        'mindmap_id',
        'user_id',
        'name',
        'description',
        'is_default',
        'settings',
    ];

    protected $casts = [
        'settings' => 'array',
        'is_default' => 'boolean',
    ];

    public function mindmap(): BelongsTo
    {
        return $this->belongsTo(WritingMindmap::class, 'mindmap_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function positions(): HasMany
    {
        return $this->hasMany(MindmapViewPosition::class, 'saved_view_id');
    }
}
