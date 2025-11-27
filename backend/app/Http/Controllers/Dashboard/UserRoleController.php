<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\User;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Illuminate\Http\Request;

class UserRoleController extends Controller
{
    public function edit(Request $request)
    {
        if (!$request->has('user_id')) {
            $users = User::with(['roles', 'permissions'])->paginate(10);
            $roles = Role::all();
            $permissions = Permission::all();

            return view('dashboard.users.assign', compact('users', 'roles', 'permissions'));
        }

        $user = User::findOrFail($request->user_id);
        $roles = Role::all();
        $permissions = Permission::all();

        return view('dashboard.users.assign', compact('user', 'roles', 'permissions'));
    }

    public function update(Request $request, User $user)
    {
        $request->validate([
            'roles' => 'array',
            'permissions' => 'array',
        ]);

        if ($request->roles) {
            $roleModels = Role::whereIn('id', $request->roles)->get();
            $user->syncRoles($roleModels);
        } else {
            $user->syncRoles([]);
        }

        if ($request->permissions) {
            $permissionModels = Permission::whereIn('id', $request->permissions)->get();
            $user->syncPermissions($permissionModels);
        } else {
            $user->syncPermissions([]);
        }

        return redirect()->route('users.assign')->with('success', 'Roles & permissions updated!');
    }

}
