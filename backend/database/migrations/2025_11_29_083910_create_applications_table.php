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
        Schema::create('applications', function (Blueprint $table) {

            $table->id();
            $table->foreignId('property_id')->constrained('properties')->onDelete('cascade');
            $table->foreignId('student_id')->constrained('users')->onDelete('cascade');

            // Application details
            $table->date('move_in_date');
            $table->integer('lease_duration_months');
            $table->text('message_to_owner')->nullable();

            // Student information
            $table->string('emergency_contact_name');
            $table->string('emergency_contact_phone');
            $table->string('emergency_contact_relationship');

            // Financial information
            $table->enum('employment_status', ['student', 'employed', 'unemployed', 'part_time'])->default('student');
            $table->decimal('monthly_income', 10, 2)->nullable();
            $table->boolean('has_guarantor')->default(false);
            $table->string('guarantor_name')->nullable();
            $table->string('guarantor_phone')->nullable();

            // References
            $table->string('previous_landlord_name')->nullable();
            $table->string('previous_landlord_phone')->nullable();
            $table->string('previous_address')->nullable();

            // Application status
            $table->enum('status', [
                'pending',
                'under_review',
                'approved',
                'rejected',
                'withdrawn',
                'expired'
            ])->default('pending');

            $table->text('owner_notes')->nullable(); // Owner's private notes
            $table->text('rejection_reason')->nullable();
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->timestamp('expires_at')->nullable(); // Auto-expire after X days

            $table->timestamps();

            // Indexes
            $table->index('property_id');
            $table->index('student_id');
            $table->index('status');
            $table->index('move_in_date');
            $table->index('created_at');

            // Prevent duplicate active applications
            $table->unique(['property_id', 'student_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('applications');
    }
};
