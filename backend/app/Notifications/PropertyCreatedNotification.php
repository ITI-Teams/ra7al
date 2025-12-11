<?php

namespace App\Notifications;

use Illuminate\Notifications\Notification;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;

class PropertyCreatedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $property;

    public function __construct($property)
    {
        $this->property = $property;
    }

    public function via($notifiable)
    {
        return ['database', 'broadcast'];
    }

    public function toDatabase($notifiable)
    {
        return [
            'title' => 'New Property Created',
            'message' => "Property '{$this->property->title}' has been created",
            'property_id' => $this->property->id,
        ];
    }

    public function toBroadcast($notifiable)
    {
        return new BroadcastMessage([
            'title' => 'New Property Created',
            'message' => "Property '{$this->property->title}' has been created",
            'property_id' => $this->property->id,
        ]);
    }

    public function broadcastOn()
    {
        return ['admins-notifications']; // PUBLIC CHANNEL
    }
}
