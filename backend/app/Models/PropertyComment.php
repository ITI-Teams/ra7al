<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class PropertyComment extends Model
{
    use HasFactory;

    protected $fillable = [
        'property_id',
        'user_id',
        'rating',
        'comment',
    ];

    protected function casts(): array
    {
        return [
            'rating' => 'integer',
        ];
    }

    /**
     * Get the property this comment belongs to.
     */
    public function property()
    {
        return $this->belongsTo(Property::class, 'property_id');
    }

    /**
     * Get the user who wrote this comment.
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
