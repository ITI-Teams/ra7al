<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Area extends Model
{
    use HasFactory;

    protected $fillable = [
        'city_id',
        'name',
    ];

    /**
     * Get the city this area belongs to.
     */
    public function city()
    {
        return $this->belongsTo(City::class, 'city_id');
    }

    /**
     * Get all properties in this area.
     */
    public function properties()
    {
        return $this->hasMany(Property::class, 'location_id');
    }

    /**
     * Get count of available properties in this area.
     */
    public function availablePropertiesCount()
    {
        return $this->properties()->available()->count();
    }

    /**
     * Scope: Filter by city.
     */
    public function scopeInCity($query, $cityId)
    {
        return $query->where('city_id', $cityId);
    }
}
