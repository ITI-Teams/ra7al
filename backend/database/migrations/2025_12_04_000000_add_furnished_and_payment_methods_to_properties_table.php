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
        Schema::table('properties', function (Blueprint $table) {
            if (!Schema::hasColumn('properties', 'furnished')) {
                $table->boolean('furnished')->default(false)->after('pets_allowed');
            }

            if (!Schema::hasColumn('properties', 'payment_methods')) {
                // store as json array of payment method keys
                $table->json('payment_methods')->nullable()->after('available_to');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('properties', function (Blueprint $table) {
            if (Schema::hasColumn('properties', 'furnished')) {
                $table->dropColumn('furnished');
            }

            if (Schema::hasColumn('properties', 'payment_methods')) {
                $table->dropColumn('payment_methods');
            }
        });
    }
};
