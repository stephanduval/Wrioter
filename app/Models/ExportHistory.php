<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ExportHistory extends Model
{
    protected $table = 'export_history';

    protected $fillable = [
        'user_id',
        'manuscript_id',
        'export_type',
        'format',
        'export_settings',
        'file_path',
        'file_name',
        'file_size',
        'status',
        'error_message'
    ];

    protected $casts = [
        'export_settings' => 'array',
        'file_size' => 'integer'
    ];

    /**
     * Get the user who performed the export.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the manuscript that was exported.
     */
    public function manuscript(): BelongsTo
    {
        return $this->belongsTo(Manuscript::class);
    }

    /**
     * Scope a query to only include completed exports.
     */
    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    /**
     * Scope a query to only include failed exports.
     */
    public function scopeFailed($query)
    {
        return $query->where('status', 'failed');
    }

    /**
     * Scope a query to only include pending exports.
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope a query to only include exports of a specific type.
     */
    public function scopeOfType($query, $type)
    {
        return $query->where('export_type', $type);
    }

    /**
     * Scope a query to only include exports in a specific format.
     */
    public function scopeInFormat($query, $format)
    {
        return $query->where('format', $format);
    }

    /**
     * Check if the export was successful.
     */
    public function isSuccessful(): bool
    {
        return $this->status === 'completed';
    }

    /**
     * Check if the export failed.
     */
    public function hasFailed(): bool
    {
        return $this->status === 'failed';
    }

    /**
     * Check if the export is pending.
     */
    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    /**
     * Get the file size in a human-readable format.
     */
    public function getFormattedFileSizeAttribute(): string
    {
        if (!$this->file_size) {
            return '0 B';
        }

        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        $size = $this->file_size;
        $unit = 0;

        while ($size >= 1024 && $unit < count($units) - 1) {
            $size /= 1024;
            $unit++;
        }

        return round($size, 2) . ' ' . $units[$unit];
    }
} 
