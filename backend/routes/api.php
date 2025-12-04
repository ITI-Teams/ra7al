<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ProfileStudentController;
use App\Http\Controllers\Api\MessageController;
use App\Http\Controllers\Api\V1\PropertyController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\Api\RecommendationController;


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
/*
|--------------------------------------------------------------------------
| Recommendation API Routes
|--------------------------------------------------------------------------
|
| These routes handle the AI-powered property recommendation system
|
*/

Route::prefix('recommendations')->group(function () {

    // Public route: Get all recommendation questions
    // GET /api/recommendation-questions
    Route::get('/questions', [RecommendationController::class, 'getQuestions'])
        ->name('recommendations.questions');

    // Protected routes: Require authentication
    Route::middleware('auth:sanctum')->group(function () {

        // POST /api/recommendations
        // Submit answers and get AI recommendations
        Route::post('/', [RecommendationController::class, 'getRecommendations'])
            ->name('recommendations.generate');

        // GET /api/recommendations/history
        // Get user's past recommendation sessions
        Route::get('/history', [RecommendationController::class, 'getHistory'])
            ->name('recommendations.history');
    });
});

/*
|--------------------------------------------------------------------------
| Route Testing Examples
|--------------------------------------------------------------------------
|
| Test with these curl commands:
|
| 1. Get questions (no auth required):
| curl -X GET http://localhost:8000/api/recommendations/questions
|
| 2. Submit answers and get recommendations (requires auth):
| curl -X POST http://localhost:8000/api/recommendations \
|   -H "Authorization: Bearer YOUR_TOKEN" \
|   -H "Content-Type: application/json" \
|   -d '{
|     "answers": {
|       "1": {"value": "Cairo"},
|       "2": {"value": 3000},
|       "3": {"value": ["WiFi", "Gym"]}
|     }
|   }'
|
| 3. Get history:
| curl -X GET http://localhost:8000/api/recommendations/history \
|   -H "Authorization: Bearer YOUR_TOKEN"
|or use POSTMAN 
*/
