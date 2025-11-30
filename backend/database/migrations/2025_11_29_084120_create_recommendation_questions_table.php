<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('recommendation_questions', function (Blueprint $table) {

            $table->id();

            // Question details
            $table->text('question');
            $table->enum('question_type', [
                'multiple_choice',
                'single_choice',
                'range',
                'boolean',
                'text'
            ]);

            // Question options (for choice types)
            $table->json('options')->nullable(); // ['option1', 'option2', 'option3']

            // Category and weighting
            $table->enum('category', [
                'location',
                'budget',
                'lifestyle',
                'amenities',
                'property_features',
                'roommate_preferences'
            ]);

            $table->integer('weight')->default(1); // Importance weight for AI model
            $table->integer('order')->default(0); // Display order

            // Mapping to database fields (for filtering)
            $table->string('maps_to_field')->nullable(); // e.g., 'price', 'gender_requirement'
            $table->string('maps_to_table')->nullable(); // e.g., 'properties', 'user_profiles'

            // Status
            $table->boolean('is_active')->default(true);
            $table->boolean('is_required')->default(false);

            // AI model hints
            $table->json('ai_hints')->nullable(); // Additional context for AI recommendations

            $table->timestamps();

            // Indexes
            $table->index('category');
            $table->index('is_active');
            $table->index('order');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('recommendation_questions');
    }
};
