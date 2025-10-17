<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WritingHistory extends Model
{
    protected $table = 'writing_history';

    protected $fillable = [
        'user_id',
        'manuscript_id',
        'date',
        'draft_word_count',
        'draft_char_count',
        'other_word_count',
        'other_char_count',
        'session_word_count',
        'session_char_count',
        'total_word_count',
        'total_char_count',
        'active_manuscripts'
    ];

    protected $casts = [
        'date' => 'date',
        'draft_word_count' => 'integer',
        'draft_char_count' => 'integer',
        'other_word_count' => 'integer',
        'other_char_count' => 'integer',
        'session_word_count' => 'integer',
        'session_char_count' => 'integer',
        'total_word_count' => 'integer',
        'total_char_count' => 'integer',
        'active_manuscripts' => 'integer'
    ];

    /**
     * Get the user that owns the writing history.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the manuscript associated with this history entry.
     */
    public function manuscript(): BelongsTo
    {
        return $this->belongsTo(Manuscript::class);
    }

    /**
     * Scope a query to only include entries for a specific date range.
     */
    public function scopeDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('date', [$startDate, $endDate]);
    }

    /**
     * Scope a query to only include manuscript-specific entries.
     */
    public function scopeManuscriptSpecific($query)
    {
        return $query->whereNotNull('manuscript_id');
    }

    /**
     * Scope a query to only include user-level entries.
     */
    public function scopeUserLevel($query)
    {
        return $query->whereNull('manuscript_id');
    }

    /**
     * Get the total word count for this entry.
     */
    public function getTotalWordsAttribute(): int
    {
        return $this->draft_word_count + $this->other_word_count;
    }

    /**
     * Get the total character count for this entry.
     */
    public function getTotalCharactersAttribute(): int
    {
        return $this->draft_char_count + $this->other_char_count;
    }
} 
