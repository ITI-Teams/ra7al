<x-app-layout>
    <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold">Users</h1>

        <div class="flex gap-3">
            <a href="{{ route('users.create') }}"
               class="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-500">
                <i class="fa fa-plus"></i> Add User
            </a>

            <a href="{{ route('users.trashed') }}"
               class="px-4 py-2 bg-red-600 text-white rounded-lg shadow hover:bg-red-500">
                <i class="fa fa-trash"></i> Trashed
            </a>
        </div>
    </div>

    <!-- Search -->
    <div class="mb-4">
        <input id="searchInput"
               type="text"
               placeholder="Search users..."
               class="w-full px-4 py-2 rounded-lg bg-white dark:bg-slate-800 border dark:border-slate-700 focus:ring focus:ring-indigo-300 dark:text-white">
    </div>

    <!-- Table -->
    <div class="overflow-x-auto rounded-xl shadow-lg bg-white dark:bg-slate-800 border dark:border-slate-700">
        <table class="w-full text-left">
            <thead class="bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-200">
                <tr>
                    <th class="px-4 py-3">Name</th>
                    <th class="px-4 py-3">Email</th>
                    <th class="px-4 py-3">Role</th>
                    <th class="px-4 py-3">Actions</th>
                </tr>
            </thead>

            <tbody id="tableData">
                @foreach($users as $user)
                <tr class="border-b dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 transition">
                    <td class="px-4 py-3">{{ $user->name }}</td>
                    <td class="px-4 py-3">{{ $user->email }}</td>
                    <td class="px-4 py-3">
                        <span class="px-3 py-1 bg-indigo-600/20 text-indigo-600 dark:text-indigo-400 rounded-full text-sm">
                            {{ $user->roles->first()->name ?? 'N/A' }}
                        </span>
                    </td>
                    <td class="px-4 py-3 flex gap-2">

                        <a href="{{ route('users.edit', $user->id) }}"
                           class="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-500">
                           Edit
                        </a>

                        <form action="{{ route('users.destroy', $user->id) }}" method="POST">
                            @csrf
                            @method('DELETE')
                            <button
                                type="button"
                                @click="$dispatch('confirm-delete', { url: '{{ route('users.destroy', $user->id) }}' , name:'user'})"
                                class="px-3 py-1 bg-red-600 text-white rounded-lg text-sm hover:bg-red-500">
                                Delete
                            </button>
                        </form>

                    </td>
                </tr>
                @endforeach
            </tbody>
        </table>
    </div>

    <!-- Pagination -->
    <div class="mt-6">
        {{ $users->links() }}
    </div>

    <!-- JS Search -->
    <script>
        document.getElementById('searchInput').addEventListener('keyup', function () {
            let filter = this.value.toLowerCase();
            let rows = document.querySelectorAll('#tableData tr');

            rows.forEach(row => {
                row.style.display =
                    row.textContent.toLowerCase().includes(filter)
                        ? '' : 'none';
            });
        });
    </script>

</x-app-layout>
