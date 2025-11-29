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
        Schema::create('user_profile', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');

            // Common fields for all user types
            $table->date('date_of_birth')->nullable();
            $table->enum('gender', ['male', 'female'])->nullable();
            $table->string('nationality')->nullable();
            $table->text('bio')->nullable();


            // Student-specific fields
            $table->string('university')->nullable();
            $table->string('major')->nullable();
            $table->string('student_id')->nullable();
            $table->year('graduation_year')->nullable();
            $table->enum('study_level', ['undergraduate', 'postgraduate', 'phd'])->nullable();

            // Owner-specific fields
            $table->string('company_name')->nullable();
            $table->string('business_license')->nullable();
            $table->integer('properties_owned')->default(0);
            $table->decimal('average_rating', 3, 2)->default(0);

            // Lifestyle preferences (for matching algorithm)
            $table->boolean('is_smoker')->default(false);
            $table->enum('sleep_schedule', ['early_bird', 'night_owl', 'flexible'])->nullable();
            $table->enum('cleanliness_level', ['very_clean', 'clean', 'moderate', 'relaxed'])->nullable();
            $table->enum('noise_tolerance', ['quiet', 'moderate', 'lively'])->nullable();
            $table->boolean('has_pets')->default(false);
            $table->json('hobbies')->nullable(); // Store as JSON array
            $table->json('languages')->nullable(); // Store as JSON array

            // Verification status
            $table->boolean('is_verified')->default(false);
            $table->timestamp('verified_at')->nullable();

            $table->timestamps();

            // Indexes
            $table->unique('user_id');
            $table->index('university');
            $table->index('is_verified');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_profile');
    }
};
