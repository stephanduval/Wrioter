<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class ExportConfiguration extends Model
{
    protected $fillable = [
        'manuscript_id',
        'user_id',
        'format',
        'format_settings',
        'export_metadata',
        'compilation_status',
        'last_compiled_at'
    ];

    protected $casts = [
        'format_settings' => 'array',
        'export_metadata' => 'array',
        'last_compiled_at' => 'datetime'
    ];

    public function manuscript(): BelongsTo
    {
        return $this->belongsTo(Manuscript::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function items(): BelongsToMany
    {
        return $this->belongsToMany(Item::class, 'export_item_settings')
            ->withPivot(['order', 'page_break_before', 'page_break_after', 'page_number_style',
                        'start_new_section', 'section_style', 'page_settings', 'export_metadata'])
            ->withTimestamps();
    }

    public function getCompilationStatusAttribute($value)
    {
        return match($value) {
            'pending' => 'Pending',
            'processing' => 'Processing',
            'completed' => 'Completed',
            'failed' => 'Failed',
            default => 'Unknown'
        };
    }

    public function setCompilationStatusAttribute($value)
    {
        $this->attributes['compilation_status'] = strtolower($value);
    }
} 
