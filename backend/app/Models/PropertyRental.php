<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PropertyRental extends Model
{
    protected $fillable = [
        'property_id',
        'tenant_id',
        'owner_id',
        'start_date',
        'end_date',
        'monthly_rent',
        'security_deposit',
        'room_number',
        'status',
        'payment_method',
        'next_payment_date',
        'last_payment_date',
        'notes',
    ];
    protected $casts = [
        'termination_date' => 'date',
    ];


    public function property()
    {
        return $this->belongsTo(Property::class);
    }

    public function tenant()
    {
        return $this->belongsTo(User::class, 'tenant_id');
    }

    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_id');
    }
}
