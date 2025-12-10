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
                ? asset("{$user->avatar}")
                : asset("images/users/avatar/default-avatar.png");

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
            ? asset("{$user->avatar}")
            : asset("images/users/avatar/default-avatar.png");

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
                'bio' => $profile->bio,
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
            'bio' => 'required',
            'avatar' => 'nullable',
        ]);



        $data['habits'] = isset($data['habits']) && is_array($data['habits']) ? json_encode($data['habits']) : ($data['habits'] ?? null);
        $data['preferences'] = isset($data['preferences']) && is_array($data['preferences']) ? json_encode($data['preferences']) : ($data['preferences'] ?? null);


        $userId = Auth::id();

        // Handle avatar upload: support file upload or base64 payload
        if ($request->hasFile('avatar') && $request->file('avatar')->isValid()) {
            $file = $request->file('avatar');
            $extension = $file->extension() ?: 'png';
            $fileName = 'avatar_' . Auth::id() . '_' . time() . '.' . $extension;
            $folder = public_path('images/users/avatar');
            if (!file_exists($folder)) {
                mkdir($folder, 0777, true);
            }
            $file->move($folder, $fileName);
            $data['avatar'] = 'images/users/avatar/' . $fileName;
        } elseif (isset($data['avatar']) && !empty($data['avatar']) && strpos($data['avatar'], 'data:image') === 0) {
            preg_match('/data:image\/(\w+);base64,/', $data['avatar'], $matches);
            $extension = $matches[1] ?? 'png';
            $base64Str = substr($data['avatar'], strpos($data['avatar'], ',') + 1);
            $image = base64_decode($base64Str);
            $fileName = 'avatar_' . Auth::id() . '_' . time() . '.' . $extension;
            $folder = public_path('images/users/avatar');
            if (!file_exists($folder)) {
                mkdir($folder, 0777, true);
            }
            file_put_contents($folder . '/' . $fileName, $image);
            $data['avatar'] = 'images/users/avatar/' . $fileName;
        } else {
            // ensure avatar key is not accessed later if not provided
            if (array_key_exists('avatar', $data)) {
                // remove empty avatar value so we don't overwrite existing avatar with null
                unset($data['avatar']);
            }
        }

        $user = User::find($userId);
        $user->name = $data['name'];
        $user->email = $data['email'];
        if (!empty($data['password'])) {
            $user->password = Hash::make($data['password']);
        }
        if (isset($data['avatar'])) {
            $user->avatar = $data['avatar'];
        }
        $user->save();
        unset($data['name'], $data['email'], $data['password'], $data['avatar']);


        $profile = student_profile::updateOrCreate(


            ['user_id' => Auth::id()],
            $data
        );

        return response()->json([
            'message' => 'Profile saved successfully',
            'profile' => $profile
        ]);
    }

    public function removeAvatar()
    {
        $userId = Auth::id();
        $user = User::find($userId);

        if (!$user) {
            return response()->json(['error' => 'User not found'], 404);
        }

        // Delete avatar file from storage if it exists
        if ($user->avatar) {
            $filePath = public_path($user->avatar);
            if (file_exists($filePath)) {
                unlink($filePath);
            }
        }

        // Remove avatar from database
        $user->avatar = null;
        $user->save();

        return response()->json([
            'message' => 'Avatar removed successfully',
            'profile' => [
                'name' => $user->name,
                'email' => $user->email,
                'avatar' => null,
            ]
        ]);
    }

    public function updateAvatar(Request $request)
    {
        $request->validate([
            'avatar' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048'
        ]);

        $userId = Auth::id();
        $user = User::find($userId);

        if (!$user) {
            return response()->json(['error' => 'User not found'], 404);
        }

        // Delete old avatar if exists
        if ($user->avatar) {
            $filePath = public_path($user->avatar);
            if (file_exists($filePath)) {
                unlink($filePath);
            }
        }

        // Upload new avatar
        if ($request->hasFile('avatar')) {
            $file = $request->file('avatar');
            $extension = $file->extension() ?: 'png';
            $fileName = 'avatar_' . Auth::id() . '_' . time() . '.' . $extension;
            $folder = public_path('images/users/avatar');
            
            if (!file_exists($folder)) {
                mkdir($folder, 0777, true);
            }
            
            $file->move($folder, $fileName);
            $avatarPath = 'images/users/avatar/' . $fileName;
            
            // Update user avatar
            $user->avatar = $avatarPath;
            $user->save();

            return response()->json([
                'message' => 'Avatar updated successfully',
                'profile' => [
                    'name' => $user->name,
                    'email' => $user->email,
                    'avatar' => asset($avatarPath)
                ]
            ]);
        }

        return response()->json(['error' => 'No file provided'], 400);
    }

}

