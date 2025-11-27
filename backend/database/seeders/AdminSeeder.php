<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // ---------------------------------------------------------
        // 1) Create Permissions
        // ---------------------------------------------------------
        $permissions = [
            'manage users',
            'create users',
            'edit users',
            'delete users',
            'view trashed users',
            'restore users',
            'force delete users',

            'manage properties',
            'create properties',
            'edit properties',
            'delete properties',

            'manage settings',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        // ---------------------------------------------------------
        // 2) Create Roles
        // ---------------------------------------------------------
        $superAdminRole = Role::firstOrCreate(['name' => 'super']);
        $adminRole      = Role::firstOrCreate(['name' => 'admin']);
        $ownerRole      = Role::firstOrCreate(['name' => 'owner']);
        $studentRole    = Role::firstOrCreate(['name' => 'student']);

        // ---------------------------------------------------------
        // 3) Assign permissions to roles
        // ---------------------------------------------------------

        // super admin gets everything
        $superAdminRole->syncPermissions(Permission::all());

        // admin (restricted but powerful)
        $adminRole->syncPermissions([
            'manage users',
            'create users',
            'edit users',
            'delete users',
            'view trashed users',
            'restore users',

            'manage properties',
            'create properties',
            'edit properties',
            'delete properties',
        ]);

        // owner
        $ownerRole->syncPermissions([
            'manage properties',
            'create properties',
            'edit properties',
            'delete properties',
        ]);

        // student (no administrative permissions)
        $studentRole->syncPermissions([]);

        // ---------------------------------------------------------
        // 4) Create Super Admin (cannot be deleted)
        // ---------------------------------------------------------
        $superAdmin = User::firstOrCreate(
            ['email' => 'superadmin@example.com'],
            [
                'name' => 'Super Admin',
                'password' => Hash::make('supersecure123'),
                'role' => 'super',
            ]
        );

        $superAdmin->assignRole('super');

        // ---------------------------------------------------------
        // 5) Create Test Admins
        // ---------------------------------------------------------
        $admins = [
            ['name' => 'Admin One',   'email' => 'admin1@example.com'],
            ['name' => 'Admin Two',   'email' => 'admin2@example.com'],
            ['name' => 'Admin Three', 'email' => 'admin3@example.com'],
        ];

        foreach ($admins as $adminData) {
            $admin = User::create([
                'name' => $adminData['name'],
                'email' => $adminData['email'],
                'password' => Hash::make('admin123'),
                'role' => 'admin',
            ]);
            $admin->assignRole('admin');
        }

        // ---------------------------------------------------------
        // 6) Create Test Owners
        // ---------------------------------------------------------
        for ($i = 1; $i <= 5; $i++) {
            $owner = User::create([
                'name' => "Owner $i",
                'email' => "owner$i@example.com",
                'password' => Hash::make('owner123'),
                'role' => 'owner',
            ]);
            $owner->assignRole('owner');
        }

        // ---------------------------------------------------------
        // 7) Create Test Students
        // ---------------------------------------------------------
        for ($i = 1; $i <= 10; $i++) {
            $student = User::create([
                'name' => "Student $i",
                'email' => "student$i@example.com",
                'password' => Hash::make('student123'),
                'role' => 'student',
            ]);
            $student->assignRole('student');
        }

        // Prevent accidental deletion message
        echo "Seeder completed: Super Admin, Admins, Owners, Students created.\n";
    }
}
