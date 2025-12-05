<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Property extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'owner_id',
        'city_id',
        'area_id',
        'title',
        'description',
        'price',
        'address',
        'gender_requirement',
        'smoking_allowed',
        'pets_allowed',
        'total_rooms',
        'available_rooms',
        'bathrooms_count',
        'beds',
        'available_spots',
        'size',
        'accommodation_type',
        'university_id',
        'available_from',
        'available_to',
        'status',
        'contact_phone',
        'contact_email',
        'is_negotiable',
        'minimum_stay_months',
        'security_deposit',
        'payment_methods',
        'furnished',
        'views_count',
        'is_featured',
        'is_verified',
        'rating',
        'reviews_count',
        'latitude',
        'longitude',
        'street',
        'building_number',
        'apartment_number'
    ];

    /**
     * Get the attributes that should be cast.
     */
    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'smoking_allowed' => 'boolean',
            'pets_allowed' => 'boolean',
            'furnished' => 'boolean',
            'is_negotiable' => 'boolean',
            'is_featured' => 'boolean',
            'is_verified' => 'boolean',
            'available_from' => 'date',
            'available_to' => 'date',
            'security_deposit' => 'decimal:2',
            'size' => 'integer',
            'total_rooms' => 'integer',
            'available_rooms' => 'integer',
            'bathrooms_count' => 'integer',
            'beds' => 'integer',
            'available_spots' => 'integer',
            'minimum_stay_months' => 'integer',
            'views_count' => 'integer',
            'reviews_count' => 'integer',
            'rating' => 'float',
            'payment_methods' => 'array',
            'created_at' => 'datetime',
            'updated_at' => 'datetime'
        ];
    }


    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_id');
    }


    public function city()
    {
        return $this->belongsTo(City::class, 'city_id', 'id');
    }

    public function area()
    {
        return $this->belongsTo(Area::class, 'area_id', 'id');
    }

    /**
     * Get all amenities for this property.
     */
    public function amenities()
    {
        return $this->belongsToMany(Amenity::class, 'property_amenity');
    }

    /**
     * Get all images for this property.
     */
    public function images()
    {
        return $this->hasMany(PropertyImage::class, 'property_id')
            ->orderBy('priority');
    }

    public function rentals()
    {
        return $this->hasMany(PropertyRental::class, 'property_id');
    }

    public function activeRentals()
    {
        return $this->rentals()->where('status', 'active');
    }

    public function rentalRequests()
    {
        return $this->hasMany(RentalRequest::class, 'property_id');
    }

    public function pendingRentalRequests()
    {
        return $this->rentalRequests()->where('status', 'pending');
    }

    /**
     * Get the primary/featured image.
     */
    public function primaryImage()
    {
        return $this->hasOne(PropertyImage::class, 'property_id')
            ->orderBy('priority')
            ->oldest();
    }

    /**
     * Get all comments/reviews for this property.
     */
    public function comments()
    {
        return $this->hasMany(PropertyComment::class, 'property_id');
    }

    /**
     * Get users who saved/favorited this property.
     */
    public function savedByUsers()
    {
        return $this->belongsToMany(User::class, 'saved_properties')
            ->withTimestamps();
    }

    /**
     * Scope: Filter by status.
     */
    public function scopeStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope: Only available properties.
     */
    public function scopeAvailable($query)
    {
        return $query->where('status', 'available')
            ->where('available_from', '<=', now());
    }

    /**
     * Scope: Filter by city.
     */
    public function scopeInCity($query, $cityId)
    {
        return $query->whereHas('area', function ($q) use ($cityId) {
            $q->where('city_id', $cityId);
        });
    }

    /**
     * Scope: Filter by area.
     */
    public function scopeInArea($query, $areaId)
    {
        return $query->where('location_id', $areaId);
    }

    /**
     * Scope: Filter by price range.
     */
    public function scopePriceBetween($query, $min, $max)
    {
        return $query->whereBetween('price', [$min, $max]);
    }

    /**
     * Scope: Filter by gender requirement.
     */
    public function scopeGenderRequirement($query, $gender)
    {
        return $query->where('gender_requirement', $gender);
    }

    /**
     * Get average rating for this property.
     */
    public function averageRating()
    {
        return $this->comments()->avg('rating') ?? 0;
    }

    /**
     * Check if property is available.
     */
    public function isAvailable(): bool
    {
        return $this->status === 'available'
            && $this->available_from <= now();
    }

    /**
     * Check if user has saved this property.
     */
    public function isSavedByUser($userId): bool
    {
        return $this->savedByUsers()->where('user_id', $userId)->exists();
    }

    /**
     * Get all applications for this property.
     */
    public function applications()
    {
        return $this->hasMany(PropertyApplication::class);
    }

    /**
     * Get pending applications for this property.
     */
    public function pendingApplications()
    {
        return $this->hasMany(PropertyApplication::class)->pending();
    }

    /**
     * Get approved applications for this property.
     */
    public function approvedApplications()
    {
        return $this->hasMany(PropertyApplication::class)->approved();
    }

    /**
     * Get contracts related to this property.
     */
    public function contracts()
    {
        return $this->hasMany(Verification::class)
            ->where('document_type', 'contract');
    }

    /**
     * Get active contract for this property.
     */
    public function activeContract()
    {
        return $this->hasOne(Verification::class)
            ->where('document_type', 'contract')
            ->where('status', 'approved')
            ->where('contract_end_date', '>=', now());
    }

    /**
     * Check if property has active contract (is currently rented).
     */
    public function hasActiveContract(): bool
    {
        return $this->activeContract()->exists();
    }

    /**
     * Get count of pending applications.
     */
    public function pendingApplicationsCount(): int
    {
        return $this->pendingApplications()->count();
    }
}
