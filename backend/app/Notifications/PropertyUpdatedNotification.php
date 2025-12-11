<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class PropertyCreatedNotification extends Notification
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
}
