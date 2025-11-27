<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PropertyComment extends Model
{
    protected $fillable = ['property_id', 'user_id', 'rating', 'comment'];

    public function property()
    {
        return $this->belongsTo(Property::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
