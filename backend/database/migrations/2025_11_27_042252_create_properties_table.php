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

            $table->foreignId('owner_id')->constrained('users')->onDelete('restrict');

            $table->foreignId('city_id')->constrained('cities')->restrictOnDelete();
            $table->foreignId('area_id')->constrained('areas')->restrictOnDelete();

            $table->string('title');
            $table->text('description');
            $table->decimal('price', 10, 2);
            $table->string('address');

            $table->enum('gender_requirement', ['male', 'female'])->default('male');
            $table->boolean('smoking_allowed')->default(false);
            $table->boolean('pets_allowed')->default(false);

            $table->integer('total_rooms')->default(1);
            $table->integer('available_rooms')->default(1);
            $table->integer('bathrooms_count')->default(1);
            $table->integer('beds')->default(1);

            $table->integer('available_spots')->default(1);

            $table->integer('size')->nullable();

            $table->string('accommodation_type')->nullable();
            $table->string('university')->nullable();

            $table->date('available_from');
            $table->date('available_to')->nullable();

            $table->enum('status', [
                'available',
                'partially_occupied',
                'fully_occupied',
                'maintenance',
                'inactive'
            ])->default('available');

            $table->timestamps();

            // Indexes
            $table->index('owner_id');
            $table->index('city_id');
            $table->index('area_id');
            $table->index('status');
            $table->index('available_from');
            $table->index('price');
            $table->index('available_rooms');
            $table->index('gender_requirement');
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
