<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use App\Models\Message;

class NewMessageNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $message;

    public function __construct(Message $message)
    {
        $this->message = $message;
    }

    public function via($notifiable)
    {
        return ['mail'];
    }

    public function toMail($notifiable)
    {
        $sender = $this->message->sender;
        $company = $this->message->company;
        
        return (new MailMessage)
            ->subject('New Message: ' . $this->message->subject)
            ->greeting('New Message Received')
            ->line('A new message has been sent in the system.')
            ->line('From: ' . $sender->name . ' (' . $sender->email . ')')
            ->line('Company: ' . $company->name)
            ->line('Subject: ' . $this->message->subject)
            ->line('Message: ' . $this->message->body)
            ->line('Sent at: ' . $this->message->created_at->format('Y-m-d H:i:s'))
            ->action('View Message', url('/messages/' . $this->message->id))
            ->line('Thank you for using our system!');
    }
} 
