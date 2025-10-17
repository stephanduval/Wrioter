@component('mail::message')
# Reset Your Password

Hello {{ $user->name }},

We received a request to reset the password for your account. Click the button below to reset your password.

@component('mail::button', ['url' => $url, 'color' => 'primary'])
Reset Password
@endcomponent

This password reset link will expire in {{ $expiryMinutes }} minutes.

If you did not request a password reset, please ignore this email or contact our support team if you have any concerns.

Thanks,<br>
{{ config('app.name') }} Team

@component('mail::subcopy')
If you're having trouble clicking the "Reset Password" button, copy and paste the URL below into your web browser:
<span class="break-all">{{ $url }}</span>
@endcomponent
@endcomponent 
