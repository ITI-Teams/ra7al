<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\student_profile;
use Illuminate\Support\Facades\Auth;

class ProfileStudentController extends Controller
{
    public function show()
    {
        $userId = Auth::id();
        $profile = student_profile::with('user')->where('user_id', $userId)->first();

        if (!$profile) {
            return response()->json([
                'message' => 'Profile not found'
            ], 404);
        }
        return response()->json([
            'profile' => [
                'name' => $profile->user->name,
                'email' => $profile->user->email,
                'age' => $profile->age,
                'gender' => $profile->gender,
                'habits' => $profile->habits,
                'preferences' => $profile->preferences,
                'roommate_style' => $profile->roommate_style,
                'cleanliness_level' => $profile->cleanliness_level,
                'smoking' => $profile->smoking,
                'pets' => $profile->pets,


            ]
        ]);
    }

    public function storeOrUpdate(Request $request)
    {
        $userId = Auth::id();

        $profile = student_profile::firstOrNew(['user_id' => $userId]);

        $profile->age = $request->age;
        $profile->gender = $request->gender;
        $profile->habits = $request->habits;
        $profile->preferences = $request->preferences;
        $profile->roommate_style = $request->roommate_style;
        $profile->cleanliness_level = $request->cleanliness_level;
        $profile->smoking = $request->smoking;
        $profile->pets = $request->pets;

        $profile->save();

        return response()->json([
            'message' => 'Profile saved successfully'
        ]);
    }
}
