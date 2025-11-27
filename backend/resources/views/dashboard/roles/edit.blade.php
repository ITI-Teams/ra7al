<x-app-layout>
    <div class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="flex items-center mb-6">
            <h1 class="text-2xl font-bold">Edit Role: {{ $role->name }}</h1>
        </div>

        <div class="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
            <form action="{{ route('roles.update', $role) }}" method="POST">
                @csrf
                @method('PUT')

                <div class="mb-4">
                    <label class="block text-sm font-medium mb-2">Role Name</label>
                    <input type="text" name="name" value="{{ old('name', $role->name) }}"
                           class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 focus:ring-2 focus:ring-indigo-500"
                           required>
                </div>

                <div class="mb-6">
                    <label class="block text-sm font-medium mb-2">Permissions</label>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto p-4 border border-gray-200 dark:border-slate-700 rounded-lg">
                        @foreach($permissions as $permission)
                            <label class="flex items-center">
                                <input type="checkbox" name="permissions[]" value="{{ $permission->id }}"
                                       class="rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500"
                                       @if(in_array($permission->id, $rolePermissions)) checked @endif>
                                <span class="ml-2">{{ $permission->name }}</span>
                            </label>
                        @endforeach
                    </div>
                </div>

                <div class="flex gap-4">
                    <button type="submit"
                            class="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-500">
                        Update Role
                    </button>
                    <a href="{{ route('roles.index') }}"
                       class="px-4 py-2 bg-gray-600 text-white rounded-lg shadow hover:bg-gray-500">
                        Cancel
                    </a>
                </div>
            </form>
        </div>
    </div>
</x-app-layout>
