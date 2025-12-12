<?php

namespace Database\Seeders;

use App\Models\RecommendationQuestion;
use Illuminate\Database\Seeder;

class RecommendationQuestionSeeder extends Seeder
{
    public function run(): void
    {
        $questions = [
            // Budget Questions
            [
                'question' => 'What is your monthly budget for rent?',
                'question_type' => 'range',
                'options' => json_encode(['min' => 1000, 'max' => 10000, 'step' => 500]),
                'category' => 'budget',
                'weight' => 10,
                'order' => 1,
                'maps_to_field' => 'price',
                'maps_to_table' => 'properties',
                'is_active' => true,
                'is_required' => true,
                'ai_hints' => json_encode(['filter_type' => 'range', 'priority' => 'high']),
            ],

            // Location Questions
            [
                'question' => 'Which city are you looking to live in?',
                'question_type' => 'single_choice',
                'options' => json_encode(['Cairo', 'Alexandria', 'Giza', 'Mansoura', 'Assuit']),
                'category' => 'location',
                'weight' => 10,
                'order' => 2,
                'maps_to_field' => 'city_id',
                'maps_to_table' => 'areas',
                'is_active' => true,
                'is_required' => true,
                'ai_hints' => json_encode(['filter_type' => 'exact', 'priority' => 'high']),
            ],

            [
                'question' => 'How far are you willing to commute to your university? (in km)',
                'question_type' => 'single_choice',
                'options' => json_encode(['Less than 5 km', '5-10 km', '10-20 km', 'More than 20 km']),
                'category' => 'location',
                'weight' => 7,
                'order' => 3,
                'maps_to_field' => null,
                'maps_to_table' => null,
                'is_active' => true,
                'is_required' => false,
                'ai_hints' => json_encode(['use_for' => 'distance_calculation', 'priority' => 'medium']),
            ],

            // Property Features
            [
                'question' => 'How many roommates are you comfortable living with?',
                'question_type' => 'single_choice',
                'options' => json_encode(['None (studio)', '1-2 roommates', '3-4 roommates', '5+ roommates']),
                'category' => 'property_features',
                'weight' => 8,
                'order' => 4,
                'maps_to_field' => 'rooms_count',
                'maps_to_table' => 'properties',
                'is_active' => true,
                'is_required' => true,
                'ai_hints' => json_encode(['convert_to_rooms' => true, 'priority' => 'high']),
            ],

            [
                'question' => 'Do you prefer a furnished or unfurnished property?',
                'question_type' => 'single_choice',
                'options' => json_encode(['Fully furnished', 'Semi-furnished', 'Unfurnished', 'No preference']),
                'category' => 'property_features',
                'weight' => 5,
                'order' => 5,
                'maps_to_field' => null,
                'maps_to_table' => 'amenities',
                'is_active' => true,
                'is_required' => false,
                'ai_hints' => json_encode(['map_to_amenities' => ['Fully furnished', 'Semi-furnished'], 'priority' => 'medium']),
            ],

            // Lifestyle Questions
            [
                'question' => 'Do you smoke?',
                'question_type' => 'boolean',
                'options' => null,
                'category' => 'lifestyle',
                'weight' => 6,
                'order' => 6,
                'maps_to_field' => 'smoking_allowed',
                'maps_to_table' => 'properties',
                'is_active' => true,
                'is_required' => true,
                'ai_hints' => json_encode(['filter_type' => 'boolean', 'priority' => 'high']),
            ],

            [
                'question' => 'What is your sleep schedule?',
                'question_type' => 'single_choice',
                'options' => json_encode(['Early bird (sleep before 11 PM)', 'Night owl (sleep after 1 AM)', 'Flexible']),
                'category' => 'lifestyle',
                'weight' => 5,
                'order' => 7,
                'maps_to_field' => 'sleep_schedule',
                'maps_to_table' => 'user_profiles',
                'is_active' => true,
                'is_required' => false,
                'ai_hints' => json_encode(['use_for' => 'roommate_matching', 'priority' => 'medium']),
            ],

            [
                'question' => 'How would you describe your cleanliness level?',
                'question_type' => 'single_choice',
                'options' => json_encode(['Very clean', 'Clean', 'Moderate', 'Relaxed']),
                'category' => 'lifestyle',
                'weight' => 6,
                'order' => 8,
                'maps_to_field' => 'cleanliness_level',
                'maps_to_table' => 'user_profiles',
                'is_active' => true,
                'is_required' => false,
                'ai_hints' => json_encode(['use_for' => 'roommate_matching', 'priority' => 'high']),
            ],

            [
                'question' => 'What is your noise tolerance level?',
                'question_type' => 'single_choice',
                'options' => json_encode(['Quiet (prefer silence)', 'Moderate', 'Lively (enjoy social atmosphere)']),
                'category' => 'lifestyle',
                'weight' => 5,
                'order' => 9,
                'maps_to_field' => 'noise_tolerance',
                'maps_to_table' => 'user_profiles',
                'is_active' => true,
                'is_required' => false,
                'ai_hints' => json_encode(['use_for' => 'roommate_matching', 'priority' => 'medium']),
            ],

            [
                'question' => 'Do you have any pets?',
                'question_type' => 'boolean',
                'options' => null,
                'category' => 'lifestyle',
                'weight' => 4,
                'order' => 10,
                'maps_to_field' => 'has_pets',
                'maps_to_table' => 'user_profiles',
                'is_active' => true,
                'is_required' => false,
                'ai_hints' => json_encode(['filter_type' => 'boolean', 'priority' => 'medium']),
            ],

            // Amenities
            [
                'question' => 'Which amenities are most important to you? (Select all that apply)',
                'question_type' => 'multiple_choice',
                'options' => json_encode([
                    'WiFi',
                    'Air Conditioning',
                    'Washing Machine',
                    'Kitchen',
                    'Parking',
                    'Gym',
                    'Swimming Pool',
                    'Security',
                    'Elevator'
                ]),
                'category' => 'amenities',
                'weight' => 7,
                'order' => 11,
                'maps_to_field' => null,
                'maps_to_table' => 'amenities',
                'is_active' => true,
                'is_required' => false,
                'ai_hints' => json_encode(['map_to_amenities' => true, 'priority' => 'medium']),
            ],

            // Roommate Preferences
            [
                'question' => 'Do you prefer living with people of the same gender?',
                'question_type' => 'single_choice',
                'options' => json_encode(['Male only', 'Female only', 'Mixed/No preference']),
                'category' => 'roommate_preferences',
                'weight' => 8,
                'order' => 12,
                'maps_to_field' => 'gender_requirement',
                'maps_to_table' => 'properties',
                'is_active' => true,
                'is_required' => true,
                'ai_hints' => json_encode(['filter_type' => 'exact', 'priority' => 'high']),
            ],

            [
                'question' => 'What are your hobbies and interests? (Select all that apply)',
                'question_type' => 'multiple_choice',
                'options' => json_encode([
                    'Reading',
                    'Sports',
                    'Gaming',
                    'Cooking',
                    'Music',
                    'Movies/TV',
                    'Travel',
                    'Art',
                    'Photography',
                    'Fitness'
                ]),
                'category' => 'roommate_preferences',
                'weight' => 4,
                'order' => 13,
                'maps_to_field' => 'hobbies',
                'maps_to_table' => 'user_profiles',
                'is_active' => true,
                'is_required' => false,
                'ai_hints' => json_encode(['use_for' => 'roommate_matching', 'priority' => 'low']),
            ],

            [
                'question' => 'When are you looking to move in?',
                'question_type' => 'single_choice',
                'options' => json_encode(['Immediately', 'Within 1 month', '1-3 months', '3+ months']),
                'category' => 'property_features',
                'weight' => 6,
                'order' => 14,
                'maps_to_field' => 'available_from',
                'maps_to_table' => 'properties',
                'is_active' => true,
                'is_required' => true,
                'ai_hints' => json_encode(['convert_to_date' => true, 'priority' => 'high']),
            ],
        ];

        foreach ($questions as $question) {
            // Use updateOrCreate to make the seeder idempotent and avoid duplicate questions
            RecommendationQuestion::updateOrCreate(
                ['question' => $question['question']],
                $question
            );
        }
    }
}
