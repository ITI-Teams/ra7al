<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Dashboard\DashboardController;
use App\Http\Controllers\Dashboard\MessageController;
use App\Http\Controllers\Dashboard\MailController;
use App\Http\Controllers\Dashboard\UserController;
use App\Http\Controllers\Dashboard\RoleController;
use App\Http\Controllers\Dashboard\PermissionController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

// Route::get('/dashboard', function () {
//     return view('dashboard');
// })->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware(['auth', 'role:super,admin'])->group(function () {
    Route::get('/dashboard', [DashboardController::class,'index'])->name('dashboard');
    Route::resource('messages', MessageController::class);
    Route::get('/mails/send', [MailController::class, 'sendTestEmail'])->name('mails.send');
    Route::resource('mails', MailController::class);
    Route::get('/users/trashed', [UserController::class, 'trashed'])->name('users.trashed');
    Route::resource('users', UserController::class);
    Route::get('users/{id}/restore', [UserController::class, 'restore'])->name('users.restore');
    Route::delete('users/{id}/force-delete', [UserController::class, 'forceDelete'])->name('users.forceDelete');
    Route::resource('roles', RoleController::class);
    Route::resource('permissions', PermissionController::class);
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});





require __DIR__.'/auth.php';
