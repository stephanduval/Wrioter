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
        $projectData = $this->message->project_data;
        $attachments = $this->message->attachments;
        
        $mailMessage = (new MailMessage)
            ->subject('New Message: ' . $this->message->subject)
            ->greeting('New Message Received')
            ->line('A new message has been sent in the system.')
            ->line('From: ' . $sender->name . ' (' . $sender->email . ')')
            ->line('Company: ' . $company->company_name)
            ->line('Subject: ' . $this->message->subject)
            ->line('Message: ' . $this->message->body)
            ->line('Sent at: ' . $this->message->created_at->format('Y-m-d H:i:s'));

        // Add project data if it exists
        if ($projectData) {
            $mailMessage->line('Project Details:')
                ->line('Title: ' . ($projectData['title'] ?? 'N/A'))
                ->line('Property: ' . ($projectData['property'] ?? 'N/A'))
                ->line('Service Type: ' . ($projectData['service_type'] ?? 'N/A'))
                ->line('Time Preference: ' . ($projectData['time_preference'] ?? 'N/A'))
                ->line('Service Description: ' . ($projectData['service_description'] ?? 'N/A'))
                ->line('Due Date: ' . ($projectData['deadline'] ? date('Y-m-d', strtotime($projectData['deadline'])) : 'N/A'))
                ->line('Latest Completion Date: ' . ($projectData['latest_completion_date'] ? date('Y-m-d', strtotime($projectData['latest_completion_date'])) : 'N/A'));
        }

        // Add attachments if they exist
        if ($attachments && count($attachments) > 0) {
            $mailMessage->line('Attachments:');
            foreach ($attachments as $attachment) {
                $mailMessage->line('- ' . $attachment['name'] . ' (' . $this->formatFileSize($attachment['size']) . ')');
            }
        }

        return $mailMessage
            ->action('View Message', url('/messages/' . $this->message->id))
            ->line('Thank you for using our system!');
    }

    /**
     * Format file size in human readable format
     */
    private function formatFileSize($bytes)
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        $bytes = max($bytes, 0);
        $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
        $pow = min($pow, count($units) - 1);
        $bytes /= pow(1024, $pow);
        return round($bytes, 2) . ' ' . $units[$pow];
    }
} 
