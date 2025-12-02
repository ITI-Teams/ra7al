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
        Schema::create('property_rentals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('property_id')
                ->constrained()
                ->onDelete('cascade');

            $table->foreignId('tenant_id')
                ->constrained('users')
                ->onDelete('cascade');

            $table->foreignId('owner_id')
                ->constrained('users')
                ->onDelete('restrict');

            $table->date('start_date');
            $table->date('end_date')->nullable();
            $table->decimal('monthly_rent', 10, 2);
            $table->decimal('security_deposit', 10, 2)->default(0);
            $table->integer('room_number')->nullable()->comment('رقم الغرفة إذا كان العقار مشترك');

            $table->enum('status', [
                'pending',       
                'active',
                'terminated',
                'cancelled'
            ])->default('pending');

            $table->enum('payment_method', ['cash', 'bank_transfer', 'card', 'check'])->default('cash');
            $table->date('next_payment_date')->nullable();
            $table->date('last_payment_date')->nullable();

            $table->text('notes')->nullable();

            // Indexes
            $table->index('property_id');
            $table->index('tenant_id');
            $table->index('owner_id');
            $table->index('status');
            $table->index('next_payment_date');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('property_rentals');
    }
};
