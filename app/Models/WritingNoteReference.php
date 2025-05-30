<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WritingNoteReference extends Model
{
    protected $fillable = [
        'note_id',
        'item_id',
        'reference_position',
        'reference_text'
    ];

    protected $casts = [
        'reference_position' => 'array'
    ];

    /**
     * Get the note that owns the reference.
     */
    public function note(): BelongsTo
    {
        return $this->belongsTo(WritingNote::class, 'note_id');
    }

    /**
     * Get the item where the reference appears.
     */
    public function item(): BelongsTo
    {
        return $this->belongsTo(Item::class);
    }
} 
