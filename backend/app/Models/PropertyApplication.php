<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class PropertyApplication extends Model
{
    use HasFactory;

    protected $fillable = [
        'property_id',
        'student_id',
        'move_in_date',
        'lease_duration_months',
        'message_to_owner',
        'emergency_contact_name',
        'emergency_contact_phone',
        'emergency_contact_relationship',
        'employment_status',
        'monthly_income',
        'has_guarantor',
        'guarantor_name',
        'guarantor_phone',
        'previous_landlord_name',
        'previous_landlord_phone',
        'previous_address',
        'status',
        'owner_notes',
        'rejection_reason',
        'reviewed_at',
        'approved_at',
        'expires_at',
    ];

    protected function casts(): array
    {
        return [
            'move_in_date' => 'date',
            'lease_duration_months' => 'integer',
            'monthly_income' => 'decimal:2',
            'has_guarantor' => 'boolean',
            'reviewed_at' => 'datetime',
            'approved_at' => 'datetime',
            'expires_at' => 'datetime',
        ];
    }

    public function property()
    {
        return $this->belongsTo(Property::class);
    }

    public function student()
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    public function owner()
    {
        return $this->property->owner();
    }

    // Scopes
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    public function scopeForProperty($query, $propertyId)
    {
        return $query->where('property_id', $propertyId);
    }

    public function scopeForStudent($query, $studentId)
    {
        return $query->where('student_id', $studentId);
    }

    // Helper methods
    public function approve()
    {
        $this->update([
            'status' => 'approved',
            'approved_at' => now(),
            'reviewed_at' => now(),
        ]);
    }

    public function reject(string $reason)
    {
        $this->update([
            'status' => 'rejected',
            'rejection_reason' => $reason,
            'reviewed_at' => now(),
        ]);
    }

    public function withdraw()
    {
        $this->update(['status' => 'withdrawn']);
    }

    public function isExpired(): bool
    {
        return $this->expires_at && $this->expires_at->isPast();
    }

    public function isPending(): bool
    {
        return $this->status === 'pending' || $this->status === 'under_review';
    }
}
