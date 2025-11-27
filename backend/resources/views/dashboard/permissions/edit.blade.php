<x-app-layout>
    <div class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="flex items-center mb-6">
            <h1 class="text-2xl font-bold">Edit Permission: {{ $permission->name }}</h1>
        </div>

        <div class="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
            <form action="{{ route('permissions.update', $permission) }}" method="POST">
                @csrf
                @method('PUT')

                <div class="mb-4">
                    <label class="block text-sm font-medium mb-2">Permission Name</label>
                    <input type="text" name="name" value="{{ old('name', $permission->name) }}"
                           class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 focus:ring-2 focus:ring-indigo-500"
                           required>
                </div>

                <div class="flex gap-4">
                    <button type="submit"
                            class="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-500">
                        Update Permission
                    </button>
                    <a href="{{ route('permissions.index') }}"
                       class="px-4 py-2 bg-gray-600 text-white rounded-lg shadow hover:bg-gray-500">
                        Cancel
                    </a>
                </div>
            </form>
        </div>
    </div>
</x-app-layout>
