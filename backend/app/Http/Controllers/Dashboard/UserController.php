<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Http\Requests\UserStoreRequest;
use App\Http\Requests\UserUpdateRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    public function index()
    {
        $users = User::with('roles')->paginate(15);
        return view('dashboard.users.index', compact('users'));
    }

    public function create()
    {
        $roles = Role::all();
        return view('dashboard.users.create', compact('roles'));
    }

    public function store(UserStoreRequest $request)
    {
        $data = $request->validated();

        $data['password'] = Hash::make($request->password);

        if ($request->hasFile('avatar')) {
            $avatarName = time() . '_' . $request->avatar->getClientOriginalName();
            $request->avatar->move(public_path('images/users/avatar'), $avatarName);
            $data['avatar'] = 'images/users/avatar/' . $avatarName;
        }

        $user = User::create($data);

        $user->assignRole($request->role);

        return redirect()->route('users.index')
            ->with('toast', ['type' => 'success', 'message' => 'User created successfully']);
    }

    public function show(string $id)
    {
        $user = User::with('roles')->findOrFail($id);
        return view('dashboard.users.show', compact('user'));
    }

    public function edit(string $id)
    {
        $user = User::findOrFail($id);
        $roles = Role::all();

        return view('dashboard.users.edit', compact('user', 'roles'));
    }

    public function update(UserUpdateRequest $request, string $id)
    {
        $user = User::findOrFail($id);

        $data = $request->validated();

        if ($request->filled('password')) {
            $data['password'] = Hash::make($request->password);
        } else {
            $data['password'] = $user->password;
        }

        if ($request->hasFile('avatar')) {
            if ($user->avatar && file_exists(public_path($user->avatar))) {
                unlink(public_path($user->avatar));
            }

            $avatarName = time() . '_' . $request->avatar->getClientOriginalName();
            $request->avatar->move(public_path('images/users/avatar'), $avatarName);
            $data['avatar'] = 'images/users/avatar/' . $avatarName;
        }

        $user->update($data);

        if ($request->filled('role')) {
            $user->syncRoles([$request->role]);
        }

        return redirect()->route('users.index')->with('toast', [
            'type' => 'success',
            'message' => 'User updated successfully'
        ]);
    }

    public function destroy(string $id)
    {
        $user = User::findOrFail($id);

        if ($user->hasRole('super')) {
            return back()->with('toast', [
                'type' => 'error',
                'message' => 'Super Admin cannot be deleted.'
            ]);
        }

        $user->delete();

        return redirect()->route('users.index')->with('toast', ['type' => 'warning', 'message' => 'User moved to trash']);
    }
    public function restore($id)
    {
        $user = User::onlyTrashed()->findOrFail($id);

        $user->restore();

        return redirect()->route('users.index')->with('toast', ['type' => 'success', 'message' => 'User restored']);
    }
    public function forceDelete($id)
    {
        $user = User::onlyTrashed()->findOrFail($id);

        if ($user->hasRole('super')) {
            return back()->with('toast', [
                'type' => 'error',
                'message' => 'Super Admin cannot be permanently deleted.'
            ]);
        }

        if ($user->avatar && file_exists(public_path($user->avatar))) {
            unlink(public_path($user->avatar));
        }

        $user->forceDelete();

        return redirect()->route('users.index')->with('toast', [
            'type' => 'error',
            'message' => 'User deleted permanently'
        ]);
    }
    public function trashed()
    {
        $users = User::onlyTrashed()->with('roles')->paginate(15);
        return view('dashboard.users.trashed', compact('users'));
    }
}
