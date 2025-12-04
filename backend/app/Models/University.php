<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class University extends Model
{
    use HasFactory , SoftDeletes;

    protected $fillable = [
        'city_id',
        'name',
    ];

    public function city()
    {
        return $this->belongsTo(City::class, 'city_id');
    }
}
