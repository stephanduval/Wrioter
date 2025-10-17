<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;

class NotificationRecipient extends Model
{
    use Notifiable;

    protected $fillable = [
        'email',
        'name',
        'is_active'
    ];

    protected $casts = [
        'is_active' => 'boolean'
    ];

    public function routeNotificationForMail()
    {
        return $this->email;
    }
} 
