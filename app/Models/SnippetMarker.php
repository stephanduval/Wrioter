<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class SnippetMarker extends Model
{
    protected $fillable = [
        'snippet_reference_id',
        'marker_id',
        'position_snapshot',
    ];

    protected $casts = [
        'position_snapshot' => 'array',
    ];

    /**
     * Get the snippet reference this marker belongs to.
     */
    public function snippetReference(): BelongsTo
    {
        return $this->belongsTo(SnippetReference::class);
    }

    /**
     * Generate a new unique marker ID.
     */
    public static function generateMarkerId(): string
    {
        return Str::uuid()->toString();
    }

    /**
     * Boot the model.
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($marker) {
            if (empty($marker->marker_id)) {
                $marker->marker_id = self::generateMarkerId();
            }
        });
    }
}
