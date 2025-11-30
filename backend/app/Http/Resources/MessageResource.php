<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MessageResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'subject' => $this->subject,
            'body' => $this->message,
            'priority' => $this->priority,
            'is_read' => $this->is_read,
            'read_at' => $this->read_at,
            
            'sender' => [
                'name' => $this->name,
                'email' => $this->email,
            ],

            'created_at' => $this->created_at->format('Y-m-d H:i'),
        ];
    }
}
