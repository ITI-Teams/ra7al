<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PropertyResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'price' => $this->price,
            'city' => $this->city?->name,
            'area' => $this->area?->name,
            'beds' => $this->beds,
            'bathrooms_count' => $this->bathrooms_count,
            'rating' => $this->rating,
            'is_featured' => $this->is_featured,

            'image' => $this->primaryImage?->url ?? null,
        ];
    }
}
