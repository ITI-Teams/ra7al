<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;

class PropertyUpdatedNotification extends Notification implements ShouldQueue
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
            'title' => 'Property updated',
            'message' => "Property '{$this->property->title}' was updated.",
            'property_id' => $this->property->id,
        ];
    }

    // What goes to Pusher
    public function toBroadcast(object $notifiable): array
    {
        return [
            'title' => 'Property Updated',
            'message' => "Property '{$this->property->title}' was updated.",
            'property_id' => $this->property->id,
        ];
    }
    public function broadcastOn()
    {
        return new PrivateChannel('admin-notifications');
    }
}
