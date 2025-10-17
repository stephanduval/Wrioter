<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ManuscriptRawFile extends Model
{
    use HasFactory;

    protected $fillable = [
        'manuscript_id',
        'file_type',
        'file_name',
        'file_content',
        'file_size',
        'scrivener_path',
        'metadata',
    ];

    protected $casts = [
        'metadata' => 'array',
    ];

    /**
     * Get the manuscript that owns the raw file.
     */
    public function manuscript(): BelongsTo
    {
        return $this->belongsTo(Manuscript::class);
    }
}
