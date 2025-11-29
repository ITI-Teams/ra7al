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
        Schema::create('user_recommendation_responses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('question_id')->constrained('recommendation_questions')->onDelete('cascade');

            // Response data
            $table->json('response'); // Flexible to handle different answer types

            // Session tracking (in case user retakes questionnaire)
            $table->string('session_id')->nullable();
            $table->timestamp('completed_at')->nullable();

            $table->timestamps();

            // Indexes
            $table->index('user_id');
            $table->index('question_id');
            $table->index('session_id');

            // Unique constraint: one response per question per session
            $table->unique(['user_id', 'question_id', 'session_id'], 'user_rec_responses_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_recommendation_responses');
    }
};
