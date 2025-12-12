<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Broadcasting\PrivateChannel;

class PropertyApprovedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public $property) {}

    // Channels
    public function via(object $notifiable): array
    {
        return ['database', 'broadcast'];
    }

    // What goes into notifications.data (JSON)
    public function toDatabase(object $notifiable): array
    {
        return [
            'title' => ' Property approved',
            'message' => "Property '{$this->property->title}' was approved.",
            'property_id' => $this->property->id,
        ];
    }

    // What goes to Pusher
    public function toBroadcast(object $notifiable): array
    {
        return [
            'title' => 'Property Approved',
            'message' => "Property '{$this->property->title}' was Approved.",
            'property_id' => $this->property->id,
        ];
    }
    public function broadcastOn()
    {
        return new PrivateChannel('owner-notifications');
    }
}
