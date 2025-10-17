<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class WritingNote extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'item_id',
        'type',
        'marker_position',
        'content',
        'marker_text',
        'order',
        'metadata',
        'is_resolved',
        'resolved_at'
    ];

    protected $casts = [
        'marker_position' => 'array',
        'metadata' => 'array',
        'is_resolved' => 'boolean',
        'resolved_at' => 'datetime'
    ];

    /**
     * Get the item that owns the note.
     */
    public function item(): BelongsTo
    {
        return $this->belongsTo(Item::class);
    }

    /**
     * Get the references for this note.
     */
    public function references(): HasMany
    {
        return $this->hasMany(WritingNoteReference::class, 'note_id');
    }

    /**
     * Scope a query to only include footnotes.
     */
    public function scopeFootnotes($query)
    {
        return $query->where('type', 'footnote');
    }

    /**
     * Scope a query to only include endnotes.
     */
    public function scopeEndnotes($query)
    {
        return $query->where('type', 'endnote');
    }

    /**
     * Scope a query to only include resolved notes.
     */
    public function scopeResolved($query)
    {
        return $query->where('is_resolved', true);
    }

    /**
     * Scope a query to only include unresolved notes.
     */
    public function scopeUnresolved($query)
    {
        return $query->where('is_resolved', false);
    }

    /**
     * Mark the note as resolved.
     */
    public function resolve(): void
    {
        $this->update([
            'is_resolved' => true,
            'resolved_at' => now()
        ]);
    }

    /**
     * Mark the note as unresolved.
     */
    public function unresolve(): void
    {
        $this->update([
            'is_resolved' => false,
            'resolved_at' => null
        ]);
    }
} 
