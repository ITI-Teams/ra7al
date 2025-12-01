<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\ProfileStudentController;



Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('profile', [ProfileStudentController::class, 'show']);
    Route::post('profile', [ProfileStudentController::class, 'storeOrUpdate']);
});
