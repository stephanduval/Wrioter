<?php

namespace App\Notifications;

use Illuminate\Auth\Notifications\ResetPassword as BaseResetPassword;
use Illuminate\Notifications\Messages\MailMessage;

class CustomResetPassword extends BaseResetPassword
{
    /**
     * Build the mail representation of the notification.
     *
     * @param  mixed  $notifiable
     * @return \Illuminate\Notifications\Messages\MailMessage
     */
    public function toMail($notifiable)
    {
        $url = config('app.frontend_url') . '/reset-password?token=' . $this->token . '&email=' . urlencode($notifiable->email);
        $expiryMinutes = config('auth.passwords.'.config('auth.defaults.passwords').'.expire');

        return (new MailMessage)
            ->subject('Reset Your Password - ' . config('app.name'))
            ->greeting('Hello ' . $notifiable->name . ',')
            ->line('We received a request to reset the password for your account.')
            ->action('Reset Password', $url)
            ->line('This password reset link will expire in ' . $expiryMinutes . ' minutes.')
            ->line('If you don\'t see this email in your inbox, please check your spam folder.')
            ->line('If you did not request a password reset, please ignore this email or contact support if you have concerns.')
            ->salutation('Best regards, ' . config('app.name') . ' Team')
            ->line('If the button above doesn\'t work, you can copy and paste this link into your browser: ' . $url);
    }
} 
