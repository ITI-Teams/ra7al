<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\student_profile;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class ProfileStudentController extends Controller
{
    public function show()
    {
        $userId = Auth::id();
        $profile = student_profile::with('user')->where('user_id', $userId)->first();



        if (!$profile) {
            $user = Auth::user();
            $avatar = $user->avatar
                ? asset("storage/{$user->avatar}")
                : asset("storage/default-avatar.png");

            return response()->json([
                'profile' => [
                    'name' => $user->name,
                    'avatar' => $avatar,
                    'email' => $user->email,
                    'age' => null,
                    'gender' => null,
                    'habits' => null,
                    'preferences' => null,
                    'roommate_style' => null,
                    'cleanliness_level' => null,
                    'smoking' => null,
                    'pets' => null,
                ]
            ]);
        }

        $user = Auth::user();
        $avatar = $user->avatar
            ? asset("storage/{$user->avatar}")
            : asset("storage/default-avatar.png");

        return response()->json([
            'profile' => [
                'name' => $profile->user->name,
                'email' => $profile->user->email,
                'avatar' => $avatar,
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
        $data = $request->validate([
            'name' => 'string|required',
            'email' => 'string|required',
            'password' => 'nullable|string|min:6',
            'age' => 'integer|required',
            'gender' => 'nullable|string',
            'habits' => 'nullable',
            'preferences' => 'nullable',
            'roommate_style' => 'required|string',
            'cleanliness_level' => 'required|integer|min:0|max:9',
            'smoking' => 'required|boolean',
            'pets' => 'required|boolean',
            'avatar' => 'nullable',
        ]);



        $data['habits'] = is_array($data['habits']) ? json_encode($data['habits']) : $data['habits'];
        $data['preferences'] = is_array($data['preferences']) ? json_encode($data['preferences']) : $data['preferences'];


        $userId = Auth::id();

        User::where('id', $userId)->update([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => !empty($data['password'])
                ? Hash::make($data['password'])
                : User::find($userId)->password
        ]);
        unset($data['name'], $data['email'], $data['password']);
        $profile = student_profile::updateOrCreate(


            ['user_id' => Auth::id()],
            $data
        );

        return response()->json([
            'message' => 'Profile saved successfully',
            'profile' => $profile
        ]);
    }
}
