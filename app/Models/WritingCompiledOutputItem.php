<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WritingCompiledOutputItem extends Model
{
    protected $fillable = [
        'compiled_output_id',
        'writing_item_id',
        'order',
        'export_metadata',
        'start_new_page',
        'include_title',
        'custom_title',
        'page_break_before',
        'page_break_after',
        'page_number_style',
        'start_new_section',
        'section_style',
        'page_settings'
    ];

    protected $casts = [
        'export_metadata' => 'array',
        'start_new_page' => 'boolean',
        'include_title' => 'boolean',
        'page_break_before' => 'boolean',
        'page_break_after' => 'boolean',
        'start_new_section' => 'boolean',
        'page_settings' => 'array'
    ];

    /**
     * Get the compiled output that owns the item.
     */
    public function compiledOutput(): BelongsTo
    {
        return $this->belongsTo(WritingCompiledOutput::class, 'compiled_output_id');
    }

    /**
     * Get the writing item.
     */
    public function writingItem(): BelongsTo
    {
        return $this->belongsTo(Item::class, 'writing_item_id');
    }

    /**
     * Scope a query to only include items that start a new page.
     */
    public function scopeStartsNewPage($query)
    {
        return $query->where('start_new_page', true);
    }

    /**
     * Scope a query to only include items that start a new section.
     */
    public function scopeStartsNewSection($query)
    {
        return $query->where('start_new_section', true);
    }

    /**
     * Get the page settings with defaults.
     */
    public function getPageSettingsWithDefaults(): array
    {
        $defaults = [
            'margins' => [
                'top' => '1in',
                'right' => '1in',
                'bottom' => '1in',
                'left' => '1in'
            ],
            'orientation' => 'portrait',
            'paper_size' => 'letter',
            'header' => null,
            'footer' => null
        ];

        return array_merge($defaults, $this->page_settings ?? []);
    }
} 
