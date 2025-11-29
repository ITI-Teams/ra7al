<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

// Model 1: UserProfile
class UserProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'date_of_birth',
        'gender',
        'nationality',
        'bio',
        'profile_image',
        // Student fields
        'university',
        'major',
        'student_id',
        'graduation_year',
        'study_level',
        // Owner fields
        'company_name',
        'business_license',
        'properties_owned',
        'average_rating',
        // Lifestyle
        'is_smoker',
        'sleep_schedule',
        'cleanliness_level',
        'noise_tolerance',
        'has_pets',
        'hobbies',
        'languages',
        // Verification
        'is_verified',
        'verified_at',
    ];

    protected function casts(): array
    {
        return [
            'date_of_birth' => 'date',
            'graduation_year' => 'integer',
            'properties_owned' => 'integer',
            'average_rating' => 'decimal:2',
            'is_smoker' => 'boolean',
            'has_pets' => 'boolean',
            'hobbies' => 'array',
            'languages' => 'array',
            'is_verified' => 'boolean',
            'verified_at' => 'datetime',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Calculate compatibility score between two profiles (for roommate matching).
     */
    public function calculateCompatibility(UserProfile $otherProfile): int
    {
        $score = 0;

        // Smoking compatibility
        if ($this->is_smoker === $otherProfile->is_smoker) $score += 20;

        // Sleep schedule compatibility
        if ($this->sleep_schedule === $otherProfile->sleep_schedule) $score += 15;

        // Cleanliness compatibility
        if ($this->cleanliness_level === $otherProfile->cleanliness_level) $score += 20;

        // Noise tolerance compatibility
        if ($this->noise_tolerance === $otherProfile->noise_tolerance) $score += 15;

        // Pets compatibility
        if ($this->has_pets === $otherProfile->has_pets) $score += 10;

        // Shared hobbies
        $sharedHobbies = array_intersect($this->hobbies ?? [], $otherProfile->hobbies ?? []);
        $score += count($sharedHobbies) * 4;

        // Shared languages
        $sharedLanguages = array_intersect($this->languages ?? [], $otherProfile->languages ?? []);
        $score += count($sharedLanguages) * 3;

        return min($score, 100); // Cap at 100
    }

    public function getAgeAttribute()
    {
        return $this->date_of_birth ? $this->date_of_birth->age : null;
    }
}
