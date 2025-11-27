<x-app-layout>
    <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold">Deleted Users</h1>

        <a href="{{ route('users.index') }}"
           class="px-4 py-2 bg-gray-600 text-white rounded-lg shadow hover:bg-gray-500">
            <i class="fa fa-arrow-left"></i> Back
        </a>
    </div>

    <!-- Search -->
    <div class="mb-4">
        <input id="searchInput"
               type="text"
               placeholder="Search deleted users..."
               class="w-full px-4 py-2 rounded-lg bg-white dark:bg-slate-800 border dark:border-slate-700 focus:ring focus:ring-indigo-300 dark:text-white">
    </div>

    <!-- Table -->
    <div class="overflow-x-auto rounded-xl shadow-lg bg-white dark:bg-slate-800 border dark:border-slate-700">
        <table class="w-full text-left">
            <thead class="bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-200">
                <tr>
                    <th class="px-4 py-3">Name</th>
                    <th class="px-4 py-3">Email</th>
                    <th class="px-4 py-3">Deleted At</th>
                    <th class="px-4 py-3">Actions</th>
                </tr>
            </thead>

            <tbody id="tableData">
                @foreach($users as $user)
                <tr class="border-b dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 transition">
                    <td class="px-4 py-3">{{ $user->name }}</td>
                    <td class="px-4 py-3">{{ $user->email }}</td>
                    <td class="px-4 py-3">{{ $user->deleted_at->format('Y-m-d') }}</td>

                    <td class="px-4 py-3 flex gap-3">

                        <a href="{{ route('users.restore', $user->id) }}"
                           class="px-3 py-1 bg-green-600 text-white rounded-lg text-sm hover:bg-green-500">
                           Restore
                        </a>

                        <form action="{{ route('users.forceDelete', $user->id) }}"
                              method="POST"
                              onsubmit="return confirm('Delete permanently?')">
                            @csrf
                            @method('DELETE')
                            <button class="px-3 py-1 bg-red-600 text-white rounded-lg text-sm hover:bg-red-500">
                                Delete Forever
                            </button>
                        </form>

                    </td>
                </tr>
                @endforeach
            </tbody>
        </table>
    </div>

    <div class="mt-6">
        {{ $users->links() }}
    </div>

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
