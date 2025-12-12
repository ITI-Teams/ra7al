<?php

namespace App\Notifications;

use Illuminate\Notifications\Notification;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Broadcasting\PrivateChannel;
use App\Models\Property;

class PropertyCreatedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $property;

    public function __construct(Property $property)
    {
        $this->property = $property;
    }

    public function via($notifiable)
    {
        return ['broadcast'];
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
        return new PrivateChannel('admin-notifications');
    }
}
