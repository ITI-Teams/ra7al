<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RoleController extends Controller
{
    public function index()
    {
        $roles = Role::with('permissions')->paginate(15);
        return view('dashboard.roles.index', compact('roles'));
    }

    public function create()
    {
        $permissions = Permission::all();
        return view('dashboard.roles.create', compact('permissions'));
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|unique:roles,name',
            'permissions' => 'array'
        ]);

        $role = Role::create(['name' => $request->name]);

        if ($request->permissions) {
            $permissionModels = Permission::whereIn('id', $request->permissions)->get();
            $role->syncPermissions($permissionModels);
        }


        return redirect()->route('roles.index')->with('toast', ['type' =>'success', 'message' =>'Role created successfully']);

    }

    public function edit(Role $role)
    {
        $permissions = Permission::all();
        $rolePermissions = $role->permissions->pluck('id')->toArray();
        return view('dashboard.roles.edit', compact('role', 'permissions', 'rolePermissions'));
    }

    public function update(Request $request, Role $role)
    {
        $request->validate([
            'name' => 'required|string|unique:roles,name,' . $role->id,
            'permissions' => 'array'
        ]);

        $role->update(['name' => $request->name]);

        if ($request->permissions) {
            $permissionModels = Permission::whereIn('id', $request->permissions)->get();
            $role->syncPermissions($permissionModels);
        } else {
            $role->syncPermissions([]);
        }
        return redirect()->route('roles.index')->with('toast', ['type' =>'success', 'message' =>'Role updated successfully']);
    }

    public function destroy(Role $role)
    {
        if ($role->name === 'super-admin') {
            return back()->with('error', 'Cannot delete super admin role');
        }

        $role->delete();

        return redirect()->route('roles.index')->with('toast', ['type' =>'success', 'message' =>'Role deleted']);
    }
}
