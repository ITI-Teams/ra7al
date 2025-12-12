<?php

namespace App\Services;

use Illuminate\Support\Facades\Notification;

class NotificationService
{
    public static function sendToUser($user, $notification)
    {
        $user->notify($notification);
    }

    public static function sendToMany($users, $notification)
    {
        Notification::send($users, $notification);
    }
}
