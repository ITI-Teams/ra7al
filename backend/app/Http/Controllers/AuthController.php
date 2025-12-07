<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class AuthController extends Controller
{
    /**
     * Register a new user (student or owner).
     */
    public function register(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8',
            'role' => 'required|in:student,owner',
            'image' => 'nullable|image|max:2048',
        ]);

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('images/users', 'public');
            $data['avatar'] = $path;
        }

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => $data['password'],
            'role' => $data['role'],
            'avatar' => $data['avatar'] ?? null,
        ]);

        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json(["user" => $user, "token" => $token], 201);
    }

    /**
     * Login user and issue token. Only student or owner allowed via frontend.
     */
    public function login(Request $request)
    {
        $data = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $data['email'])->first();

        if (! $user || ! Hash::check($data['password'], $user->password)) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        if (! in_array($user->role, ['student', 'owner'])) {
            return response()->json(['message' => 'This account cannot login from the frontend'], 403);
        }

        $user->updateLastLogin();

        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json(["user" => $user, "token" => $token]);
    }

    /**
     * Logout (revoke current token)
     */
    public function logout(Request $request)
    {
        if ($request->user()) {
            $request->user()->currentAccessToken()->delete();
        }

        return response()->json(['message' => 'Logged out']);
    }
}
