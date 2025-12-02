<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class RecommendationQuestion extends Model
{
    use HasFactory;

    protected $fillable = [
        'question',
        'question_type',
        'options',
        'category',
        'weight',
        'order',
        'maps_to_field',
        'maps_to_table',
        'is_active',
        'is_required',
        'ai_hints',
    ];

    protected function casts(): array
    {
        return [
            'options' => 'array',
            'weight' => 'integer',
            'order' => 'integer',
            'is_active' => 'boolean',
            'is_required' => 'boolean',
            'ai_hints' => 'array',
        ];
    }

    public function responses()
    {
        return $this->hasMany(UserRecommendationResponse::class, 'question_id');
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeByCategory($query, $category)
    {
        return $query->where('category', $category);
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('order');
    }

    public function scopeRequired($query)
    {
        return $query->where('is_required', true);
    }
}
