<x-app-layout>
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-2xl font-bold">Roles</h1>
            <a href="{{ route('roles.create') }}"
               class="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-500 flex items-center gap-2">
                <i class="fas fa-plus"></i> Add Role
            </a>
        </div>

        @if(session('success'))
            <div class="mb-4 p-4 bg-green-100 text-green-700 rounded-lg">
                {{ session('success') }}
            </div>
        @endif

        @if(session('error'))
            <div class="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
                {{ session('error') }}
            </div>
        @endif

        <div class="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden">
            <div class="overflow-x-auto">
                <table class="w-full">
                    <thead class="bg-gray-100 dark:bg-slate-700">
                    <tr>
                        <th class="px-6 py-3 text-left">Name</th>
                        <th class="px-6 py-3 text-left">Permissions</th>
                        <th class="px-6 py-3 text-left">Actions</th>
                    </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-200 dark:divide-slate-700">
                    @forelse($roles as $role)
                        <tr class="hover:bg-gray-50 dark:hover:bg-slate-700">
                            <td class="px-6 py-4">{{ $role->name }}</td>
                            <td class="px-6 py-4">
                                <div class="flex flex-wrap gap-1">
                                    @forelse($role->permissions as $permission)
                                        <span class="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                                            {{ $permission->name }}
                                        </span>
                                    @empty
                                        <span class="text-gray-500 text-sm">No permissions</span>
                                    @endforelse
                                </div>
                            </td>
                            <td class="px-6 py-4">
                                <div class="flex gap-2">
                                    <a href="{{ route('roles.edit', $role) }}"
                                       class="px-3 py-1 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-500">
                                        Edit
                                    </a>
                                    <button
                                        type="button"
                                        @click="$dispatch('confirm-delete', { url: '{{ route('roles.destroy', $role->id) }}' , name:'role'})"
                                        class="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-500">
                                        Delete
                                    </button>
                                </div>
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="3" class="px-6 py-4 text-center text-gray-500">
                                No roles found
                            </td>
                        </tr>
                    @endforelse
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Pagination -->
        <div class="mt-6">
            {{ $roles->links() }}
        </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div x-data="{ open: false, deleteUrl: '' }"
         x-show="open"
         @confirm-delete.window="open = true; deleteUrl = $event.detail.url"
         class="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
         x-transition>

        <div class="bg-white dark:bg-slate-800 p-6 rounded-xl w-full max-w-md mx-4">
            <h3 class="text-lg font-semibold mb-4">Confirm Delete</h3>
            <p class="mb-6">Are you sure you want to delete this role? This action cannot be undone.</p>

            <div class="flex justify-end gap-3">
                <button
                    @click="open = false"
                    class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500">
                    Cancel
                </button>
                <form :action="deleteUrl" method="POST" class="inline">
                    @csrf
                    @method('DELETE')
                    <button
                        type="submit"
                        class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500">
                        Delete
                    </button>
                </form>
            </div>
        </div>
    </div>
</x-app-layout>
