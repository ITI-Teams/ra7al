<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PropertyRental extends Model
{
    use HasFactory;

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
        'start_date' => 'date',
        'end_date' => 'date',
        'monthly_rent' => 'decimal:2',
        'security_deposit' => 'decimal:2',
        'next_payment_date' => 'date',
        'last_payment_date' => 'date',
    ];

    /**
     * Get the property
     */
    public function property()
    {
        return $this->belongsTo(Property::class);
    }

    /**
     * Get the tenant
     */
    public function tenant()
    {
        return $this->belongsTo(User::class, 'tenant_id');
    }

    /**
     * Get the owner
     */
    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    /**
     * Scope: Active rentals only
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Check if rental is currently active
     */
    public function isActive(): bool
    {
        return $this->status === 'active'
            && (!$this->end_date || $this->end_date->isFuture());
    }
}
