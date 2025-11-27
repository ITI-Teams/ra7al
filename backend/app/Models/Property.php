<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Property extends Model
{
    protected $fillable = [
        'title',
        'description',
        'price',
        'address',
        'user_id',
        'location_id',
        'gender_requirement',
        'smoking_allowed',
        'rooms_count',
        'bathrooms_count',
        'size',
        'available_from',
        'status'
    ];

    public function owner()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function images()
    {
        return $this->hasMany(PropertyImage::class);
    }

    public function amenities()
    {
        return $this->belongsToMany(Amenity::class, 'property_amenity');
    }

    public function comments()
    {
        return $this->hasMany(PropertyComment::class);
    }
}
