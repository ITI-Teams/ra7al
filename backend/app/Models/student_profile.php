<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class student_profile extends Model
{
    protected $fillable = ['user_id', 'age', 'gender', 'habits', 'preferences', 'roommate_style', 'cleanliness_level', 'smoking', 'pets'];
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
