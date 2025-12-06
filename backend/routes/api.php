<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ProfileStudentController;
use App\Http\Controllers\Api\MessageController;
use App\Http\Controllers\Api\V1\PropertyController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\Api\V1\LocationController;
use App\Http\Controllers\Api\V1\PropertySearchController;
use App\Http\Controllers\Api\CityController;
use App\Http\Controllers\Api\AmenityController;
use App\Http\Controllers\Api\V1\RecommendationController;
use App\Http\Controllers\Api\V1\HomeController;


Route::get('/home/latest-properties', [HomeController::class, 'latestPropertiesByCity']);

// profile student and owner
Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('profile', [ProfileStudentController::class, 'show']);
    Route::post('profile', [ProfileStudentController::class, 'storeOrUpdate']);
});

Route::middleware('auth:sanctum')->get('/me', function (Request $request) {
    return response()->json([
        'user' => $request->user()
    ]);
});

// message contact-us
Route::get('/messages', [MessageController::class, 'index']);
Route::post('/messages', [MessageController::class, 'store']);

// Public auth routes for frontend
Route::post('register', [AuthController::class, 'register']);
Route::post('login', [AuthController::class, 'login']);

// Location & amenities lists used by frontend
Route::get('cities', [CityController::class, 'index']);
Route::get('cities/{city}/areas', [CityController::class, 'areas']);
Route::get('amenities', [AmenityController::class, 'index']);

// Protected route example: logout
Route::middleware('auth:sanctum')->post('logout', [AuthController::class, 'logout']);
// Property Search
Route::get('properties/search', [PropertySearchController::class, 'search']);
Route::get('properties/filter', [PropertyController::class, 'filterProperties']);
Route::prefix('properties')->group(function () {
    // Cities
    Route::get('/cities', [LocationController::class, 'getCities'])->name('api.cities');

    // Areas
    Route::get('/areas', [LocationController::class, 'getAreas'])->name('api.areas');

    // Universities
    Route::get('/universities', [LocationController::class, 'getUniversities'])->name('api.universities');
    Route::get('/universities/{id}', [LocationController::class, 'getUniversitiesByCity']);
    Route::get('/', [PropertyController::class, 'index']);

    Route::get('/{id}', [PropertyController::class, 'show']);
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/', [PropertyController::class, 'store']);
        Route::get('/my-properties', [PropertyController::class, 'getOwnerProperties']);
        Route::get('/my-rentals', [PropertyController::class, 'getTenantProperties']);
        Route::get('/statistics', [PropertyController::class, 'getOwnerStatistics']);

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
