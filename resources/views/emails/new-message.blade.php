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
        .section {
            margin-bottom: 20px;
            padding-bottom: 20px;
            border-bottom: 1px solid #eee;
        }
        .section:last-child {
            border-bottom: none;
            margin-bottom: 0;
            padding-bottom: 0;
        }
        .section-title {
            color: #1976D2;
            font-size: 1.1em;
            font-weight: bold;
            margin-bottom: 10px;
        }
        .field {
            margin-bottom: 8px;
        }
        .field-label {
            font-weight: bold;
            color: #666;
        }
        .field-value {
            color: #333;
        }
        .attachments {
            background-color: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            margin-top: 15px;
        }
        .attachment-item {
            display: flex;
            align-items: center;
            margin-bottom: 5px;
        }
        .attachment-icon {
            margin-right: 8px;
            color: #666;
        }
        .button {
            display: inline-block;
            padding: 12px 24px;
            background-color: #1976D2;
            color: #fff !important;
            text-decoration: none;
            border-radius: 5px;
            margin-top: 20px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .button:hover {
            background-color: #1565C0;
            text-decoration: none;
        }
        .footer {
            font-size: 12px;
            color: #6c757d;
            margin-top: 20px;
            text-align: center;
            padding-top: 20px;
            border-top: 1px solid #dee2e6;
        }
    </style>
</head>
<body>
    <div class="header">
        <h2>New Message Received</h2>
        <p>You have received a new message from a client.</p>
    </div>

    <div class="message-content">
        <!-- Sender Information -->
        <div class="section">
            <div class="section-title">Sender Information</div>
            <div class="field">
                <span class="field-label">From:</span>
                <span class="field-value">{{ $sender->name }} ({{ $sender->email }})</span>
            </div>
            <div class="field">
                <span class="field-label">Company:</span>
                <span class="field-value">{{ $company->company_name }}</span>
            </div>
            <div class="field">
                <span class="field-label">Sent at:</span>
                <span class="field-value">{{ $message->created_at->format('Y-m-d H:i:s') }}</span>
            </div>
        </div>

        <!-- Message Details -->
        <div class="section">
            <div class="section-title">Message Details</div>
            <div class="field">
                <span class="field-label">Subject:</span>
                <span class="field-value">{{ $message->subject }}</span>
            </div>
            <div class="field">
                <span class="field-label">Message:</span>
                <div class="field-value" style="white-space: pre-wrap; margin-top: 8px;">{{ $message->body }}</div>
            </div>
        </div>

        @if($message->project_data)
        <!-- Project Details -->
        <div class="section">
            <div class="section-title">Project Details</div>
            <div class="field">
                <span class="field-label">Title:</span>
                <span class="field-value">{{ $message->project_data['title'] ?? 'N/A' }}</span>
            </div>
            <div class="field">
                <span class="field-label">Property:</span>
                <span class="field-value">{{ $message->project_data['property'] ?? 'N/A' }}</span>
            </div>
            <div class="field">
                <span class="field-label">Service Type:</span>
                <span class="field-value">{{ $message->project_data['service_type'] ?? 'N/A' }}</span>
            </div>
            <div class="field">
                <span class="field-label">Time Preference:</span>
                <span class="field-value">{{ $message->project_data['time_preference'] ?? 'N/A' }}</span>
            </div>
            @if($message->project_data['service_description'])
            <div class="field">
                <span class="field-label">Service Description:</span>
                <div class="field-value" style="white-space: pre-wrap; margin-top: 8px;">{{ $message->project_data['service_description'] }}</div>
            </div>
            @endif
            <div class="field">
                <span class="field-label">Due Date:</span>
                <span class="field-value">{{ $message->project_data['deadline'] ? date('Y-m-d', strtotime($message->project_data['deadline'])) : 'N/A' }}</span>
            </div>
            <div class="field">
                <span class="field-label">Latest Completion Date:</span>
                <span class="field-value">{{ $message->project_data['latest_completion_date'] ? date('Y-m-d', strtotime($message->project_data['latest_completion_date'])) : 'N/A' }}</span>
            </div>
        </div>
        @endif

        @if($message->attachments && count($message->attachments) > 0)
        <!-- Attachments -->
        <div class="section">
            <div class="section-title">Attachments</div>
            <div class="attachments">
                @foreach($message->attachments as $attachment)
                <div class="attachment-item">
                    <span class="attachment-icon">📎</span>
                    <span class="field-value">{{ $attachment['name'] }} ({{ \App\Notifications\NewMessageNotification::formatFileSize($attachment['size']) }})</span>
                </div>
                @endforeach
            </div>
        </div>
        @endif
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
