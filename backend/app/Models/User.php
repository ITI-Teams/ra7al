<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;




class User extends Authenticatable
{
    use HasFactory, Notifiable, HasApiTokens, SoftDeletes, HasRoles;

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'phone',
        'avatar',
        'last_login',
    ];

    /**
     * The attributes that should be hidden for serialization.
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'last_login' => 'datetime',
            'password' => 'hashed',
            'deleted_at' => 'datetime',
        ];
    }

    /**
     * Get all properties owned by this user (landlord).
     */
    public function properties()
    {
        return $this->hasMany(Property::class, 'user_id');
    }

    /**
     * Get all properties saved/favorited by this user.
     */
    public function savedProperties()
    {
        return $this->belongsToMany(Property::class, 'saved_properties')
            ->withTimestamps();
    }

    /**
     * Get all comments/reviews made by this user.
     */
    public function comments()
    {
        return $this->hasMany(PropertyComment::class, 'user_id');
    }

    /**
     * Check if user is an admin.
     */
    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    /**
     * Check if user is a landlord.
     */
    public function isLandlord(): bool
    {
        return $this->role === 'landlord';
    }

    /**
     * Check if user is a student/tenant.
     */
    public function isStudent(): bool
    {
        return $this->role === 'student' || $this->role === 'tenant';
    }

    /**
     * Update last login timestamp.
     */
    public function updateLastLogin(): void
    {
        $this->update(['last_login' => now()]);
    }

    /**
     * Get the user's profile.
     */
    public function profile()
    {
        return $this->hasOne(UserProfile::class);
    }

    /**
     * Get all verifications submitted by this user.
     */
    public function verifications()
    {
        return $this->hasMany(Verification::class);
    }

    /**
     * Get verifications where this user is the admin who verified.
     */
    public function verificationsApproved()
    {
        return $this->hasMany(Verification::class, 'verified_by');
    }

    /**
     * Get all property applications submitted by this student.
     */
    public function applications()
    {
        return $this->hasMany(PropertyApplication::class, 'student_id');
    }

    /**
     * Get contracts where this user is the tenant.
     */
    public function contractsAsTenant()
    {
        return $this->hasMany(Verification::class, 'tenant_id')
            ->where('document_type', 'contract');
    }

    /**
     * Get contracts where this user is the landlord.
     */
    public function contractsAsLandlord()
    {
        return $this->hasMany(Verification::class, 'landlord_id')
            ->where('document_type', 'contract');
    }

    /**
     * Get recommendation responses by this user.
     */
    public function recommendationResponses()
    {
        return $this->hasMany(UserRecommendationResponse::class);
    }

    /**
     * Check if user has completed the recommendation questionnaire.
     */
    public function hasCompletedQuestionnaire(?string $sessionId = null): bool
    {
        $query = $this->recommendationResponses()->whereNotNull('completed_at');

        if ($sessionId) {
            $query->where('session_id', $sessionId);
        }

        return $query->exists();
    }

    /**
     * Check if user profile is verified.
     */
    public function isVerified(): bool
    {
        return $this->profile && $this->profile->is_verified;
    }
}
