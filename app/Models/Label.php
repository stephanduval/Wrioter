<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Label extends Model
{
    use HasFactory;

    protected $fillable = ['label_name', 'user_id', 'colour'];

    public function messages()
    {
        return $this->belongsToMany(Message::class, 'message_labels');
    }
}
