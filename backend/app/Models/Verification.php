<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Verification extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'property_id',
        'document_type',
        'document_path',
        'document_number',
        'issue_date',
        'expiry_date',
        'status',
        'rejection_reason',
        'verified_by',
        'verified_at',
        // Contract fields
        'tenant_id',
        'landlord_id',
        'contract_start_date',
        'contract_end_date',
        'contract_amount',
    ];

    protected function casts(): array
    {
        return [
            'issue_date' => 'date',
            'expiry_date' => 'date',
            'verified_at' => 'datetime',
            'contract_start_date' => 'date',
            'contract_end_date' => 'date',
            'contract_amount' => 'decimal:2',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function property()
    {
        return $this->belongsTo(Property::class);
    }

    public function verifiedBy()
    {
        return $this->belongsTo(User::class, 'verified_by');
    }

    public function tenant()
    {
        return $this->belongsTo(User::class, 'tenant_id');
    }

    public function landlord()
    {
        return $this->belongsTo(User::class, 'landlord_id');
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

    public function scopeContracts($query)
    {
        return $query->where('document_type', 'contract');
    }

    // Helper methods
    public function isExpired(): bool
    {
        return $this->expiry_date && $this->expiry_date->isPast();
    }

    public function approve(User $admin)
    {
        $this->update([
            'status' => 'approved',
            'verified_by' => $admin->id,
            'verified_at' => now(),
        ]);
    }

    public function reject(User $admin, string $reason)
    {
        $this->update([
            'status' => 'rejected',
            'verified_by' => $admin->id,
            'verified_at' => now(),
            'rejection_reason' => $reason,
        ]);
    }
}
