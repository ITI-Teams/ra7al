<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Auth Controller
use App\Http\Controllers\AuthController;

// API Controllers
use App\Http\Controllers\Api\ProfileStudentController;
use App\Http\Controllers\Api\MessageController;
use App\Http\Controllers\Api\CityController;
use App\Http\Controllers\Api\AmenityController;

// API V1 Controllers
use App\Http\Controllers\Api\V1\PropertyController;
use App\Http\Controllers\Api\V1\LocationController;
use App\Http\Controllers\Api\V1\PropertySearchController;
use App\Http\Controllers\Api\V1\RecommendationController;
use App\Http\Controllers\Api\V1\HomeController;
use App\Http\Controllers\Api\V1\DashboardController;

use App\Http\Controllers\Api\V1\PropertyCommentController;
use App\Http\Controllers\Api\V1\PropertySaveController;
use App\Http\Controllers\Api\V1\OwnerDashboardController;
use App\Http\Controllers\Api\V1\RentalRequestController;


/*
|--------------------------------------------------------------------------
| Authentication Routes
|--------------------------------------------------------------------------
*/


Route::post('register', [AuthController::class, 'register']);
Route::post('login', [AuthController::class, 'login']);
Route::middleware('auth:sanctum')->post('logout', [AuthController::class, 'logout']);


/*
|--------------------------------------------------------------------------
| Authenticated User Routes
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {
    // User Profile
    Route::prefix('profile')->group(function () {
        Route::get('/', [ProfileStudentController::class, 'show']);
        Route::post('/', [ProfileStudentController::class, 'storeOrUpdate']);
        Route::post('/avatar', [ProfileStudentController::class, 'updateAvatar']);
        Route::delete('/avatar', [ProfileStudentController::class, 'removeAvatar']);
    });

    // Current User
    Route::get('/me', function (Request $request) {
        return response()->json(['user' => $request->user()]);
    });
});

/*
|--------------------------------------------------------------------------
| Location & Reference Data Routes
|--------------------------------------------------------------------------
*/

Route::get('cities', [CityController::class, 'index']);
Route::get('cities/{city}/areas', [CityController::class, 'areas']);
Route::get('amenities', [AmenityController::class, 'index']);


/*
|--------------------------------------------------------------------------
| Property Routes
|--------------------------------------------------------------------------
*/
Route::get('/home/latest-properties', [HomeController::class, 'latestPropertiesByCity']);
Route::prefix('properties')->group(function () {
    // Public Property Routes
    Route::get('/', [PropertyController::class, 'index']);


    // Property Search & Filter
    Route::get('/search', [PropertySearchController::class, 'search']);
    Route::get('/filter', [PropertyController::class, 'filterProperties']);

    // Property Reference Data
    Route::get('/cities', [LocationController::class, 'getCities']);
    Route::get('/areas', [LocationController::class, 'getAreas']);
    Route::get('/universities', [LocationController::class, 'getUniversities']);
    Route::get('/universities/{id}', [LocationController::class, 'getUniversitiesByCity']);

    // Protected Property Routes (Require Authentication)
    Route::middleware('auth:sanctum')->group(function () {
        // Property Management
        Route::post('/', [PropertyController::class, 'store']);
        Route::put('/{id}', [PropertyController::class, 'update']);
        Route::delete('/{id}', [PropertyController::class, 'destroy']);

        // User Property Lists
        Route::get('/my-properties', [PropertyController::class, 'getOwnerProperties']);
        Route::get('/my-properties/{id}', [PropertyController::class, 'getOwnerProperty']);
        Route::get('/my-rentals', [PropertyController::class, 'getTenantProperties']);
        Route::get('/statistics', [PropertyController::class, 'getOwnerStatistics']);

        // Rental Management
        Route::post('/{id}/request', [PropertyController::class, 'submitRentalRequest']);
        Route::post('/requests/{id}/approve', [PropertyController::class, 'approveRentalRequest']);
        Route::post('/requests/{id}/reject', [PropertyController::class, 'rejectRentalRequest']);
        Route::post('/rentals/{id}/terminate', [PropertyController::class, 'terminateRental']);

        // Comments
        Route::post('/{id}/comments', [PropertyCommentController::class, 'addComment']);
    });
    Route::get('/show/{id}', [PropertyController::class, 'show']);
    Route::get('/{id}/similar', [PropertyController::class, 'getSimilarProperties']);
    route::get('/{id}/comments', [PropertyCommentController::class, 'getPropertyComments']);
});

