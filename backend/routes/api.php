<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ProfileStudentController;
use App\Http\Controllers\Api\MessageController;
use App\Http\Controllers\AuthController;



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
