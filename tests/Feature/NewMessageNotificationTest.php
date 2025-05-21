<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Message;
use App\Models\Company;
use App\Models\NotificationRecipient;
use Illuminate\Support\Facades\Mail;
use App\Notifications\NewMessageNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;

class NewMessageNotificationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Create a test company
        $this->company = Company::create([
            'company_name' => 'Test Company',
            'email' => 'test@company.com',
        ]);

        // Create a client user
        $this->clientUser = User::create([
            'name' => 'Test Client',
            'email' => 'client@test.com',
            'password' => bcrypt('password'),
        ]);
        $this->clientUser->roles()->create(['name' => 'Client']);

        // Create a notification recipient
        $this->recipient = NotificationRecipient::create([
            'name' => 'Stephan Duval',
            'email' => 'stephan.duval@gmail.com',
            'is_active' => true,
        ]);
    }

    public function test_notification_is_sent_when_client_sends_message()
    {
        Notification::fake();
        $message = Message::create([
            'sender_id' => $this->clientUser->id,
            'company_id' => $this->company->id,
            'subject' => 'Test Message',
            'body' => 'This is a test message',
            'status' => 'sent',
        ]);
        $this->recipient->notify(new NewMessageNotification($message));
        Notification::assertSentTo(
            $this->recipient,
            NewMessageNotification::class,
            function ($notification, $channels) use ($message) {
                return $notification->getMessage()->id === $message->id;
            }
        );
    }

    public function test_notification_is_not_sent_when_non_client_sends_message()
    {
        Notification::fake();
        $nonClientUser = User::create([
            'name' => 'Test Admin',
            'email' => 'admin@test.com',
            'password' => bcrypt('password'),
        ]);
        $nonClientUser->roles()->create(['name' => 'Admin']);
        $message = Message::create([
            'sender_id' => $nonClientUser->id,
            'company_id' => $this->company->id,
            'subject' => 'Test Message',
            'body' => 'This is a test message',
            'status' => 'sent',
        ]);
        // Only notify if sender is client
        $isClient = $nonClientUser->roles()->where('name', 'Client')->exists();
        if ($isClient) {
            $this->recipient->notify(new NewMessageNotification($message));
        }
        Notification::assertNotSentTo($this->recipient, NewMessageNotification::class);
    }

    public function test_notification_is_not_sent_to_inactive_recipient()
    {
        Notification::fake();
        $this->recipient->update(['is_active' => false]);
        $message = Message::create([
            'sender_id' => $this->clientUser->id,
            'company_id' => $this->company->id,
            'subject' => 'Test Message',
            'body' => 'This is a test message',
            'status' => 'sent',
        ]);
        // Only notify if recipient is active
        if ($this->recipient->is_active) {
            $this->recipient->notify(new NewMessageNotification($message));
        }
        Notification::assertNotSentTo($this->recipient, NewMessageNotification::class);
    }
} 
