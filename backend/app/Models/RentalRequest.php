<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RentalRequest extends Model
{
    protected $fillable = [
        'property_id',
        'user_id',
        'desired_start_date',
        'duration_months',
        'message',
        'status',
        'owner_response',
        'responded_at',
    ];
    protected $casts = [
        'desired_start_date' => 'date',
    ];

    public function property()
    {
        return $this->belongsTo(Property::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
