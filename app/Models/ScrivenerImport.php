<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ScrivenerImport extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'filename',
        'status',
        'storage_path',
        'manuscript_id',
        'error_message',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function manuscript()
    {
        return $this->belongsTo(Manuscript::class);
    }
} 
