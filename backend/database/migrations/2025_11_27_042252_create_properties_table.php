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
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('location_id')->constrained('areas');

            $table->string('title');
            $table->text('description')->nullable();
            $table->decimal('price', 10, 2);
            $table->string('address')->nullable();

            $table->enum('gender_requirement', ['male', 'female', 'any'])->default('any');
            $table->boolean('smoking_allowed')->default(false);

            $table->integer('rooms_count')->default(1);
            $table->integer('bathrooms_count')->default(1);
            $table->integer('size')->nullable();

            $table->date('available_from')->nullable();

            $table->enum('status', ['pending', 'approved', 'rejected', 'active', 'archived'])->default('pending');

            $table->timestamps();
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
