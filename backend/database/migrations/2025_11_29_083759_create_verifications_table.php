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
        Schema::create('verifications', function (Blueprint $table) {

            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('property_id')->nullable()->constrained('properties')->onDelete('set null');

            // Document types
            $table->enum('document_type', [
                'national_id',
                'passport',
                'student_id',
                'contract',
                'proof_of_enrollment',
                'business_license'
            ]);

            // Document storage
            $table->string('document_path'); // Path to stored document
            $table->string('document_number')->nullable(); // ID/Passport number
            $table->date('issue_date')->nullable();
            $table->date('expiry_date')->nullable();

            // Verification status
            $table->enum('status', ['pending', 'approved', 'rejected', 'expired'])->default('pending');
            $table->text('rejection_reason')->nullable();
            $table->foreignId('verified_by')->nullable()->constrained('users')->onDelete('set null'); // Admin who verified
            $table->timestamp('verified_at')->nullable();

            // Contract-specific fields (when document_type = 'contract')
            $table->foreignId('tenant_id')->nullable()->constrained('users')->onDelete('cascade');
            $table->foreignId('landlord_id')->nullable()->constrained('users')->onDelete('cascade');
            $table->date('contract_start_date')->nullable();
            $table->date('contract_end_date')->nullable();
            $table->decimal('contract_amount', 10, 2)->nullable();

            $table->timestamps();

            // Indexes
            $table->index('user_id');
            $table->index('property_id');
            $table->index('status');
            $table->index('document_type');
            $table->index(['tenant_id', 'landlord_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('verifications');
    }
};
