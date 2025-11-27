<x-app-layout>
    @if(isset($users))
        <!-- User Selection View -->
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div class="flex justify-between items-center mb-6">
                <h1 class="text-2xl font-bold">Assign Access to Users</h1>
            </div>

            @if(session('success'))
                <div class="mb-4 p-4 bg-green-100 text-green-700 rounded-lg">
                    {{ session('success') }}
                </div>
            @endif

            <div class="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden">
                <div class="p-6">
                    <h2 class="text-xl font-semibold mb-4">Select User</h2>

                    <div class="overflow-x-auto">
                        <table class="w-full">
                            <thead class="bg-gray-100 dark:bg-slate-700">
                            <tr>
                                <th class="px-6 py-3 text-left">User</th>
                                <th class="px-6 py-3 text-left">Roles</th>
                                <th class="px-6 py-3 text-left">Direct Permissions</th>
                                <th class="px-6 py-3 text-left">Actions</th>
                            </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-200 dark:divide-slate-700">
                            @forelse($users as $user)
                                <tr class="hover:bg-gray-50 dark:hover:bg-slate-700">
                                    <td class="px-6 py-4">
                                        <div class="flex items-center">
                                            <div class="flex-shrink-0 w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold mr-3">
                                                {{ substr($user->name, 0, 1) }}
                                            </div>
                                            <div>
                                                <div class="font-medium">{{ $user->name }}</div>
                                                <div class="text-sm text-gray-500">{{ $user->email }}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td class="px-6 py-4">
                                        <div class="flex flex-wrap gap-1">
                                            @forelse($user->roles as $role)
                                                <span class="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                                                    {{ $role->name }}
                                                </span>
                                            @empty
                                                <span class="text-gray-500 text-sm">None</span>
                                            @endforelse
                                        </div>
                                    </td>
                                    <td class="px-6 py-4">
                                        <div class="flex flex-wrap gap-1">
                                            @forelse($user->permissions as $permission)
                                                <span class="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                                                    {{ $permission->name }}
                                                </span>
                                            @empty
                                                <span class="text-gray-500 text-sm">None</span>
                                            @endforelse
                                        </div>
                                    </td>
                                    <td class="px-6 py-4">
                                        <a href="{{ route('users.assign', ['user_id' => $user->id]) }}"
                                           class="px-3 py-1 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-500">
                                            Manage Access
                                        </a>
                                    </td>
                                </tr>
                            @empty
                                <tr>
                                    <td colspan="4" class="px-6 py-4 text-center text-gray-500">
                                        No users found
                                    </td>
                                </tr>
                            @endforelse
                            </tbody>
                        </table>
                    </div>

                    <!-- Pagination -->
                    <div class="mt-6">
                        {{ $users->links() }}
                    </div>
                </div>
            </div>

            <!-- Quick Stats -->
            <div class="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
                    <h3 class="text-lg font-semibold mb-2">Total Users</h3>
                    <p class="text-3xl font-bold text-indigo-600">{{ \App\Models\User::count() }}</p>
                </div>
                <div class="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
                    <h3 class="text-lg font-semibold mb-2">Total Roles</h3>
                    <p class="text-3xl font-bold text-indigo-600">{{ \Spatie\Permission\Models\Role::count() }}</p>
                </div>
                <div class="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
                    <h3 class="text-lg font-semibold mb-2">Total Permissions</h3>
                    <p class="text-3xl font-bold text-indigo-600">{{ \Spatie\Permission\Models\Permission::count() }}</p>
                </div>
            </div>
        </div>
    @else
        <!-- User Assignment View -->
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div class="flex justify-between items-center mb-6">
                <div>
                    <h1 class="text-2xl font-bold">Assign Roles & Permissions</h1>
                    <p class="text-gray-600 dark:text-gray-400 mt-1">
                        Managing access for: <span class="font-semibold">{{ $user->name }}</span>
                    </p>
                </div>
                <a href="{{ route('users.assign') }}"
                   class="px-4 py-2 bg-gray-600 text-white rounded-lg shadow hover:bg-gray-500">
                    Back to Users
                </a>
            </div>

            @if(session('success'))
                <div class="mb-4 p-4 bg-green-100 text-green-700 rounded-lg">
                    {{ session('success') }}
                </div>
            @endif

            <div class="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden">
                <div class="p-6">
                    <form action="{{ route('users.assign.update', $user) }}" method="POST">
                        @csrf
                        @method('POST')

                        <!-- User Info Card -->
                        <div class="mb-6 p-4 bg-blue-50 dark:bg-slate-700 rounded-lg">
                            <div class="flex items-center">
                                <div class="flex-shrink-0">
                                    <div class="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                                        {{ substr($user->name, 0, 1) }}
                                    </div>
                                </div>
                                <div class="ml-4">
                                    <h3 class="text-lg font-semibold">{{ $user->name }}</h3>
                                    <p class="text-gray-600 dark:text-gray-400">{{ $user->email }}</p>
                                    <p class="text-sm text-gray-500">ID: {{ $user->id }}</p>
                                </div>
                            </div>
                        </div>

                        <!-- Roles Section -->
                        <div class="mb-8">
                            <div class="flex justify-between items-center mb-4">
                                <h2 class="text-xl font-semibold">Roles</h2>
                                <span class="text-sm text-gray-500">{{ $roles->count() }} available roles</span>
                            </div>

                            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                @forelse($roles as $role)
                                    <label class="flex items-center p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 cursor-pointer transition-colors">
                                        <input type="checkbox"
                                               name="roles[]"
                                               value="{{ $role->id }}"
                                               class="rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500"
                                               @if($user->hasRole($role->name)) checked @endif>
                                        <span class="ml-3 font-medium">
                                            {{ $role->name }}
                                        </span>
                                        <span class="ml-auto text-xs px-2 py-1 bg-gray-100 dark:bg-slate-600 text-gray-600 dark:text-gray-300 rounded">
                                            {{ $role->permissions->count() }} perms
                                        </span>
                                    </label>
                                @empty
                                    <div class="col-span-full text-center py-8 text-gray-500">
                                        <i class="fas fa-users text-4xl mb-2"></i>
                                        <p>No roles available</p>
                                    </div>
                                @endforelse
                            </div>
                        </div>

                        <!-- Permissions Section -->
                        <div class="mb-8">
                            <div class="flex justify-between items-center mb-4">
                                <h2 class="text-xl font-semibold">Permissions</h2>
                                <span class="text-sm text-gray-500">{{ $permissions->count() }} available permissions</span>
                            </div>

                            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                @forelse($permissions as $permission)
                                    <label class="flex items-center p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 cursor-pointer transition-colors">
                                        <input type="checkbox"
                                               name="permissions[]"
                                               value="{{ $permission->id }}"
                                               class="rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500"
                                               @if($user->hasPermissionTo($permission->name)) checked @endif>
                                        <span class="ml-3 font-medium">
                                            {{ $permission->name }}
                                        </span>
                                        <span class="ml-auto text-xs px-2 py-1 bg-gray-100 dark:bg-slate-600 text-gray-600 dark:text-gray-300 rounded">
                                            {{ $permission->guard_name }}
                                        </span>
                                    </label>
                                @empty
                                    <div class="col-span-full text-center py-8 text-gray-500">
                                        <i class="fas fa-key text-4xl mb-2"></i>
                                        <p>No permissions available</p>
                                    </div>
                                @endforelse
                            </div>
                        </div>

                        <!-- Action Buttons -->
                        <div class="flex justify-end gap-4 pt-6 border-t border-gray-200 dark:border-slate-700">
                            <a href="{{ route('users.assign') }}"
                               class="px-6 py-2 bg-gray-600 text-white rounded-lg shadow hover:bg-gray-500">
                                Cancel
                            </a>
                            <button type="submit"
                                    class="px-6 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-500 flex items-center gap-2">
                                <i class="fas fa-save"></i>
                                Update Access
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <!-- User Current Access Summary -->
            <div class="mt-6 bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden">
                <div class="p-6">
                    <h2 class="text-xl font-semibold mb-4">Current Access Summary</h2>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <!-- Current Roles -->
                        <div>
                            <h3 class="text-lg font-medium mb-3 flex items-center">
                                <i class="fas fa-users text-indigo-600 mr-2"></i>
                                Current Roles
                            </h3>
                            @if($user->roles->count() > 0)
                                <div class="space-y-2">
                                    @foreach($user->roles as $role)
                                        <div class="flex items-center justify-between p-3 bg-blue-50 dark:bg-slate-700 rounded-lg">
                                            <span class="font-medium">{{ $role->name }}</span>
                                            <span class="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
                                                {{ $role->permissions->count() }} permissions
                                            </span>
                                        </div>
                                    @endforeach
                                </div>
                            @else
                                <div class="p-4 text-center text-gray-500 bg-gray-50 dark:bg-slate-700 rounded-lg">
                                    <i class="fas fa-user-slash text-2xl mb-2"></i>
                                    <p>No roles assigned</p>
                                </div>
                            @endif
                        </div>

                        <!-- Current Permissions -->
                        <div>
                            <h3 class="text-lg font-medium mb-3 flex items-center">
                                <i class="fas fa-key text-indigo-600 mr-2"></i>
                                Direct Permissions
                            </h3>
                            @if($user->permissions->count() > 0)
                                <div class="space-y-2">
                                    @foreach($user->permissions as $permission)
                                        <div class="flex items-center justify-between p-3 bg-green-50 dark:bg-slate-700 rounded-lg">
                                            <span class="font-medium">{{ $permission->name }}</span>
                                            <span class="text-xs px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded">
                                                Direct
                                            </span>
                                        </div>
                                    @endforeach
                                </div>
                            @else
                                <div class="p-4 text-center text-gray-500 bg-gray-50 dark:bg-slate-700 rounded-lg">
                                    <i class="fas fa-key-skeleton text-2xl mb-2"></i>
                                    <p>No direct permissions</p>
                                </div>
                            @endif
                        </div>
                    </div>
                </div>
            </div>
        </div>
    @endif
</x-app-layout>
