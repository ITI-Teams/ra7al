<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ProfileStudentController;
use App\Http\Controllers\Api\MessageController;
use App\Http\Controllers\Api\V1\PropertyController;
use App\Http\Controllers\AuthController;


// profile student and owner
Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('profile', [ProfileStudentController::class, 'show']);
    Route::post('profile', [ProfileStudentController::class, 'storeOrUpdate']);
});



// message contact-us
Route::get('/messages', [MessageController::class, 'index']);
Route::post('/messages', [MessageController::class, 'store']);

// Public auth routes for frontend
Route::post('register', [AuthController::class, 'register']);
Route::post('login', [AuthController::class, 'login']);

// Protected route example: logout
Route::middleware('auth:sanctum')->post('logout', [AuthController::class, 'logout']);

Route::prefix('properties')->group(function () {
    Route::get('/', [PropertyController::class, 'index']);
    // Route::get('/filters', function() {
    //     return (new PropertyController)->getFilters();
    // });

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/', [PropertyController::class, 'store']);
        Route::get('/my-properties', [PropertyController::class, 'getOwnerProperties']);
        Route::get('/my-rentals', [PropertyController::class, 'getTenantProperties']);
        Route::get('/statistics', [PropertyController::class, 'getOwnerStatistics']);

        Route::get('/{id}', [PropertyController::class, 'show']);
        Route::put('/{id}', [PropertyController::class, 'update']);
        Route::delete('/{id}', [PropertyController::class, 'destroy']);

        Route::post('/{id}/request', [PropertyController::class, 'submitRentalRequest']);
        Route::post('/requests/{id}/approve', [PropertyController::class, 'approveRentalRequest']);
        Route::post('/requests/{id}/reject', [PropertyController::class, 'rejectRentalRequest']);

        Route::post('/rentals/{id}/terminate', [PropertyController::class, 'terminateRental']);
    });
});
