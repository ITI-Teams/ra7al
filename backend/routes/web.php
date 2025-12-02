<?php

use App\Http\Controllers\Dashboard\UserRoleController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Dashboard\DashboardController;
use App\Http\Controllers\Dashboard\MessageController;
use App\Http\Controllers\Dashboard\MailController;
use App\Http\Controllers\Dashboard\UserController;
use App\Http\Controllers\Dashboard\RoleController;
use App\Http\Controllers\Dashboard\PermissionController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Dashboard\CityController;
use App\Http\Controllers\Dashboard\AreaController;
use App\Http\Controllers\Dashboard\UniversityController;

Route::get('/', function () {
    return view('welcome');
});

Route::middleware(['auth', 'role:super,admin'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/messages/trashed', [MessageController::class, 'trashed'])->name('messages.trashed');
    Route::resource('messages', MessageController::class);
    Route::get('messages/{id}/restore', [MessageController::class, 'restore'])->name('messages.restore');
    Route::delete('messages/{id}/force-delete', [MessageController::class, 'forceDelete'])->name('messages.force-delete');
    /// Mails Routes
    Route::prefix('mail')->group(function () {
        Route::get('/', [MailController::class, 'index'])->name('mails.index');
        Route::get('/message/{id}', [MailController::class, 'getMessage'])->name('mail.message');
        Route::post('/send', [MailController::class, 'sendEmail'])->name('mail.send');
        Route::post('/send-to-user', [MailController::class, 'sendToUser'])->name('mail.send.user');
    });
    Route::get('/gmail/connect', function () {
        $client = new Google\Client();
        $client->setAuthConfig(storage_path('app/credentials.json'));
        $client->addScope(Google\Service\Gmail::GMAIL_READONLY);
        $client->setRedirectUri(url('/gmail/callback'));
        $client->setAccessType('offline');
        return redirect($client->createAuthUrl());
    });
    Route::get('/gmail/callback', function () {
        $client = new Google\Client();
        $client->setAuthConfig(storage_path('app/credentials.json'));
        $client->addScope(Google\Service\Gmail::GMAIL_READONLY);
        $client->setRedirectUri(url('/gmail/callback'));

        $token = $client->fetchAccessTokenWithAuthCode(request('code'));

        file_put_contents(storage_path('app/gmail_token.json'), json_encode($token));

        return "Connected! Now you can read inbox from dashboard.";
    });
    Route::get('/users/trashed', [UserController::class, 'trashed'])->name('users.trashed');
    Route::resource('users', UserController::class);
    Route::get('users/{id}/restore', [UserController::class, 'restore'])->name('users.restore');
    Route::delete('users/{id}/force-delete', [UserController::class, 'forceDelete'])->name('users.forceDelete');
    // Roles CRUD
    Route::resource('roles', RoleController::class);
    // Permissions CRUD
    Route::resource('permissions', PermissionController::class);
    // Assign Roles & Permissions to User
    Route::post('users/{user}/assign', [UserRoleController::class, 'update'])->name('users.assign.update');
    Route::get('assign/users', [UserRoleController::class, 'edit'])->name('users.assign');




    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    /** ------------------- Cities ------------------- */
    Route::get('cities/trashed', [CityController::class, 'trashed'])->name('cities.trashed');
    Route::resource('cities', CityController::class);
    Route::post('cities/{id}/restore', [CityController::class, 'restore'])->name('cities.restore');
    Route::delete('cities/{id}/force-delete', [CityController::class, 'forceDelete'])->name('cities.force-delete');

    /** ------------------- Areas ------------------- */
    Route::get('areas/trashed', [AreaController::class, 'trashed'])->name('areas.trashed');
    Route::resource('areas', AreaController::class);
    Route::post('areas/{id}/restore', [AreaController::class, 'restore'])->name('areas.restore');
    Route::delete('areas/{id}/force-delete', [AreaController::class, 'forceDelete'])->name('areas.force-delete');

    /** ------------------- Universities ------------------- */
    Route::get('universities/trashed', [UniversityController::class, 'trashed'])->name('universities.trashed');
    Route::resource('universities', UniversityController::class);
    Route::post('universities/{id}/restore', [UniversityController::class, 'restore'])->name('universities.restore');
    Route::delete('universities/{id}/force-delete', [UniversityController::class, 'forceDelete'])->name('universities.force-delete');
});





require __DIR__ . '/auth.php';
