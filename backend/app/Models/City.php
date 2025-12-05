<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;

class City extends Model
{
    use HasFactory , SoftDeletes;

    protected $fillable = ['name'];

    /**
     * Get all areas in this city.
     */
    public function areas()
    {
        return $this->hasMany(Area::class, 'city_id');
    }

    /**
     * Get all properties in this city (through areas).
     */
    public function properties()
    {
        return $this->hasManyThrough(
            Property::class,
            Area::class,
            'city_id',      // Foreign key on areas table
            'id',           // Local key on cities table
            'id'            // Local key on areas table
        );
    }

    /**
     * Get count of available properties in this city.
     */
    public function availablePropertiesCount()
    {
        return $this->properties()->available()->count();
    }
}
