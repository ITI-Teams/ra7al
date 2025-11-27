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
        'user_id',
        'location_id', // This should reference areas table
        'title',
        'description',
        'price',
        'address',
        'gender_requirement',
        'smoking_allowed',
        'rooms_count',
        'bathrooms_count',
        'size',
        'available_from',
        'status',
    ];

    /**
     * Get the attributes that should be cast.
     */
    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'smoking_allowed' => 'boolean',
            'rooms_count' => 'integer',
            'bathrooms_count' => 'integer',
            'size' => 'integer',
            'available_from' => 'date',
        ];
    }

    /**
     * Get the owner/landlord of this property.
     */
    public function owner()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Get the area where this property is located.
     * CRITICAL: location_id should reference areas table
     */
    public function area()
    {
        return $this->belongsTo(Area::class, 'location_id');
    }

    /**
     * Get the city through the area relationship.
     * This provides direct access to city without extra queries.
     */
    public function city()
    {
        return $this->hasOneThrough(
            City::class,
            Area::class,
            'id',           // Foreign key on areas table
            'id',           // Foreign key on cities table
            'location_id',  // Local key on properties table
            'city_id'       // Local key on areas table
        );
    }

    /**
     * Get all amenities for this property.
     */
    public function amenities()
    {
        return $this->belongsToMany(Amenity::class, 'property_amenities');
    }

    /**
     * Get all images for this property.
     */
    public function images()
    {
        return $this->hasMany(PropertyImage::class, 'property_id')
            ->orderBy('priority');
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
}
