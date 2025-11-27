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
        Schema::create('properties', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');

            // CRITICAL: This creates the relationship with areas table
            $table->foreignId('location_id')->constrained('areas')->onDelete('restrict');

            $table->string('title');
            $table->text('description');
            $table->decimal('price', 10, 2);
            $table->string('address');
            $table->enum('gender_requirement', ['male', 'female', 'mixed'])->default('mixed');
            $table->boolean('smoking_allowed')->default(false);
            $table->integer('rooms_count')->default(1);
            $table->integer('bathrooms_count')->default(1);
            $table->integer('size')->nullable()->comment('Size in square meters');
            $table->date('available_from');
            $table->enum('status', ['available', 'rented', 'pending', 'inactive'])->default('available');
            $table->timestamps();

            // Indexes for better query performance
            $table->index('user_id');
            $table->index('location_id');
            $table->index('status');
            $table->index('available_from');
            $table->index('price');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('properties');
    }
};
