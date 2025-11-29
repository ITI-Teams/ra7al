<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class UserRecommendationResponse extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'question_id',
        'response',
        'session_id',
        'completed_at',
    ];

    protected function casts(): array
    {
        return [
            'response' => 'array',
            'completed_at' => 'datetime',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function question()
    {
        return $this->belongsTo(RecommendationQuestion::class, 'question_id');
    }

    // Scopes
    public function scopeForUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeForSession($query, $sessionId)
    {
        return $query->where('session_id', $sessionId);
    }

    public function scopeCompleted($query)
    {
        return $query->whereNotNull('completed_at');
    }
}
