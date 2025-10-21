<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>New Message Alert</title>
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
        .button {
            display: inline-block;
            padding: 10px 20px;
            background-color: #1976D2;
            color: #FFFFFF !important;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            border: none;
        }
        .button:hover, .button:visited, .button:active {
            color: #FFFFFF !important;
            text-decoration: none;
        }
        .footer {
            margin-top: 30px;
            font-size: 0.9em;
            color: #666;
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
    </style>
</head>
<body>
    <div class="header">
        <h2>New Message Alert</h2>
        <p>A new message has been sent to info@freynet-gagne.com from the Freynet-Gagne web portal.</p>
    </div>

    <div class="message-content">
        <div class="section">
            <div class="section-title">Message Details</div>
            <div class="field">
                <span class="field-label">From:</span>
                <span class="field-value">
                    @if(isset($msg->sender))
                        {{ $msg->sender->name ?? 'Unknown Sender' }} ({{ $msg->sender->email ?? 'unknown@example.com' }})
                    @else
                        Unknown Sender
                    @endif
                </span>
            </div>
            <div class="field">
                <span class="field-label">Company:</span>
                <span class="field-value">
                    @if(isset($msg->company))
                        {{ $msg->company->company_name ?? 'Unknown Company' }}
                    @else
                        Unknown Company
                    @endif
                </span>
            </div>
            <div class="field">
                <span class="field-label">Subject:</span>
                <span class="field-value">{{ $msg->subject ?? 'No Subject' }}</span>
            </div>
            <div class="field">
                <span class="field-label">Message:</span>
                <div class="field-value" style="white-space: pre-wrap; margin-top: 8px;">{!! $msg->body ?? 'No Message Content' !!}</div>
            </div>
            @if(!empty($msg->due_date))
            <div class="field">
                <span class="field-label">Due Date:</span>
                <span class="field-value">{{ $msg->due_date }}</span>
            </div>
            @endif
            <div class="field">
                <span class="field-label">Sent at:</span>
                <span class="field-value">{{ $msg->created_at->format('Y-m-d H:i:s') }}</span>
            </div>
        </div>

        @if(!empty($msg->project_data))
        <div class="section">
            <div class="section-title">Project Information</div>
            @if(!empty($msg->project_data['title']))
            <div class="field">
                <span class="field-label">Project Title:</span>
                <span class="field-value">{{ $msg->project_data['title'] }}</span>
            </div>
            @endif
            @if(!empty($msg->project_data['property']))
            <div class="field">
                <span class="field-label">Property:</span>
                <span class="field-value">{{ $msg->project_data['property'] }}</span>
            </div>
            @endif
            @if(!empty($msg->project_data['service_type']))
            <div class="field">
                <span class="field-label">Service Type:</span>
                <span class="field-value">{{ $msg->project_data['service_type'] }}</span>
            </div>
            @endif
            @if(!empty($msg->project_data['service_description']))
            <div class="field">
                <span class="field-label">Service Description:</span>
                <span class="field-value">{{ $msg->project_data['service_description'] }}</span>
            </div>
            @endif
            @if(!empty($msg->project_data['deadline']))
            <div class="field">
                <span class="field-label">Project Deadline:</span>
                <span class="field-value">{{ $msg->project_data['deadline'] }}</span>
            </div>
            @endif
            @if(!empty($msg->project_data['latest_completion_date']))
            <div class="field">
                <span class="field-label">Latest Completion Date:</span>
                <span class="field-value">{{ $msg->project_data['latest_completion_date'] }}</span>
            </div>
            @endif
            @if(!empty($msg->project_data['time_preference']))
            <div class="field">
                <span class="field-label">Time Preference:</span>
                <span class="field-value">{{ $msg->project_data['time_preference'] }}</span>
            </div>
            @endif
        </div>
        @endif

        @if($msg->attachments && count($msg->attachments) > 0)
        <div class="section">
            <div class="section-title">Attachments</div>
            <div class="attachments">
                @foreach($msg->attachments as $attachment)
                <div class="attachment-item">
                    <span class="attachment-icon">📎</span>
                    <span>{{ $attachment->original_name ?? $attachment->filename ?? 'Attachment' }}
                        @if(isset($attachment->size))
                            ({{ number_format($attachment->size / 1024, 2) }} KB)
                        @endif
                    </span>
                </div>
                @endforeach
            </div>
        </div>
        @endif
    </div>

    <a href="{{ config('app.url') }}/login" class="button">Log in to Portal</a>

    <div class="footer">
        <p>This is an automated message from the Freynet-Gagne web portal.</p>
        <p>If you did not expect this message, please ignore it.</p>
    </div>
</body>
</html> 
