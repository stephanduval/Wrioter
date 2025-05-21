<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 5px;
            margin-bottom: 20px;
        }
        .message-content {
            background-color: #fff;
            padding: 20px;
            border: 1px solid #dee2e6;
            border-radius: 5px;
            margin-bottom: 20px;
        }
        .button {
            display: inline-block;
            padding: 10px 20px;
            background-color: #007bff;
            color: #fff;
            text-decoration: none;
            border-radius: 5px;
            margin-top: 20px;
        }
        .footer {
            font-size: 12px;
            color: #6c757d;
            margin-top: 20px;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="header">
        <h2>New Message Received</h2>
        <p>You have received a new message from a client.</p>
    </div>

    <div class="message-content">
        <p><strong>From:</strong> {{ $sender->name }} ({{ $sender->email }})</p>
        <p><strong>Company:</strong> {{ $company->company_name }}</p>
        <p><strong>Subject:</strong> {{ $message->subject }}</p>
        <p><strong>Message:</strong></p>
        <div style="white-space: pre-wrap;">{{ $message->body }}</div>
        <p><strong>Sent at:</strong> {{ $message->created_at->format('Y-m-d H:i:s') }}</p>
    </div>

    <div style="text-align: center;">
        <a href="{{ $viewUrl }}" class="button">View Message</a>
    </div>

    <div class="footer">
        <p>This is an automated message from your system. Please do not reply directly to this email.</p>
        <p>If you need assistance, please log in to your account.</p>
    </div>
</body>
</html> 