/*
|--------------------------------------------------------------------------
| Recommendation System Routes
|--------------------------------------------------------------------------
|
| AI-powered property recommendation system
|
| Test Commands:
| 1. Get questions: curl -X GET http://localhost:8000/api/recommendations/questions
| 2. Submit answers: curl -X POST http://localhost:8000/api/recommendations -H "Authorization: Bearer TOKEN" -H "Content-Type: application/json" -d '{"answers": {...}}'
| 3. Get history: curl -X GET http://localhost:8000/api/recommendations/history -H "Authorization: Bearer TOKEN"
|
*/
Route::prefix('recommendations')->group(function () {
    // Public Routes
    Route::get('/questions', [RecommendationController::class, 'getQuestions'])
        ->name('recommendations.questions');

    // Protected Routes
    Route::middleware('auth:sanctum')->group(function () {
        // Answer a single question
        Route::post('/answer', [RecommendationController::class, 'answerQuestion'])
            ->name('recommendations.answer');

        // Answer multiple questions at once
        Route::post('/answers', [RecommendationController::class, 'answerMultipleQuestions'])
            ->name('recommendations.answers');

        // Get AI-powered recommendations
        Route::post('/', [RecommendationController::class, 'getRecommendations'])
            ->name('recommendations.generate');

        // Get recommendation history
        Route::get('/history', [RecommendationController::class, 'getHistory'])
            ->name('recommendations.history');
    });
});


// favourites api routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('property/{id}/favourite', [PropertySaveController::class, 'toggle']);
    Route::get('/my-favourites', [PropertySaveController::class, 'myFavourites']);
});

// Dashboard API routes
Route::prefix('dashboard')->group(function () {
    Route::get('/stats', [DashboardController::class, 'stats']);
    Route::get('/users-per-month', [DashboardController::class, 'usersPerMonth']);
    Route::get('/users-by-role', [DashboardController::class, 'usersByRole']);
    Route::get('/properties-per-city', [DashboardController::class, 'propertiesPerCity']);
    Route::get('/properties-by-status', [DashboardController::class, 'propertiesByStatus']);
    Route::get('/messages-by-priority', [DashboardController::class, 'messagesByPriority']);
});
/*
|--------------------------------------------------------------------------
| Contact & Messages Routes
|--------------------------------------------------------------------------
*/
Route::prefix('messages')->group(function () {
    Route::get('/', [MessageController::class, 'index']);
    Route::post('/', [MessageController::class, 'store']);
});
// Favourite properties routes
Route::middleware('auth:sanctum')->group(function () {

    Route::post('/property/{id}/favourite', [PropertySaveController::class, 'toggle']);

    Route::get('/my-favourites', [PropertySaveController::class, 'myFavourites']);
});
// Owner Dashboard Route
Route::middleware('auth:sanctum')->get('/owner/dashboard', [OwnerDashboardController::class, 'index']);
// Rental Requests Routes
Route::middleware('auth:sanctum')->group(function () {
    // Get all rental requests (with pagination, search, filter)
    Route::get('rental-requests', [RentalRequestController::class, 'index']);

    // Submit a new rental request
    Route::post('rental-requests', [RentalRequestController::class, 'store']);

    // Show single rental request details
    Route::get('rental-requests/{id}', [RentalRequestController::class, 'show']);

    // Approve rental request
    Route::post('rental-requests/{id}/approve', [RentalRequestController::class, 'approve']);

    // Reject rental request
    Route::post('rental-requests/{id}/reject', [RentalRequestController::class, 'reject']);
});
